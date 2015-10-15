/**
 * @author Javier.Ortega
 * 
 * This class will handle the specific functionalities for the Reels View
 * Scaling up or down and centering the reels for all the different devices
 */


/**
 * Constructor
 * @param { Object } objMainConsole The height of the bottom bar
 * @param { Object } objGuiController The height of the bottom bar
 * @param { Object } intHeightBottomBar The height of the bottom bar
 */
function ReelsController( objMainConsole, 
						  objDeviceModel, 
						  objGuiController, 
						  arrReelSymbols, 
						  objSymbolTable, 
						  objSoundController)
{
    this.resourcesLoaded = this.resourcesLoaded.bind (this);
    this.initSlotReelsAnimations = this.initSlotReelsAnimations.bind (this);
    this.initSymbolsSlots = this.initSymbolsSlots.bind(this);
    this.spin = this.spin.bind(this);
    this.freespin = this.freespin.bind(this);
    this.lockspin = this.lockspin.bind(this);
    this.handlerSymbolClicked = this.handlerSymbolClicked.bind (this);
    this.finishedAnimation = this.finishedAnimation.bind(this);
    this.setAnimations = this.setAnimations.bind(this);
    this.lockWilds = this.lockWilds.bind(this);
    this.setWildSelectedCallback = this.setWildSelectedCallback.bind(this);
    this.assignController = this.assignController.bind(this);
    this.assignReelAnimations  = this.assignReelAnimations.bind(this);
    this.fnLockspinCallback = this.fnLockspinCallback.bind(this);
    this.updateLockspinBetParameters = this.updateLockspinBetParameters.bind(this);
    this.hasLockedWilds = this.hasLockedWilds.bind(this);
    this.clearAllLockedWilds = this.clearAllLockedWilds.bind(this);
    this.onReelStopped = this.onReelStopped.bind(this);

    this.objSoundController = objSoundController;
    
    this.objGameSettings = GameSettings.getInstance();
    
    this.fnOnWildSelected;
    
    /**
     * TO signal reels stopped and animate the win symbols
     */
	this.fnUpdateReelsCompleteCallback;
	this.fnReelStoppedCallback;
    this.startSlotAnimations = this.startSlotAnimations.bind(this);
    this.stopSlotAnimations = this.stopSlotAnimations.bind(this);
    this.fnSlotAnimationsCompleteCallback;
    this.arrReelSymbols = arrReelSymbols;

    this.onConnectionError = this.onConnectionError.bind(this);
    
	/**
	 * TODO remove: temp  
	 */
    this.intTimeoutId;
    
    /**
     * Which reelset in use (normal/freespins etc)
     */
    this.intLayout = 0;
    
    /**
     * Symbols 
     */
    this.objSymbolTable = objSymbolTable;
    
    /**
     * This is the div container for the canvas
     * @type {Object}
     */
    this.objDivContainer = document.getElementById('reelsArea');
    
    /**
     * This canvas reference
     * @type {Object}
     */    
    this.objCanvas = document.getElementById('reels');
    
    /**
     * A reference to the controller for the Bottombar
     * @type {Object}
     */    
    this.objMainConsole = objMainConsole;
    
    /**
     * A refernce to the Gui controller for the reels
     * @type {Object}
     */
    this.objGuiController =  objGuiController;
    
    this.create(objDeviceModel, objGuiController );

    /**
     * The assets Factory
     * @type {Object}
     */
    this.objAssetsFactory = new AssetsFactory(); 
    
    this.objAssetsFactory.getResources(this.resourcesLoaded, (["LockIconSymbol_20001.png","LockIconSymbol_20002.png","loseOverlay.png"].concat(ReelsController.SYMBOLS_ARRRAY)).concat(ReelsController.REELS_ANIMATION_ARRRAY) );
    

    /**
     * The array of the reel animations
     * @type {Array}
     */    
    this.arrReelsController = new Array();
    
    /**
     * setSpinController will set this
     * @type {SpinController} 
     */
    this.objSpinController;

    /**
     * The array of symbols
     * @type {Array}
     */      
    this.arrSlotSymbols = new Array();

	/*    
    var that = this;
    this.mainRunLoop = setInterval(function() 
    {
        that.mainRun();
    }, 30 );
    */
	this.mainRun = this.mainRun.bind(this);
	MainLoop.getInstance().addItem(this.mainRun);
    
    /**
     * The state
     * @type {int}
     */  
    this.intState = ReelsController.STOP;
    
    //this.arrReelsPositions
    this.arrNewPositions = [0,1,2,3,4];
    
    /**
     * An instance of the WildsSelector
     */
    this.objWildsSelector;
    
    /**
     * Array of external controllers to apply the same scale factors than to this controller
     *  @type { Array }
     */
    this.arrControllers = [];
    
    var objPlaceHolder = this.objGuiController.objGuiView.getPlaceHolder("pixel1");   
    
    ReelsController.INIT_X = objPlaceHolder.intX;
    ReelsController.INIT_Y = objPlaceHolder.intY;
}

/**
 * Derive ReelsController from our base type to provide inheritance
 */ 
