/**
 * @author Javier.Ortega
 * 
 * This class will handle the switch between different Screens
 */
  


/**
 * Singleton pattern for state factory
 */

StateFactory.instance = null;

StateFactory.getInstance = function()
{
    if (!StateFactory.instance)
    {
        StateFactory.instance = new StateFactory();
    }
    return StateFactory.instance;
}

/**
 * Initialise a new StateFactory
 */
function StateFactory()
{
    /**
     * The current state
     * @type {int}
     */
    this.intState = StateFactory.INT_START;

    /*
     * Parameters obtained on startup from the sidebar when running in VF
     */
    this.initParamsObj = null;
    this.fnCallback = null;
    
    /*
     * Initialise IFrameMessengerModel if we are not the top window
     */    
    if (window != window.top)  
    {
        IFrameMessengerModel.init();
    }
     
	/*
	 * Controlling background visibility, resizing, image etc.
	 */
	this.objBackgroundController = new BackgroundController();

	/*
	 * Obj to control screen and spin button
	 */
	this.objSpinController;
    
    /*
     * To control the Big Win animations.
     * ONLY does big win. Rename?
     */
    this.objPopupsController;
     
    /*
     * To handle the message shown when setting some autoplays
     * but then pressing lockspin. 
     */
    this.objAutoplayWarningController;
    
    /*
     * Main reels bottom bar
     */
    this.objMainConsoleController;

    /*
     * Freespin reels bottom bar
     */
     this.objFreespinConsoleController;
    
    /*
     * TO control free spins
     */
    this.objFreeSpinController;
    
    /*
     * The Gui factory to ask for one screen or other
     */
    this.objGuiFactory;
	
    /**
     * Handles communications with server
     */
    this.objCommsController;
	
	/*
	 * Cost of wilds warning dialog
	 */
    this.objStakeWarningController;
    
    /**
     * Game Settings Controller
     * @type {GameSettingsController}
     */
    this.objGameSettingsController;
    
    /**
     * An array
     * @type { Object }
     */    
    StateFactory.objCanvasQueue ;
    
        
	/**
     * Binding functions
     */
    this.processStartUpConfiguration = this.processStartUpConfiguration.bind(this);
    this.continueStart = this.continueStart.bind(this);
    this.showLockAndSpin = this.showLockAndSpin.bind(this); 
    this.forceResize = this.forceResize.bind(this); 
    this.loadingScreenLoaded = this.loadingScreenLoaded.bind(this);
    this.guiLoaded = this.guiLoaded.bind(this);
    this.initialiseLocalisation = this.initialiseLocalisation.bind(this);
    this.showGui = this.showGui.bind(this);
    this.allAssetsLoadedCallback = this.allAssetsLoadedCallback.bind(this);
	this.addResolutionsCallbacks = this.addResolutionsCallbacks.bind(this);
	this.onAutoplayBlockerClick = this.onAutoplayBlockerClick.bind(this);
    this.showReels = this.showReels.bind(this);
    this.onResize = this.onResize.bind(this);
    this.modalDialogOpen = this.modalDialogOpen.bind(this);
    this.modalDialogClosed = this.modalDialogClosed.bind(this);
    
	// To review
	this.receiveInitResponse = this.receiveInitResponse.bind(this);
	this.receiveBetResponse = this.receiveBetResponse.bind(this);
    
    // gui / asset loading
	this.blGuiLoadedOk = false;
	this.blInitResponseOk = false;
	this.blGfxLoaded = false;
	this.blSoundLoaded = false;
	this.objDetectBrowser = new DetectBrowser();
	this.blAllAssetsLoaded = false;
    
	/*
	 * Initial response data. This is the game configuratio,
	 * stakes, reels etc. May in the future contain refresh information.
	 */
	this.objInitResponseData;
	
	/*
	 * Game spin response data, including freespins, bonuses etc.
	 */
	this.objSpinResponseData;
	
    // Sound (To review)
	this.objSoundController;
	this.initSound = this.initSound.bind(this);
	this.initSoundComplete = this.initSoundComplete.bind(this);
	this.setupDummySoundController = this.setupDummySoundController.bind(this);
	this.checkiOSAudioLoaded = this.checkiOSAudioLoaded.bind(this);
	this.gameBlur = this.gameBlur.bind(this);
	this.gameFocus = this.gameFocus.bind(this);
	this.intIosAudioInterval;
	
    /**
     * Autoplay Controller
     * @type { AutoplayController }
     */
    this.objAutoplayController;

    /**
     * Autoplay Select
     * @type { AutoplayController }
     */
    this.objAutoplaySelect;
    
    /**
     * current Linebet
     * @type { Linebet }
     */
    this.objLinebet;
    
    /**
     * Main timer loop 
     * @type {MainLoop}
     */
    this.objMainLoop = MainLoop.getInstance();
    
    /**
     * Sidebar logic
     * @type {SidebarCommController}
     */
    this.objSidebarCommController = new SidebarCommController();
    
    /**
     * Hack to fix issue in Samsung Galaxy 3 IS , without resizing
     */
    this.blForceRedraw = false;
    
    /**
     * Source for localised texts
     * @type {Localisation}
     */
    this.objLocalisation; 
    
   this.objLocalisationLoader = new LoaderData("res/text.json");
   this.objLocalisationLoader.setCallback(this.initialiseLocalisation);
   this.objLocalisationLoader.load();
}

/**
 * Derive GuiView from our base type to provide inheritance
 */
Class.extend( Class, StateFactory );


// Global object which handles information that the game uses when handling VF's initialization URL parameters.

//list of supported languages
StateFactory.SUPPORTED_LANGUAGES = ["en", "da", "de", "el", "es", "fi", "it", "ja", "nl", "no", "pt", "ru", "sv", "zh-cn"];
//VF config
StateFactory.GAME_CONFIG;
//path to globalize library
StateFactory.PATH_GLOBALIZE = "common/globalize/";




/**
 * This function is required by the error dialog.
 * It's purpose is to ensure that when an error dialog (MODAL)
 * is opened we block all user interaction.
 */
StateFactory.prototype.modalDialogOpen = function()
{
    this.objSpinController.setButtonState(SpinController.MODAL_DIALOG);
}

