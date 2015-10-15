/**
 * Handles the show/hide and content of the lockspin stake warnings
 * Owned by the bet manager. 
 * 
 * Thresholds are 10x, 100x, 1000x and shows to the nearest (floored) 10x, 100x, 1000x
 * 
 * @param {Object} objDeviceModel
 * @param {Object} objGuiController
 */
function StakeWarningController( objDeviceModel, objConfig, 
								 //fnSetWildsSelectionEnabled,
								 objGuiController1, objGuiController2, objSoundController,objReelsController)
{
	this.objDeviceModel = objDeviceModel;
	this.objGuiViewIntro = objGuiController1.objGuiView;
	this.objGuiViewThreshold = objGuiController2.objGuiView;
	this.objSoundController = objSoundController;
	
	this.objReelsController = objReelsController;
	this.objGameSettings = GameSettings.getInstance(); //get singleton instance of game settings object
	
	/*
	 * ReelsController function we can use to switch wilds selection on and off.
	 * Call with false to disconnect wilds selection, true to re-enable.
	 */
	//this.fnSetWildsSelectionEnabled = fnSetWildsSelectionEnabled;
	
	this.strCurrencyCode = objConfig.strCurrencyCode;
	
	this.objGuiViewIntro.blVisible = false;
	this.objGuiViewThreshold.blVisible = false;
	
	this.btnIntroYes = objGuiController1.getElementByID("yes");
	this.btnIntroNo = objGuiController1.getElementByID("no");
    this.txtIntroCost = this.objGuiViewIntro.getTextView("betAmountWarning");
	this.btnIntroCheckbox = objGuiController1.getElementByID("checkbox");
	
	this.btnThresholdYes = objGuiController2.getElementByID("yes");
	this.btnThresholdNo = objGuiController2.getElementByID("no");
    this.txtThreshold = this.objGuiViewThreshold.getTextView("betOverAmount");

    this.showIntro = this.showIntro.bind(this);
	this.onIntroClicked = this.onIntroClicked.bind(this);
	this.onCheckboxClicked = this.onCheckboxClicked.bind(this);
	this.showThresholdWarning = this.showThresholdWarning.bind(this);
	this.onThresholdClicked = this.onThresholdClicked.bind(this);
    
    this.fnIntroCallback;
}
Class.extend(Class,StakeWarningController)

/**
 * TODO CurrencyCode 
 * @param {Object} flTotalCost
 * @param {Object} fnCallback
 */
StakeWarningController.prototype.showIntro = function( flTotalCost, fnCallback )
{
    
    this.objReelsController.intState = ReelsController.STOP;
	//this.fnSetWildsSelectionEnabled(false);
	
	this.fnIntroCallback = fnCallback;
    //this.txtIntroCost.setText(this.strCurrencyCode + " " + flTotalCost.toFixed(2))
    this.txtIntroCost.setText(Localisation.formatNumber(flTotalCost));
	this.objGuiViewIntro.blVisible = true;
	this.objGuiViewIntro.setDirty(true);
    this.btnIntroYes.addListener(ButtonController.STATE_CLICK, this.onIntroClicked);
    this.btnIntroNo.addListener(ButtonController.STATE_CLICK, this.onIntroClicked);

	//handle checkbox
    this.btnIntroCheckbox.addListener(ButtonController.STATE_CLICK, this.onCheckboxClicked);

	// Set Checkbox from Settings panel 
    var blLockAndSpinValue = this.objGameSettings.getItem(GameSettings.DISABLE_AUTOLOCK_WILDS); //load from game settings
    this.btnIntroCheckbox.setChecked(!blLockAndSpinValue); // This parameter is inverted because the description of the button "Disable Auto-Lock Wilds" was unclear
}


/**
 * 
 */
StakeWarningController.prototype.onCheckboxClicked = function(objEvent, objButton, intX, intY)
{
	//get current checked value
	var blIsChecked = this.btnIntroCheckbox.isChecked();
    //console.log("Checkbox clicked", blIsChecked)
	this.objGameSettings.setItem(GameSettings.DISABLE_AUTOLOCK_WILDS, !blIsChecked); //save to game settings

    // play click sound ??
    this.objSoundController.playButtonClickSound();
}

/**
 * 
 */
StakeWarningController.prototype.onIntroClicked = function(objEvent, objButton, intX, intY)
{
	objEvent.stopPropagation();

    this.btnIntroYes.removeListener(ButtonController.STATE_CLICK, this.onIntroClicked);
    this.btnIntroNo.removeListener(ButtonController.STATE_CLICK, this.onIntroClicked);
    this.btnIntroCheckbox.removeListener(ButtonController.STATE_CLICK, this.onCheckboxClicked);

	this.objGuiViewIntro.blVisible = false;
	this.objGuiViewIntro.setDirty(true);

	//this.fnSetWildsSelectionEnabled(true);

	if(objButton.strIdButton == "yes")
	{
		this.fnIntroCallback(true);
	}
	else
	{
		this.fnIntroCallback(false);
	}
}

/**
 * Show how far bet is over threshold to nearest 10, 100 or 1000
 * @param {Object} flTotCost
 * @param {Object} flTotLineStake
 * @param {Object} intThreshold
 * @param {Object} fnCallback
 */
StakeWarningController.prototype.showThresholdWarning = function( flTotCost,
																  flTotLineStake,
																  intThreshold,
																  fnCallback )
{
    this.objReelsController.intState = ReelsController.STOP;
	//this.fnSetWildsSelectionEnabled(false);

	this.fnIntroCallback = fnCallback;

    this.btnThresholdYes.addListener(ButtonController.STATE_CLICK, this.onThresholdClicked);
    this.btnThresholdNo.addListener(ButtonController.STATE_CLICK, this.onThresholdClicked);
    
    var multiple = Math.floor(Math.floor((flTotCost*100) / (flTotLineStake*100))/intThreshold)*intThreshold;
	
	this.txtThreshold.setText("" + multiple + "x");
	    
   	this.objGuiViewThreshold.blVisible = true;
	this.objGuiViewThreshold.setDirty(true);

}

/**
 * 
 * @param {Object} objButton
 */
StakeWarningController.prototype.onThresholdClicked = function(objEvent, objButton, intX, intY)
{
	objEvent.stopPropagation();

    this.btnThresholdYes.removeListener(ButtonController.STATE_CLICK, this.onThresholdClicked);
    this.btnThresholdNo.removeListener(ButtonController.STATE_CLICK, this.onThresholdClicked);
    
   	this.objGuiViewThreshold.blVisible = false;
	this.objGuiViewThreshold.setDirty(true);

	//this.fnSetWildsSelectionEnabled(true);

	if(objButton.strIdButton == "yes")
	{
		this.fnIntroCallback(true);
	}
	else
	{
		this.fnIntroCallback(false);
	}
}

