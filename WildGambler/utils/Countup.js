function Countup()
{
	this.createSteps = this.createSteps.bind(this);
	this.getFlFactor = this.getFlFactor.bind(this);
	this.createIntermediateSteps = this.createIntermediateSteps.bind(this);
	this.createDeceleratingSteps = this.createDeceleratingSteps.bind(this);
	this.createAcceleratingSteps = this.createAcceleratingSteps.bind(this);

	this.runTest = this.runTest.bind(this);
	
	/*
	this.runTest();
	this.createDeceleratingSteps(0.01,5000);
	this.createAcceleratingSteps(0.01,5000);
	*/
}
Class.extend(Class,Countup);

Countup.LINEAR = 0;
Countup.ACCELERATING = 1;
Countup.DECELERATING = 2;

/**
 * Using easeIn to create a list of values shooting up and slowing down towards the end. 
 * Not fully working yet: I think we should be += the values over many more steps,
 * or we need to weed out the values that fall  
 */
Countup.prototype.createAcceleratingSteps = function(flInitialValue, flTargetVal, intNumOfSteps)
{	
	var duration = intNumOfSteps;
	if(duration == null)
	{
		duration = 100;
	}
	
	var vals=[];

	for(var now=0;now<duration; ++now)
	{
		var val = Number((""+Bounce.easeIn(now, flInitialValue, flTargetVal, duration).toFixed(2)));
		if(val < flTargetVal)vals.push(val);
	}
	//console.log(vals.length + "\n" + vals);
	vals.push(flTargetVal);
	return vals;	
}

/**
 * Using easeOut to create a list of values starting slow and speeding up towards the end.  
 * Not fully working yet: I think we should be += the values over many more steps,
 * or we need to weed out the values that fall  
 */
Countup.prototype.createDeceleratingSteps = function(flInitialValue, flTargetVal, intNumOfSteps)
{
	var duration = intNumOfSteps;
	if(duration == null)
	{
		duration = 100;
	}

	var vals=[];

	for(var now=0;now<duration; ++now)
	{
		var val = Number((""+Bounce.easeOut(now, flInitialValue, flTargetVal, duration).toFixed(2)));
		if(val < flTargetVal)vals.push(val);
	}
	//console.log(vals.length + "\n" + vals);
	vals.push(flTargetVal);
	return vals;	
}

/**
 * 
 */
Countup.prototype.getFlFactor = function(flTargetVal, flFactorial)
{
	// Standard default: regulates distance between, and hence number of, steps.
	var flFactor = 1.01;

	// If we have specified a factor, use it
	if(flFactorial)
	{
		flFactor = flFactorial;
	}
	
	// else use the default setting based on size of win.
	else
	{	
		// Change the flFactor to limit the number of steps 
		// we will be presented with when we start.
		if(flTargetVal > 250000)
		{
			flFactor = 1.06;
		}
		else if(flTargetVal > 20000)
		{
			flFactor = 1.05;
		}
		else if(flTargetVal > 10000)
		{
			flFactor = 1.04;
		}
		else if(flTargetVal > 800)
		{
			flFactor = 1.03;
		}
	}
	
	return flFactor;
}

/**
 * 
 */
Countup.prototype.createIntermediateSteps = function(flInitialValue, flTargetVal, flFactorial )
{
	var arrResults = new Array();
	arrResults.push(flInitialValue);
	var flCurrent;
	var flAmount = flInitialValue;
	var intStepCount = 0;

	var flInit = Number(flInitialValue);

	// Standard default: regulates distance between, and hence number of, steps.
	var flFactor = this.getFlFactor(flTargetVal, flFactorial);
	
	//
	while (flAmount < flTargetVal) 
	{
		++intStepCount;
		
		var tInitVal = 0.01;
		
		flCurrent = Math.pow(flFactor, intStepCount) * tInitVal;

		flAmount += Number(flCurrent.toFixed(2));
		
		flAmount = Number(flAmount.toFixed(2));

		if( arrResults[ arrResults.length-1 ] != flAmount )
		{
			arrResults.push( flAmount );
		}
	}
	
	// Remove final result
	arrResults.pop();
	
	// Put in the actual target
	arrResults.push(flTargetVal);
	
	//
	return arrResults;
}


