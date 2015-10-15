/**
 * @Author TG
 * Sound Sprite for HTML AUDIO
 */

function SoundSprite()
{
    this.objAudioList = null;
    this.objAudioObject = null;
    this.blLoops = false;
    this.intFadeIn = 0;
    this.intFadeOut = 0;
    this.flVolume = 1;
    this.intSoundIndexFromName = 0;

    this.objDetectBrowser = new DetectBrowser();
    this.flStartTime = 0;
    this.flEndTime = 0;

    this.objPreloadTimer = null;
    this.fnPreloadCallback;

    this.strRequestedAudio = "";
    this.blSameTrackRequested = false;

    this.setJson = this.setJson.bind(this);
    this.setAudioObject = this.setAudioObject.bind(this);
    this.getAudioObject = this.getAudioObject.bind(this);
    this.setLoops = this.setLoops.bind(this);

    this.start = this.start.bind(this);
    this.startAfterDelay = this.startAfterDelay.bind(this);
    this.play = this.play.bind(this);
    this.stop = this.stop.bind(this);

    this.assignTrackTimes = this.assignTrackTimes.bind(this);

    this.onTimeUpdate = this.onTimeUpdate.bind(this);
    this.setPreloadCompleteCallback = this.setPreloadCompleteCallback.bind(this);
    this.preloadAudio = this.preloadAudio.bind(this);
    this.doPreload = this.doPreload.bind(this);
    this.setFadeIn = this.setFadeIn.bind(this);
    this.setFadeOut = this.setFadeOut.bind(this);
    this.setVolume = this.setVolume.bind(this);
    this.loadComplete = this.loadComplete.bind(this);

    this.cloneFunction = this.cloneFunction.bind(this);
    this.cloneArray = this.cloneArray.bind(this);

    this.applyTrackStartTime = this.applyTrackStartTime.bind(this);

    this.retriggerLoop = this.retriggerLoop.bind(this);

    // reference to callback function on sound completed (or audio stopped)
    this.fnCallback = null;

    // reference to an array of callback function agruments
    this.arrCallbackArguments = [];

    // Sound focus (for changing browser tabs / home button)
    this.onFocus = this.onFocus.bind(this);
    this.checkFocus = this.checkFocus.bind(this);
    this.objFocusTimer = null;
    this.focusLastSeen = null;

    // seek and play stuff
    this.name = null;
    this.callbackFunction = null;
    this.callbackArguments = null;
    this.intTimerId = null;

    // States
    this.state = 0;

    this.INT_IDLE = 0;
    this.INT_LOADING = 1;
    this.INT_SEARCHING = 2;
    this.INT_PLAYING = 3;
}

Class.extend(Class, SoundSprite);

SoundSprite.prototype.setPreloadCompleteCallback = function (fnPreloadCallback)
{
    this.fnPreloadCallback = fnPreloadCallback;
}

SoundSprite.prototype.setJson = function (objAudioList)
{
    this.objAudioList = objAudioList;
}

SoundSprite.prototype.setAudioObject = function (objAudioObject)
{
    this.objAudioObject = objAudioObject;
}

SoundSprite.prototype.getAudioObject = function ()
{
    return this.objAudioObject;
}

SoundSprite.prototype.setLoops = function (blLoops)
{
    this.blLoops = blLoops;
}

/** STUB Methods only - not supported by IOS!! **/
SoundSprite.prototype.setFadeIn = function (intFadeIn)
{
    this.intFadeIn = intFadeIn;
}

/** STUB Methods only - not supported by IOS!! **/
SoundSprite.prototype.setFadeOut = function (intFadeOut)
{
    this.intFadeOut = intFadeOut;
}

/** STUB Methods only - not supported by IOS!! **/
SoundSprite.prototype.setVolume = function (flVolume)
{
    this.flVolume = flVolume;
}


SoundSprite.prototype.preloadAudio = function ()
{
    this.objPreloadTimer = setInterval(this.doPreload, 200);
}

SoundSprite.prototype.loadComplete = function ()
{
    this.objAudioObject.muted = false;

	clearInterval(this.objPreloadTimer);
    this.objAudioObject.currentTime = "0";
    this.objAudioObject.pause();
    this.objAudioObject.addEventListener('timeupdate', this.onTimeUpdate);
    this.fnPreloadCallback();

    //for ios, add an interval to check for lost focus (to stop audio if required)       
    this.objFocusTimer = setInterval(this.onFocus, 50);
}

