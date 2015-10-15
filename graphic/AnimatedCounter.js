function AnimatedCounter(objGuiView)
{
	this.objGuiView = objGuiView;
	
	// Decimal point
	this.decimalPointSprite;
	this.commaSprite;
	
	// Number animation objects
	this.arrNumberAnims;
	
	// Arr of delimeters
	this.arrDelimiters;
	
	// The array of values to run through during the countup
	this.arrSteps;
	
	// How many steps to create if using accelrating/decelerating steps
	this.intNumberOfSteps = 100;
	
	// On complete
	this.fnCallbackOnComplete;
	
	// To center all the number glyphs
	this.intCenterX = -160;
	this.intSymbolWidth;
	this.intStrNumBounds=0;
	this.arrCenteringOffset;
	
	this.start = this.start.bind(this);
	this.initialise = this.initialise.bind(this);
	this.drawNext = this.drawNext.bind(this);
	this.draw = this.draw.bind(this);
	this.drawString = this.drawString.bind(this);
	this.displayFinalAmount= this.displayFinalAmount.bind(this);
	
	this.objCountup = new Countup();
}
Class.extend(Class,AnimatedCounter);

/**
 * Initialise with the graphics to use. 
 * Might be different for various displays (BigWin, FreeSpinSummary etc)
 * @param {Object} decimalPointSprite : usually used
 * @param {Object} commaSprite : sometimes used instead of decimal point
 * @param {Object} arrNumberAnimations : 2D array of arrays of numbers + delimiter:
 * 										 0-9 incl & "," at [10]
 */
AnimatedCounter.prototype.initialise = function( decimalPointSprite, commaSprite, arrNumberAnimations )
{
	this.decimalPointSprite = decimalPointSprite;
	this.commaSprite = commaSprite;
	
	/*
	 * Add all the aniamtions to our objGuiView so that they will be drawn 
	 * when we make them visible and set objGuiView.blDirty = true;
	 */
	for (var a=0; a<arrNumberAnimations.length; ++a)
	{
		this.objGuiView.addElement(12, "bigWinAnim_"+a, arrNumberAnimations[a]);
	}
	
	// Work out screen centering positions
	this.intSymbolWidth = this.decimalPointSprite.intWidth;
	var intXShift = (this.intSymbolWidth/2)-3;

	// 1st three not used: minimum onscreen will be 3 digits (0.01)	
	this.arrCenteringOffset = [ this.intCenterX,this.intCenterX,this.intCenterX,
								this.intCenterX-intXShift,
								this.intCenterX,
								this.intCenterX+intXShift,
								this.intCenterX+(intXShift*2), //00.00
								this.intCenterX+(intXShift*3), //000.00
								this.intCenterX+(intXShift*4), //0000.00
								this.intCenterX+(intXShift*5),
								this.intCenterX+(intXShift*6),
								this.intCenterX+(intXShift*7),
								this.intCenterX+(intXShift*8),
								this.intCenterX+(intXShift*9) ];
	
	// Only SOME of these are for numbers, some are for delimeters
	this.arrNumberAnims = [ arrNumberAnimations[0],
							arrNumberAnimations[1],
							// Decimal sprite displays here
							arrNumberAnimations[2],
							arrNumberAnimations[3],
							arrNumberAnimations[4],
							// Ist delimeter here (arrNumberAnimations[5][10])
							arrNumberAnimations[6],
							arrNumberAnimations[7],
							arrNumberAnimations[8],
							// Second delimiter here(arrNumberAnimations[9][10])
							arrNumberAnimations[10],
							arrNumberAnimations[11]
							];
	
	// Delimiters show in these positions
	this.arrDelimiters = [ arrNumberAnimations[5],
							arrNumberAnimations[9] ];
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
AnimatedCounter.prototype.start = function(flInitialValue, flWinAmount, fnCallback, flFactor, intType, intNumSteps )
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
		this.arrSteps = this.objCountup.createSteps( flInitialValue, flWinAmount, flFactor );
	}
	else if(intType = Countup.ACCELERATING)
	{
		this.arrSteps = this.objCountup.createAcceleratingSteps( flInitialValue, flWinAmount, this.intNumberOfSteps);
	}
	else if(intType = Countup.DECELERATING)
	{
		this.arrSteps = this.objCountup.createDeceleratingSteps( flInitialValue, flWinAmount, this.intNumberOfSteps);
	}

	/*
	 * Reset the numbers to start positions. Numbers will center across screen
	 * as they get bigger (ie display more digits) 
	 */
	for(var a in this.arrNumberAnims)
	{
		this.arrNumberAnims[a].intState = Animation.STOP;
		this.arrNumberAnims[a].intCurrentFrame = a;
		this.arrNumberAnims[a].visible(false);
		this.arrNumberAnims[a].intOffsetX = this.arrCenteringOffset[0];
	}
	
	/*
	 * Reset the delimiters which are in a seperate array.
	 */
	for(var d in this.arrDelimiters)
	{
		this.arrDelimiters[d].intState = Animation.STOP;
		this.arrDelimiters[d].intCurrentFrame = 10;
		this.arrDelimiters[d].visible(false);
		this.arrDelimiters[d].intOffsetX = this.arrCenteringOffset[0];
	}
	
	// Reset and show decimal point	
	this.decimalPointSprite.intOffsetX = this.arrCenteringOffset[0];
	this.decimalPointSprite.blVisible = true;
}


