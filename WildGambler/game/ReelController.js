/**
 * @author Javier.Ortega
 * 
 * This class will handle the specific functionalities for a reel
 * Scaling up or down and centering the reels for all the different devices
 */

/**
 * 
 */
function ReelController(arrReelImages, 
						intStartDelay, 
						intEndDelay, 
						intReelNumber, 
						fnCallbackOnStop)
{
    /**
     * A "clone" of the animation of "spinning reel"
     */
    this.arrReelImages = arrReelImages;

    /**
     * Params to control start and stop times for spinning this reel
     */    
    this.intStartDelay = intStartDelay;
	this.intEndDelay = intEndDelay;
	this.intStopTime;

    /**
     * The reel ID (0-4 in a 5-reel game)
     */        
    this.intReelNumber = intReelNumber;
    
	/**
	 * When "stop" is called on this reel, this callback
	 * is made, passing the ID of the reel as a param.
	 */
	this.fnCallbackOnStop = fnCallbackOnStop;

    /**
     * The current frame of the "spinning" blur images:
     * Set to a different number on startup for each reel so that
     * when they spin they don't all look the same.
     * @type { integer }
     */
    this.intCurrentFrame = this.intReelNumber;
	
	/**
	 * Bindings
	 */	
    this.move = this.move.bind (this);
    this.setSpinResult = this.setSpinResult.bind (this);
    this.stop = this.stop.bind(this);
    this.keepSpinning = this.keepSpinning.bind(this);
    
    /**
     * The state for the reel
     * @type { Integer }
     */
    this.intState = ReelController.STOPPED;
    
    /**
     * This array contains the diffrent controllers for the Slot Symbols for this reel
     * @type { Array }
     */    
    this.arrSlots = new Array();
    
    /**
     * This array contains the diffrent controllers for the reel animations
     * @type { Array }
     */    
    this.arrReelAnimation = new Array();
    
    // -- Values for the bouncing interpolation 
    
    /**
     * The current interpolation tome for the bouncing interpolation
     * { integer }
     */
    this.intCurrentTime = 0;
    
    /**
     * The initial value for the bouncing
     * { integer }  
     */
    this.intInitY = 0;
    
    /**
     * The total change for the bouncing interpolation
     * { integer }  
     */
    this.intInitialChangeY = -20;
    
    /**
     * The total change for the bouncing interpolation
     * { integer }  
     */
    this.intFinalChangeY = -5;
    
    /**
     * The current Y for the reel
     * { integer }  
     */
    this.intCurrentY = 0;
    
    /**
     * The view parent of all our view elements.
     * Initialised in ReelController.prototype.initSymbolsSlots
     * { Object }  
     */
    this.objParentView;

    /**
     * The collection of symbols for this reel
     * { Object }  
     */    
    this.objReelSymbols;
 
 	/**
 	 * Set in setReelSymbols (on startup)
 	 * and setSpinResult (during game)
 	 */
 	this.arrSymbolsInView;
 
     /**
     * A boolean to specify when the game has received the response.
     * We are waiting for this in the spin animation loop.
     * { Boolean }  
     */       
    this.blResponseReceived = false;
    
    //
    this.arrReelStates=["START","MOVING","STOPPED","ANIMATING_SLOTS","INITIAL_BOUNCING","FINAL_BOUNCING"];
}
 
/**
 * Derive ReelController from our base type to provide inheritance
 */ 
Class.extend(ScreenLogicController, ReelController);
 
/**
 * Time for the bouncing animation
 * @type { Const }
 */
ReelController.TIME_BOUNCING = 500;

/**
 * Increase value for the interpolation
 * @type { Const }
 */
ReelController.INCREASE_TIME_BOUNCING = 100;
    
/**
 * State to start the spinning
 * @type { Const }
 */
ReelController.START = 0;
/**
 * State for spinning
 * @type { Const }
 */
ReelController.MOVING = 1;
/**
 * State to be stopped
 * @type { Const }
 */
ReelController.STOPPED = 2;

/**
 * State to animate individual slots, for example the wilds
 * @type { Const }
 */
ReelController.ANIMATING_SLOTS = 3;

/**
 * State to start the initial bouncing
 * @type { Const }
 */
ReelController.INITIAL_BOUNCING = 4;

/**
 * State to start the final bouncing
 * @type { Const }
 */
