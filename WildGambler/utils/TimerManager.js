/**
 * This class overlays the MainLoop singleton class (which provides a single loop for animations)
 * It is used in a similar way to setTimeout but with the reliability of a setInterval:
 * 
 * TimeManager maintains a list of objects (Clients) requiring a callback after a set time.
 * 
 * Clients pass a callback function and a time delay integer (mSec) after which the callback will be made. 
 * Instead of using setTimeout we receive the callback from MainLoop roughly every 30ms. 
 * 
 * Each object in our arrTimedObjects tracks its accumulated time from this to determine 
 * when to be removed from the array of objects and have its callback run. 
 * 
 * The start method returns an ID which can be used to cancel the listener, using the stop method: 
 * 		The callback will not be run if this is invoked.
 * 		Calling stop with an invalid, null or undefined timerId will have no ill effects.
 * 
 * Once the callback is made there is no need to take any further action in the Client class.
 * 
 * When the TimeManager's list of objects is empty it will remove its wait method from MainLoop 
 * and cease to consume any resources.
 *  
 * @ author maserlin c. ashgaming 2013
 */
function TimerManager()
{
	this.start = this.start.bind(this);
	this.stop = this.stop.bind(this);
	this.wait = this.wait.bind(this);

	this.arrTimedObjects = [];
}
Class.extend(Class,TimerManager);

/* singleton functionality */
TimerManager.objSingletonInstance = null;

/**
 * Get singleton instance
 * @return {MainLoop}
 */
TimerManager.getInstance = function()
{
	if (TimerManager.objSingletonInstance == null)
	{
		TimerManager.objSingletonInstance = new TimerManager();
	}
	return TimerManager.objSingletonInstance;
}

/**
 * Using a similar signature to setTimeout, this class depends on a setInterval loop
 * running in MainLoop, which is more reliable and allows us to have just one animation 
 * loop running for multiple animations or timing events.
 * @param fnCallback : To call on complete
 * @param intDuration : Min length of time in mS to wait before making the callback. 
 * 						Not 100% accurate - callback is made when elapsed time >= intDuration
 */
TimerManager.prototype.start = function(fnCallback, intMinDuration)
{
	/*
	 * Store new timed object
	 */ 
	this.arrTimedObjects.push( new TimedObject(fnCallback, intMinDuration) );
	var intTimerId = this.arrTimedObjects[this.arrTimedObjects.length-1].intTimerId;
	//console.log("TimerManager.prototype.start " + intTimerId)
	
	/*
	 * Check if we need to add ourselves to the main loop
	 */
	if(MainLoop.getInstance().hasItem(this.wait) == false)
	{
		MainLoop.getInstance().addItem(this.wait);
	}
	
	/*
	 * Return ID in case we need to cancel
	 */
	return intTimerId;
}

/**
 * @param intTimerId : the object to stop waiting for.
 */
TimerManager.prototype.stop = function(intTimerId)
{
	/**
	 * We may be called with a null value: some objects might call stop
	 * even though they weren't started, in which case we needn't do anything.
	 * i.e. as a default action to clear winlines, after a spin with no actual wins.
	 */
	if(intTimerId != null)
	{
		//console.log("TimerManager.prototype.stop " + intTimerId)
		for(var objs in this.arrTimedObjects)
		{
			/*
			 * Remove matching TimedObject.
			 */
			if(this.arrTimedObjects[objs].intTimerId == intTimerId)
			{
				this.arrTimedObjects.splice(objs, 1);
			}
		}

		/*
		 * Remove our listener if we have nothing to listen for.
		 */ 
		if(this.arrTimedObjects.length == 0)
		{
			MainLoop.getInstance().removeItem(this.wait);
		}
	}
}

/**
 * This method recieves the callback from the MainLoop with the standard params as below.
 * Here we increment all our timedObjects' intElapsedTime and check to see if we should 
 * fire the callback.
 * "Used" objects are removed from the array.
 * If the array is empty this method is removed from the MainLoop.
 * Finally any queued callbacks are made. 
 * 
 * @param {Object} intElapsedTime : time taken since last call
 * @param {Object} intCurrentTime : current time
 */
TimerManager.prototype.wait = function(intElapsedTime, intCurrentTime)
{
	//console.log("TimerManager.prototype.wait")
	var newArray = [];
	var arrCallbackQueue = [];
	
	for(var objs in this.arrTimedObjects)
	{
		this.arrTimedObjects[objs].intElapsedTime += intElapsedTime;
		
		/*
		 * Gather any callbacks we should make on this pass 
		 */
		if(this.arrTimedObjects[objs].intElapsedTime >= this.arrTimedObjects[objs].intDuration)
		{
			arrCallbackQueue.push(this.arrTimedObjects[objs].fnCallback);
			//console.log("timerId " + this.arrTimedObjects[objs].intTimerId + " completed")
		}
		/*
		 * Continue to check any callback objects not yet hit their time.
		 */
		else
		{
			newArray.push(this.arrTimedObjects[objs]);
		}
	}
	
	/*
	 * Reassign the arrTimedObjects with those not finished yet.
	 */ 
	this.arrTimedObjects = newArray;

	if(this.arrTimedObjects.length == 0)
	{
		MainLoop.getInstance().removeItem(this.wait);
	}
	
	/*
	 * Finally deal with the callbacks. 
	 * Some callbacks may result in new TimerManager.start events, and if we jump 
	 * straight to that via these callbacks and THEN call MainLoop.getInstance().removeItem(this.wait)
	 * everything may stop working, as if we are the last object in the arrTimedObjects 
	 * we may have removed our wait method after having started a new iteration.
	 * The start method above will re-add this wait method to MainLoop if required.
	 */
	for(var next in arrCallbackQueue)
	{
		arrCallbackQueue[next].call();
	}
}

/**
 * Timed object. 
 * @param {Object} fnCallback: callback to make on completion
 * @param {Object} intDuration: how long to wait to make the callback
 * @param {Object} intId: timer ID for recognition.
 */
function TimedObject(fnCallback, intDuration)
{
	this.fnCallback = fnCallback;
	this.intDuration = intDuration;
	this.intTimerId = new Date().getTime();
	this.intElapsedTime = 0;
}
