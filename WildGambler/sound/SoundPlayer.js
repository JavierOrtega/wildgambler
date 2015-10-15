
function SoundPlayer()
{

    this.playSound = this.playSound.bind(this); 
    this.stopSound = this.stopSound.bind(this);
    this.setAudioPlugin = this.setAudioPlugin.bind(this);
    this.getAudioPlugin = this.getAudioPlugin.bind(this);
    this.setLoops = this.setLoops.bind(this);
    this.setFadeIn = this.setFadeIn.bind(this);
    this.setFadeOut = this.setFadeOut.bind(this);
    this.setVolume = this.setVolume.bind(this);

    this.objAudioPlugin = "";

    this.intTimerId = null;
    this.name = null;
    this.callbackFunction = null;
    this.callbackArguments = null;
}

Class.extend(Class, SoundPlayer);

// statics to prevent sound player from playing sounds
SoundPlayer.BL_MUTE = false;
SoundPlayer.BL_MUTED_FROM_SIDEBAR = false;


SoundPlayer.prototype.retriggerLoop = function ()
{
    // if the sound is NOT muted and a focus event is received and the previous stored sound is a loop:
    // retrigger it.
    if (this.getAudioPlugin())
    {
        if (SoundPlayer.BL_MUTE == false)
        {
            this.getAudioPlugin().retriggerLoop();
        }
    }
}

SoundPlayer.setMuteSound = function (mute, muteFromBlur)
{
    if (typeof mute == 'undefined')
    {
        alert("SoundPlayer.setMuteSound : No mute value provided.");
    }

    // if mute is requested from a blur/focus event (for example when hitting the home button on a device)
    // only unmute the sound if it has not been muted in the sidebar.

    if (typeof muteFromBlur != 'undefined')
    {
        var ignoreDevice = false;

        // exceptions:

        // Galaxy Tab, Asus Tablet
        if (String(navigator.userAgent).indexOf("Android 4.1.1", 0) > -1)
        {
            ignoreDevice = true;
        }

        // HTC
        if (String(navigator.userAgent).indexOf("HTC", 0) > -1)
        {
            // HTC ONE X (should be ok)
            if (String(navigator.userAgent).toLowerCase.indexOf("one", 0) == -1)
            {
                ignoreDevice = true;
            }
        }

        // blur / focus - mute the sound
        if (ignoreDevice==false)
        {
            if ((SoundPlayer.BL_MUTED_FROM_SIDEBAR) && (mute == false))
            {
                SoundPlayer.BL_MUTE = true;
            }
            else
            {
                SoundPlayer.BL_MUTE = mute;
            }
        }
    }
    // standard: mute the sound as instructed by the sidebar
    else
    {
        if (typeof mute != 'undefined')
        {
            SoundPlayer.BL_MUTE = mute;
            SoundPlayer.BL_MUTED_FROM_SIDEBAR = mute;
        }
    }

    return mute;
}

SoundPlayer.prototype.playSound = function (name, callbackFunction, callbackArguments)
{
    if (!callbackFunction) callbackFunction = null;
    if (!callbackArguments) callbackArguments = [];

    // only play sounds if mute is disabled, this
    if (SoundPlayer.BL_MUTE == false)
    {
        this.objAudioPlugin.play(name, callbackFunction, callbackArguments);
    }
    else
    {
        // if sounds muted.. callback immediately with arguments (if a callback function is specified)
        if (callbackFunction)
        {
            callbackFunction(callbackArguments);
        }
    }
}

SoundPlayer.prototype.stopSound = function (name, allowLooping)
{
    this.objAudioPlugin.stop(name, allowLooping);
}

SoundPlayer.prototype.setAudioPlugin = function (objAudioPlugin)
{
    this.objAudioPlugin = objAudioPlugin;
}

SoundPlayer.prototype.getAudioPlugin = function ()
{
    return this.objAudioPlugin;
}

SoundPlayer.prototype.setLoops = function (loops)
{

    this.objAudioPlugin.setLoops(loops);
}

/** STUB Method only - not supported by IOS!! **/
SoundPlayer.prototype.setFadeIn = function (fadeIn)
{

    this.objAudioPlugin.setFadeIn(fadeIn);
}

/** STUB Method only - not supported by IOS!! **/
SoundPlayer.prototype.setFadeOut = function (fadeOut)
{

    this.objAudioPlugin.setFadeOut(fadeOut);
}

/** STUB Method only - not supported by IOS!! **/
SoundPlayer.prototype.setVolume = function (volume)
{

    this.objAudioPlugin.volume(volume);
}





