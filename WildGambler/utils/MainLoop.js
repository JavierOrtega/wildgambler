/**
 * @author Petr Urban
 * 
 * Register items to periodically call functions on them
 */

/**
 * Constructor
 */
function MainLoop()
{
	this.blRunning = false;
	this.loopInterval = null;
	
	this.arrItems = [];
	
	this.intItemsLength = 0;
	this.intIterator = 0;
	
	this.intCurrentTime = 0;
	this.intPreviousTime = 0;
	this.intTimeDifference = 0;
	
    this.intPausedTime = 0;
	
	//bindings
	this.doLoop = this.doLoop.bind(this);
}

MainLoop.INTERVAL_DURATION = 1000/30; //30fps

/* singleton functionality */
MainLoop.objSingletonInstance = null;

/**
 * Get singleton instance
 * @return {MainLoop}
 */
MainLoop.getInstance = function()
{
	if (MainLoop.objSingletonInstance == null)
	{
		MainLoop.objSingletonInstance = new MainLoop();
	}
	return MainLoop.objSingletonInstance;
}


/**
 * Derive Bounce from our base type to provide inheritance
 */ 
Class.extend(Class, MainLoop);

/**
 * Add item / callback to the loop
 * 
 * @param {Object} objCallback
 * @throws {Error}
 */
MainLoop.prototype.addItem = function(objCallback)
{
	if (typeof objCallback == "function")
	{
		if (this.hasItem(objCallback))
		{
			throw new Error("this callback is already in the loop", objCallback);
		}
		this.arrItems.push(objCallback);
		//console.log("MainLoop add item " + this.intItemsLength)
		this.intItemsLength++;
	}
	else
	{
		throw new Error("function expected", objCallback);
	}

	//console.log("MainLoop add length " + this.arrItems.length)
}

/**
 * Add item to the loop 
 * @param {Object} objCallback
 */
MainLoop.prototype.removeItem = function(objCallback)
{
	for (var i in this.arrItems)
	{
		if (this.arrItems[i] == objCallback)
		{
			this.arrItems.splice(i, 1);
			this.intItemsLength--;
			//console.log("MainLoop remove item " + i)
			break;
		}
	}
	//console.log("MainLoop length " + this.arrItems.length)
}

/**
 * Is item already here? 
 * @param {Object} objCallback
 */
MainLoop.prototype.hasItem = function(objCallback)
{
	for (var i in this.arrItems)
	{
		if (this.arrItems[i] == objCallback)
		{
			return true;
		}
	}
	return false;
}

/**
 * start looping 
 */
MainLoop.prototype.start = function()
{
	if (this.isRunning())
	{
		return;
	}
	
	this.intPreviousTime = (new Date().getTime()) - MainLoop.INTERVAL_DURATION; //for correct time difference during first loop run
	this.loopInterval = setInterval(this.doLoop, MainLoop.INTERVAL_DURATION);
	this.blRunning = true;
	
	//interval would run the first loop in MainLoop.INTERVAL_DURATION, but we want to run that immediately
	this.doLoop();
}

/**
 * Call all the registered callbacks 
 */
MainLoop.prototype.doLoop = function()
{
    if (this.blPaused)
    {
        /*this.intCurrentTime = new Date().getTime();
        this.intPausedTime += this.intCurrentTime - this.intPreviousTime;
        this.intPreviousTime = this.intCurrentTime;*/
        
        return;
    }
    
	this.intCurrentTime = new Date().getTime()  - this.intPausedTime;
	this.intTimeDifference = this.intCurrentTime - this.intPreviousTime;

	//console.log(this.intItemsLength, this.intTimeDifference, this.intCurrentTime);

	for (this.intIterator = 0; this.intIterator < this.intItemsLength; this.intIterator++)
	{
		this.arrItems[this.intIterator](this.intTimeDifference, this.intCurrentTime);
	}

	this.intPreviousTime = this.intCurrentTime;
}

/**
 * Stop looping 
 */
MainLoop.prototype.stop = function()
{
	clearInterval(this.loopInterval);
}

/**
 * Pause looping 
 */
MainLoop.prototype.pause = function()
{
    this.blPaused = true;
}

/**
 * Pause looping 
 */
MainLoop.prototype.resume = function()
{
    this.blPaused = false;
}

/**
 * Is the loop running at the moment?
 * @return {boolean} 
 */
MainLoop.prototype.isRunning = function()
{
	return this.blRunning;
}