ReelController.FINAL_BOUNCING = 5;


/**
 * Init the slot symbol images + the animations 
 * @param { Array } arrSymbols  The collection of images for each Symbol
 * @param { Object } objParentView The parent view
 * @param { Image } imgSlotOverlay The image
 */
ReelController.prototype.initSymbolsSlots = function (arrSymbols, objParentView, imgSlotOverlay)
{
    this.objParentView = objParentView;
    
    var objReelSlotView;
    var objReelSlotController;    
    //Init the symbols for each slot in this reel
    
    for ( var j = 0; j < ReelsController.ROWS ; j++ )
    {
    	var intX = ReelsController.INIT_X  + this.intReelNumber * (ReelSlotView.WIDTH + ReelsController.GAP_X );
    	var intY = ReelsController.INIT_Y + j * (ReelSlotView.HEIGHT + ReelsController.GAP_Y );
    	
        objReelSlotView = new ReelSlotView ( arrSymbols , 
           									 objParentView.context, 
            					             intX, 
            								 intY,
            								 this.arrSymbolsInView[j] , imgSlotOverlay );
        
        objParentView.addElement( 1,"slot" + this.intReelNumber + "" + j, objReelSlotView );
        
        objReelSlotController = new ElementController(objReelSlotView);
        objReelSlotController.doOnClick = this.callBackClick;
        
        objParentView.objController.addElement(1,"slot" + this.intReelNumber + "" + j,objReelSlotController);
        
        this.arrSlots.push( objReelSlotView );
    }  
}

/**
 * This function set the collection of symbols for a reel
 * @param objReelData : An array of reel data describing an entire reel,
	 * with methods for retrieving the symbols in view etc
 */
ReelController.prototype.setReelSymbols = function ( objReelData, intIndex )
{
	/*
	 * Reel symbols data object 
	 */
    this.objReelSymbols = objReelData;
    
    /*
     * The current position of this reel.
     */
	this.intReelPosition = intIndex;

	/*
	 * Set initial symbols in view
	 */	
	this.arrSymbolsInView = this.objReelSymbols.getSymbolsInView(this.intReelPosition);

	/*
	console.log("ReelController " + this.intReelNumber + " changed to " + this.objReelSymbols.arrSymbols);
	console.log("Showing " + this.arrSymbolsInView + " from index pos " + this.intReelPosition);
	*/
}

/**
 * Called by ReelsController.setResponseReceivedInReels
 * false (no quickstop param) during spin,
 * true (with quickstop param) when result arrives.
 */
ReelController.prototype.responseReceived = function(blResponseReceived, blQuickstop)
{
	this.blResponseReceived = blResponseReceived;
	
	// If we received a result
	if(this.blResponseReceived)
	{
		// Set to a default if forgotten
		if(blQuickstop == null)
		{
			blQuickstop = false;
		}
		
		// Stop reel
		if(blQuickstop)
		{
			this.intStopTime = new Date().getTime();
		}
		else
		{
			this.intStopTime = new Date().getTime() + this.intEndDelay;
		} 
	}	
}

/**
 * New result recieved from server by ReelsController.
 * Some of our actual reel symbols may have been overlaid with locked wilds
 * so we don't want to get our symbols-in-view direct from the reel! 
 * @param arrSymbolsInView : array of three symbols for this reel to display when it stops
 * @param intNewPosition: the new stop position of this reel: Not much use in Wild Gambler
 * as the reel symbols may be overlaid by wilds but in most slots this would mark the place
 * in the reelband telling us which symbols to display 
 * i.e. this.intReelPosition, this.intReelPosition+1, this.intReelPosition+2 (wrapped to reel). 
 */
ReelController.prototype.setSpinResult = function( arrSymbolsInView, intNewPosition )
{
	this.arrSymbolsInView = arrSymbolsInView;
	this.intReelPosition = intNewPosition;
}


/**
 * This function set the collection of symbols for a reel. 
 * Called at the end of the spin process after setSpinResult has been called.
 */
ReelController.prototype.updateSymbolsEnd = function ( )
{
    for ( var row = 0; row < ReelsController.ROWS; ++row )
    {
         this.arrSlots[ row ].setSymbol( ReelsController.SYMBOLS_ARRRAY[ this.arrSymbolsInView[ row ] ] );         
    }
}