SoundSprite.prototype.onFocus = function ()
{
    this.focusLastSeen = Date.now();
}

/**
 * The doPreload method pre-buffers the HTML Audio file contents into the devices memory prior to 
 * playing sounds.
 */

SoundSprite.prototype.doPreload = function ()
{
    // Desire HD Hack
    if (String(navigator.userAgent).indexOf("HTC") > -1)
    {
        clearInterval(this.objPreloadTimer);
        this.objAudioObject.play();
        this.objAudioObject.muted = true;
        this.objPreloadTimer = setInterval(this.loadComplete, 50);
    }
    else if (this.objAudioObject)
    {
        this.objAudioObject.muted = true;

        if (Number(this.objAudioObject.currentTime) == 0)
        {
            // instruct audio to play if currentTime is zero     
            this.objAudioObject.play();
            this.state = this.INT_LOADING;
        }
        else
        {
            // if currentTime is less than end of last sound index, attempt to set it
            var duration = (Number(this.objAudioList.sounds[this.objAudioList.sounds.length - 1].end)+0.300);

            if (Number(this.objAudioObject.currentTime) < duration)
            {
                // Set the audio object current time to the maxiumum duration of the Sound Sprite.
                try
                {
                    this.objAudioObject.currentTime = String(duration);
                } catch (err)
                {
                }

                // ensure the audio is playing during this preload phase
                if (this.state != this.INT_LOADING)
                {
                    this.objAudioObject.play();
                    this.state = this.INT_LOADING;
                }
            }
            else
            {
                clearInterval(this.objPreloadTimer);

                //add a delay to allow the playback head to reset.                
                this.objPreloadTimer = setInterval(this.loadComplete, 300);
            }
        }
    }
}

/**
 * Instruct a specific sound to play
 *
 * @param name: a string containing the sound name
 * @param callbackFunction: a reference to a callback function to be called once the sound has completed (optional)
 * @param callbackArguments: an array of callback arguments to be passed to the callback function above (optional)
 */

SoundSprite.prototype.play = function (name, callbackFunction, callbackArguments)
{
    // store values, stop all sound, assign the new track time then play the new sound after 50ms delay
    this.name = name;
    this.callbackFunction = callbackFunction;
    this.callbackArguments = callbackArguments;

    this.stop();
    this.assignTrackTimes(name);

    if ((this.objDetectBrowser.browser == BROWSERS.CHROME) ||
        (this.objDetectBrowser.browser == BROWSERS.ANDROID))
    {
        // android: play sound immediately
        this.startAfterDelay();
    } else
    {
        // IOS: add delay for playhead tp catchup
        TimerManager.getInstance().stop(this.intTimerId);
        this.intTimerId = TimerManager.getInstance().start(this.startAfterDelay, 50);
    }
}

SoundSprite.prototype.startAfterDelay = function ()
{
    TimerManager.getInstance().stop(this.intTimerId);
    this.start(this.name, this.callbackFunction, this.callbackArguments);
}

/**
 * Used to retrigger a looping sound on receiving a focus event (if applicable)
 */
SoundSprite.prototype.retriggerLoop = function ()
{
    if((this.blLoops) && 
        (this.state == this.INT_IDLE))
    {
        this.start(this.strRequestedAudio, this.fnCallback, this.arrCallbackArguments);
    }
}

SoundSprite.prototype.start = function (name, callbackFunction, callbackArguments)
{
    // stop existing track
    this.stop();

    // assign the last requested audio string
    this.strRequestedAudio = name;

    // assign reference to callback function
    if (callbackFunction)
    {
        this.fnCallback = callbackFunction;

        if (callbackArguments)
        {
            this.arrCallbackArguments = callbackArguments;
        }
    }

    // set track start and end times
    this.assignTrackTimes(name);

    // set looping as required
    if (String(this.objAudioList.sounds[this.intSoundIndexFromName].loop) == "true")
    {
        this.setLoops(true);
    } else
    {
        this.setLoops(false);
    }

    // set to play
    this.state = this.INT_SEARCHING;

    this.objAudioObject.play();
}

/**
 * Calculate and assign the Start and End times for the track name provided (as specified in the sounds.json file)
 */

