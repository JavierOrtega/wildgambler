function TextCounter()
{
	this.objGuiView;
	
	//	
	this.objTextField;
	
	// The array of values to run through during the countup
	this.arrSteps = new Array();
	
	// How many steps to create if using accelrating/decelerating steps
	this.intNumberOfSteps = 100;
	
	// On complete
	this.fnCallbackOnComplete;
	
	//
	this.strCurrencyCode;
	
	this.start = this.start.bind(this);
	this.initialise = this.initialise.bind(this);
	this.drawNext = this.drawNext.bind(this);
	this.stop = this.stop.bind(this);	
	this.objCountup = new Countup();
}
Class.extend(Class,TextCounter);

/**
 * Initialise with the graphics to use. 
 * Might be different for various displays (BigWin, FreeSpinSummary etc)
 * @param {Object} decimalPointSprite : usually used
 * @param {Object} commaSprite : sometimes used instead of decimal point
 * @param {Object} arrNumberAnimations : 2D array of arrays of numbers + delimiter:
 * 										 0-9 incl & "," at [10]
 */
TextCounter.prototype.initialise = function( objGuiView, objTextField, strCurrencyCode )
{
	this.strCurrencyCode = strCurrencyCode;
	this.objGuiView = objGuiView;
	this.objTextField = objTextField;
}

/**
 * Startup values: list of values to display, callback on complete. 
 * @param flInitialValue: scaled to size of win, default is 1.01.
 * @param flWinAmount: final target
 * @param fnCallback for when we have finished
 * @param flFactor: OPITIONAL scaled to size of win, default is 1.01, range usually 1.01 - 1.05
 * @param intType: OPITIONAL can be set to use accelerating or decelerating easing. (TODO)
 * @param inNumSteps: OPITIONAL  When using easing, specify how many steps to use. 
 */
TextCounter.prototype.start = function(flInitialValue, flWinAmount, fnCallback, flFactor, intType, intNumSteps )
{
	this.fnCallbackOnComplete = fnCallback;		

    // Set the countup steps if using acc/decelerating
	if(intNumSteps != null)
	{
		this.intNumberOfSteps = intNumSteps;
	}

	// Create the steps for the countup using the params supplied
	if(intType == null || intType == Countup.LINEAR)
	{
		if(flInitialValue > 1.4)
		{
			this.arrSteps = this.objCountup.createIntermediateSteps( flInitialValue, flWinAmount, flFactor );
		}
		else
		{
			this.arrSteps = this.objCountup.createSteps( flInitialValue, flWinAmount, flFactor );
		}
	}
	else if(intType = Countup.ACCELERATING)
	{
		this.arrSteps = this.objCountup.createAcceleratingSteps( flInitialValue, flWinAmount, this.intNumberOfSteps);
	}
	else if(intType = Countup.DECELERATING)
	{
		this.arrSteps = this.objCountup.createDeceleratingSteps( flInitialValue, flWinAmount, this.intNumberOfSteps);
	}

	//
	this.objTextField.setText("");
	this.intStepIndex = 0;
}


TextCounter.prototype.stop = function()
{
	clearTimeout(this.intTimeoutId);	
	if(this.arrSteps.length > 0)
	{
        this.objTextField.setText(Localisation.formatNumber(this.arrSteps[this.arrSteps.length-1]));
	}
}

/**
 * 
 */
TextCounter.prototype.drawNext = function()
{
	if(this.intStepIndex == this.arrSteps.length)
	{
		if(this.fnCallbackOnComplete)
		{
			this.fnCallbackOnComplete();
		}
	}
	else
	{
		// Get the amount as a string always with 2 decimal places
		var strNum = Localisation.formatNumber(this.arrSteps[this.intStepIndex++])
		this.objTextField.setText(strNum);
		this.objGuiView.blDirty = true;
		this.intTimeoutId = setTimeout(this.drawNext, 30); 
	}	
}
