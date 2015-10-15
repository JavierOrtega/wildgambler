/**
 * Big win usually has thresholds for big win, super big win, mega big win 
 * This object contains a fancy digit animator, for which it must provide
 * the assets to animate: a decimal point, a comma and a 2D array of
 * number animations 0-9 inclusive plus a delimiter at [10].
 * The animator is called in a loop controlled here, in this way we
 * can control the rate at which the counter changes the display.
 * @see function run()
 */
function BigWinController( objDeviceModel, 
						   objConfig, 
						   objGuiController, 
						   objSoundController)
{
	this.objDeviceModel = objDeviceModel;
	this.objConfig = objConfig;
	this.objGuiController = objGuiController;
	this.objGuiView = this.objGuiController.objGuiView;
	this.objSoundController = objSoundController;
	this.onCountupComplete = this.onCountupComplete.bind(this);
	this.onClick = this.onClick.bind(this);

	//	this.objGuiController.addListener(this.onClick);
	
	// Time to show BigWin after countup has finished	
	this.intTimeoutId;
	this.intTimeoutDelay = 2500;
	
	// Framecount between show/hide BIG WIN text (flashes during countup)
	this.intFlashInterval = 20;

	// Final win amount (for quick display if needed)
	this.flWinAmount;

	// Callback after timeout
	this.fnCallbackOnComplete;

	this.isBigWin = this.isBigWin.bind(this);
	this.startBigWin = this.startBigWin.bind(this);
	this.hideNow = this.hideNow.bind(this);
	this.run = this.run.bind(this);
	this.intState = BigWinController.INACTIVE;
	
	this.strCurrencyCode = objConfig.strCurrencyCode;

	// Thresholds for BigWin :
	// 20, 50 or 100x the total stake paid
	this.arrThresholds = [20,50,100];

	/*
	 * We will put this onscreen and flash it during the countup 
	*/
	this.bigWinSprite = this.objGuiView.getElement(0, "big_win.png");
	this.bigWinSprite.blVisible = false;
	 
	/*
	 * Decimal point and comma are handed to the countup object.
	 * The comma should also be part of the animation (frame 10) so it 
	 * can be set in place as a delimiter but we also need to use it
	 * in place of the decimal point in some cases.
	 */
	this.decimalPointSprite = this.objGuiView.getElement(0, "big_win_decimal.png");
	this.decimalPointSprite.blVisible = false;
	
	this.commaSprite = this.objGuiView.getElement(0, "big_win0011.png");
	this.commaSprite.blVisible = false;
	
	/*
	 * These create an aniamtion consisting of our fancy digits and delimiter
	 * which will be cloned into an array and passed to the animated counter.
	*/
	this.assignNumberAnimations = this.assignNumberAnimations.bind(this);
    this.objAssetsFactory = new AssetsFactory(); 	
	this.objAssetsFactory.getResources(this.assignNumberAnimations, [], ["countUp"]);   
	 
	/*
	 * This object will accept a 2D array of fancy digits to be used to display
	 * the countup: it also will calculate the countup steps and use them 
	 * to set the onscreen display.
	 */
	this.animatedCounter = new AnimatedCounter(this.objGuiView);
	
	/*
	 * Store the X,Y of each number as specced in the layout info created when 
	 * these were individual numbers to be put onscreen (this has changed, they are
	 * now configured elsewhere as animations)
	 */	
	this.arrPositions=[];
	
	/*
	 * We will create an animation for each digit consisting of all the numbers
	 * and a delimiter which we will clone into this array to create the display digits.
	 */
	this.arrNumberAnims = []
	
	/*
	 * First create array of numbers. These are not actually used but we need
	 * the layout positioning from each of them for the fancy digit number anims.
	 * Make them all invisible as we don't want to draw them anywhere. 
	*/
	var arrElements = [];
	arrElements.push(this.objGuiView.getElement(0, "big_win0001.png"))
	arrElements.push(this.objGuiView.getElement(0, "big_win0002.png"))
	arrElements.push(this.objGuiView.getElement(0, "big_win0003.png"))
	arrElements.push(this.objGuiView.getElement(0, "big_win0004.png"))
	arrElements.push(this.objGuiView.getElement(0, "big_win0005.png"))
	arrElements.push(this.objGuiView.getElement(0, "big_win0011.png"))
	arrElements.push(this.objGuiView.getElement(0, "big_win0006.png"))
	arrElements.push(this.objGuiView.getElement(0, "big_win0007.png"))
	arrElements.push(this.objGuiView.getElement(0, "big_win0008.png"))
	arrElements.push(this.objGuiView.getPlaceHolder("pixel1"))
	arrElements.push(this.objGuiView.getElement(0, "big_win0009.png"))
	arrElements.push(this.objGuiView.getElement(0, "big_win0010.png"))



	for(var i=0; i<arrElements.length; ++i)
	{	
		var element = arrElements[i];
		this.arrPositions.push( {x:element.intX,y:element.intY} );
		element.blVisible = false;
	}
	 
	/*
	 * Reverse the XY's as we will be drawing the numbers in the display
	 * from RIGHT to LEFT starting with the pennies (cents) etc

	this.arrPositions.reverse();
	*/
}
Class.extend(Class, BigWinController);

/*
 * States
 */
