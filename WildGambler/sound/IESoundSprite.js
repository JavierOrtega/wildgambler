/**
 * Class stub for a Sound Manager
 */

function IESoundSprite()
{

    this.objAudioList = null;
    this.objAudioObject = null;
    this.objAudioPlayTimer = null;
    this.blLoops = false;
    this.intFadeIn = 0;
    this.intFadeOut = 0;
    this.flVolume = 1;
    this.intSoundIndexFromName = 0;

    this.setJson = this.setJson.bind(this);
    this.setAudioObject = this.setAudioObject.bind(this);
    this.getAudioObject = this.getAudioObject.bind(this);
    this.setLoops = this.setLoops.bind(this);
    this.play = this.play.bind(this);
    this.onPlaySoundIndex = this.onPlaySoundIndex.bind(this);
    this.onStopSoundIndex = this.onStopSoundIndex.bind(this);
    this.setFadeIn = this.setFadeIn.bind(this);
    this.setFadeOut = this.setFadeOut.bind(this);
    this.setVolume = this.setVolume.bind(this);
    this.setPreloadCompleteCallback = this.setPreloadCompleteCallback.bind(this);
    this.preloadAudio = this.preloadAudio.bind(this);
    this.preloadCallback;
}

Class.extend(Class, IESoundSprite);

IESoundSprite.prototype.setPreloadCompleteCallback = function (preloadCallback)
{
    this.preloadCallback = preloadCallback;
}

IESoundSprite.prototype.preloadAudio = function ()
{
    this.preloadCallback();
}

IESoundSprite.prototype.setJson = function (objAudioList)
{
    this.objAudioList = objAudioList;
}

IESoundSprite.prototype.setAudioObject = function (objAudioObject)
{
    this.objAudioObject = objAudioObject;
}

IESoundSprite.prototype.getAudioObject = function ()
{
    return this.objAudioObject;
}

IESoundSprite.prototype.setLoops = function (blLoops)
{
    this.blLoops = blLoops;
}

/** STUB Methods only - not supported by IOS!! **/
IESoundSprite.prototype.setFadeIn = function (intFadeIn)
{
    this.intFadeIn = intFadeIn;
}

/** STUB Methods only - not supported by IOS!! **/
IESoundSprite.prototype.setFadeOut = function (intFadeOut)
{
    this.intFadeOut = intFadeOut;
}

/** STUB Methods only - not supported by IOS!! **/
IESoundSprite.prototype.setVolume = function (flVolume)
{
    this.flVolume = flVolume;
}

IESoundSprite.prototype.play = function (name)
{
    this.stop();

    for (var x = 0; x < this.objAudioList.sounds.length; x++)
    {
        if (String(this.objAudioList.sounds[x].name) == String(name))
        {
            this.intSoundIndexFromName = x;
            break;
        }
    }

    this.objAudioPlayTimer = setInterval(this.onPlaySoundIndex, 50);
}

IESoundSprite.prototype.stop = function (name)
{
    if (this.objAudioObject)
    {
        try
        {
            this.objAudioObject.currentTime = 0;
            this.objAudioObject.pause();
        } catch (exception)
        {
            // catch exceptions
        }
    }
}

IESoundSprite.prototype.onPlaySoundIndex = function ()
{
    if (this.objAudioObject)
    {

        if (this.objAudioObject.currentTime == 0)
        {

            // instruct audio to play if currentTime is zero     
            this.objAudioObject.play();

        }
        else
        {

            // if currentTime is less than start index, attempt to set it
            var flStartTime = Number(this.objAudioList.sounds[this.intSoundIndexFromName].start);

            if (Number(this.objAudioObject.currentTime) < flStartTime)
            {

                // fail safe for windows mobile
                try
                {
                    this.objAudioObject.currentTime = String(flStartTime);
                } catch (err) 
                { 
				}

                // play audio at current time!
                this.objAudioObject.play();

            }
            else
            {
            
                // replace "onPlaySoundIndex" interval with "onStopSoundIndex" interval
               this.objAudioObject.play();
               clearInterval(this.objAudioPlayTimer);
               var stopSoundInterval = 10;
               if (this.blLoops) stopSoundInterval = 1;
               this.objAudioPlayTimer = setInterval(this.onStopSoundIndex, stopSoundInterval);
            }
        }
    }
}

IESoundSprite.prototype.onStopSoundIndex = function ()
{
    if (this.objAudioObject)
    {

        if (Number(this.objAudioObject.currentTime) >=
        Number(String(this.objAudioList.sounds[this.intSoundIndexFromName].end))) {

            // if blLoops = true, restart the sound
            if (this.blLoops)
            {
                var flStartTime = Number(this.objAudioList.sounds[this.intSoundIndexFromName].start);
                this.objAudioObject.currentTime = String(flStartTime);
                this.objAudioPlayTimer = setInterval(this.onPlaySoundIndex, 50);
                
            // otherwise just kill it!
            } 
            else 
            {

                this.stop();
            }
        }
    }
}