/**
 * This function is required by the error dialog.
 * It is called when the dialog is dismissed.
 * It's purpose is to re-enable the UI for the player.
 * It sets the UI to an IDLE state. The error dialog also calls
 * a custom callback (if provided) AFTER this so that the caller
 * can set the UI to a special state if required.
 */
StateFactory.prototype.modalDialogClosed = function()
{
    this.objSpinController.setButtonState(SpinController.IDLE);
    
    this.objReelsController.objSelectionIcon.intState = WildsView.NORMAL; 
}

/**
 * 
 */
StateFactory.prototype.initialiseLocalisation = function( objData )
 {
    this.objLocalisation = new Localisation(objData);
}

/**
 * Example handler for receiving the Bet response
 */
StateFactory.prototype.receiveBetResponse = function( objData )
{
	this.objSpinResponseData = objData;
	
	/*
	 * Anything needed at this level to handle an ERROR.
	 * Note: Error dialog should be raised in Template by CommsManager
	 */
	if(this.objSpinResponseData.ERROR != null)
	{
		console.log("Error code received: " + this.objSpinResponseData.ERROR.errorCode);
	}
	
	/*
	 * Game must handle error by resetting reels, balance etc.
	 */
	this.objSpinController.receiveBetResponse(this.objSpinResponseData);
}

/**
 * This function will init all the necessary objects 
 */
StateFactory.prototype.init = function ()
{
    //TO MOVE TO SOUND
    // Hide main and free spin backgrounds (for loading screen)
    this.objBackgroundController.setVisible(false);
    this.objBackgroundController.setBackgroundMain();

    this.deviceModel = new DeviceModel();
    
    StateFactory.objCanvasQueue = new CanvasQueue( this.deviceModel );
   
    IFrameMessengerModel.setCanvasQueue( StateFactory.objCanvasQueue ); // Allow the Iframe messneger access to the canvas 
    
    this.objGuiFactory = new GuiFactory();
    
    this.arrGuiControllers;

    this.objCommsController = new CommsController();
	
	//init main loop (it is probably running already)
	this.objMainLoop.start();
}


/**
 * Init linebet setup 
 */
StateFactory.prototype.initLinebet = function()
{
	//linebet setup
	var arrLinebetSetup = [];
	for (var i in this.objInitResponseData.Stakes.arrValidStakes)
	{
		arrLinebetSetup.push(this.objInitResponseData.Stakes.arrValidStakes[i]);
	}
	
	var flDefaultValue = arrLinebetSetup[this.objInitResponseData.Stakes.intDefaultStakeIndex];
	
	//create setup and set default value
	var objLinebetSetup = new LinebetSetup(arrLinebetSetup, flDefaultValue);
	objLinebetSetup.setDefaultValue(flDefaultValue);
	
	//create linebet
	this.objLinebet = new Linebet(objLinebetSetup);
}

// Global Boolean for enabling / disabling the loading of sound
StateFactory.BL_SOUND_ENABLED = true;

/////Collection for the different possible states

/**
 * The state to show the splashscreen
 * while the initial config is loading from the server
 * @type { Integer }
 */ 
StateFactory.INT_START = 0;

/**
 * The state to show the initial config is loading from the server
 * and the assets are loaded for the gui.The state to show the reels
 * @type { Integer }
 */
StateFactory.INT_LOAD = 1;

/**
* load the gui
* @type { Integer }
*/
StateFactory.INT_GUIS_LOADED = 2;

/** 
 * 
 * All graphical assets have been loaded
 * 
 * @type { Integer }
 */
StateFactory.INT_GFX_LOADED = 3

/**
 * sounds and graphics have both been loaded (i.e. show the reels :)
 * @type { Integer }
 */
StateFactory.INT_ALL_LOADED = 4

/**
 * The state to show the reels
 * @type { Integer }
 */
StateFactory.INT_SHOW_REELS = 5;

/**
 * The state to show a Bonus
 * @type { Integer }
 */
StateFactory.INT_BONUS = 6;
/**
 * The state to show the helps screen
 * @type { Integer }
 */
StateFactory.INT_HELP = 7;
/**
 * The state to show the pay table
 * @type { Integer }
 */
StateFactory.INT_PAY_TABLE = 8;
///////////////////////////////////END STATES

/**
 * This function handles a big switch to change from one context to other
 * @param { Integer } intNewState The new state.
 */
