/**
 * @author Javier.Ortega
 * 
 * This class will handle the switch between different Screens
 */


function StateFactory()
{
    LoadingScreenController.blHide = true;
    
    document.getElementById("sidebar-wrapper").style.display = "none";
    
    /**
     * @type {PortraitController}
     */
    this.objPortraitController;
    
    /**
     * The current controller
     * @type {Object}
        Pretty sure this isn't used  
	this.objCurrentController;
	*/

    /**
     * The Gui factory to ask for one screen or other
     * @type {Object}
     */
    this.objGuiFactory;
	
    /**
     * The current state
     * @type {int}
     */
    this.intState = StateFactory.INT_SHOW;	
    
    
    /**
     * The current state
     * @type { Object }
        Pretty sure this isn't used  
    this.objMainCanvasController;
    */
   
    /**
     * An array
     * @type { Object }
     */    
    this.objCanvasQueue ;
	
	/**
     * Binding functions
     */
	this.showGui = this.showGui.bind (this);
	this.resolutionChanged = this.resolutionChanged.bind(this); 
	this.addResolutionsCallbacks = this.addResolutionsCallbacks.bind ( this );	
    this.checkPortrait = this.checkPortrait.bind(this);
    this.onResize = this.onResize.bind(this);
    
	StateFactory.LOADED = true;
		
    IFrameMessengerModel.init();
    
    /**
     * Timeout for resize message sent to the game
     */
    this.resizeTimeout = null;

    
    /**
     * Object to create and maintain external pages 
     * e.g. "help" ("rules"), "paytable"
     */
    this.objExternalPageController;
    
}

/**
 * Derive GuiView from our base type to provide inheritance
 */
Class.extend( Class, StateFactory );


/**
 * This function will init all the nesary objects 
 */
StateFactory.prototype.init = function ()
{
    this.deviceModel = new DeviceModel();
    
    this.objCanvasQueue = new CanvasQueue( this.deviceModel );
    
    this.objGuiFactory = new GuiFactory();
    
    this.arrGuiControllers;
}


/////Collection for the different possible states
/**
 * The state to show the splashscreen
 * while the initial config is loading from the server
 * @type { Integer }
 */ 
StateFactory.INT_START = 0;
/**
 * The state to show the reels
 * @type { Integer }
 */ 
StateFactory.INT_SHOW = 1;
/**
 * The state to show the helps screen
 * @type { Integer }
 */
StateFactory.INT_HELP = 3;
/**
 * The state to show the pay table
 * @type { Integer }
 */
StateFactory.INT_PAY_TABLE = 4;
///////////////////////////////////END STATES

/**
 * This function handles a big switch to change from one context to other
 * @param { Integer } intNewState The new state.
 */
