/**
 * @author Javier.Ortega
 *
 * This class handles the Freespins Summary panel
 * It displays the total amount won
 * It automatically dismisses itself.
 * There is an optional callback param in show which can be called when it hides itself.
 */

/**
 * Constructor
 * @param { Object } objGuiController containing the objGuiView.
 * @param { Object } objConfigData game configuration
 */
function FreeSpinsSummaryPopupController(objGuiController, objConfigData, objSoundController)
{
    /*
     * The view with the panel controller
     */
    this.objGuiView = objGuiController.objGuiView;
    
    /*
     * Currency code from the config
     */
    this.strCurrencyCode = objConfigData.strCurrencyCode;

	/*
	 * View elements
	 */
    this.fsPanel = objGuiController.getElementByID("popup_freespins_win_summary.png");
    //this.txtWinField = objGuiController.objGuiView.getTextView("freeSpinsCounter");
	
	
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
	 * This dialog disappears automatically without an OK button 
	 */
	this.intTimeoutDelay = 6000;
	this.fnCallbackOnHide;
	this.intFrameCount = 0;

    // Bindings
    this.hide = this.hide.bind(this);
    this.show = this.show.bind(this);
	this.performCountup = this.performCountup.bind(this); 
	this.onCountupComplete = this.onCountupComplete.bind(this);
	this.wait = this.wait.bind(this);
	this.intElapsedTime=0;

	// Hide immediately
    this.objGuiView.blVisible = false;

    this.objSoundController = objSoundController;
}
Class.extend(Class, FreeSpinsSummaryPopupController);


/**
 * Create an animation of all 10 numbers 0-9 incl. with the delimeter
 * at [10].
 * Clone this however many times we have positioning for and initialise 
 * the counter animation object with the array of animations, decimal point
 * and delimiter character.
 */
FreeSpinsSummaryPopupController.prototype.assignNumberAnimations = function( assets )
{
	var objAnimation = new Animation ( this.objAssetsFactory , "big_win", 0,0);
    objAnimation.context = this.objGuiView.context;
    objAnimation.initAnimation();
	
	//	
	for(var an=0; an<this.arrPositions.length; ++an)
	{
		var anim = objAnimation.clone()
		anim.setXY(this.arrPositions[an].x, this.arrPositions[an].y);
		anim.visible(false);
		this.arrNumberAnims.push(anim);
	}
	
	//
	this.animatedCounter.initialise(this.decimalPointSprite, this.commaSprite, this.arrNumberAnims);
}

/**
 * Auto-hide after specified delay.
 * Clear text field
 * Make callback if it exists. 
 */
FreeSpinsSummaryPopupController.prototype.hide = function()
{
    this.objGuiView.blVisible = false;
    this.objGuiView.setDirty(true);
    //this.txtWinField.setText("");

    // kill win countup sound if applicable
    this.objSoundController.freeSpinSummarySoundActive = false;
    this.objSoundController.stopSound();
    
    if(this.fnCallbackOnHide)
    {
    	this.fnCallbackOnHide();
    }
}

/**
 * Auto-hide on a timeout:
 * TODO Should be waiting for countup and coins particle animation callback.
 * @param flWinAmount: total won, to be displayed
 * @param intTimeoutDelay: to override standard timing of 3 sec (optional)
 * @param fnCallbackOnHide: callback to make when hidden (optional)
 */
FreeSpinsSummaryPopupController.prototype.show = function ( flWinAmount, fnCallbackOnHide, intTimeoutDelay )
{
	this.fnCallbackOnHide = fnCallbackOnHide;

	if(intTimeoutDelay && intTimeoutDelay != 0)
	{
		this.intTimeoutDelay = intTimeoutDelay;	
	}

    // play free spins summary sound on panel displayed
    this.objSoundController.playFreeSpinsSummarySound();
	
	// Init the count	
	this.intFrameCount = 0;
	var flInitialValue = 1.01;


    //Asked to be removed for Product
	// -- What does the above comment mean?
	// -- Also what is happening here and why is code commented out below but comments not changed?
    this.animatedCounter.start( flInitialValue, flWinAmount, this.onCountupComplete );
	
	this.animatedCounter.drawNext(this.animatedCounter.arrSteps.length - 1);
	
	setTimeout(this.onCountupComplete,2000);
	
	this.intElapsedTime = 0;
    
	
	//
    this.objGuiView.blVisible = true;
    this.objGuiView.setDirty(true);
	
	/*
	 * Run the countup. This runs frame by frame rather than waiting for a specific 
	 * time to elapse, so we can use the Mainloop directly here.
	 * We will get a callback form the animated counter when it is done: we can then
	 * take our performCountup function out of the MainLoop 
	 */
	// -- Why is  this commented out? Why no comments explaining this?
	// -- Also why was the removal line in onCountupComplete NOT commented out?
	//MainLoop.getInstance().addItem(this.performCountup);
}

/**
 * @param {int} intTimeDiff [miliseconds] time change from last call
 * @param {int} intTime [miliseconds] currentTime
 */
FreeSpinsSummaryPopupController.prototype.performCountup = function(intTimeDiff, intTime)
{
	this.animatedCounter.drawNext(this.intFrameCount++)
} 

/**
 * 
 */
FreeSpinsSummaryPopupController.prototype.onCountupComplete = function()
{
    // I have commented this out as I don't *think* it was ever added (see above)
	//MainLoop.getInstance().removeItem(this.performCountup);
	this.intElapsedTime = 0;
	MainLoop.getInstance().addItem(this.wait);

    // kill win countup sound if applicable
	if (this.objSoundController.freeSpinSummarySoundActive==false)
	{
	    this.objSoundController.stopSound();
	}
}


FreeSpinsSummaryPopupController.prototype.wait = function(intTimeDiff, intTime)
{
	this.intElapsedTime += intTimeDiff;
	if(this.intElapsedTime >= this.intTimeoutDelay)
	{
		MainLoop.getInstance().removeItem(this.wait);
		this.hide();
	}
}