Class.extend(ScreenLogicController, ReelsController);

ReelsController.ROWS = 3;
ReelsController.COLUMNS = 5;

/**
 * Is wild selection enabled at the moment?
 * @type { boolean } 
 */
ReelsController.blWildSelectionEnabled = true;

ReelsController.WIDTH = 138;
ReelsController.HEIGHT = 416;

ReelsController.INIT_X = 150;
ReelsController.INIT_Y = 40;
ReelsController.GAP_X = 10;
ReelsController.GAP_Y = 0;

ReelsController.START_BOUNCE = 0;
ReelsController.START_SPIN = 1;
ReelsController.SPIN = 2;
ReelsController.END_BOUNCE = 3;
ReelsController.STOP = 4;
ReelsController.ANIMATING_SYMBOLS = 5;
ReelsController.END_SPINNING = 6;
ReelsController.GO_WILD = 7;
                                  
ReelsController.SYMBOLS_ARRRAY = ["Icon0.png", "Icon1.png", "Icon2.png", "Icon3.png",
                                    "Icon4.png", "Icon5.png", "Icon6.png", "Icon7.png",
                                    "Icon8.png", "Icon8.png", "Icon10.png"];
                                  
ReelsController.REELS_ANIMATION_ARRRAY = ["reels1.jpg","reels2.jpg","reels3.jpg","reels4.jpg","reels5.jpg","reels6.jpg","reels7.jpg","reels8.jpg"];                                  

/**
 * 
 */
ReelsController.prototype.assignController = function(strName,objController)
{
	this.arrControllers[strName] = objController;
}


/**
 * Callback to be called when all the extra resources needed are ready
 * @param { Array } arrResources The array containing the image for the reels
 */ 
ReelsController.prototype.resourcesLoaded = function (arrResources)
{
    //To build the animations for the reels
    this.initSlotReelsAnimations();    
    
    //To build the array with the symbols
    this.arrSymbols = new Array();
    
    this.imgSlotOverlay = arrResources["loseOverlay.png"];
    
    for ( var i = 0 ; i < ReelsController.SYMBOLS_ARRRAY.length ; i++ )
    {
        this.arrSymbols[ ReelsController.SYMBOLS_ARRRAY[i] ] = arrResources[ ReelsController.SYMBOLS_ARRRAY[i] ];
    }
    
    
    this.arrSpritesReelAnimation = [];
    for ( var i = 0 ; i < ReelsController.REELS_ANIMATION_ARRRAY.length ; i++ )
    {
        
        var objSprite = arrResources[ ReelsController.REELS_ANIMATION_ARRRAY[i] ]
        this.arrSpritesReelAnimation[i] = new ElementView();
        
        this.arrSpritesReelAnimation[i].init( this.objGuiController.objGuiView.context, 
                                   objSprite, 
                                   1, 
                                   objSprite.width, 
                                   objSprite.height );
                                   
        this.arrSpritesReelAnimation[i] .intX = 0;
        this.arrSpritesReelAnimation[i] .intY = 0;
    }
    
    /**
     *  The new positions to be updated when the animation stops
     * { Array }
     */
    //this.arrNewPositions = [];
    
    this.arrResources = arrResources;
    
    this.objGuiController.objGuiView.changeLayer("reels_frame.png",3);
    this.objGuiController.objGuiView.changeLayer("freespins_.png",4);
    this.objGuiController.objGuiView.changeLayer("wildgamblertitle.png",4); 
    
    this.assignReelAnimations();

}


/**
 * The SpinController needs to know when a wild symbol was clicked on
 * so that it can cancel all winline animation, and maybe do other things too. (TODO) 
 */
ReelsController.prototype.setWildSelectedCallback = function( fnCallback )
{
	this.fnOnWildSelected = fnCallback;
}


/**
 * This function will comunicate to the individual reels that the response from the server was received or not
 */
ReelsController.prototype.setResponseReceivedInReels = function (blValue, blQuickstop)
{
    for ( var i = 0; i < ReelsController.COLUMNS ; i++ )    
    {
        this.arrReelsController[i].responseReceived(blValue, blQuickstop);
    }    
}

/**
 * A function to set the animation object in memory
 * @param { Object } objAnimations The object containing the animations
 */ 
ReelsController.prototype.setAnimations =  function ( objAnimations )
{
    this.objAnimations = objAnimations;
    
    if (this.arrResources && this.arrResources["Icon10.png"])
    {
        this.initSelector(this.arrResources["Icon10.png"]);
    }
    
    
    for ( var i = 0; i < this.arrReelsController.length ; i++ )
    {
         this.arrReelsController[i].setAnimations( this.objAnimations);
    }
    
}

/**
 * To enable the animation for lions, breaking the cages 
 * @param { function } fnCallback The callback to be called when all the animations are finished
 */ 
ReelsController.prototype.startBreakJailAnimations =  function ( fnCallback )
{
    if (this.objSelectionIcon)
    {
        this.objSelectionIcon.intState = WildsView.STARTING_BREAKING;
        if (this.objAnimations)
        {        
            this.objSelectionIcon.setParticles(this.objAnimations.arrSymbolAnimations["CageBreaker"]);
        }
        this.objSelectionIcon.objCallBack = fnCallback;
    }    
}