StateFactory.prototype.changeState = function( intNewState )
{
    this.intState = intNewState;
    switch ( intNewState )
    {
        case StateFactory.INT_START:            
        {
            var hideUrlBarCallback = function(e)
            {
                //hide URL bar on each start of touch
                /*
                 * This is done in multiple places including every
                 * DomBuilder.build method
                 */
                BrowserWindow.getInstance().hideUrlBar();
            };

            EventController.SETUP.mainElement = document.body;
            EventController.SETUP.onTouchStart = hideUrlBarCallback;

            this.changeState(StateFactory.INT_SHOW);
        }        	  	
        break;
        
        case StateFactory.INT_SHOW:
            this.objGuiFactory.objCallBack = this.showGui;
            
            var arrGuisToLoad = ["sideBar","bottom", "portrait"];
            
            this.objGuiFactory.getGuis(arrGuisToLoad);
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
};

/**
 * This function will be called when the controller for the Gui is ready
 * @param { Object } arrGuiControllers The collection of controllers for the Guis
 */
StateFactory.prototype.showGui = function( arrGuiControllers )
{
    switch ( this.intState )
    {
        case StateFactory.INT_START:            
            
        	
        break;

        case StateFactory.INT_SHOW:
            this.arrGuiControllers = arrGuiControllers;

            this.objEventController = new EventController(EventController.SETUP);        
            this.initMain();
            
            if (this.deviceModel.platform == OS.ANDROID && this.deviceModel.browser != BROWSERS.CHROME)
            {
	        
	            this.objCanvasQueue.getCanvasController("sideBar").blSemitransparence = true;
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
 * This function inits the main Screen with the Rails and the Button Bar
 */
StateFactory.prototype.initMain = function ( )
{
    
    if (this.deviceModel.strDeviceType == "Mobile" || this.deviceModel.strDeviceType == "iPhone")
    {
        StateFactory.BIG_BUTTONS = 1.5;        
    }
    else
    {
        StateFactory.BIG_BUTTONS = 1;
    }
     
    //Init the Guis
    /* 
     * The "Gui"s to be initialised are hardcoded here. We MUST have all three of these
     * to allow us to run the game. The "sidebar" depends on the "bottom" to be created so that
     * bottomBarController exists.
     *  
     * I assume "bottom" is the 
     */
    
    this.initGui("bottom",MenuController.WIDTH,MenuController.HEIGHT,"bottom");
    
    this.objBottomBarController = new BottomController(this.deviceModel, 
                                                   this.arrGuiControllers["bottom"]);
    
    this.arrGuiControllers["bottom"].objExternalController = this.objBottomBarController;    
    
    this.objIframeController = new IFrameController(this.deviceModel, this.objBottomBarController);

    this.objScreenCoverController = new ScreenCoverController();

    this.initGui("sideBar",MenuController.WIDTH * StateFactory.BIG_BUTTONS,MenuController.HEIGHT * StateFactory.BIG_BUTTONS,"sideBar");
       
    this.objSideBarController = new MenuController(null,this.deviceModel, this.arrGuiControllers["sideBar"], this.objIframeController, this.objScreenCoverController, this.objBottomBarController.assignLang);

    this.arrGuiControllers["sideBar"].objExternalController = this.objSideBarController;




	//init portrait controller
	this.objPortraitController = new PortraitController(this.arrGuiControllers["portrait"], document.getElementById("portrait"));

	//init message controller
    this.initMessageController();
    
    //    
    BrowserWindow.getInstance().addOnCurrentWindowScroll(function() {
    	if (window.document.body.scrollTop > 1)
    	{
    		BrowserWindow.getInstance().hideUrlBar();
    	}
    });
    
    /*
     * I think this is a listener for any resizing the window event.
     * Not sure if it covers us for orientation.
     */
    MainLoop.getInstance().addItem(this.onResize);
}


StateFactory.BIG_BUTTONS = false;

/**
 * This function inits a Gui
 * 
 * @param { String } strNameGui This name of the Gui to be intitialized 
 */
StateFactory.prototype.initGui = function ( strNameGui, intWidth, intHeight, strCanvasName )
{
    this.objCanvasQueue.addView ( this.arrGuiControllers[strNameGui].objGuiView, strCanvasName , intWidth, intHeight);    
    var blCaptureMoveEvents = true;
    this.objEventController.addItem( this.arrGuiControllers[strNameGui], blCaptureMoveEvents);
}


/**
 * This function will be called when the resolution 
 * changes.
 *  
 */
StateFactory.prototype.onResize = function( )
{
    
    if ( window.innerWidth >  window.innerHeight )
    {
        this.strOrientation = "landScape";
    }
    else
    {
        this.strOrientation = "portrait";
        
        //Fix added for HTC_One_X
        if (navigator.userAgent.match (/HTC_One_X/i) )
        {
            document.body.style.width = window.innerWidth + "px";
            document.body.style.height =  window.innerHeight + "px";                    
        }
    }
    
    //Relocate the different elements if the screen size changes
    DomBuilder.setCoordinatesLoadingScreeen();
    
        
    var objDomLoadingScreen = document.getElementById("loadingScreen");
    if (objDomLoadingScreen)
    {           
        objDomLoadingScreen.style.width = "100%";
        objDomLoadingScreen.style.height = window.innerHeight + "px";
        
        objDomLoadingScreen.style.width = "100%";
        objDomLoadingScreen.style.height = window.innerHeight + "px";
        objDomLoadingScreen.style.top = "0px";
        objDomLoadingScreen.style.left = "0px";
        objDomLoadingScreen.style.marginTop = "0px";
        objDomLoadingScreen.style.marginLeft = "0px";
        objDomLoadingScreen.style.display = "block";
    }
    
    if (this.strOldOrientation != this.strOrientation)
    {    
        IFrameController.sendMessageToIframe("orientation", this.strOrientation);
    }
    
    if (this.strOldOrientation != this.strOrientation ||  (this.intOldWidth != window.innerWidth|| this.intOldHeight != window.innerHeight) )
    {
        
        this.blStopResizing = false;
        
        this.strOldOrientation = this.strOrientation;
        this.intOldWidth = window.innerWidth;
        this.intOldHeight = window.innerHeight;
    }
    
    if ( !this.blStopResizing && this.strOrientation == "landScape" )
    {
        this.resolutionChanged();                
            
        this.blStopResizing = true;
        
        //We will resize the Iframe Content for iOS only in the case that we are in landscape to fix the error for iOS 6 switching Normal/Full screen mode
        if (this.strOldOrientation == "landScape" && ( navigator.userAgent.match (/iPhone/i) ||  navigator.userAgent.match (/HTC_One_X/i) || navigator.userAgent.match (/GT-I9100/i)  ) )
        {
            var obj = {};
            obj.width = IFrameController.WIDTH;
            obj.height = IFrameController.HEIGHT;            
            var msg = JSON.stringify(obj);
            IFrameController.sendMessageToIframe("resize", msg);
        } 
    }

    this.checkPortrait();
}

/**
 * This function will be called when the resolution 
 * changes.
 *  
 */
StateFactory.prototype.addResolutionsCallbacks = function( )
{
    if (this.deviceModel.blResized)
    {
        this.resolutionChanged();
    }
    else
    {
        this.deviceModel.addResolutionChangedCallback(this.resolutionChanged, true);                
    }
    
    this.deviceModel.addResolutionChangedCallback(this.checkPortrait, false);
}

/**
 * This function will be called when the resolution 
 * changes.
 *  
 */
StateFactory.prototype.resolutionChanged = function(intWidth, intHeight)
{	
	document.body.style.width = window.innerWidth + "px";
	document.body.style.height = document.getElementById("sidebar-wrapper").style.height = window.innerHeight + "px";



    var flZoomRatio = window.innerWidth / BottomController.WIDTH;
    var flZoomRatioSidebar = flZoomRatio;

    if ( flZoomRatioSidebar > 1 && (this.deviceModel.platform == OS.WINDOWS) )
    {
    	flZoomRatioSidebar = 1;
    }
    
	this.objBottomBarController.resize(flZoomRatio); //resize bottom bar first
	this.objSideBarController.resize(flZoomRatioSidebar, this.objBottomBarController.intHeightPx);


	this.objIframeController.resize(flZoomRatio, this.objBottomBarController.intHeightPx);
	
	this.objScreenCoverController.resize();
	
	//inform the game about this change, but not too often
	
	//It seems that it is not needed
	//TO DELETE : after a cross platform test
	//clearTimeout(this.resizeTimeout);
	/*this.resizeTimeout = setTimeout(function() {
		IFrameController.sendMessageToIframe("resizeWindow", null);
	}, 500);*/
	
	var borwserWindow = BrowserWindow.getInstance();
	//BrowserWindow.getInstance().hideUrlBar();

	//resize external page
	if (this.objExternalPageController)
	{
		this.objExternalPageController.resize();
		if (this.objExternalPageController.isVisible())
		{
			//hide all except bottom bar
			this.objCanvasQueue.showOnly("bottom");
		}
	}
    BrowserWindow.getInstance().hideUrlBar();
    
    document.getElementById("sidebar-wrapper").style.display = "block";
};


StateFactory.oldBlOrientation = false;

StateFactory.prototype.checkPortrait = function ()
{
    
    var blOrientation = window.innerWidth < window.innerHeight;
    if (blOrientation != StateFactory.oldBlOrientation )
    {
        if (blOrientation)
        {
            this.setPortraitVisible(true);             
            StateFactory.oldBlOrientation = blOrientation;
        }
        else
        {
            this.setPortraitVisible(false);
            StateFactory.oldBlOrientation = blOrientation;
        }
    }

}

/**
 * Set the visibility of the portrait screen. This screen is an iFrame constructed by DomBuilder
 * and positioned over the top of everything so it covers everything up when invoked.
 * There is no need to hide anything else.
 * Note: the images in the portrait screen are resourced in objPortraitController.init()
 */
StateFactory.prototype.setPortraitVisible = function(blVisible)
{
   this.objSideBarController.blDisableButtonClick = blVisible;

   
    //Adding this fix only for the specific devices where it is needed (HTC_ONE_X)
    if (navigator.userAgent.match (/HTC_One_X/i) )
    {
        document.getElementById("container").style.display = !blVisible ? "block" : "none";
        document.getElementById("container").style.display = !blVisible ? "block" : "none";
        document.getElementById("sideBarArea").style.display = !blVisible ? "block" : "none";
        document.getElementById("bottomArea").style.display = !blVisible ? "block" : "none";
       
       
       document.getElementById("sidebar-wrapper").style.display = !blVisible ? "block" : "none";
    }
    
    document.getElementById("portrait").style.width = window.innerWidth + "px";
    document.getElementById("portrait").style.height = window.innerHeight + "px";
   
   
    this.objPortraitController.setVisible(blVisible);
   
    BrowserWindow.getInstance().hideUrlBar();
    window.scrollTo(0, 1);
   
   /*
    * Send a message out to the game that orientation has been changed
    */
    IFrameController.sendMessageToIframe("portraitWarning", blVisible); 
}


/**
 * This function will be called by the html file to start the application
 */
StateFactory.start = function(initParamsObj, fncCallback)
{
    /*
     * Virtuefusion server startup parameters are supplied by the 
     * start page (currently called loader-test.html) which supplies
     * a query string full of params.
     * These:
     *      StateFactory.initParamsObj = initParamsObj;
     *      StateFactory.fncCallBack = fncCallback;                
     *      MenuController.config = initParamsObj.siteConfig;
     *      Configuration.strLangCode = initParamsObj.locale;
     * should be here if we are running on the VF platform
     * If not.. HAVE YOU DEFINED "VF" in your local.properties ant file: 
     *          local.flags=VF
     */
    StateFactory.initParamsObj = initParamsObj;
    StateFactory.fncCallBack = fncCallback;                
    MenuController.config = initParamsObj.siteConfig;
    Configuration.strLangCode = initParamsObj.locale;  
    
    /*
     * Create page elements (divs etc) appropriate to platform.
     */
    DomBuilder.setDomElelements();
    DomBuilder.init();

    /*
     * Start application
     */    
    var objStateFactory = new StateFactory();    
    objStateFactory.init();    
    objStateFactory.changeState( StateFactory.INT_START );
};


/**
 * Add an event listener to the window object, of type "message".
 * NOTE:
 * window.addEventListener is bound to window, such that any calls into it
 * that reference "this" will reference the window, not the object that
 * called the method as with an unbound method.
 * Therefore we alias "this" i.e. StateFactory, calling it "that" in this context
 * so that it is StateFactory's handleListenExternalMessages (sic) method that 
 * will run when this event listener is invoked.
 * Another way to do this might be to supply a static method e.g.
 * StateFactory.handleListenExternalMessages(event.data)
 * That would complicate things though as everythign in there would need to be static.
 * Another alternative is to use StateFactory.getInstance() ie run this object as a Singleton.
 */
StateFactory.prototype.initMessageController = function()
{
    var that = this;
    window.addEventListener("message", function(event)
    {
        that.handleListenExternalMessages(event.data);
    }, false);
}

/**
 * Receive POST messages from the GAME 
 * via the FRAMEWORK's IFrameMessengerModel's sendMessage method.
 */
StateFactory.prototype.handleListenExternalMessages = function(strJSON)
{
    var objJSON = JSON.parse(strJSON);
    switch ( objJSON.type )
    {
        /*
         * Handle loading messages and percentage from game's Loader process
         * loader page currently run by the DomBuilder!
         */
        case "loadingScreen":
        {
            switch(objJSON.message)
            {
                case "echo":
                {
                    DomBuilder.setLoadingInfo(objJSON.value);
                }
                break;
                
                // Initialise the loading page if necessary
                case "loadingStarted":
                    DomBuilder.initLoadingProgress(objJSON.message);
                break;
                
                // Update the loading percentage
                case "progress":
                    DomBuilder.setLoadingProgress(objJSON.percent);
                break;

                // Remove loading page and signal game OK to start (release UI etc)
                case "loadingCompleted":
                    DomBuilder.removeLoadingScreen();

                    var response = JSON.stringify({type:"loadingScreen",message:"startGame"});
                    IFrameController.sendMessageToIframe(objJSON.type, response);
                break;
                
            }
        }
        break;
        
        case "StartUp":
        {
                var settings = JSON.stringify(StateFactory.initParamsObj);
                
                var info = new Object();
            
                if( objJSON.message == "configRequest" )
                {
                
                info.initParamsObj = StateFactory.initParamsObj;
                }
                
                info.width = IFrameController.WIDTH;
                
                info.height = IFrameController.HEIGHT;
                
                info = JSON.stringify(info);
                
                IFrameController.sendMessageToIframe(objJSON.type, info);
            
        }
        break;
        
        case "amount":
            if ( this.objBottomBarController )
            {
                this.objBottomBarController.txtAmount.setText (objJSON.amount);                
                this.arrGuiControllers["bottom"].objGuiView.blDirty = true;
            }
            break;
        case "autolock":            
            
            //TO DO : To add the proper variable from the proper class
            //Send off or on, depending of the autolock is enabled/disabled in the settings panel
            if (false)
            {
                IFrameController.sendMessageToIframe("autolock", "Off");
            }
            else
            {
                IFrameController.sendMessageToIframe("autolock", "On");
            }
            
            break;
        case "paused":
            // --    
        break;
        
        case "hideSideBar":
            if ( objJSON.actionType == "hide" )
            {
                this.objCanvasQueue.showOnly("bottom");
            }
            else 
            {
                this.objCanvasQueue.restoreAll();
            }
            
            break;
        case "loading":
            switch (objJSON.actionType)
            {
                case "loaded":
                    this.objCanvasQueue.restoreAll();
                break;
            }
        break;

        case "setEnabled":
        	var blEnabled = objJSON.actionType;
       		//close sidebar if necessary
        	if (!blEnabled && this.objScreenCoverController.isVisible())
        	{
	        	this.objScreenCoverController.setVisible(objJSON);
        	}
        	//make sidebar disabled / enabled
        	this.objSideBarController.setSidebarEnabled(blEnabled);
        break;
        	
		case "balance":
            if (objJSON.typeBalance == "balanceLow")
            {
                this.objBottomBarController.setLowBalance(true);
            }
            else
            {
                this.objBottomBarController.setLowBalance(false);
            }
        break;
           
        /*
         * Common code for launching external page
         */
    	case STRINGS.PAYTABLE:
   			console.log("SIDEBAR StateFactory should launch PAYTABLE at " + objJSON.message);
        case STRINGS.HELP:
        {
        	
        	
            this.objExternalPageController = new ExternalPageController(this.deviceModel,
                                                                     this.objCanvasQueue,
                                                                     document.getElementById('container'),
                                                                     this.objBottomBarController,
                                                                     this.objSideBarController,
                                                                     null,
                                                                     objJSON);
        															 
			this.objExternalPageController.createIFrame();
	    }
        break;
    }
}

/**
 * 
 * @param {String} strAmount
 */
StateFactory.formatCurrency = function (strAmount)
{
    if (strAmount == "")
    {
        strAmount = 0;
    }
    var strFormattedNumber = Localisation.formatNumber(strAmount);
    return strFormattedNumber;
}



var initGame = StateFactory.start;

