/**
 * @author Tim.Gudgion
 * 
 * This class controls the game specific sound requests & logic
 */

/**
 * Constructor
 * @param {Object} objSoundPlayer Reference to the Sound Player
 */
function SoundController(objSoundPlayer)
{
    this.objSoundPlayer = objSoundPlayer;

    // bound public methods
    this.playSpinSound = this.playSpinSound.bind(this);
    this.stopSound = this.stopSound.bind(this);
    this.playButtonClickSound = this.playButtonClickSound.bind(this);
    this.playLineBetPlusSound = this.playLineBetPlusSound.bind(this);
    this.playLineBetMinusSound = this.playLineBetMinusSound.bind(this);
    this.playWildSelectedSound = this.playWildSelectedSound.bind(this);
    this.playLionRoarCageBreakSound = this.playLionRoarCageBreakSound.bind(this);
    this.playCageLockSound = this.playCageLockSound.bind(this);
    this.playWinSound = this.playWinSound.bind(this);
    this.playTENJQWinSound = this.playTENJQWinSound.bind(this);
    this.playKAWinSound = this.playKAWinSound.bind(this);
    this.playLionWinSound = this.playLionWinSound.bind(this);
    this.playRhinoWinSound = this.playRhinoWinSound.bind(this);
    this.playZebraWinSound = this.playZebraWinSound.bind(this);
    this.playBigWinSound = this.playBigWinSound.bind(this);
    this.playLionRoarSound = this.playLionRoarSound.bind(this);
    this.playFreeSpinsStartButtonSound = this.playFreeSpinsStartButtonSound.bind(this);
    this.playFreeSpinsIntroLoop = this.playFreeSpinsIntroLoop.bind(this);
    this.playFreeSpinsMainLoop = this.playFreeSpinsMainLoop.bind(this);
    this.playFreeSpinsSummarySound = this.playFreeSpinsSummarySound.bind(this);
    this.playMeerkatPopupSound = this.playMeerkatPopupSound.bind(this);
    this.playMeerkatCheerSound = this.playMeerkatCheerSound.bind(this);
    this.playWinCountupSound = this.playWinCountupSound.bind(this);
    this.killTotalWinCountupSound = this.killTotalWinCountupSound.bind(this);
    this.calcAggression = this.calcAggression.bind(this);
    this.playLockSpinSound = this.playLockSpinSound.bind(this);
    this.startFSMainloopAfterDelay = this.startFSMainloopAfterDelay.bind(this);
    this.killSoundOnError = this.killSoundOnError.bind(this);
    this.killSoundAfterDelay = this.killSoundAfterDelay.bind(this);

    // a reference to the wild array selected when lock spin is clicked
    this.lockSpinArrWilds = [];

    // reference for freespin controller (to retrigger spin loop as required)
    this.objFreeSpinController;

    // reference for freespin controller (to retrigger spin loop as required)
    this.objBigWinController;

    // reference for main spin controller (to calculate lion roar agression value from lockstake)
    this.objMainConsoleController;

    // calculation methods
    this.getWildCountFromArray = this.getWildCountFromArray.bind(this);

    // cage break  / lion roar sound flag, used by WildsViews.as
    this.playingLionRoarCageBreakSound = false;

    // free summary sound active flag
    this.freeSpinSummarySoundActive = false;

    // timer id for triggering sounds after pause (to allow IOS playhead to catchup when FS loop)
    this.intTimerId = null;

    // timer id for error handling (to kill sounds after a delay);
    this.errorTimerId = null;
}

SoundController.prototype.playSpinSound = function (arrWilds)
{
    // calculate which spin sound to play
    var wildCount = Number(this.getWildCountFromArray(arrWilds));
    var spinSoundToPlay = 0;
    if (wildCount < 4) spinSoundToPlay = 1;
    else if (wildCount < 9) spinSoundToPlay = 2;
    else spinSoundToPlay = 3;

    // play the spin sound
    this.objSoundPlayer.playSound("spin loop " + String(spinSoundToPlay));

    // reset cage break sound
    this.playingLionRoarCageBreakSound = false;

    // reset lock spin wilds array 
    this.lockSpinArrWilds = [];
}
SoundController.prototype.playButtonClickSound = function ()
{
    this.objSoundPlayer.playSound("button press");
}