/**
 * This method seeks to lock all the wilds on the reels immediately before a spin.
 * Used during freespins.
 * First freespin locks any wilds that arrived on the last main reels spin.
 * Subsequent freespins lock all wilds that arrive every spin.
 */
ReelsController.prototype.lockWilds = function( objSymbolData, fnCallback )
{
	/*
	 * Clear out the selection array.
	 * TODO Not sure why this AND "setWildsInTheReels" is necessary?
	 */
	this.objWildsSelector.cleanSelection();
														  
	/*
	 *  Set all wild positions to true, including the new ones that may have landed.
	 */
	for(var i=0; i<objSymbolData.length; ++i)
	{
		var intReel = Math.floor(i/3);
		var intSymbol = parseInt(i%3);
		if(objSymbolData[i] == this.objSymbolTable.find("Wild").intId)
		{
			if ( !this.objWildsSelector.arrWilds [intReel] )
		    {
		        this.objWildsSelector.arrWilds [intReel] = new Array();
		    } 	  
    		this.objWildsSelector.arrWilds [intReel][intSymbol] = true;
		}
	}
	
	/*
	 * This tells the reels which of their symbols have been overlaid by a WILD.
	 * TODO surely the reels should know this already as they were set when the
	 * symbols landed? If not this needs fixing. 
	 */
	this.objWildsSelector.setWildsInTheReels(this);

	/*
	 *  This gets run when the locking animation has finished
	 */
	this.objSelectionIcon.objCallBack = fnCallback;
	
	/*
	 * This starts the locking animation.
	 * "this.objSelectionIcon" is actually a WildsView object, and is running in a continuous loop
	 * TODO Why is this re-named as something entirely unconnected with its functionality?  
	 */
   	this.objSelectionIcon.intState = WildsView.STARTING_LOCKING;
   	
    /*
     *  play cage lock sound
	this.objSoundController.playCageLockSound(this.objWildsSelector.arrWilds)
     */
}

/**
 * To enable the animation for a set of slots
 * @param { Array } arrIndexes The indexes for the slots where enabling the animations
 * @param { function } fnCallback The callback to be called when all the animations are finished
 */ 
ReelsController.prototype.startSlotAnimations =  function ( arrIndexes, fnCallback )
{
    var intReel;
    var intSlot;
    
    this.stopSlotAnimations();
    
    this.intNumberAnimations = 0;
    
    for (var i in arrIndexes)
    {
        intReel = Math.floor(arrIndexes[i] / 3);        
        intSlot = arrIndexes[i] % 3;
        
        this.arrEnabled[arrIndexes[i]] = true;
        
        this.arrReelsController[intReel].enableSlot(intSlot, this.finishedAnimation); 
        this.arrControllers["animationsController"] .objGuiController.objGuiView.blAnimated = true;
        this.intNumberAnimations++;
    }
    
    var blEnabled;
    for (var j = 0;  j < 15 ; j++)
    {
        intReel = Math.floor(j / 3);
        intSlot = j % 3;

        if (this.arrEnabled[j] )
        {
            blEnabled = false;
        }
        else
        {
            blEnabled = true;
        }

        this.arrReelsController[intReel].disableSlot(intSlot, blEnabled);
        this.objSelectionIcon.enableOverLay(intReel, intSlot, blEnabled);
    }
    
    this.fnSlotAnimationsCompleteCallback = fnCallback;
    
    this.intState = ReelsController.ANIMATING_SYMBOLS;
}


/**
 * This function will remove all the overlays from the screen 
 */
ReelsController.prototype.removeAllTheOverlays = function()
{
    for (var j = 0;  j < 15 ; j++)
    {
        intReel = Math.floor(j / 3);
        intSlot = j % 3;
        this.arrReelsController[intReel].disableSlot(intSlot, false);
        this.objSelectionIcon.enableOverLay(intReel, intSlot, false);
    }
    
    for ( var intX in this.arrWilds )
    {
        for ( var intY in this.arrWilds[intX] )
        {
             this.arrWilds [intX][intY] = false;
        }
    }
    
    this.objWildsSelector.arrOverlayWilds = new Array();
    
}

/**
 * This function will be called when all the animations are finished
 */ 
ReelsController.prototype.finishedAnimation =  function ( )
{
 
    this.intNumberAnimations--;
    
    if (this.intNumberAnimations <= 0 )
    {
        if (this.fnSlotAnimationsCompleteCallback)
        {
            this.fnSlotAnimationsCompleteCallback();
            this.fnSlotAnimationsCompleteCallback = null;
            this.stopSlotAnimations();
            
        }
    }
}

/**
 * To enable the animation for a set of slots.
 */ 
ReelsController.prototype.stopSlotAnimations = function ( )
{
    var intReel;
    var intSlot;
    
    for ( var i in this.arrReelsController )
    {
        this.arrControllers["animationsController"] .objGuiController.objGuiView.blAnimated = false;
        this.arrControllers["animationsController"] .objGuiController.objGuiView.clean();
        this.arrReelsController[i].disableSlotsAnimations();
        
        if (this.objSelectionIcon)
        {
            this.objSelectionIcon.intState = WildsView.NORMAL;
        }          
    }
    this.objGuiController.objGuiView.setDirty(true);
}