StateFactory.prototype.changeState = function( intNewState )
{
    if (this.intState > intNewState)
    {
        return;
    }
    
    this.intState = intNewState;
    
    switch ( intNewState )
    {
        case StateFactory.INT_START:
        {
            // Start to load the Loading Screen.
            // NOTE this static setup-then-start design pattern sucks.
            LoadingScreenController.deviceModel = this.deviceModel;
            LoadingScreenController.fnScreenLoaded = this.loadingScreenLoaded;
            LoadingScreenController.fnResourcesLoaded = this.allAssetsLoadedCallback;  
            LoadingScreenController.load(StateFactory.objCanvasQueue);
        }
        break;

        case StateFactory.INT_LOAD:

            /**
            * Once the splash screen have loaded display it, the load the config and gui's
            * 
            * NOTE: this.objGuiFactory.getGuis is passed an array of names which
            * 		relate to the JSON LAYOUT files [name]Data.json and [name]Res.json in the layouts folder.
            * 	Each of these is a collection of onscreen elements which create a "Gui".
            * 	Later we will attach each of these to a canvas layer.
            * 		[name]Res.json has the names of all the images etc 
            * 			that we want to put on any given GUI collection.
            * 		[name]Data.json has all the layout information for positioning them.
            */

            this.objCommsController.sendRequest({ code: STRINGS.INIT }, this.receiveInitResponse);  


            this.objGuiFactory.objCallBack = this.guiLoaded;
            this.objGuiFactory.getGuis([ "autoplayWarning",
                                         "errorMessage2",
            							 "bigWin",
            							 "stakePopup1",
            							 "stakePopup2",
            							 "lockAndSpinIntroPopup", 
            							 "freespinsHUD",
            							 "console", 
            							 "reels", 
            							 "winLines", 
            							 "winPanel", 
            							 "freeSpinsCongratsPopup", 
            							 "freeSpinsSummaryPopup", 
            							 "autoplayPanel", 
            							 "animations",
            							 "settings"
            							 ]);
            
            break;

        case StateFactory.INT_GUIS_LOADED:

            // HTC - DESIRE X (Disable loading of sound)
            // Changed to case-insensitive regex search
            //if (String(navigator.userAgent).indexOf("HTC_Desire_X") > -1)
            if( navigator.userAgent.match( /HTC_DESIRE_X/i ) )
            {
                StateFactory.BL_SOUND_ENABLED = false;
            }

            // Initialise the sound (if enabled) once the configuration data has been returned
            if (StateFactory.BL_SOUND_ENABLED)
            {
                this.initSound(this.initSoundComplete);
            } else
            {
                this.blSoundLoaded = true;
                // if sound is disabled setup a "dummy" sound controller (to prevent browser errors on play/stop calls)
                this.setupDummySoundController();
            }		
            
            this.showGui(this.arrGuiControllers);
            
            
            if (this.blAllAssetsLoaded)
            {
                this.changeState(StateFactory.INT_GFX_LOADED);
            }
            
            break;

        case StateFactory.INT_GFX_LOADED:
                    
	        TimerManager.getInstance().start(this.showLockAndSpin, 1500);
	        
            this.blGfxLoaded = true;

            // disable interface buttons
            this.objMainConsoleController.setButtonStates(SpinController.INACTIVE);

            // For safari (i.e iOS) set the loading flag to true (as sound-loading can only be completed by clicking)

            if ((this.objDetectBrowser.browser == BROWSERS.SAFARI) ||
                (this.blSoundLoaded))
            {
                this.changeState(StateFactory.INT_ALL_LOADED);
            }
            break;


        case StateFactory.INT_ALL_LOADED:
               

            var objJSon = new Object();
            objJSon.type = "loading";
            objJSon.actionType = "loaded";
            IFrameMessengerModel.sendMessage( JSON.stringify(objJSon) );
            break;

        case StateFactory.INT_SHOW_REELS:

            // hide the lockAndSpinIntroPopup
            if (this.arrGuiControllers["lockAndSpinIntroPopup"].objGuiView.blVisible)
            {
                this.arrGuiControllers["lockAndSpinIntroPopup"].objGuiView.blVisible = false;
            }

            // wait for IOS Sound to finish loading if required
            if ((this.objDetectBrowser.browser == BROWSERS.SAFARI) &&
                (this.blSoundLoaded == false))
            {
                if (!this.intIosAudioInterval)
                {
                    this.intIosAudioInterval = setInterval(this.checkiOSAudioLoaded, 300);
                }
            }
            else
            {
                //this.objReelsController.resize();
                // enable interface buttons
                this.arrGuiControllers["lockAndSpinIntroPopup"].objGuiView.blVisible = false;
                this.arrGuiControllers["lockAndSpinIntroPopup"].objGuiView.setDirty (true);
                this.arrGuiControllers["winLines"].objGuiView.setDirty (true);
                this.objMainConsoleController.setButtonStates(SpinController.IDLE);
                this.arrGuiControllers["lockAndSpinIntroPopup"].objGuiView.setVisible(false);
                
            }

            break;
        
        case StateFactory.INT_BONUS:

        break;
        
        case StateFactory.INT_HELP:

        break;
        
        case StateFactory.INT_PAY_TABLE:

        break;
        
        default:
        
        break;
    }
}

/**
 * 
 */
StateFactory.prototype.showLockAndSpin = function ()
{
    /*
     * This fixes rendering issue in Samsung Galaxy 3 IS , without resizing
     * No idea how or why this works. Voodoo.
     */
    if (!this.blForceRedraw)
    {
        this.arrGuiControllers["lockAndSpinIntroPopup"].objGuiView.blVisible = true;
        this.arrGuiControllers["console"].objGuiView.blVisible = true;
        
        this.arrGuiControllers["lockAndSpinIntroPopup"].objGuiView.setDirty (true);
        this.arrGuiControllers["console"].objGuiView.setDirty (true);
        
        this.arrGuiControllers["reels"].objGuiView.blVisible = true;
        this.arrGuiControllers["reels"].objGuiView.setDirty (true);
        
        this.arrGuiControllers["winLines"].objGuiView.blVisible = true;
        this.arrGuiControllers["winLines"].objGuiView.setDirty (true);

        TimerManager.getInstance().start(this.showLockAndSpin, 1500);
    }
}

/**
 * 
 */
StateFactory.prototype.checkiOSAudioLoaded = function ()
{
    if (this.blSoundLoaded)
    {
        clearInterval(this.intIosAudioInterval);
        LoadingScreenController.endUnexpectedLoadingValues();
    }
    
    this.changeState(StateFactory.INT_SHOW_REELS);
}

/**
 * 
 */
StateFactory.prototype.setupDummySoundController = function ()
{
    this.objSoundController = {};
    this.objSoundController.playSpinSound = function(){};
    this.objSoundController.stopSound = function(){};
    this.objSoundController.playButtonClickSound = function(){};
    this.objSoundController.playLineBetPlusSound = function(){};
    this.objSoundController.playLineBetMinusSound = function(){};
    this.objSoundController.playWildSelectedSound = function(){};
    this.objSoundController.playLionRoarCageBreakSound = function(){};
    this.objSoundController.playCageLockSound = function(){};
    this.objSoundController.playWinSound = function(){};
    this.objSoundController.playTENJQWinSound = function(){};
    this.objSoundController.playKAWinSound = function(){};
    this.objSoundController.playLionWinSound = function(){};
    this.objSoundController.playRhinoWinSound = function(){};
    this.objSoundController.playZebraWinSound = function(){};
    this.objSoundController.playBigWinSound = function(){};
    this.objSoundController.playLionRoarSound = function(){};
    this.objSoundController.playFreeSpinsStartButtonSound = function(){};
    this.objSoundController.playFreeSpinsIntroLoop = function(){};
    this.objSoundController.playFreeSpinsMainLoop = function(){};
    this.objSoundController.playFreeSpinsSummarySound = function(){};
    this.objSoundController.playMeerkatPopupSound = function(){};
    this.objSoundController.playMeerkatCheerSound = function(){};
    this.objSoundController.playWinCountupSound = function(){};
    this.objSoundController.killTotalWinCountupSound = function(){};
    this.objSoundController.killFSWinCountupSound = function(){};
    this.objSoundController.calcAggression = function(){};
    this.objSoundController.playLockSpinSound = function(){};
	this.objSoundController.playLionRoadAfterDelay = function(){};
}


