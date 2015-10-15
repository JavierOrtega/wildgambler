/**
 * Environment class author maserlin, javier.ortega, core gaming et al
 *  
 * This class seeks to capture all the information we might need to 
 * get a game launched on [OS][Platform][Browser] at [width][height]resolution!
 * Also we want to make this information available in some coherent way.
 * Javier's code in DetectionModel.js uses this info to construct URLs
 * Core code does a similar thing (see this.launchPageURL)
 * We *may split this class up into detection/decision/accessor methods at a later date,
 * for now we will be doing all the work here until we have a better idea about 
 * framework requirements and structure.
 */
function DeviceModel()
{
	/** Legacy */
	this.launchPageURL = "";

	/** External data */
	this.browser = "";
	this.browserVersion = "";
	this.device = "";
	this.platform = "";	

    /** External data */
    /** Still being thought about */
    this.detectScaling;
    this.orientation;
    this.timeoutId;
    this.aspectRatio = 0;
    this.screenWidth = 0;
    this.screenHeight = 0;
    this.windowWidth = 0;
    this.windowHeight = 0;
    this.devicePixelRatio = 0;


	/** Methods */
    this.init = this.init.bind(this);

    this.start =  this.start.bind(this);

    this.runChecksAndConfig = this.runChecksAndConfig.bind(this);	
    this.redirectToLaunchPage = this.redirectToLaunchPage.bind(this);
    this.getParameterByName = this.getParameterByName.bind(this);
    this.onOrentationComplete = this.onOrentationComplete.bind(this);
    
    this.poll = this.poll.bind(this);
    
    
    this.intOldWidth = 0;
    this.intOldHeight = 0;
    
    this.strState = "normal";
    
    /**
     * This will have a collection of listener to be called when the resolution in the browser changes only 1 time in the beginning
     */
    this.arrResolutionChangedOneTime = [];
    
    /**
     * This will have a collection of listener to be called when the resolution in the browser changes
     */
    this.arrResolutionChanged = [];
    
    /**
     * To store if the scene has been already resized or not for a landscape orientation
     * 
     * {type} Boolean  
     */
    this.blResized = false;
    
  
    /** run */
    this.init();
}
Class.extend(Class,DeviceModel);

/**
 * Allow 200ms for complete page load 
 */
DeviceModel.prototype.init = function()
{	
	// Wait for page loaded
	//setTimeout(this.runChecksAndConfig, 200);

	// Need a persistent class for this so we can run ongoing orientation checks
	this.detectScaling = new DetectScaling();
	
	// Run immediately if we are kicking this off from window onLoad handler 
	this.runChecksAndConfig();
}

/**
 * It adds a new callback to the queue
 * 
 * @param { Function }  fncCallBack A new callBack to be added
 * @param { Boolean } blOneTime To be called one time or several
 */
DeviceModel.prototype.addResolutionChangedCallback = function(fncCallBack,blOneTime)
{
    if (blOneTime)
    {
        this.arrResolutionChangedOneTime.push(fncCallBack);
    }
    else
    {
        this.arrResolutionChanged.push(fncCallBack);
    }
}

/**
 * Continuously checks orientation.
 * TODO useful on Desktop to detect landsape/portrait?
 */
DeviceModel.prototype.poll = function()
{
	this.detectScaling.pollOrientation(this.onOrentationComplete);
}


/**
 * To return the height of the address bar.
 * Each browser (safari, mozilla,android) returns result by device:
 * iPhone && platformVersion 6/any, android/any, android/any
 * @return 
 */
DeviceModel.prototype.getHeightAdressBar = function()
{
    switch( this.browser )
    {
        case BROWSERS.SAFARI:
        
            if (this.device == DEVICES.IPHONE && this.platformVersion != "6")
            {
                return 60;
            }
            else
            {
                return 0;
            }
        break;
        
        case BROWSERS.MOZILLA:
                                                
            if (this.device == DEVICES.ANDROID)
            {
                return 0;
            }
            else
            {
                return 0;
            }
        break;
        
        case BROWSERS.ANDROID:
            
            if (this.device == DEVICES.ANDROID)
            {
               return 0;
            }
            else
            {
                return 0;
            }
        break;        
        default:
        
            return 0;
        break;
    }
}

/**
 * 
 */