/**
 * To enable the animation for a set of slots.
 */ 
ReelsController.prototype.hideOverlays = function ( )
{
    for ( var i in this.arrReelsController )
    {
        this.arrReelsController[i].hideOverlays();
    }

	//mark layer to redraw
    this.objGuiController.objGuiView.setDirty(true);
}

/**
 * To start the freespin
 */
ReelsController.prototype.freespin = function ()
{
    if ( this.intState == ReelsController.STOP || this.intState == ReelsController.ANIMATING_SYMBOLS )
    {
        this.intReelsSpinning = 4;
        this.setResponseReceivedInReels(false);
        this.intState = ReelsController.START_BOUNCE;
        this.stopSlotAnimations();
    }
    else
    {
        this.stopReels();
        this.intState = ReelsController.STOP;
    }
}

/**
 * To start the spin
 */
ReelsController.prototype.spin = function ()
{
    if ( this.intState == ReelsController.STOP || this.intState == ReelsController.ANIMATING_SYMBOLS )
    {
        this.intReelsSpinning = 4;
        this.setResponseReceivedInReels(false);
        this.objWildsSelector.setWildsInTheReels(this);
        this.objWildsSelector.cleanSelection ();
        
        this.objMainConsole.spin();
        this.intState = ReelsController.START_BOUNCE;
        this.stopSlotAnimations();
    }
    else
    {
        this.stopReels();
        this.intState = ReelsController.STOP;
    }
}

/**
 * Callback from each reel in arrReelsController when it stops 
 */
ReelsController.prototype.onReelStopped = function( intReelId )
{
	if(this.fnReelStoppedCallback)
	{
		this.fnReelStoppedCallback(intReelId);
	}
}
 

/**
 * Called from the AutoplaySelect object 
 * Check each position in the held wilds array 
 * If any one is true return true, so that the 
 * AutoplaySelect obj will show the "This will cancel held wilds" dialog.
 * NOTE: De-selecting a wild (by clicking it) does not remove it from the array, it just sets its entry to false.
 * 		 If we new the array or do anything else the symbol is liable to flip back to whatever is
 * 		 underneath the wild when we start to spin, which obviously Looks Bad. 	
 */
ReelsController.prototype.hasLockedWilds = function()
{
	var arr = this.objWildsSelector.arrWilds;
	
	for(var reel=0; reel<arr.length; ++reel)
	{
		if(arr[reel] != null)
		{
			for(var symbol=0; symbol<arr[reel].length; ++symbol)
			{
				if(arr[reel][symbol] == true)
				{
					return true;
				}		
			}  
		}
	}
 
	return false; 
}

/**
 * 
 */
ReelsController.prototype.clearAllLockedWilds = function()
{
	var arr = this.objWildsSelector.arrWilds;
	
	for(var reel=0; reel<arr.length; ++reel)
	{
		if(arr[reel] != null)
		{
			for(var symbol=0; symbol<arr[reel].length; ++symbol)
			{
				arr[reel][symbol] = false;
			}  
		}
	}
}

/**
 * It checks if there is wilds not selected by the user in the reels.
 *  
 * @return { Boolean } True if there are wilds in the reels
 */

ReelsController.prototype.checkPreviousWilds = function()
{
    var arrLinearMap = [];
    for(var i=0; i<this.arrReelSymbols[this.intLayout].length; ++i)
    {
        arrLinearMap = arrLinearMap.concat( this.arrReelsController[i].arrSymbolsInView );
    }
    
    /*
     * Add all wilds found into the held array
     */
    var intWildId = this.objSymbolTable.find("Wild").intId;
    
    for(var i=0; i<arrLinearMap.length; ++i)
    {
        var intReel = Math.floor(i/3);
        var intSymbol = parseInt(i%3);
        if(arrLinearMap[i] == intWildId)
        {
             return true;
        }
    }
    
    return false;
}
/**
 * Do everything necessary to lock any new wilds to the reels for the next spin.
 * If we are auto-locking, wilds are locked in AS THEY ARRIVE. Changing the setting
 * for auto-lock does NOT AFFECT wilds that have just spun in. Only wilds arriving 
 * in the next spin will remain unlocked. This is how the WILL HILL game works.
 */