/** 
 * the last of the loading dependencies is complete, start the main game 
 */
StateFactory.prototype.showReels = function(objEvent, objButton, intX, intY)
{
    //stop event propagation
    objEvent.stopPropagation();

    // standard ok listener for lock and spin intro popup
    this.arrGuiControllers["lockAndSpinIntroPopup"].getElementByID("okay").setEnabled(false);
    
    this.blForceRedraw = true;
    
    if ( DeviceModel.strPlatform == OS.IOS )
    {    
        LoadingScreenController.startUnexpectedLoadingValues();
    }
    
    // show reels
    this.changeState(StateFactory.INT_SHOW_REELS);

    // play button click sound. (for android)
    if (this.objDetectBrowser.browser != BROWSERS.SAFARI)
    {
        this.objSoundController.playButtonClickSound(this.objSoundController.stopSound);
    }
    else
    {
        // Guarantee sound has been killed from IOS preloader
        this.objSoundController.stopSound();
    }
}

/**
 * handler for receiving the Init json (starts if both init response received and gui assets loaded)
 */
StateFactory.prototype.receiveInitResponse = function (objData)
{
    this.objInitResponseData = objData;
    this.blInitResponseOk = true;
    this.initLinebet();
    
    /*
     * Handing race condition between init response arriving 
     * and the GUIs being loaded.
     */
    if (this.blGuiLoadedOk)
    {
        this.blInitResponseOk = false;

        // the last of the loading dependencies is complete, start the main game
        this.changeState(StateFactory.INT_GUIS_LOADED);
    }
}

/**
 * handler for received gui assets (starts if both init response received and gui assets loaded)
 */
StateFactory.prototype.guiLoaded = function (arrGuiControllers)
{
    this.arrGuiControllers = arrGuiControllers;
    this.blGuiLoadedOk = true;

    /*
     * Handing race condition between the GUIs being loaded 
     * and init response arriving.
     */
    if (this.blInitResponseOk)
    {
        this.blGuiLoadedOk = false;

        // the last of the loading dependencies is complete, start the main game
        this.changeState(StateFactory.INT_GUIS_LOADED);
    }
}

/**
 * Callback when the GAME's loading screen is loaded with its assets
 */
StateFactory.prototype.loadingScreenLoaded = function ()
{
    this.changeState(StateFactory.INT_LOAD);
    
    this.objSidebarCommController.loadingScreenMessage("loadingStarted");
}

/**
 * 
 */
StateFactory.prototype.allAssetsLoadedCallback = function ()
{
    this.blAllAssetsLoaded = true;
    
    if (this.intState == StateFactory.INT_GUIS_LOADED)
    {
        this.changeState(StateFactory.INT_GFX_LOADED);
    }

    this.objSidebarCommController.loadingScreenMessage("loadingCompleted");
}

/**
 * This function will be called when the controller for the Gui is ready
 * @param { Object } arrGuiControllers The collection of controllers for the Guis
 */
StateFactory.prototype.showGui = function( arrGuiControllers )
{
    switch ( this.intState )
    {
       /*
        * Show splash screen while config is loading.
        * on loaded, objCommsController will receive data
        * Game must receive its data and build the required screens
        * before removing the spalsh and enabling the spin button
        */
        case StateFactory.INT_START:            
        {	
        	if ( DeviceModel.strPlatform == OS.IOS )
        	{
        	   LoadingScreenController.load();
        	}
        }
        break;

       /*
        * The state to show the loading is complete 
        * and the loading screen "OK" button can be activated
        */
        case StateFactory.INT_GUIS_LOADED:
        {

            //initialize event controller, use default setup
            EventController.SETUP.mainElement = document.body;
			EventController.SETUP.onTouchStart = function(e)
            {
            	//hide URL bar on each start of touch
   				window.scrollTo(0, 1);
            };

            this.objEventController = new EventController(EventController.SETUP);
            
            this.initMainGame();
         }   
         break;

        case StateFactory.INT_LOAD:
            break;
        case StateFactory.INT_GFX_LOADED:
            break;
        case StateFactory.INT_ALL_LOADED:
            break;
        case StateFactory.INT_SHOW_REELS:
            break;
        case StateFactory.INT_BONUS:
            break;
        case StateFactory.INT_HELP:
            break;
        case StateFactory.INT_PAY_TABLE:
            break;
        default:
            break;
    }
}

/**
 * This function inits the main Screen with the Reels and the Button Bar
 */