/**
 * Sets a specific symbol in one position. 
 * Called at START OF SPIN to lock a symbol to the reel and make it spin off.
 * Called when a wild overlay is removed to "reveal" the correct symbol underneath.
 * @param {int} intY
 * @param {int} intSymbol  
 */
ReelController.prototype.setReelSymbol = function ( intSymbolPosition, intSymbolId )
{
    this.arrSlots[ intSymbolPosition ].setSymbol( ReelsController.SYMBOLS_ARRRAY[ intSymbolId ] );
    this.arrSymbolsInView[ intSymbolPosition ] = intSymbolId;
    /*
    console.log(this.arrSlots[0].strType + " " + this.arrSlots[1].strType + " " + this.arrSlots[2].strType);
    console.log(this.arrSymbolsInView);
    */
}



/**
 * Move the reel 
 */
ReelController.prototype.move = function ()
{
    //console.log(this.arrReelStates[this.intState])
    switch (this.intState )
    {
        case ReelController.INITIAL_BOUNCING:
            if ( this.intCurrentTime < ReelController.TIME_BOUNCING)
            {
                this.intCurrentTime += ReelController.INCREASE_TIME_BOUNCING;
                this.intCurrentY = Bounce.easeInOut(this.intCurrentTime, this.intInitY, this.intInitialChangeY, ReelController.TIME_BOUNCING );
                this.applyBouncingEffect();
            }
            else
            {
                this.setSymbolVisible(false);
                this.objReelAnimationView.blVisible = true;
                this.objReelAnimationView.startAnimation();
                this.objStarTime = new Date();       
                this.intCurrentY = 0;
                this.applyBouncingEffect();
                this.intState = ReelController.MOVING;
            }
            
        break;
        
        case ReelController.FINAL_BOUNCING:            
            if ( this.intCurrentTime < ReelController.TIME_BOUNCING)
            {
                this.intCurrentTime += (ReelController.INCREASE_TIME_BOUNCING);
                this.intCurrentY = (Bounce.easeOut2(this.intCurrentTime, this.intInitY, this.intFinalChangeY, ReelController.TIME_BOUNCING )) - this.intFinalChangeY;
                this.applyBouncingEffect();
            }
            else
            {
                this.intCurrentY = 0;
                this.applyBouncingEffect();
                this.intState = ReelController.STOPPED;
                //console.log("Reel " + this.intReelNumber + " is " + this.arrReelStates[this.intState])
            }
        break;
        
        case ReelController.STOPPED:
            this.drawReelSymbols();
        break;
        case ReelController.START:
            if (this.objStarTime.getTime() + this.intStartDelay < (new Date()).getTime() )
            {
                
                //Skipping steps for HTC devices, so the performance is so bad.
                if (navigator.userAgent.match(/HTC/i))
                {
                    this.setSymbolVisible(false);
                    this.objReelAnimationView.blVisible = true;
                    this.objReelAnimationView.startAnimation();
                    this.objStarTime = new Date();       
                    this.intCurrentY = 0;
                    this.applyBouncingEffect();
                    this.intState = ReelController.MOVING;
                }
                else
                {
                    this.intState = ReelController.INITIAL_BOUNCING;    
                }
                
                this.intCurrentTime = 0;
            }
        break;
        case ReelController.MOVING:
        	/*
        	 * Continue moving while:
        	 * less than 1 second has elapsed since we started
        	 * No response is received.
        	 */

        	if(!this.blResponseReceived)
        	{
        		this.keepSpinning();
        	}
        	
            else if ( this.intStopTime > new Date().getTime() )
            {
        		this.keepSpinning();
            }
            else
            {   
                 
                this.updateSymbolsEnd();
                this.stop();
                this.intCurrentTime = 0;
                this.intInitY = 0;
                this.setSymbolVisible(true);
                                
                //Skipping steps for HTC devices, so the performance is so bad.
                if (navigator.userAgent.match(/HTC/i))
                {
                    this.intCurrentY = 0;
                    this.applyBouncingEffect();
                    this.intState = ReelController.STOPPED;
                }
                else
                {
                    this.intState = ReelController.FINAL_BOUNCING;
                }
            }
        break;
        case ReelController.ANIMATING_SLOTS:
        
        break;
    }
}

/**
 * 
 */
