
function LoaderSound(soundConfigPath, soundConfigFileName, soundFileName, onLoadCompleteCallback)
{
	/** event reference for button which triggered the sound loading **/
	this.triggerEvent = null;
	
    /** debug boolean used for tracing audio load sequence on device **/
    this.blDebug = false;

    /** The name of the sound file to loaded / played (minus the extension) (e.g. "cop_base") **/
    this.strSoundFileName = soundFileName;

    /** File name (with extension) for JSON sound config **/
    this.strSoundConfigFileName = soundConfigFileName;

    /** The path of the JSON sound file to be loaded (with start,stop & loop details for each game sound **/
    this.strSoundConfigPath = soundConfigPath;

    /** The full path & filename of the reconstitute JSON sound file **/
    this.strJsonSoundsPath = soundConfigPath + soundConfigFileName;

    /** The function called when sound sprite (or web audio) loading is complete **/
    this.objOnLoadCompleteCallback = onLoadCompleteCallback;

    /** instance of sound player */
    this.objSoundPlayer = null;

    /** Boolean for when sound sprite loading is complete*/
    this.blSoundsPreLoaded = false;

    /** Boolean for load timeout error*/
	this.blLoadTimeout = false;
	
	/** JSON data file containing .sounds Array(start,end,loop,name) */
	this.objSoundData = null;

	/** String src of audio file e.g. ../res/test/sounds.mp3 */
	this.strAudioSrc = "";

	/** String type of audio file e.g. audio/mp3 */
	this.strAudioType = "";

	/** boolean denoting audio support */
	this.blAudioSupported = false;
	
	/** HTML5 Audio component, this is a reference to document.getElementById('elmtAudio'); */
	this.objAudio=null;

	/** Bound functions */
	
	/** load JSON file, set Audio src, load Sound file */	
	this.load = this.load.bind(this);
	
	/** Use LoaderData to load JSON sound data file */
	this.loadSoundData = this.loadSoundData.bind(this);
	
	/** Callback for LoaderData */
	this.loadSoundDataCallback = this.loadSoundDataCallback.bind(this);
	
	/** Sets .src and .type of audio component, calls load() and sets timeout listener
	 *  NB We need a timeout listener as well or this could recurse forever  */
	this.loadSoundFile = this.loadSoundFile.bind(this);
	
	/** Sets the appropriate audio src format using method audioSupport() */
	this.setAudioSource = this.setAudioSource.bind(this);
	
	/** Determines which formats are supported by the Browser, using utils.DetectBrowser */	
	this.objAudioSupport = this.audioSupport.bind(this);
	
	/** The following manually load the JSON file: can probably lose these */
	/** Parses the JSON file (if we have loaded it ourselves rather than using LoaderData) */
	this.parseJSONSoundsFile = this.parseJSONSoundsFile.bind(this);

	/** Callback for manual loading of JSON file */
	this.serverErrorHandler = this.serverErrorHandler.bind(this);

	/** Callback for manual loading of JSON file */
	this.commsTimeoutHandler = this.commsTimeoutHandler.bind(this);

    /** set method for instance of sound player*/
	this.setSoundPlayer = this.setSoundPlayer.bind(this);

    /** Callback for when sound load has been initiated (i.e. on button click/press)*/
	this.onSoundClick = this.onSoundClick.bind(this);

    /** Simulate click method to preload audio for non iOS devices) **/
	this.simulateClick = this.simulateClick.bind(this);

    /** callback from audio object when loading is complete */
	this.loadComplete = this.loadComplete.bind(this);
}

/** 
 * Extend this as a Loader class to provide standard error handling 
 * when loading our sound file
 * TODO This may not work like that as it is the audio component that
 * actually loads the file given its .src property i.e. a url
 */
Class.extend(Loader, LoaderSound);

/*
 * Assign sound player reference
 *
 */

LoaderSound.prototype.setSoundPlayer = function (soundPlayer)
{

    if (this.blDebug) 
    {
        alert("soundLoader was asked to set soundPlayer: " + soundPlayer);
    }
    this.objSoundPlayer = soundPlayer;
}

/**
 * To load a sound data file (JSON format)
 * and the relevant sound file for the platform
 */
LoaderSound.prototype.load = function ()
{
	// Does nothing - but proves inheritance AND use of parent class' functions
	this.parent.load();
	
    // Load json sound data 
	this.loadSoundData();
}

/** SoundFile Start load **/
LoaderSound.prototype.loadSoundFile = function()
{
    this.objAudio = document.getElementById(AUDIO.ELEMENT);
    this.objAudio.src = this.strAudioSrc;
	this.objAudio.type = this.strAudioType;
	this.objAudio.loop = false;
	this.objAudio.autoplay = false;
	this.objAudio.muted = false;
	this.objAudio.preload = "none";
	this.objAudio.load();

    // Load sounds when available for non ios devices
	var objDetectBrowser = new DetectBrowser();
	if (objDetectBrowser.browser != BROWSERS.SAFARI)
	{
	    this.onSoundClick("spin");
	}

    if (this.blDebug)
    {
        alert("testAudio: this.objAudio: " + this.objAudio + " this.objAudio.src: " + this.objAudio.src + " this.objAudio.type: " + this.objAudio.type);
    }
}