StateFactory.prototype.initMainGame = function ( )
{
    this.setGuiViewVisibility(false);

    /*
     * Each set of elements we want to put on screen needs to be associated with a GuiView. The GuiView
     * is therefore a group of onscreen elements (e.g. all the graphics associated with the Intro Screen).
     * 
     * 
     * 
     * Params to initGui:
     * @Param1: The names given to this.objGuiFactory.getGuis (above) which creates each Gui collection
     * 			of elements from the resources specified in the JSON files ([]Data & []Res) fo the same name.
     * @Param2 & 3: width and height that each of the canvases upon which the Gui groups display should have.
     * 				(to be deprecated)
     * @Param4: the name of the canvas (on the html page) that we want to display the Gui groups on.
     * 
     * Note: Each canvas can display more than one group of elements.
     * 		 Each group of elements is arranged into a "view" within the GuiController and can be 
     * 		 show/hidden and drawn as a group using the objGuiView.blVisible, .blDirty etc
     */
    //
    this.initGui("winLines",1024,520,"winLines"); 
    this.initGui("lockAndSpinIntroPopup", 1024, 520, "animations");
    
    this.initGui("autoplayPanel",1024,520,"panels");
    this.initGui("winPanel",1024,520,"panels");
    this.initGui("autoplayWarning", 1024, 520, "animations");
    this.initGui("errorMessage2", 1024, 520, "animations");

    this.initGui("animations",1024,520,"animations");
    this.initGui("freeSpinsCongratsPopup", 1024, 520, "animations");
    this.initGui("freeSpinsSummaryPopup", 1024, 520, "animations");
    this.initGui("stakePopup1", 1024, 520, "animations");
    this.initGui("stakePopup2", 1024, 520, "animations");

    this.initGui("settings", 1024, 520, "animations");
    
    this.initGui("bigWin",1024,520,"animations");

    this.initGui("console", 1024, 86, "buttons");
    this.initGui("freespinsHUD", 1024, 86, "buttons");

    this.initGui("reels",1024,520,"reels"); //init reels after autoplayPanel and all the popups for better EventController handling
    
    
    this.arrGuiControllers["lockAndSpinIntroPopup"].objGuiView.blContinuos = true;
    this.arrGuiControllers["settings"].objGuiView.blContinuos = true;
    this.arrGuiControllers["autoplayWarning"].objGuiView.blContinuos = true;
    this.arrGuiControllers["errorMessage2"].objGuiView.blContinuos = true;
    this.arrGuiControllers["freeSpinsCongratsPopup"].objGuiView.blContinuos = true;
    this.arrGuiControllers["freeSpinsSummaryPopup"].objGuiView.blContinuos = true;
    this.arrGuiControllers["stakePopup1"].objGuiView.blContinuos = true;
    this.arrGuiControllers["stakePopup2"].objGuiView.blContinuos = true;
    this.arrGuiControllers["bigWin"].objGuiView.blContinuos = true;
    
    
    var blAutoplayAvailable = true; //TODO: set to false in case autoplay functionality is not allowed (legislation reasons) 
	var autoplayOptions = [5, 10, 15, 20, 25];
	
    /*
     * Not a "new" one, this is a singleton object as we need it to be globally available.
     */
    ErrorDialog.getInstance().initResources( this.deviceModel,
                                            this.arrGuiControllers["errorMessage2"],
                                            this.objLocalisation);

    this.objAutoplayController = new AutoplayController(this.deviceModel,
												     this.objInitResponseData,
												     blAutoplayAvailable,
												     this.objLocalisation,
												     this.objSoundController );

    this.objPopupsController = new PopupsController( this.deviceModel,
												     this.objInitResponseData,
												     this.arrGuiControllers["bigWin"],
                                                     this.objSoundController);

	this.objFreespinConsoleController = new FreespinConsoleController( this.deviceModel,
																	   this.objInitResponseData,
																	   this.arrGuiControllers["freespinsHUD"],
																	   this.objLocalisation );

    this.objMainConsoleController = new MainConsoleController( this.deviceModel,
    													   this.objLocalisation, 
    													   this.objInitResponseData,
    													   this.objAutoplayController,
    													   this.objLinebet,
    													   this.arrGuiControllers["console"],
    													   this.arrGuiControllers["autoplayPanel"],
    													   this.arrGuiControllers["autoplayWarning"],
    													   this.objSoundController,
    													   this.objSidebarCommController,
    													   this.arrGuiControllers["freespinsHUD"] );

    this.objReelsController = new ReelsController( this.objMainConsoleController, 
    											   this.deviceModel, 
    											   this.arrGuiControllers["reels"],
    											   this.objInitResponseData.objReelsTable.arrReelbands,
    											   this.objInitResponseData.objSymbolTable,
                                                   this.objSoundController);
                                                   
    this.objMainConsoleController.setReelsController(this.objReelsController);
    
    
    this.objMainConsoleController.setReelsController(this.objReelsController);
    
    
	this.objStakeWarningController = new StakeWarningController( this.deviceModel,
															     this.objInitResponseData,
															     this.arrGuiControllers["stakePopup1"],
															     this.arrGuiControllers["stakePopup2"],
                                                                 this.objSoundController,
                                                                 this.objReelsController);

    this.objWinLinesController = new WinLinesController( this.objMainConsoleController, 
    													 this.deviceModel, 
    													 this.arrGuiControllers["winLines"] );
    
    this.objSymbolAnimationsController = new SymbolAnimationsController( this.objMainConsoleController, 
    																	 this.deviceModel, 
    																	 this.arrGuiControllers["animations"] );
    
    this.objPanelsController = new PanelsController( this.objMainConsoleController, 
    											     this.deviceModel,
    											     this.arrGuiControllers["winPanel"],
    											     this.objSymbolAnimationsController,
                                                     this.objSoundController,
                                                     this.objLocalisation);

    this.objFSCongratsPopupController = new FreeSpinsCongratsPopupController(
                                                    this.arrGuiControllers["freeSpinsCongratsPopup"],
                                                    this.objSoundController);
                                                    
    this.objFSSummaryPopupController = new FreeSpinsSummaryPopupController(
                                                    this.arrGuiControllers["freeSpinsSummaryPopup"],
                                                    this.objInitResponseData,
                                                    this.objSoundController);
    /* This is never used but was never removed
    this.objLockSpinIntroPopupController = new LockAndSpinIntroPopupController(
                                                    this.arrGuiControllers["lockAndSpinIntroPopup"],
                                                    this.objReelsController);
    */                                                
	/*
	 * Doing this rather than straight assignment means we definitely know, within each object,
	 * when the controllers are in existence within the object and we can safely grab a reference.
	 * @see objBottomBarController
	 */        
	 
    this.objReelsController.assignController("winLinesController", this.objWinLinesController);
    this.objReelsController.assignController("animationsController", this.objSymbolAnimationsController);
    
    this.objWinLinesController.assignAnimationController(this.objSymbolAnimationsController);
    
    /*
     * Various objects need various things from the panel controller.
     * SpinController needs the meerkat animations
     * BottomBar and FSBottomBar both need the WinPanel popup
     */
    this.objMainConsoleController.assignController("panelsController", this.objPanelsController);    
     this.objFreespinConsoleController.assignController("panelsController", this.objPanelsController);    
    
    this.objSymbolAnimationsController.objCallBack = this.objReelsController.setAnimations;
    this.objSymbolAnimationsController.init();


    // Send some or all of the config JSON
    this.objWinLinesController.initWinLinesView( this.objInitResponseData );
    
    //To add the specific functionality to the controllers
    /*
     * TODO What does "the specific functionality" mean?
     * Why are they sometimes the same though they are very different objects?
     * What does this actually *do* ?
     */
    this.arrGuiControllers["bigWin"].objExternalController = this.objPopupsController;
    this.arrGuiControllers["console"].objExternalController = this.objMainConsoleController;
    this.arrGuiControllers["reels"].objExternalController = this.objReelsController;
    this.arrGuiControllers["winLines"].objExternalController = this.objWinLinesController;
    this.arrGuiControllers["animations"].objExternalController = this.objSymbolAnimationsController;
    this.arrGuiControllers["winPanel"].objExternalController = this.objPanelsController;
    this.arrGuiControllers["errorMessage2"].objExternalController = this.objSymbolAnimationsController;
    this.arrGuiControllers["autoplayPanel"].objExternalController = this.objPanelsController;
    this.arrGuiControllers["freeSpinsCongratsPopup"].objExternalController = this.objSymbolAnimationsController;
    this.arrGuiControllers["freeSpinsSummaryPopup"].objExternalController = this.objSymbolAnimationsController;
    this.arrGuiControllers["lockAndSpinIntroPopup"].objExternalController = this.objWinLinesController;
    this.arrGuiControllers["freespinsHUD"].objExternalController =  this.objFreespinConsoleController;
    this.arrGuiControllers["stakePopup1"].objExternalController = this.objSymbolAnimationsController;
    this.arrGuiControllers["stakePopup2"].objExternalController = this.objSymbolAnimationsController;
    this.arrGuiControllers["autoplayWarning"].objExternalController = this.objSymbolAnimationsController;
    this.arrGuiControllers["settings"].objExternalController = this.objSymbolAnimationsController;
    
    //
    this.objMainConsoleController.initBetController(this.objCommsController,
    												this.objInitResponseData.Winlines.arrWinlines,
    												this.receiveBetResponse,
    												this.objReelsController,
    												this.objStakeWarningController);

	// Pass ref to console, reels, winlines and big win.
	this.objAutoplayController.initialise( this.objMainConsoleController, 
										   this.objReelsController, 
										   this.objWinLinesController,
										   this.objPopupsController.objBigWinController);

	
	// Must do this AFTER AutoplayController
	this.objFreeSpinController = new FreeSpinController( this.deviceModel,
	  	                                                 this.arrGuiControllers["reels"],
											             this.objFreespinConsoleController,
												         this.objReelsController,
												         this.objWinLinesController,
														 this.objPopupsController.objBigWinController,
                                                         this.objFSCongratsPopupController,
                                                         this.objFSSummaryPopupController,
                                                         this.objBackgroundController,
                                                         this.objSidebarCommController );

	/*
	 * New SpinController object to handle different states during spinning
	 * Kind of becoming a god class for the main reels screen
	 */
	this.objSpinController = new SpinController( this.deviceModel,
                                                 this.arrGuiControllers["reels"],
												 this.objMainConsoleController,
												 this.objReelsController,
												 this.objWinLinesController,
												 this.objPopupsController.objBigWinController,
												 this.objFreeSpinController,
												 this.objAutoplayController,
                                                 this.objSoundController,
                                                 this.objSidebarCommController,
                                                 this.objSymbolAnimationsController);
                                                 
	this.objSpinController.assignController("panelsController", this.objPanelsController);

    // In the sound controller, set a reference to the freespins controller & main console controller objects
	this.objSoundController.objFreeSpinController = this.objFreeSpinController;
	this.objSoundController.objBigWinController = this.objPopupsController.objBigWinController;
	this.objSoundController.objMainConsoleController = this.objMainConsoleController;

    // assign callback reference for connection, timeout and comms errors. (to stop reels)
	Comm.CONNECTION_ERROR_CALLBACK = this.objReelsController.onConnectionError;
	
    this.objGameSettingsController = new GameSettingsController(
    												this.objLocalisation,
                                                    this.arrGuiControllers["settings"],
                                                    this.objMainConsoleController,
                                                    this.objSpinController,
                                                    this.objReelsController,
                                                    this.arrGuiControllers["lockAndSpinIntroPopup"]);
                                     

    //Initialize the listeners
    this.initListeners();
    
    
    //Add callBacks for the resize functions
    //this.addResolutionsCallbacks();
    
    //force initial resize
    this.forceResize();
}