ReelsController.prototype.updateLockspinBetParameters = function()
{
		/*
		 * Get current reel map. This works for first ever spin 
		 * as we aren't depending on a previous spin result.
		 * Any symbols overlaid with wilds locked by player  
		 * are already in the objWildsSelector arrWilds. 
		 */
		var arrLinearMap = [];
		for(var i=0; i<this.arrReelSymbols[this.intLayout].length; ++i)
		{
			arrLinearMap = arrLinearMap.concat( this.arrReelsController[i].arrSymbolsInView );
		}
		
		/*
		 * Add all wilds found into the held array
		 */
		var intWildId = this.objSymbolTable.find("Wild").intId;
		
		for(var i=0; i<arrLinearMap.length; ++i)
		{
			var intReel = Math.floor(i/3);
			var intSymbol = parseInt(i%3);
			if(arrLinearMap[i] == intWildId)
			{
				if ( !this.objWildsSelector.arrWilds [intReel] )
			    {
			        this.objWildsSelector.arrWilds [intReel] = new Array();
			    } 	  
	    		this.objWildsSelector.arrWilds [intReel][intSymbol] = true;
			}
		}
		
		/*
		 * Lock the wilds in the held array to the reels
		 */
		this.objWildsSelector.setWildsInTheReels(this);
		
		/*
		 * More voodoo: updates the bet manager
		 */			
        this.objMainConsole.changeWilds(this.objWildsSelector.arrWilds);
}

/**
 * To start the lock and spin
 * @return boolean indicating whether the lockspin bet was accepted.
 * TODO this logic may not scale over time. Not sure when/why the else clause might fire?
 */
ReelsController.prototype.lockspin = function ( fnCallbackOnDecision )
{
	this.fnCallbackOnDecision = fnCallbackOnDecision;
	
    if ( this.intState == ReelsController.STOP || this.intState == ReelsController.ANIMATING_SYMBOLS )
    {
        this.intReelsSpinning = 4;
        this.setResponseReceivedInReels(false);
    	
    	/**
    	 * objMainConsole.lockspin() returns false if the first lockspin
    	 * was not accepted by the player, so we must not spin the reels!
    	 */
    	this.objMainConsole.lockspin( this.fnLockspinCallback )
    }
    else
    {
        this.stopReels();
        this.intState = ReelsController.STOP;
    }
}

/**
 * If auto-lock is enabled we need to make sure that every wild showing
 * gets locked to the reels. Otherwise, only those clicked on by the player should lock.
 * This is the current (pre-autolock) functionality so all we *should* have to do
 * is add any unlocked wilds into the objWildsSelector.arrWilds and ensure they are 
 * showing the padlock.
 */
ReelsController.prototype.fnLockspinCallback = function( blBetAccepted )
{
	if(blBetAccepted)
	{
		/*
		 * Start the spin with reel bounce and wilds lock 
		 */
		this.intState = ReelsController.START_BOUNCE;
		this.objSelectionIcon.intState = WildsView.STARTING_LOCKING;

	    /*
	     * play cage lock sound 
	     */
	    //this.objSoundController.playCageLockSound(this.objWildsSelector.arrWilds)

	    // play button spin sound
		this.objSoundController.playSpinSound(this.objWildsSelector.arrWilds);

	}
	else
	{
		this.stopSlotAnimations();
		this.intState = ReelsController.STOP;
	}

	this.fnCallbackOnDecision(blBetAccepted);
}

/**
 * To assign the collection of the symbols for each reel
 * @param { Array } arrReelSymbols The array with the symbols for each reel
 */
ReelsController.prototype.setReelSymbols = function ( )
{
    for ( var reel = 0; reel < ReelsController.COLUMNS ; ++reel )
    {
         this.arrReelsController[reel].setReelSymbols( this.arrReelSymbols[this.intLayout][reel], this.arrNewPositions[reel] );
    }
}

/**
 * Start Spinning the reels
 */
ReelsController.prototype.startSpinning = function ()
{
    for ( var i = 0; i < ReelsController.COLUMNS ; i++ )
    {
         this.arrReelsController[i].start();
    }
}

/**
 * Spinning the reels
 */
ReelsController.prototype.spinning = function ()
{ 
    var blSpinning = false;
    for ( var i = 0; i < ReelsController.COLUMNS ; i++ )
    {
         this.arrReelsController[i].move();
         
         //this.arrReelsController[i].updateSymbols( this.arrNewPositions[i] );
         
         if ( this.arrReelsController[i].intState != ReelController.STOPPED)
         {
             blSpinning = true;
         }
    }
    
    if (!blSpinning)
    {
        this.arrControllers["animationsController"] .objGuiController.objGuiView.blAnimated = true;        
        this.stopReels();
        this.intState = ReelsController.STOP;
    }
}


/**
 * Inits the selection icon for the reels
 * @param imSelection The icon to select the different icons
 */
ReelsController.prototype.initSelector = function ( imSelection )
{
    //Initialize the controller
    this.objWildsSelector = new WildsSelector( this.objSymbolTable.find("wild").intId );

    //Initialize the view
    if (!this.objSpinController)
    {
    	throw new Error("spin controller needed");
    }

    this.objSelectionIcon = new WildsView(this.objGuiController.objGuiView.context, this.objWildsSelector, this.objSoundController, this.objSpinController);
    this.objSelectionIcon.init(this.objGuiController.objGuiView.context, imSelection);

    this.objSelectionIcon.objAnimationsWild = this.objAnimations.arrSymbolAnimations["WildOverlay"];
    this.objSelectionIcon.objExplosionParticles  = this.objAnimations.arrSymbolAnimations["CageBreaker"];
    
    this.objSelectionIcon.setImage (imSelection);
    this.objSelectionIcon.setOverlay (this.imgSlotOverlay);
    this.objSelectionIcon.setAutoLockEnableImage (this.arrResources["LockIconSymbol_20001.png"]);
    this.objSelectionIcon.setAutoLockDisableImage (this.arrResources["LockIconSymbol_20002.png"]);
    
    this.objSelectionIcon.intWidth = imSelection.width;
    this.objSelectionIcon.intHeight = imSelection.height;
    
    this.objGuiController.objGuiView.addElement ( 10,"selectionIcon",this.objSelectionIcon );
    
    for ( var i = 0; i < ReelsController.COLUMNS ; i++ )
    {
        if (this.arrReelsController[i])
        {
            this.arrReelsController[i].setLockImage(this.objSelectionIcon );
        }        
    }
    
    this.objSelectionIcon.objAnimationsWild = this.objAnimations.arrSymbolAnimations["WildOverlay"];
}

