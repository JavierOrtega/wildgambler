/**
 * Browser Window
 * 
 * Basic API:
 * - singleton is available via BrowserWindow.getInstance()
 * 
 * - hideUrlBar() to hide address bar on smart phones
 * - addOnCurrentWindowResize(callback) to add callback on current window resize
 * - addOnCurrentWindowScroll(callback) to add callback on current window scroll
 */

/**
 * Browser Window
 * 
 * @param {DeviceModel} deviceModel optional (if not provided, device model will be instantiated automatically)
 */
var BrowserWindow = function(deviceModel)
{
	this.objDeviceModel = (deviceModel == undefined) ? new DeviceModel() : deviceModel;

	this.objCurrentWindow = null; //current window
	this.objParentWindow = null; //parent window
	this.objMainWindow = null; //the main window (ie. this window is going to hide the bar)

	this.urlBarTimeout = null; //timeout for hiding url bar

	//resizing current window
	this.blCatchingCurrentWindowResize = false; //true when resize events are already being caught
	this.arrCurrentWindowResizeCallbacks = []; //array of callbacks on current window resize
	this.timeoutCurrentWindowResize = null;
	this.intCurrentWindowResizeTime = 100; //[miliseconds], how often the window resize event is fired

	//resizing current window
	this.blCatchingCurrentWindowScroll = false; //true when scroll events are already being caught
	this.arrCurrentWindowScrollCallbacks = []; //array of callbacks on current window scroll
	this.timeoutCurrentWindowScroll = null;
	
	this.windowWidthInner = null;
	this.windowHeightInner = null;

	//binding
	this.processOnCurrentWindowResize = this.processOnCurrentWindowResize.bind(this);
	this.doCurrentWindowResize = this.doCurrentWindowResize.bind(this);
	
	this.processOnCurrentWindowScroll = this.processOnCurrentWindowScroll.bind(this);
	this.doCurrentWindowScroll = this.doCurrentWindowScroll.bind(this);

	//initialisation
	this.init();
}

//extend class
Class.extend(Class, BrowserWindow);

/* singleton functionality */
BrowserWindow.objSingletonInstance = null;

/**
 * Get singleton instance
 * @return {BrowserWindow}
 */
BrowserWindow.getInstance = function()
{
	if (BrowserWindow.objSingletonInstance == null)
	{
		BrowserWindow.objSingletonInstance = new BrowserWindow();
	}
	return BrowserWindow.objSingletonInstance;
}

/**
 * Initialisation
 * - find current window, parent window and top window 
 */
BrowserWindow.prototype.init = function()
{
	this.objCurrentWindow = window; //current window
	this.objParentWindow = window; //parent window
	this.objMainWindow = window; //the main window (ie. this window is going to hide the bar)

	//find parent window
	if (window.parent)
	{
		this.objParentWindow = window.parent; //set parent window

		//find the top window (the main window)			
		if (window.top)
		{
			this.objMainWindow = window.top;
		}
	}
}

/**
 * Call this to hide URL bar on mobile devices (smartphones)
 * This can be used anywhere (even inside IFRAME)
 */
BrowserWindow.prototype.hideUrlBar = function()
{
	//run this on this.objMainWindow
	/*if (this.objDeviceModel.platform == OS.WINDOWS)
	{
		return;
	}
     
	var that = this;
	clearTimeout(this.urlBarTimeout);
	if (this.objDeviceModel.platform == OS.IOS)
	{
		this.urlBarTimeout = setTimeout(function() {
			that.objMainWindow.scrollTo(0, 0);

		}, 500);
	}
	else if (this.objDeviceModel.platform == OS.ANDROID)
	{
		this.urlBarTimeout = setTimeout(function() {
			
			var originalHeight = that.objMainWindow.document.body.style.height;
			that.objMainWindow.document.body.style.height = (window.outerHeight + 200) + "px";
			that.objMainWindow.scrollTo(0, 1);
			that.objMainWindow.document.body.style.height = originalHeight;
			
		}, 500);
	}*/
}

/**
 * Add callback on resize of current window
 * 
 * @param {Function} callback
 *  
 */
BrowserWindow.prototype.addOnCurrentWindowResize = function(callback)
{
	if (!this.blCatchingCurrentWindowResize)
	{
		this.objCurrentWindow.addEventListener("resize", this.processOnCurrentWindowResize, false);
		setInterval(this.doCurrentWindowResize, 1000); //thanks to Galaxy S3 and the state when address bar is half hidden
		this.blCatchingCurrentWindowResize = true;
	}
	
	this.arrCurrentWindowResizeCallbacks.push(callback);
}

/**
 * Add callback on window scroll
 * 
 * @param {Function} callback 
 */
BrowserWindow.prototype.addOnCurrentWindowScroll = function(callback)
{
	if (!this.blCatchingCurrentWindowScroll)
	{
		this.objCurrentWindow.addEventListener("scroll", this.processOnCurrentWindowScroll, false);
		this.blCatchingCurrentWindowScroll = true;
	}
	
	this.arrCurrentWindowScrollCallbacks.push(callback);
}

/**
 * Make sure that resize event happens only once in time
 */
BrowserWindow.prototype.processOnCurrentWindowResize = function(event)
{
	clearTimeout(this.timeoutCurrentWindowResize);
	this.timeoutCurrentWindowResize = setTimeout(this.doCurrentWindowResize, this.intCurrentWindowResizeTime);
}

/**
 * Do the window onResize (if the size of window has changed)
 * Will pass window width, height and the window into the function
 */
BrowserWindow.prototype.doCurrentWindowResize = function()
{
	if (this.windowWidthInner != this.objCurrentWindow.innerWidth || this.windowHeightInner != this.objCurrentWindow.innerHeight)
	{
		for (var i in this.arrCurrentWindowResizeCallbacks)
		{
			this.windowWidthInner = this.objCurrentWindow.innerWidth;
			this.windowHeightInner = this.objCurrentWindow.innerHeight;
			
			this.arrCurrentWindowResizeCallbacks[i](this.windowWidthInner, this.windowHeightInner, this.objCurrentWindow);
		}
	}
}

/**
 *  Make sure that scroll event happens only once in time
 */
BrowserWindow.prototype.processOnCurrentWindowScroll = function(event)
{
	clearTimeout(this.timeoutCurrentWindowScroll);
	this.timeoutCurrentWindowScroll = setTimeout(this.doCurrentWindowScroll, this.intCurrentWindowResizeTime);
}

/**
 * Do the window onScroll 
 */
BrowserWindow.prototype.doCurrentWindowScroll = function()
{
	for (var i in this.arrCurrentWindowScrollCallbacks)
	{
		//console.log(this.objCurrentWindow);
		this.arrCurrentWindowScrollCallbacks[i](this.objCurrentWindow.innerWidth, this.objCurrentWindow.innerHeight, this.objCurrentWindow);
	}
}


/**
 * Retrieve current window object 
 *
 * @return {Window} 
 */
BrowserWindow.prototype.getWindow = function()
{
	return this.objCurrentWindow;
}

/**
 * Retrieve parent window object (can be the same as current window)
 *
 * @return {Window} 
 */
BrowserWindow.prototype.getParentWindow = function()
{
	return this.objParentWindow;
}

/**
 * Retrieve main window object (can be the same as current window or the same as parent window)
 *
 * @return {Window} 
 */
BrowserWindow.prototype.getMainWindow = function()
{
	return this.objMainWindow;
}