/**
 * To hide all the views
 * 
 * @param { Boolean } blVisible 
 */

StateFactory.prototype.setGuiViewVisibility = function (blVisible)
{   
    this.arrGuiControllers["bigWin"].objGuiView.blVisible = blVisible;
    this.arrGuiControllers["lockAndSpinIntroPopup"].objGuiView.blVisible = blVisible;
    this.arrGuiControllers["reels"].objGuiView.blVisible = blVisible;
    this.arrGuiControllers["autoplayPanel"].objGuiView.blVisible = blVisible;
    this.arrGuiControllers["winPanel"].objGuiView.blVisible = blVisible;
    this.arrGuiControllers["winLines"].objGuiView.blVisible = blVisible;
    this.arrGuiControllers["animations"].objGuiView.blVisible = blVisible;
    this.arrGuiControllers["console"].objGuiView.blVisible = blVisible;
    this.arrGuiControllers["freespinsHUD"].objGuiView.blVisible = blVisible;
    this.arrGuiControllers["freeSpinsCongratsPopup"].objGuiView.blVisible = blVisible;
    this.arrGuiControllers["freeSpinsSummaryPopup"].objGuiView.blVisible = blVisible;
    this.arrGuiControllers["settings"].objGuiView.blVisible = blVisible;
}

/**
 * This function initialises the sound
 * 
 * @param { String } onLoadCompletedCallback A reference to the callback 
 */