SoundSprite.prototype.assignTrackTimes = function (name)
{
    // look through list of sounds to find correct index
    for (var x = 0; x < this.objAudioList.sounds.length; x++)
    {
        if (String(this.objAudioList.sounds[x].name) == String(name))
        {
            // set correct sound index
            this.intSoundIndexFromName = x;

            // calculate and store the current, start, and end sound times
            try
            {
                this.objAudioObject.currentTime = String(this.objAudioList.sounds[this.intSoundIndexFromName].start);
            }
            catch (err) { }

            this.flStartTime = Number(this.objAudioObject.currentTime);
            this.flEndTime = Number(this.objAudioList.sounds[this.intSoundIndexFromName].end);

            break;
        } 
    }
}

SoundSprite.prototype.stop = function (name, allowLooping)
{
    this.state = this.INT_IDLE;

    //console.log("SoundSprite: stop: " + name + " callbackFunction: " + this.fnCallback + " args: " + this.arrCallbackArguments);

    if (this.objAudioObject)
    {
        // by default the "allowLooping" argument is undefined, this is set to "true" when a focus event 
        // is dispatched by the device and allows looping sounds to resume.
        if (typeof allowLooping == 'undefined')
        {
            this.blLoops = false;
        } else
        {
            if (allowLooping == false)
            {
                this.blLoops = false;
            }
        }

        this.objAudioObject.pause();

        // call callback function when audio stopped (if applicable)
        if (this.fnCallback)
        {
            // clone callback function and arguments
            var cb = this.cloneFunction(this.fnCallback);
            var args = new Array();
            args = this.cloneArray(this.arrCallbackArguments);

            // reset internal callback function and arguments
            this.fnCallback = null;
            this.arrCallbackArguments = new Array();

            // callback with arguments as required
            if (args.length > 0)
            {
                cb(args);
            }
            else
            {
                cb();
            }
        }
    }
}

SoundSprite.prototype.cloneFunction = function (obj)
{
    if (obj == null || typeof (obj) != 'object')
        return obj;

    var temp = new obj.constructor();
    for (var key in obj)
        temp[key] = this.cloneFunction(obj[key]);

    return temp;
}

SoundSprite.prototype.cloneArray = function (arr)
{
    var newArray = new Array();

    for (var x = 0; x < arr.length; x++)
    {
        newArray[x] = arr[x];
    }
    return newArray;
}

/**
 * State machine, called each time the play head moves in the HTML audio element, 
 * Handles the following states:
 *
 *  INT_IDLE : The playhead is paused.
 *  INT_SEARCHING : The playhead is being moved to the requested track StartTime.
 *  INT_PLAYING : The playhead is playing.
 *
 */

SoundSprite.prototype.onTimeUpdate = function()
{

    if (this.state == this.INT_SEARCHING)
    {
        if ((Number(this.objAudioObject.currentTime) >= (this.flStartTime))
            && (Number(this.objAudioObject.currentTime) < (this.flEndTime)))
        {
            this.state = this.INT_PLAYING;
        } else
        {
            this.applyTrackStartTime();
        }
    }

    else if (this.state == this.INT_PLAYING)
    {
        if (Number(this.objAudioObject.currentTime) >= this.flEndTime)
        {
            if (this.blLoops)
            {
                this.applyTrackStartTime();
                this.state = this.INT_SEARCHING;

            } else
            {
                this.state = this.INT_IDLE;
                this.objAudioObject.pause();
                this.stop();
            }
        }
    }

    this.checkFocus();
}

SoundSprite.prototype.checkFocus = function ()
{
    // Stop sound when focus is lost
    if (this.state != this.INT_IDLE)
    {
        if ((Date.now() - this.focusLastSeen) > 100)
        {
            this.focusLastSeen = Date.now();
            this.state = this.INT_IDLE;
            this.objAudioObject.pause();
        }
    }

    // Restore sound when focus is returned (for loops)
    if (this.state == this.INT_IDLE)
    {
        if (this.blLoops)
        {
            if ((Date.now() - this.focusLastSeen) < 100)
            {
                this.focusLastSeen = Date.now();
                this.state = this.INT_PLAYING
                this.objAudioObject.play();
            }
        }
    }
}

SoundSprite.prototype.applyTrackStartTime = function ()
{
    // The latest version of android (and Windows mobile) devices will reject the assignment of the
    // audio object "currentTime" property (playhead position) unless the audio object is playing!
    try
    {
        this.objAudioObject.currentTime = String(this.flStartTime);
    }
    catch (err) { }
}