SoundController.prototype.playLineBetPlusSound = function ()
{
    this.objSoundPlayer.playSound("line stake up");
}

SoundController.prototype.playLineBetMinusSound = function ()
{
    this.objSoundPlayer.playSound("line stake down");
}

SoundController.prototype.playWildSelectedSound = function ()
{
    this.objSoundPlayer.playSound("lion roar 1");
}

SoundController.prototype.stopSound = function (allowLooping)
{
    this.objSoundPlayer.stopSound("", allowLooping);
}

SoundController.prototype.killTotalWinCountupSound = function ()
{
    if (this.objFreeSpinController.intState == FreeSpinController.IDLE)
    {
        this.stopSound("");
    }
}

/** Determines the number of locked wilds, used to modify the cage lock / lion roar sounds **/

SoundController.prototype.getWildCountFromArray = function(arrWilds)
{
    var intWildsSelected = 0;

    for (var intX in arrWilds)
    {
        for (var intY in arrWilds[intX])
        {
            if (arrWilds[intX][intY] == true)
            {
                intWildsSelected++;
            }
        }
    }

    return intWildsSelected;
}


SoundController.prototype.playCageLockSound = function (arrWilds)
{
    if (this.objFreeSpinController.intState == FreeSpinController.IDLE)
    {

        // count the wildsSelected
        var intWildsSelected = this.getWildCountFromArray(arrWilds);

        // if any wilds are locked play the cage sound, then the spin sound
        if (intWildsSelected > 0)
        {
            this.lockSpinArrWilds = arrWilds;
            this.objSoundPlayer.playSound("cage lock", this.playLockSpinSound);
        } else
        {
            // otherwise just play the spin sound
            this.playSpinSound(0);
        }
    }
}

SoundController.prototype.playLockSpinSound = function ()
{
    this.playSpinSound(this.lockSpinArrWilds);
}

SoundController.prototype.playLionRoarCageBreakSound= function ()
{
    if (this.objFreeSpinController.intState == FreeSpinController.IDLE)
    {
        this.playingLionRoarCageBreakSound = true;
        this.playLionRoarSound();
    }

}

/** method used to calculate which lion roar sound to play based on lockstake value **/
SoundController.prototype.calcAggression = function ()
{
    var spinStake = Number(this.objMainConsoleController.objBetController.getSpinStake());
    var lockStake = Number(this.objMainConsoleController.objBetController.getLockSpinStake());

    var agression = 0;

    if (lockStake < spinStake * 5) agression=1;
    else if (lockStake < spinStake * 10) agression=2;
    else if (lockStake < spinStake * 20) agression = 3;
    else if (lockStake < spinStake * 50) agression = 4;
    else agression=5;

    //console.log("calcAggression: spinStake: " + spinStake + " lockStake: " + lockStake + " agression: " + agression);

    return agression;
}                                              

SoundController.prototype.playLionRoarSound = function (arrWilds)
{
    this.objSoundPlayer.playSound("lion roar " + String(this.calcAggression()));
}

SoundController.prototype.playWinSound = function (intId, callbackFunction)
{
    if (this.objFreeSpinController.intState == FreeSpinController.IDLE)
    {
        if ((intId >= 0) && (intId <= 2))
        {
            this.playTENJQWinSound(callbackFunction);
        }
        else if ((intId >= 3) && (intId <= 4))
        {
            this.playKAWinSound(callbackFunction);
        }
        else if (intId == 5)
        {
            this.playFlamingoWinSound(callbackFunction);
        }
        else if (intId == 6)
        {
            this.playZebraWinSound(callbackFunction);
        }
        else if (intId == 7)
        {
            this.playCheetaWinSound(callbackFunction);
        }
        else if (intId == 8)
        {
            this.playRhinoWinSound(callbackFunction);
        }
        else
        {
            this.playLionWinSound(callbackFunction);
        }
    }
}