StateFactory.prototype.initSound = function (onLoadCompletedCallback)
{	
    // Setup sound configuration path
    var strSoundConfigPath = this.objInitResponseData.objSoundConfiguration.strSoundConfigPath;

    // File name (with extension) for JSON sound configuration
    var strSoundConfigFileName = this.objInitResponseData.objSoundConfiguration.strSoundConfigFileName;

    // Setup (sound-sprite or compatibility-test) sound file name
    var strSoundFileName = this.objInitResponseData.objSoundConfiguration.strSoundFileName;

    // Assign callback for audio loading complete
    var objOnLoadCompleteCallback = onLoadCompletedCallback;
    
    // Instantiate audio plugin (SoundSprite, IESoundSprite OR eventually WebAudio)
    this.objAudioPlugin = new SoundSprite();
    
    // Instantiate new sound player
    this.objSoundPlayer = new SoundPlayer();

    // Assign audioPlugin to sound player
    this.objSoundPlayer.setAudioPlugin(this.objAudioPlugin);

    // Instantiate the sound controller and provide a reference to the sound player
    this.objSoundController = new SoundController(this.objSoundPlayer);

    // Instantiate sound Loader
    this.objSoundLoader = new LoaderSound(strSoundConfigPath, strSoundConfigFileName, strSoundFileName, objOnLoadCompleteCallback);

    // Assign soundPlayer to soundLoader
    this.objSoundLoader.setSoundPlayer(this.objSoundPlayer);	
    
    // Once all configuration & dependencies are setup, load sound :)
    this.objSoundLoader.load();
}

/**
 * 
 */
StateFactory.prototype.gameBlur = function ()
{
    if (StateFactory.BL_SOUND_ENABLED == true)
    {
        var allowLooping = true;
        this.objSoundController.stopSound(allowLooping);
        SoundPlayer.setMuteSound(true, true);
    }
}

/**
 * 
 */
StateFactory.prototype.gameFocus = function ()
{
    if (StateFactory.BL_SOUND_ENABLED == true)
    {
        SoundPlayer.setMuteSound(false, true);
        // retrigger looping sounds if they were playing
        this.objSoundPlayer.retriggerLoop();
    }
}

/**
 * The function called once sound has finished loading. 
 * initialises the sound controller and game specific sound event listeners
 */
StateFactory.prototype.initSoundComplete = function (triggerEvent)
{
    this.blSoundLoaded = true;

    // add blur / focus handling for sound
    var that = this;

    $(window.parent).focus(function ()
    {
        that.gameFocus();
    });

    $(window.parent).blur(function ()
    {
        that.gameBlur();
    });

    // remove listeners for initial button click (to load sound for iOS)  
    if (this.objDetectBrowser.browser == BROWSERS.SAFARI)
    {
        this.arrGuiControllers["lockAndSpinIntroPopup"].getElementByID("okay").removeListener(ButtonController.STATE_CLICK, this.objSoundLoader.onSoundClick);
    }

    // add button listeners for game specific sound events
    var objSpinButtonElement = this.arrGuiControllers["console"].getElementByID("spin");
    
    /*
     * BGB Commented this line below out, 
     * because you could click the Lock & Spin, 
     * then Spin quickly, and the spin sound was playing
     * it seems to be handled correctly somewhere else without relying on this listener anyway.
     * Need to check that specific devices don't rely on this
     */
   // objSpinButtonElement.addListener(ButtonController.STATE_CLICK, this.objSoundController.playSpinSound);

    // check for asset loading complete and switch state if needed
    if (this.blGfxLoaded) this.changeState(StateFactory.INT_ALL_LOADED);
}

/**
 * This function inits a Gui
 * @param { String } strNameGui This name of the Gui to be intitialized 
 */
StateFactory.prototype.initGui = function ( strNameGui, intWidth, intHeight, strCanvasName )
{
    StateFactory.objCanvasQueue.addView ( this.arrGuiControllers[strNameGui].objGuiView, strCanvasName , intWidth, intHeight);    
    var blCaptureMoveEvents = true;    
    this.objEventController.addItem( this.arrGuiControllers[strNameGui], blCaptureMoveEvents);

    if (strNameGui == "autoplayPanel")
    {
    	var that = this;
    	var objTouchStopObject = new TouchLayer(0, 0, 100000, function() { return window.innerHeight - that.objMainConsoleController.objCanvas.offsetHeight }, this.onAutoplayBlockerClick);
    	this.objEventController.addItem(objTouchStopObject);
    }
}


/**
 * This function inits the listeners
 */
StateFactory.prototype.initListeners = function ( )
{
    //Add listeners or callbacks here
	this.arrGuiControllers["console"].getElementByID("spin").addListener(ButtonController.STATE_CLICK, this.objSpinController.onSpinButtonPressed );
	this.arrGuiControllers["console"].getElementByID("lockspin").addListener(ButtonController.STATE_CLICK, this.objSpinController.onSpinButtonPressed );
    this.arrGuiControllers["console"].getElementByID("autoplay").addListener(ButtonController.STATE_CLICK, this.objSpinController.onConsoleButtonPressed );
    this.arrGuiControllers["console"].getElementByID("lineBetPlus").addListener(ButtonController.STATE_CLICK, this.objSpinController.onConsoleButtonPressed );
    this.arrGuiControllers["console"].getElementByID("lineBetMinus").addListener(ButtonController.STATE_CLICK, this.objSpinController.onConsoleButtonPressed );

    // add listeners for initial button click (to load sound for iOS)  
    if (this.objDetectBrowser.browser == BROWSERS.SAFARI)
    {
        this.arrGuiControllers["lockAndSpinIntroPopup"].getElementByID("okay").addListener(ButtonController.STATE_CLICK, this.objSoundLoader.onSoundClick);
    }


    // add ok listener for lock and spin intro popup
    this.arrGuiControllers["lockAndSpinIntroPopup"].getElementByID("okay").addListener(ButtonController.STATE_CLICK, this.showReels);

	var objLinebetButton = this.arrGuiControllers["console"].getElementByID("lineBetMiddle");
    objLinebetButton.addListener(ButtonController.STATE_CLICK, this.objMainConsoleController.onLinebetClicked );
    objLinebetButton.addListener(ButtonController.ON_TOUCH_START, this.objMainConsoleController.onLinebetTouchStart );
    objLinebetButton.addListener(ButtonController.ON_TOUCH_END, this.objMainConsoleController.onLinebetTouchEnd );
}


/**
 * Why is this declared here and when is it used and what for?
 */