Countup.prototype.createSteps = function(flInitialValue, flTargetVal, flFactorial )
{
	var arrResults = new Array();
	arrResults.push(flInitialValue);
	var flCurrent;
	var flAmount = flInitialValue;
	var intStepCount = 0;

	// Standard default: regulates distance between, and hence number of, steps.
	var flFactor = this.getFlFactor(flTargetVal, flFactorial);

	//
	while (flAmount < flTargetVal) 
	{
		++intStepCount;
		
		flCurrent = Math.pow(flFactor, intStepCount) * flInitialValue;
		
		flAmount += flCurrent;
		
		flAmount = Number(flAmount.toFixed(2));
		
		if( arrResults[ arrResults.length-1 ] != flAmount )
		{
			arrResults.push( flAmount );
		}
	}
	
	// Remove final result
	arrResults.pop();
	
	// Put in the actual target
	arrResults.push(flTargetVal);
	
	//
	return arrResults;
}

/**
 * Test various flFactor scenarios to try and find some optimal settings
 * Leaving flFactor at 1.01 can result in a steps array of hundreds if not thousands
 * of values:
 * The following settings however have the following results:
winAmount	factor	num steps 
65.5		1.01		51 
165.5		1.01		98 
965.5		1.03		115
1965.5		1.03		139 
5965.5		1.03		176 
15965.5		1.04		165 
25965.5		1.05		147 
45965.5		1.05		159 
215965.5	1.05		191
 * 
 * 
 */
Countup.prototype.runTest = function()
{
	console.log("winAmount\tfactor\tnum steps");
	var flFactor, flInitialValue, flWinAmount;
	flWinAmount = 65.50
	flFactor = 1.01;
	flInitialValue = 1.01;
	console.log(flWinAmount + "\t\t" + flFactor + "\t\t" + this.createSteps(flInitialValue,flWinAmount,flFactor).length);
	
	flWinAmount = 165.50
	flFactor = 1.01;
	flInitialValue = 1.01;
	console.log(flWinAmount + "\t\t" + flFactor + "\t\t" + this.createSteps(flInitialValue,flWinAmount,flFactor).length);
	
	flWinAmount = 965.50
	flFactor = 1.03;
	flInitialValue = 1.01;
	console.log(flWinAmount + "\t\t" + flFactor + "\t\t" +  this.createSteps(flInitialValue,flWinAmount,flFactor).length);
	
	flWinAmount = 1965.50
	flFactor = 1.03;
	flInitialValue = 1.01;
	console.log(flWinAmount + "\t\t" + flFactor + "\t\t" +  this.createSteps(flInitialValue,flWinAmount,flFactor).length);

	flWinAmount = 5965.50
	flFactor = 1.03;
	flInitialValue = 1.01;
	console.log(flWinAmount + "\t\t" + flFactor + "\t\t" +  this.createSteps(flInitialValue,flWinAmount,flFactor).length);

	flWinAmount = 15965.50
	flFactor = 1.04;
	flInitialValue = 1.01;
	console.log(flWinAmount + "\t\t" + flFactor + "\t\t" +  this.createSteps(flInitialValue,flWinAmount,flFactor).length);
	
	flWinAmount = 25965.50
	flFactor = 1.05;
	flInitialValue = 1.01;
	console.log(flWinAmount + "\t\t" + flFactor + "\t\t" +  this.createSteps(flInitialValue,flWinAmount,flFactor).length);

	flWinAmount = 45965.50
	flFactor =1.05;
	flInitialValue = 1.01;
	console.log(flWinAmount + "\t\t" + flFactor + "\t\t" +  this.createSteps(flInitialValue,flWinAmount,flFactor).length);

	flWinAmount = 215965.50
	flFactor = 1.05;
	flInitialValue = 1.01;
	console.log(flWinAmount + "\t" + flFactor + "\t\t" +  this.createSteps(flInitialValue,flWinAmount,flFactor).length);
}