/**
 * Enable/Disable the buttons in the console 
 */
ReelsController.prototype.updateLockSpinButton = function()
{
    if( !this.objGameSettings.getItem(GameSettings.DISABLE_AUTOLOCK_WILDS))
    {
        return (WildsSelector.blWildsSelected );
    }
    else
    {
        return (WildsSelector.blWildsSelected || this.checkPreviousWilds());
    }
   
}


/**
 * Handle the symbol selected in the reels
 * @param { Integer } intX The clicked x coordinate
 * @param { Integer } intY The clicked y coordinate 
 */
ReelsController.prototype.handlerSymbolClicked = function ( objEvent, intX, intY )
{
	//fix autoplay button click through
	if (!this.isWildSelectionEnabled())
	{
		return;
	}
	
    if ( this.objWildsSelector )
    {
        this.blAnyExisistedWild = this.objWildsSelector.select ( intX, intY );
        
        //this.objMainConsole.blExistingWilds = this.updateLockSpinButton(this.blAnyExisistedWild);
        this.objMainConsole.blExistingWilds = this.blAnyExisistedWild;
        this.objMainConsole.setButtonStates(this.objMainConsole.intState);


        var blSelectedWild = false;
        
        //If we are unselecting a wild to set the original symbol
        
        if (!this.objWildsSelector.arrWilds[this.objWildsSelector.intSelectorX][this.objWildsSelector.intSelectorY] && this.arrNewPositions.length > 0)
        {
            
            var intBandReelInitPosition = this.arrNewPositions[this.objWildsSelector.intSelectorX];
            
            var intRealBandPosition = ( intBandReelInitPosition + this.objWildsSelector.intSelectorY) % (this.arrReelSymbols[this.intLayout][this.objWildsSelector.intSelectorX].arrSymbols.length) ;
            
            var intOriginalSymbol = this.arrReelSymbols[this.intLayout][this.objWildsSelector.intSelectorX].arrSymbols[intRealBandPosition];
            
            if (intOriginalSymbol == 10)
            {
                intOriginalSymbol = 0;
            }
            
            this.arrReelsController[this.objWildsSelector.intSelectorX].setReelSymbol( this.objWildsSelector.intSelectorY, intOriginalSymbol );
            blSelectedWild = false;
        }
        else
        {
            blSelectedWild = true;
        }
        this.objMainConsole.changeWilds(this.objWildsSelector.arrWilds);

		//stop current event
		objEvent.stopPropagation();

    }
    
    // Callback to SpinController
    if(this.fnOnWildSelected != null)
    {
    	this.fnOnWildSelected(blSelectedWild);
    }
}

/**
 * Is wild selection enabled at the moment?
 *  
 * @return {boolean} 
 */
ReelsController.prototype.isWildSelectionEnabled = function()
{
	return ReelsController.blWildSelectionEnabled;
};

/**
 * Set whether wild selection is enabled at the moment
 *  
 * @param {boolean} blEnabled 
 */
ReelsController.prototype.setWildSelectionEnabled = function(blEnabled)
{
	ReelsController.blWildSelectionEnabled = blEnabled;
};

/**
 *
 * This function will update the positions of the Reels
 * 
 * @param { Array } arrPositions The array of positions for the reels 
 */
ReelsController.prototype.updateReels =  function(objSpinData, blQuickstop, fnCallbackOnComplete, fnReelStopped)
{
	// Set stop positions	
    this.arrNewPositions = objSpinData.arrPosition;    

	/**
	 * swap in the new reelbands if they have changed
	 * for instance when changing to/from freespins.
	 */
	if(	this.intLayout != objSpinData.intLayout )
	{
		this.intLayout = objSpinData.intLayout;
		this.setReelSymbols();
	}
	
	
    /*
     * Set the result for the spinning action
     * Each reel has 3 symbols in view 
     */
    for ( var reel = 0; reel < ReelsController.COLUMNS; ++reel )
    {
    	var arrSymbolsInView = new Array();
        for ( var symbol = 0; symbol < ReelsController.ROWS; ++symbol )
    	{
         	arrSymbolsInView.push(objSpinData.arrSymbols[symbol + (ReelsController.ROWS * reel)]);
    	}
        this.arrReelsController[ reel ].setSpinResult( arrSymbolsInView );
    }
    
    // Record callback for when all reels have stopped.
    this.fnUpdateReelsCompleteCallback = fnCallbackOnComplete;

	// If it exists, record callback for individual reel stops.
    if(fnReelStopped)
    {
    	this.fnReelStoppedCallback = fnReelStopped;
    }

	// Set the result
    this.setResponseReceivedInReels(true, blQuickstop);
    
    this.objMainConsole.blExistingWilds = this.updateLockSpinButton(false);    
    this.objMainConsole.setButtonStates(this.objMainConsole.intState);
}