/**
 * Called in a loop by the panel or display using this object's services.
 * The parent need not know the number of steps as we will stop and perform
 * a callback when the limit of the steps array is reached.
 * A centering offset is applied throughout to keep the increasingly wide
 * string of digits centered on the screen area/panel.
 * @param {Object} intStepIndex: passed in by owner so that it can 
 * 								 control the speed of the countup.
 */
AnimatedCounter.prototype.drawNext = function( intStepIndex )
{
	if(intStepIndex == this.arrSteps.length)
	{
		this.fnCallbackOnComplete();
	}
	else
	{
		this.draw(intStepIndex);
	}
}

/**
 * Draw the amount to show at intStepIndex from our array of steps.
 * @param {Object} intStepIndex
 */
AnimatedCounter.prototype.draw = function(intStepIndex)
{
	if(intStepIndex == this.arrSteps.length ||
		this.arrSteps[intStepIndex] == null )
	{
		console.log("AnimatedCounter.prototype.draw index:" + intStepIndex + " length:" + this.arrSteps.length);	
	}
	else
	{
		// Get the amount as a string always with 2 decimal places
		var strNum = ""+this.arrSteps[intStepIndex].toFixed(2);
		
		// Remove the point
		strNum = strNum.replace(".", "");
		
		this.drawString(strNum);
	}
}

/**
 * Draw the supplied formatted currency string using the animated fancy digits. 
 */
AnimatedCounter.prototype.drawString = function(strNum)
{
	// Get the bounds. We want to access the string backwards
	// so we can print the pence first, right -> left
	this.intStrNumBounds = strNum.length-1;
	
	//console.log(this.arrSteps[intStepIndex].toFixed(2) + " : " + strNum)
	
	// Show each part of the number to the screen.
	for(var i=0; i<strNum.length; ++i)
	{
		this.arrNumberAnims[i].intOffsetX = this.arrCenteringOffset[strNum.length];
		this.arrNumberAnims[i].visible(true);

		// Last digit goes into the first number animation, second-to-last into next, etc
		// Since animation[1] & animation[0] == the pence, and so on.
		this.arrNumberAnims[i].intCurrentFrame = strNum.charAt(this.intStrNumBounds-i);
	}

	// Show decimal point
	this.decimalPointSprite.intOffsetX = this.arrCenteringOffset[strNum.length];
	
	// Show delimiters when necessary
	if(strNum.length > 5)
	{
		this.arrDelimiters[0].intOffsetX = this.arrCenteringOffset[strNum.length];
		this.arrDelimiters[0].visible(true);
	}
	if(strNum.length > 8)
	{
		this.arrDelimiters[1].intOffsetX = this.arrCenteringOffset[strNum.length];
		this.arrDelimiters[1].visible(true);
	}
	
	//		
	this.objGuiView.blDirty = true;
}

/**
 * To ensure that we can draw the final win amount even if the 
 * device we are on is so slow that the steps countup does not show properly.
 * We can call this method to just show the final win amount. 
 * @param flWinAmount: the amount to display (optional; may be passed in by calling code)
 */
AnimatedCounter.prototype.displayFinalAmount = function(flWinAmount)
{
	// Use the supplied parameter if there is one.
	if(flWinAmount != null)
	{
		// Get the amount as a string always with 2 decimal places
		var strNum = "" + flWinAmount.toFixed(2);
		
		// Remove the point
		strNum = strNum.replace(".", "");
		
		//
		this.drawString(strNum);
	}
	// Otherwise just show the final amount in our list of steps.
	else
	{
		this.draw(this.arrSteps.length-1);
	}
}