/**
* Called when the first button is clicked (generic but implemented because of load restrictions for IOS)
*/

LoaderSound.prototype.onSoundClick = function (triggerEvent)
{ 
    this.triggerEvent = triggerEvent;

    // Add json & audio loaded to sound player (and audio plugin)
    this.objSoundPlayer.getAudioPlugin().setJson(this.objSoundData);
    this.objSoundPlayer.getAudioPlugin().setAudioObject(this.objAudio);
    this.objSoundPlayer.getAudioPlugin().setPreloadCompleteCallback(this.loadComplete);
    this.objAudio.load();
    this.objAudio.addEventListener('canplaythrough', this.objSoundPlayer.getAudioPlugin().preloadAudio);

    if (this.blDebug)
    {
        var objDetectBrowser = new DetectBrowser();
        alert("onSoundClick - browser: " + objDetectBrowser.browser + " v" + objDetectBrowser.version);
    }
}

/**
* Called once the sound has finished loading, populates  the audio plugin with loaded sound objects
*/

// RENAME TO LOAD COMPLETE OR SOMETHING!

LoaderSound.prototype.loadComplete = function ()
{
    this.objAudio.removeEventListener('canplaythrough', this.loadComplete);
    this.objOnLoadCompleteCallback(this.triggerEvent);
}

/**
 * Code lifted from Chests Of Plenty soundHandler.as
 * this method seeks to determine the correct sound format to use given a particular
 * browser type.
 * The browser type is determined in function audioSupport.
 * When we have a positive result from audioSupport we can set the .src and .type
 * of our audio component. This should be enough to allow us to load the file.
 */
LoaderSound.prototype.setAudioSource = function()
{
    var blnAudioSupported = true;
    var pathArr = window.location.href.split('?'); 
    var pathArr2 = pathArr[0].split('://');      
    var fullPath = 'http://'+pathArr2[1].substring(0, pathArr2[1].lastIndexOf('/')+1);

    if (this.audioSupport(AUDIO.MP4))
    {
        this.strAudioSrc = this.strSoundConfigPath + this.strSoundFileName + '.m4a';
        this.strAudioType = AUDIO.MP4;
    }
    else if( this.audioSupport( AUDIO.OGG ))
    {
        this.strAudioSrc = this.strSoundConfigPath + this.strSoundFileName + '.ogg';
        this.strAudioType = AUDIO.OGG;
    }
    else if (this.audioSupport(AUDIO.MP3))
    {
        this.strAudioSrc = this.strSoundConfigPath + this.strSoundFileName + '.mp3';
        this.strAudioType = AUDIO.MP3;
    }
    else if (this.audioSupport(AUDIO.WAV))
    {
        this.strAudioSrc = this.strSoundConfigPath + this.strSoundFileName + '.wav';
        this.strAudioType = AUDIO.WAV;
    }
    else
    {
        blnAudioSupported = false;
    }
    
    this.blAudioSupported = blnAudioSupported; 

    if (this.blDebug)
    {
        alert("setAudioSource: " + this.blAudioSupported);
    }

    //alert("strAudioType: " + this.strAudioType);
    
    return blnAudioSupported;
}

/** 
 * Code lifted from Chests Of Plenty soundHandler.as
 * This method seeks to determine whether audio of a particular format is
 * supported by our browser.
 * It uses the DetectBrowser util object to get the browser type.
 * 
 */