/**
 * Callback to be called when all the extra resources needed are ready
 * @param {Image} imReels The image for the animation of the reels
 * 
 * @param {int} intTimeDiff [miliseconds] time change from last call
 * @param {int} intTime [miliseconds] currentTime
 */
ReelsController.prototype.mainRun = function (intTimeDiff, intTime)
{
    switch ( this.intState )
    {
        case ReelsController.START_BOUNCE:
            this.arrEnabled = [];
            this.hideOverlays();
            this.intState = ReelsController.START_SPIN;
        break;
        
        case ReelsController.START_SPIN:
            this.startSpinning();
            this.intState = ReelsController.SPIN;
        break;
        
        case ReelsController.SPIN:
            this.spinning();
        break;
        
        case ReelsController.STOP:
                
        break;
        
        case ReelsController.ANIMATING_SYMBOLS:
            this.animatedSymbols();
        break;
    }
}

ReelsController.prototype.animatedSymbols = function ()
{
    if (this.arrReelsController[0] && this.arrReelsController[0] )
    {
        this.arrReelsController[0].arrSlots[0].arrSymbolAnimations["Icon10"].context.clearRect (0, 0, 
                                                                           this.arrReelsController[0].arrSlots[0].arrSymbolAnimations["Icon10"].context.canvas.width, 
                                                                           this.arrReelsController[0].arrSlots[0].arrSymbolAnimations["Icon10"].context.canvas.height );
    }
    
    for ( var i in this.arrReelsController )
    {       
        this.arrReelsController[i].animate(); 
    } 
}

/**
 * Callback to be called when all the extra resources needed are ready
 * @param {Image} imReels The image for the animation of the reels
 */ 
ReelsController.prototype.initSlotReelsAnimations = function ( imReels )
{
    //this.objAssetsFactory.getResources(this.assignReelAnimations, [], ["reel"]);   
}

/**
 * Assign the animations to the reels
 * 
 */
ReelsController.prototype.assignReelAnimations = function ()
{
    //var objAnimation = new Animation ( this.objAssetsFactory , "reel", 0,0);
    
    var objAnimation = new Animator(this.arrSpritesReelAnimation);
        
    //Init the animations for the reels
    for ( var i = 0; i < ReelsController.COLUMNS ; i++ )
    {
        var intStartDelay = (i * 50) + (i * i * 40);
    	var intEndDelay = Math.floor((intStartDelay + 250) * 1.4);
    	
        objReel = new ReelController( objAnimation.clone(), intStartDelay, intEndDelay, i, this.onReelStopped);
        objReel.callBackClick =  this.handlerSymbolClicked;        
        objReel.objReelsController =  this;
        
        this.arrReelsController[i] = objReel;
        objReel.stop();
        
        objReel.initSymbolsAnimations(this.objGuiController.objGuiView);
    }
	
	/*
	 * Do in this order
	 */    
    this.setReelSymbols();
    this.initSymbolsSlots( this.arrSymbols);
    
    /*
     * 
     */
    if (this.objAnimations)
    {
        this.initSelector(this.arrResources["Icon10.png"]);
     
        for ( var i = 0; i < ReelsController.COLUMNS ; i++ )
        {
             this.arrReelsController[i].setAnimations( this.objAnimations);
        }
        
    }
    
}


/**
  * This method does NOT stop the reels.
 */
ReelsController.prototype.stopReels = function (  )
{
    for ( var i in this.arrReelsController )
    {	
    	// Hopefully this will not happen....will result in 2 callbacks to onReelStopped
    	// stop() should be called internally to ReelController
        if(this.arrReelsController[i].intState != ReelController.STOPPED)
        {
        	this.arrReelsController[i].stop();
        }
    }
    this.finishUpdate();
}

/**
 * Finish the update process
 * 
 */
ReelsController.prototype.finishUpdate = function ( )
{
   for ( var i in this.arrReelsController )
    {
        this.arrReelsController[i].updateSymbolsEnd();
    }

	/*
	 * Auto-lock any new wilds to the reels, according to GameSettings
	 */    	
	if( this.objGameSettings.getItem(GameSettings.DISABLE_AUTOLOCK_WILDS) != false )
	{
		this.updateLockspinBetParameters();
	}
	
	//
    if(this.fnUpdateReelsCompleteCallback)
    {
        this.fnUpdateReelsCompleteCallback();
    }
}

/**
 * Initialize the different slots controller
 * 
 * @param { Array } arrSymbols The collection of Symbols
 */