SoundController.prototype.playTENJQWinSound = function (callbackFunction)
{
    this.objSoundPlayer.playSound("10 / J / Q", callbackFunction);
}

SoundController.prototype.playCheetaWinSound = function (callbackFunction)
{
    this.objSoundPlayer.playSound("cheetah", callbackFunction);
}

SoundController.prototype.playFlamingoWinSound = function (callbackFunction)
{
    this.objSoundPlayer.playSound("Flamingo", callbackFunction);
}

SoundController.prototype.playKAWinSound = function (callbackFunction)
{
    this.objSoundPlayer.playSound("K / A", callbackFunction);
}

SoundController.prototype.playRhinoWinSound = function (callbackFunction)
{
    this.objSoundPlayer.playSound("rhino", callbackFunction);
}

SoundController.prototype.playZebraWinSound = function (callbackFunction)
{
    this.objSoundPlayer.playSound("Zebra", callbackFunction);
}

SoundController.prototype.playLionWinSound = function (callbackFunction)
{
    this.objSoundPlayer.playSound("lion win", callbackFunction);
}

SoundController.prototype.playFreeSpinsStartButtonSound = function ()
{
    //this.objSoundPlayer.playSound("fs start press", this.playFreeSpinsMainLoop);

    // removed free spin start button sound at the request of Vinnay, now skips straight to the main fs loop.
    //this.playFreeSpinsMainLoop();

    this.startFSMainloopAfterDelay();
}

SoundController.prototype.playFreeSpinsMainLoop = function ()
{
    this.stopSound();
    this.intTimerId = TimerManager.getInstance().start(this.startFSMainloopAfterDelay, 100);
}

SoundController.prototype.startFSMainloopAfterDelay = function ()
{
    TimerManager.getInstance().stop(this.intTimerId);
    this.intTimerId = null;
    this.objSoundPlayer.playSound("fs loop");
}

SoundController.prototype.playFreeSpinsIntroLoop= function ()
{
    //console.log("SoundController: playFreeSpinsIntroLoop");
    this.objSoundPlayer.playSound("fs intro loop");
}

SoundController.prototype.playFreeSpinsSummarySound = function ()
{
    //console.log("SoundController: playFreeSpinsSummarySound");
    this.freeSpinSummarySoundActive = true;
    this.objSoundPlayer.playSound("fs summary");
}

SoundController.prototype.playMeerkatPopupSound = function (intReelId, callbackFunction, callbackArguments)
{
    this.objSoundPlayer.playSound("meerkat appear" + String(intReelId + 1), callbackFunction, callbackArguments);
}

SoundController.prototype.playMeerkatCheerSound = function (callbackFunction, callbackArguments)
{
    this.objSoundPlayer.playSound("meerkat cheer", callbackFunction, callbackArguments);
}

SoundController.prototype.playBigWinSound = function ()
{
    if (this.objFreeSpinController.intState == FreeSpinController.IDLE)
    {
        this.objSoundPlayer.playSound("Big Win Bell", this.playWinPanelCountupSound);
    }
}

SoundController.prototype.playWinCountupSound = function ()
{
    // only play win countup sound if countup is active!
    if (this.objFreeSpinController.intState == FreeSpinController.IDLE)
    {
        if (this.objBigWinController.intState != BigWinController.ACTIVE)
        {
            this.objSoundPlayer.playSound("total win count");
        }
    }
}

SoundController.prototype.killSoundOnError = function ()
{
    this.stopSound();
    this.errorTimerId = setInterval(this.killSoundAfterDelay, 100);
}

SoundController.prototype.killSoundAfterDelay = function ()
{
    clearInterval(this.errorTimerId);
    this.errorTimerId = null;
    this.stopSound();
}