StateFactory.resized =  false;


/**
 * This function will be called when the resolution changes.
 */
StateFactory.prototype.addResolutionsCallbacks = function( )
{
    if (this.deviceModel.blResized)
    {
        this.forceResize();
    }
    else
    {
        this.deviceModel.addResolutionChangedCallback(this.objReelsController.resize, true); 
        this.deviceModel.addResolutionChangedCallback(this.objBackgroundController.resize, true);
        this.deviceModel.addResolutionChangedCallback(this.objMainConsoleController.resize, true);
        this.deviceModel.addResolutionChangedCallback(this.objReelsController.resize, true);
        this.deviceModel.addResolutionChangedCallback(this.objPopupsController.resize, true);              
    }
}


/**
 * This function will be called when the resolution 
 * changes.
 *  
 */
StateFactory.prototype.onResize = function( )
{
    //Possible fix for Samsung Galaxy S3
    /*
     * WHY COMMENTED OUT NOW? Is it still needed? 
     if(this.objReelsController != null)
     {
        this.objReelsController.objGuiController.objGuiView.setDirty(true);
        this.objWinLinesController.objGuiController.objGuiView.setDirty(true);
     }
    */
    
    //hide URL bar on each start of touch     
    
    if ( !this.objReelsController)
    {
        return;
    }
    
    if ( window.innerWidth >  window.innerHeight )
    {
        this.strOrientation = "landScape";
    }
    else
    {
        this.strOrientation = "portrait";                
    }
    
    if (this.strOldOrientation != this.strOrientation ||  (this.intOldWidth != StateFactory.WIDTH_CONTAINER|| this.intOldHeight != StateFactory.HEIGHT_CONTAINER) )
    {
        this.blStopResizing = false;
        
        this.strOldOrientation = this.strOrientation;
        this.intOldWidth = StateFactory.WIDTH_CONTAINER;
        this.intOldHeight = StateFactory.HEIGHT_CONTAINER;
    }
    
    if ( this.objGameSettingsController.objGuiController.objGuiView.blVisible)
    {
        this.objGameSettingsController.objGuiController.objGuiView.blDirty = true;
    }
    
    if ( !this.blStopResizing && this.strOrientation == "landScape")
    {
        this.objReelsController.resize();
        this.objBackgroundController.resize();
        this.objMainConsoleController.resize();
        this.objReelsController.resize();
        
        this.blStopResizing = true;
    } 
}

/**
 * 
 */
StateFactory.prototype.forceResize = function( )
{
    if(this.objReelsController != null)
    {
        this.objReelsController.resize();
    }
    if(this.objBackgroundController != null)
    {
        this.objBackgroundController.resize();
    }
    if(this.objMainConsoleController != null)
    {
        this.objMainConsoleController.resize();
    }
    if(this.objPopupsController != null)
    {
        this.objPopupsController.resize();
    }
    if (this.objFreespinConsoleController != null)
    {
        this.objFreespinConsoleController.resize();
    }
}

/**
 * This function will be called by the html file to start the application
 */
StateFactory.start = function()
{
    /*
     *  Make sure StateFactory is started and initialised so that
     *  objSidebarCommController exists.
     */
    StateFactory.getInstance().objSidebarCommController.requestStartupParameters();
}   


/*
 * This will receive the response from the sidebar,
 * which sends the sidebar.StateFactory's startup parameters. 
 */
StateFactory.prototype.processStartUpConfiguration = function( objInfo )
{
    StateFactory.GAME_CONFIG = new GameConfig.className(objInfo.initParamsObj, StateFactory.SUPPORTED_LANGUAGES);
	var objGlobalizeLoader = new GlobalizeLoader(Globalize, StateFactory.GAME_CONFIG, StateFactory.PATH_GLOBALIZE);
	
    if (objInfo.initParamsObj)
    {
        StateFactory.getInstance().initParamsObj = objInfo.initParamsObj;    
    }
    
    StateFactory.WIDTH_CONTAINER = objInfo.width;
    StateFactory.HEIGHT_CONTAINER = objInfo.height;
    
    //start loading globalize
    objGlobalizeLoader.load(StateFactory.getInstance().continueStart);
}

/**
 * Continue startup with server details etc 
 */
StateFactory.prototype.continueStart = function()
{    
    StateFactory.getInstance().init();
    StateFactory.getInstance().changeState( StateFactory.INT_START );
    
    MainLoop.getInstance().addItem(this.onResize);
}


/**
 * SIDEBAR button click handler.
 */
StateFactory.prototype.processButtonMessages = function(strMessage)
{
    switch (strMessage)
    {
        case "sound_off":
            SoundPlayer.setMuteSound(true);
            break;
        case "sound_on":
            SoundPlayer.setMuteSound(false);
            break;
        case "settings":
        	if( this.okToShowSettingsPanel() )
        	{
        		this.objGameSettingsController.show();
        	}
        	else
        	{
        		alert("Error, settings dialog is not available in this state");
        	}
            break;
        case "paytable":
        	//console.log("paytable clicked");
            break;
        case "help":
        	//console.log("help clicked");
            break;
        default:
        	console.log("unknown button clicked: " + strMessage);
        	break;
    }

}

/**
 * 
 */
StateFactory.prototype.okToShowSettingsPanel = function()
{
	if( this.intState == StateFactory.INT_SHOW_REELS )
	{
		if( this.objSpinController.intSpinButtonState == SpinController.WIN_ANIMATION || 
		    this.objSpinController.intSpinButtonState == SpinController.IDLE )
		{
			return true;
		}
	}
	
	return false;
}

/**
 * on click of grayed area closes autoplay 
 * @param {Object} event
 */
StateFactory.prototype.onAutoplayBlockerClick = function(event)
{
	if (this.objAutoplayController && this.objAutoplayController.objAutoplaySelect && this.objAutoplayController.objAutoplaySelect.isVisible())
	{
		this.objMainConsoleController.onAutoplayButtonClick();
		event.stopPropagation();
	}
}

/**
 * -------------------------------------------------------------------------------------
 * NOTE FOR STANDALONE ONLY:
 */


/**
 * -------------------------------------------------------------------------------------
 */