ReelsController.prototype.initSymbolsSlots = function (arrSymbols)
{
    for (var i in this.arrReelsController)
    {
        this.arrReelsController[i].initSymbolsSlots( arrSymbols, this.objGuiController.objGuiView, this.imgSlotOverlay  );        
    }
}


ReelsController.WIDTH = 1024;

ReelsController.HEIGHT = 520;

/**
 * To resize the reels canvas, when it is needed
 * 
 */
ReelsController.prototype.resize = function()
{
    // The original relation width / height for the original design
    var widthToHeight = ReelsController.WIDTH  / ReelsController.HEIGHT;
    
    var newWidth = StateFactory.WIDTH_CONTAINER;
    
    var newHeight = StateFactory.HEIGHT_CONTAINER  - this.objMainConsole.intHeightBottomBar;
    
    var newWidthToHeight = newWidth / newHeight;
    
    // To detect what dimension we should use to fill the maximum screen area possible
    if (newWidthToHeight > widthToHeight)
    {
        this.intrelation = newHeight / ReelsController.HEIGHT;
    }
    else
    { // window height is too high relative to desired game height
        this.intrelation = newWidth / ReelsController.WIDTH ;
    }
    
    //We apply the correct relation depending of the platform
    this.objCanvas.width = ReelsController.WIDTH  / this.intrelation;
    this.objCanvas.height = ReelsController.HEIGHT / this.intrelation;
    
    this.objDivContainer.style.marginTop = (1) + 'px';
    this.objDivContainer.style.marginLeft = (newWidth/2 - (ReelsController.WIDTH  * this.intrelation/ 2)) + 'px';
    
    if ( this.objDeviceModel.platform == OS.IOS || this.objDeviceModel.platform == OS.WINDOWS )
    {
        this.objCanvas.width = ReelsController.WIDTH ;
        this.objCanvas.height = ReelsController.HEIGHT;
        
        this.objDivContainer.style.marginTop = (0) + 'px';
        this.objDivContainer.style.marginLeft = (newWidth/2 - (ReelsController.WIDTH  * this.intrelation/ 2))  + 'px';
        
        this.objCanvas.style.width = (ReelsController.WIDTH  *this.intrelation)+ 'px';
        this.objCanvas.style.height = (ReelsController.HEIGHT * this.intrelation) + 'px';
    }
    else
    {
        if(this.objDivContainer.style.webkitTransform != undefined)
        {
            this.objDivContainer.style.webkitTransform = "scale(" + this.intrelation +  "," + this.intrelation + ")";            
        }
        else if(this.objDivContainer.style.MozTransform != undefined)
        {
            this.objDivContainer.style.MozTransform =  "scale(" + this.intrelation +  "," + this.intrelation + ")";            
        }
        else if(this.objDivContainer.style.OTransform != undefined)
        {
            this.objDivContainer.style.OTransform  =  "scale(" + this.intrelation +  "," + this.intrelation + ")";
        }
    }
    
    //this.objGuiController.objGuiView.blVisible = true;
    
    this.objGuiController.objGuiView.setDirty(true);
    
    for (var i in this.arrControllers)
    {
        this.arrControllers[i].resize(this.intrelation);
    }
    
    //StateFactory.objCanvasQueue.getCanvasController("reels").enableDoubleBuffer(this.intrelation,(window.innerWidth/2) - ((this.objCanvas.width * this.intrelation)/ 2),0);
    
    window.scrollTo(0, 1);
}

/**
 * @param {SpinController} objSpinController
 */
ReelsController.prototype.setSpinController = function(objSpinController)
{
	this.objSpinController = objSpinController;
}

/**
 * TODO Refactor some of these actions to a more appropriate place.
 * E.G. resetting the balance, stopping autoplay 
 */
ReelsController.prototype.onConnectionError = function ()
{
    /*
     * Set reels at a non-winning posititon on connection error received
     */

    for (var reel = 0; reel < ReelsController.COLUMNS; ++reel)
    {
        this.arrReelsController[reel].setSpinResult([reel, reel, reel + 2]);
        this.arrReelsController[reel].updateSymbolsEnd();
        this.arrReelsController[reel].stop();
        this.arrReelsController[reel].intCurrentTime = 0;
        this.arrReelsController[reel].intInitY = 0;
        this.arrReelsController[reel].setSymbolVisible(true);
        this.arrReelsController[reel].intState = ReelController.FINAL_BOUNCING;
    }

    // Reset displayed balance to the previous balance amount before the bet was placed.
    var flBalance = ServerData.getInstance().flPlayerBalance;
    flBalance += this.objMainConsole.getTotalAmountStaked();
    ServerData.getInstance().flPlayerBalance = flBalance;

    // Stop wild animations
    this.objSelectionIcon.intState = WildsView.NORMAL;
    
    // Stop autoplay
    this.objSpinController.objAutoplayController.cueCancel();  
    
    // Stop reels
    this.stopReels();
    this.intState = ReelsController.STOP;
    
    // Redraw animations
    StateFactory.getInstance().arrGuiControllers["animations"].objGuiView.setDirty(true);

    // kill sounds on error!
    this.objSoundController.killSoundOnError();
}