//TO DO
// to discuse with Mark about to change the name of this
DeviceModel.prototype.onOrentationComplete = function()
{
	this.orientation = this.detectScaling.orientation;
	
	
	if ( DeviceModel.strPlatform == OS.IOS && (this.windowWidth != window.innerWidth || this.windowHeight != window.innerHeight))
	{
	     for (var fnFunction in this.arrResolutionChangedOneTime )
        {
            if (this.arrResolutionChangedOneTime[fnFunction])
            {
                this.arrResolutionChangedOneTime[fnFunction](this.windowWidth, this.windowHeight, window);
            }
        }
        
        for (var fnFunction in this.arrResolutionChanged )
        {
            if (this.arrResolutionChanged[fnFunction])
            {
                this.arrResolutionChanged[fnFunction](this.windowWidth, this.windowHeight, window);
            }
        }  
	}
	else
	{
        //Call all the callbacks in the queue
        if ((!this.blResized  || this.detectScaling.windowHeight > this.windowHeight) && this.detectScaling.windowWidth >this.detectScaling.windowHeight)
        {
            this.blResized = true;
            for (var fnFunction in this.arrResolutionChangedOneTime )
            {
                if (this.arrResolutionChangedOneTime[fnFunction])
                {
                    this.arrResolutionChangedOneTime[fnFunction](this.windowWidth, this.windowHeight, window);
                }
            }
        }
        else
        {
            for (var fnFunction in this.arrResolutionChanged )
            {
                if (this.arrResolutionChanged[fnFunction])
                {
                    this.arrResolutionChanged[fnFunction](this.windowWidth, this.windowHeight, window);
                }
            }
        }
    }
    
    
    this.windowWidth = this.detectScaling.windowWidth;
    this.windowHeight = this.detectScaling.windowHeight;
}

/**
 * This method should run on load after a delay long enough to make sure that the 
 * page has loaded. NB using onLoad event in testing
 */
DeviceModel.prototype.runChecksAndConfig = function()
{
	// First try for a type of browser.
	var detectBrowser = new DetectBrowser();
	this.browser = detectBrowser.browser; 
	this.browserVersion = detectBrowser.version; 
	

	var detectPlatform = new DetectPlatform();
	this.platform = detectPlatform.platform;
	this.strDeviceType = detectPlatform.strDeviceType;
	
	//Static access, easily accesible
	//TO DO, to explain to Mark what this change was added
	DeviceModel.strPlatform = detectPlatform.platform;
	DeviceModel.intVersion = parseInt (detectPlatform.strOSVersion);
	DeviceModel.browser = detectBrowser.browser;
	DeviceModel.strDeviceType = detectPlatform.strDeviceType;
	DeviceModel.strAssets = "high";
	
	if ((DeviceModel.strDeviceType == "Mobile" && DeviceModel.strPlatform == OS.ANDROID)  || DeviceModel.strDeviceType == "iPhoneLow")
    {
        //if (DeviceModel.browser != BROWSERS.CHROME || DeviceModel.strDeviceType == "iPhoneLow")
        {
            DeviceModel.strAssets = "low";    
        }
    } 
	
	this.platformVersion = detectPlatform.strVersion;
	
	var detectDevice = new DetectDevice();
	this.device = detectDevice.device;

	//Setting the correct data for the screen
	this.aspectRatio = this.detectScaling.aspectRatio;
	this.devicePixelRatio = this.detectScaling.devicePixelRatio;	
	this.screenWidth = this.detectScaling.screenWidth;
	this.screenHeight = this.detectScaling.screenHeight;
	this.windowWidth = this.detectScaling.windowWidth;
	this.windowHeight = this.detectScaling.windowHeight;
	this.orientation = this.detectScaling.orientation;

	/*
    var that = this;
    this.mainRunLoop = setInterval(function() 
    {
        that.poll();
    }, 1000 );
    */
	// Starts a timeout which continually checks for portrait/landscape.

	TimerManager.getInstance().start(this.start, 1500);
}

/**
 *  Start the loop
 */
DeviceModel.prototype.start = function()
{
    var objMainLoop = MainLoop.getInstance();
    objMainLoop.addItem(this.poll);
    objMainLoop.start(); //make sure the loop is running from this point
}

/**
 * 
 * @param {Object} launchPageURL
 */
DeviceModel.prototype.redirectToLaunchPage = function (launchPageURL)
{
	var urlRedirect = launchPageURL;
	var qs = "?";
	
	var commonUIURL = String(this.getParameterByName("commonUIURL"));
	var playMode = String(this.getParameterByName("playMode"));
	var gameName = String(this.getParameterByName("gameName"));
	var channel = String(this.getParameterByName("channel"));
	
	qs += "&commonUIURL=" + commonUIURL;
	qs += "&playMode=" + playMode;
	qs += "&gameName=" + gameName;
	qs += "&channel=" + channel;

  // REDIRECT THE BROWSER
	//window.location.href = urlRedirect + qs;

}

DeviceModel.prototype.getParameterByName = function (name)
{
  if(name)
  {
      name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
      var regexS = "[\\?&]" + name + "=([^&#]*)";
      var regex = new RegExp(regexS);
      var results = regex.exec(window.location.search);
      if(results == null)
        return "";
      else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
  }
  else
  {
      console.log("name undefined");
  }
}


DeviceModel.prototype.getParameterByName2 = function (name)
{
  if(name)
  {
      name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
      var regexS = "[\\?&]" + name + "=([^&#]*)";
      var regex = new RegExp(regexS);
      var results = regex.exec(window.location.search);
      if(results == null)
        return "";
      else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
  }
  else
  {
      console.log("name undefined");
  }
}