LoaderSound.prototype.audioSupport = function( strFormat )
{
    // Set our audio component to the one declared on the page that loaded us.
    this.objAudio = document.getElementById(AUDIO.ELEMENT);

    var blAudioFormatSupported=false;
    var objDetectBrowser = new DetectBrowser();
    var blIeUnsuportedVersion = false;    
    
    if (this.blDebug)
    {
        alert("browser: " + objDetectBrowser.browser + " v" + objDetectBrowser.version);
    }

    if (objDetectBrowser.browser == BROWSERS.IE) 
    {
        if (parseInt(objDetectBrowser.version) <= 8)
        {
            // Audio unsupported for IE 8 or below
            blIeUnsuportedVersion = true;
        }
        else
        {

            // Try to automatically determine compatibility in case of unknown browser type
            try
            {
                blAudioFormatSupported = (this.objAudio.canPlayType(strFormat) != '');
            } catch (err) { }
        }
	}
    
	// no point checking these if an unsupported version of IE
    if (blIeUnsuportedVersion == false)
    {
    	
        switch (objDetectBrowser.browser)
	    {
	    	// IE should support the following:
	    	case BROWSERS.IE:
	        switch (strFormat)
	        {
	            case AUDIO.MP3:
	            case AUDIO.MP4:
	                blAudioFormatSupported = true;
	                break;
	            default:
	                blAudioFormatSupported = false;
	                break;
	        }   
	    	break;
	    	
	    	// Android / Chrome should support the following
	        case BROWSERS.ANDROID:
	    	case BROWSERS.CHROME:
	        switch (strFormat)
	    	{
	            case AUDIO.OGG:
	            case AUDIO.MP3:
	            case AUDIO.MP4:
	                blAudioFormatSupported = true;
	                break;
	            default:
	                blAudioFormatSupported = false;
	                break;
	        }   
	    	break;
	
	    	// Firefox should support the following
	    	case BROWSERS.FIREFOX:
	        switch (strFormat)
	    	{
	            case AUDIO.OGG:
	            case AUDIO.WAV: 
	                blAudioFormatSupported = true;
	                break;
	            default:
	                blAudioFormatSupported = false;
	                break;
	        }   
	    	break;
	
	    	// Safari should support the following
	    	case BROWSERS.SAFARI:
	        switch (strFormat)
	    	{
	            case AUDIO.MP4:
	            case AUDIO.OGG:
	            case AUDIO.MP4:
	                blAudioFormatSupported = true;
	                break;
	            default:
	                blAudioFormatSupported = false;
	                break;
	        }   
	    	break;
	
	    	// Opera should support the following
	    	case BROWSERS.OPERA:
	    	    switch (strFormat)
	    	{
	            case AUDIO.OGG:
	            case AUDIO.WAV:             
	                blAudioFormatSupported = true;
	                break;
	            default:
	                blAudioFormatSupported = false;
	                break;
	        }   
	    	break;
    	}
	}
    
    return blAudioFormatSupported; 
}

/**
 * Load the JSON file describing the contents of the sound file
 */
LoaderSound.prototype.loadSoundData = function()
{
    if (this.blDebug)
    {
        alert("loadSoundData");
    }

    // instantiate loader
    var objLoaderData = new LoaderData(this.strJsonSoundsPath);
	   
	// set callback for onLoad
    objLoaderData.setCallback(this.loadSoundDataCallback);

    // load sound data
    objLoaderData.load();
}

/**
 * Callback method for LoaderData to call when the soundData JSON has arrived.
 */
LoaderSound.prototype.loadSoundDataCallback = function( objResource, strName )
{
    if (strName == this.strJsonSoundsPath && this.objSoundData == null)
    {
        this.objSoundData = objResource;

        if (this.blDebug)
        {
            alert("loadSoundDataCallback");
            this.debugOutJSON();
        }
    }
	
	// Determine which type of sound file to use after JSON has arrived.
	this.setAudioSource();

	// then load sound file selected!
	if( this.blAudioSupported )
	{
		this.loadSoundFile();
	}	
}

/**
 * Load sound Data (JSON) file directly using a comm object
 * NOTE: for reference only : we will use a LoaderData for JSON
 * 			 but will need to load actual sound file separately
 * 			 and pass them to a sound manager.
 */
LoaderSound.prototype.loadJSONFile = function()
{
    var objRequest = new Comm(null);
    objRequest.setHandlerErr(this.serverErrorHandler);
    objRequest.setHandlerTime( this.commsTimeoutHandler, 35000);
    objRequest.doGet(this.strJsonSoundsPath, this.parseJSONSoundsFile, 'text');
}

/**
 * Callback method to receive objRequest data from loadSoundData method.
 * Note: If we use LoaderData the JSON will arrive pre-parsed so we
 * won't need this method.
 */
LoaderSound.prototype.parseJSONSoundsFile = function(resp)
{
	// Parse sound JSON data
	this.objSoundData = JSON.parse( resp );
}

/**
 * Print out data object contents to console:
 * Data should be class member by now: If not we have a problem.
 */
LoaderSound.prototype.debugOutJSON = function ()	
{
	console.log("\n----------------------\n");
	console.log("debugOut LoaderSound JSON data:\n")
	for ( obj in this.objSoundData.sounds )
	{
		console.log("name: " + this.objSoundData.sounds[obj].name)
		console.log("start: " + this.objSoundData.sounds[obj].start)
		console.log("end: " + this.objSoundData.sounds[obj].end)
		console.log("loop: " + this.objSoundData.sounds[obj].loop)
		console.log("-------------\n")
	}
}

/**
 * Comm timeout callback 
 */
LoaderSound.prototype.commsTimeoutHandler = function()
{
    alert("Comms Timeout.");
}

/**
 * Comm error callback 
 */
LoaderSound.prototype.serverErrorHandler = function ()
{
    alert("Server error.");
}

/** Used to preload audio for non iOS devices 
    also used as an A-synchronus Unit Test method to simulate a mouse click which triggers sound loading **/
LoaderSound.prototype.simulateClick = function (id)
{
    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window, 1, 0, 0, 0, 0,
        false, false, false, false, 0, null);

    var cb = document.getElementById(id);
    cb.dispatchEvent(evt);
}