BigWinController.INACTIVE = 0;
BigWinController.ACTIVE = 1;
BigWinController.COUNTUP_COMPLETE = 2;


/**
 * Create an animation of all 10 numbers 0-9 incl. with the delimeter
 * at [10].
 * Clone this however many times we have positioning for and initialise 
 * the counter animation object with the array of animations, decimal point
 * and delimiter character.
 */
BigWinController.prototype.assignNumberAnimations = function( assets )
{
	var objAnimation = new Animation ( this.objAssetsFactory , "big_win", 0,0);
    objAnimation.context = this.objGuiView.context;
    objAnimation.initAnimation();
	
	//	
	for(var an=0; an<this.arrPositions.length; ++an)
	{
		var anim = objAnimation.clone();
		anim.setXY(this.arrPositions[an].x, this.arrPositions[an].y);
		anim.visible(false);
		this.arrNumberAnims.push(anim);
	}
	
	//
	this.animatedCounter.initialise(this.decimalPointSprite, this.commaSprite, this.arrNumberAnims);
}


/**
 * Start big win process.
 * EITHER set flFactor appropriate to the win size to stop us getting 
 * 1000's of steps in the countup, AND/OR set the flInitialValue higher 
 * for bigger wins.
 */
BigWinController.prototype.startBigWin = function( flWinAmount, fnCallbackOnComplete)
{
	this.fnCallbackOnComplete = fnCallbackOnComplete;
	this.flWinAmount = flWinAmount;
	
	//
	this.objGuiView.blVisible = true;
	this.bigWinSprite.blVisible = true;
	this.objGuiView.setDirty(true);
	
	// Init the count	
	this.intFrameCount = 0;
	var flInitialValue = 1.01;

    // Work out the count up steps and begin.
    // NB USE DEFAULT FOR NOW (Countup.LINEAR)
    // as the ones that use easing need debugging - they rise, fall, rise again MAYBE:
    // could have been due to error in reelscontroller after 1 spin.
    // TODO check this out!
	this.animatedCounter.start( flInitialValue, flWinAmount, 
								this.onCountupComplete );
	// Start	
	this.intState = BigWinController.ACTIVE;

	//
	this.objGuiController.addListener(this.onClick);

    // Play bin win "bell" sound
	this.objSoundController.playBigWinSound();
}

/**
 * Called in a continuous loop by PopupController. 
 * When intFrameCount reaches the limit of the array of values generated
 * by the animator we will get a callback telling us to reset our state
 * (i.e. stop calling) and after a delay, to tell the game to start the win summary.
 * 
 * @param {int} intTimeDiff [miliseconds] time change from last call
 * @param {int} intTime [miliseconds] currentTime
 */
BigWinController.prototype.run  = function(intTimeDiff, intTime)
{
	switch(this.intState)
	{
		// Perform the BIG WIN countup
		case BigWinController.ACTIVE:
		{
			// Set the next in the series of win amount steps, increment counter.
			this.animatedCounter.drawNext(this.intFrameCount++);
			
			// Flash the BIG WIN text on and off
			if(this.intFrameCount % this.intFlashInterval == 0)
			{
				this.bigWinSprite.blVisible = !this.bigWinSprite.blVisible;
			}
		}
		break;
		
		// Final iteration using the animator
		case BigWinController.COUNTUP_COMPLETE:
		{
			//
			this.objGuiController.removeListener(this.onClick);

			// Set to redraw
			this.objGuiView.setDirty(true);
		
			// ensure that the BIG WIN text is always visible
			this.bigWinSprite.blVisible = true;
			
			// Ensure that even slow devices are showing the final winamount
			this.animatedCounter.displayFinalAmount();
			
		    // kill win countup sound
			this.objSoundController.killTotalWinCountupSound();
		    
		    // We're done.
	    	this.intState = BigWinController.INACTIVE;
		}
		break;
	}
}


/**
 * Callback from our objGuiController's onClick event. 
 */
BigWinController.prototype.onClick = function(objEvent, intX, intY)
{
	if(this.intState == BigWinController.ACTIVE)
	{
		this.onCountupComplete();
	}
}

/**
 * Counter has finished: We want to stay visible for a few seconds
 * before clearing the screen down for the win summary.
 */
BigWinController.prototype.onCountupComplete = function()
{
	// Stop calling animator: do final iteration.
    this.intState = BigWinController.COUNTUP_COMPLETE;

    // kill win countup sound
    //this.objSoundController.killTotalWinCountupSound();

	// Prepare to clear screen.
	this.intTimeoutId = TimerManager.getInstance().start(this.hideNow, this.intTimeoutDelay);
}  

/**
 * Clear the screen and callback to game to show win summary.
 */
BigWinController.prototype.hideNow = function()
{
	this.objGuiView.blVisible = false;
	this.objGuiView.setDirty(true);

    // kill win countup sound
	this.objSoundController.killTotalWinCountupSound();

	this.fnCallbackOnComplete();
}

/**
 * return according to thresholds 
 * @param {Object} flWinMx (win/totStake) 
 * in WG need only be bigger than our first threshold multiplier (20).
 */
BigWinController.prototype.isBigWin = function( flWinMx )
{
	return flWinMx >= this.arrThresholds[0] ? true : false;
}