ReelController.prototype.keepSpinning = function()
{
    this.intCurrentFrame = (this.intCurrentFrame + 1) % 8;
    this.objReelAnimationView.setSymbol(this.intCurrentFrame);
    
    if ( this.objParentView )
    {
        this.objParentView.update();
    }
}

/**
 * Enable the animation for one slot
 * @param { int } intSlot The index of the slot to be enabled
 * @param { Function } endCallBack This function will be called every time that an animation finished
 */
ReelController.prototype.enableSlot = function ( intSlot, endCallBack )
{   
    this.arrSlots[intSlot].enableAnimation(endCallBack);    
}

/**
 * Enable the animation for one slot
 * @param { int } intSlot The index of the slot to be enabled 
 * @param { Boolean } blVisible 
 */
ReelController.prototype.disableSlot = function ( intSlot, blVisible )
{   
    this.arrSlots[intSlot].enableOverLay(blVisible); 
}


/**
 * Disable the slot animations.
 */
ReelController.prototype.disableSlotsAnimations = function ( )
{   
    for (var i in this.arrSlots )
    {
        this.arrSlots[i].disableAnimation(); 
    } 
}

/**
 * Disable the slot animations.
 */
ReelController.prototype.hideOverlays = function ( )
{   
    for (var i in this.arrSlots )
    {
        this.arrSlots[i].enableOverLay (false); 
    } 
}

/**
 * Animate the animated symbols
 * 
 */
ReelController.prototype.animate = function ()
{
    for ( var i in this.arrSlots)
    {
        this.arrSlots[i].animate();
    }
}

/**
 * Set this symbol invisible
 */
ReelController.prototype.setSymbolVisible = function ( blVisible )
{   
    for (var i in this.arrSlots )
    {
        this.arrSlots[i].setVisible(blVisible);
    }
}


/**
 * Stop the reel 
 */
ReelController.prototype.stop = function ()
{
    this.blMove = false;
    if (this.objReelAnimationView)
    {
        this.objReelAnimationView.blVisible = false;
        this.fnCallbackOnStop(this.intReelNumber);
    }
}

/**
 * CallBack for the click event for the views inside of this controller
 */
ReelController.prototype.callBackClick = function ()
{
    
}

/**
 * Draw the reel symbols when we don't have movement in the reels
 *  - ???
 */
ReelController.prototype.drawReelSymbols = function ()
{
    //TO DO
    //To do properly when we have all the symbols ready
}

/**
 * Start the movement of the reel 
 */
ReelController.prototype.start = function ()
{
    this.intState = ReelController.START;
    this.objStarTime = new Date();
    this.blMove = true;
}

/**
 * Apply the bouncing effect 
 */
ReelController.prototype.applyBouncingEffect = function ()
{
    for ( var i = 0; i < this.arrSlots.length ; i++ )
    {
        this.arrSlots[i].intBouncingY =  this.intCurrentY;
    }
    
    if (this.objParentView)
    {
        this.objParentView.update();
    }
}


/**
 * This will set the lock image for all the slots
 * 
 * @param {Object} objImage
 */
ReelController.prototype.setLockImage = function ( objImage)
{
    this.objSlotImage = objImage;    
    
    for ( var i  in this.arrSlots )
    {
        this.arrSlots[i].setLockImage( objImage);
    }  
}


/**
 * A function to set the animation object in the reel
 * @param { Object } objAnimations The object containing the animations
 */ 
ReelController.prototype.setAnimations =  function ( objAnimations )
{
    for ( var i in this.arrSlots )
    {
        this.arrSlots[i].setAnimations( objAnimations );
    }
}

/**
 * Init the slot symbol images + the animations 
 * @param { Array } arrSymbols  The collection of images for each Symbol
 * @param { Object } objParentView The parent view
 */
ReelController.prototype.initSymbolsAnimations = function ( objParentView)
{
    this.objReelAnimationView = new ReelAnimationView ( this.arrReelImages , 
            objParentView.context, 
            ReelsController.INIT_X  + this.intReelNumber * (ReelSlotView.WIDTH + ReelsController.GAP_X ) , 
            ReelsController.INIT_Y);
            
    
    this.objReelAnimationView.blVisible = false;
    objParentView.addElement( 2,"reel" + this.intReelNumber , this.objReelAnimationView);
}
