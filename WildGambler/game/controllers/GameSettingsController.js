/**
 * @author Petr Urban
 *
 * This class handles Game Settings dialog
 */

/**
 * Constructor
 * @param { Object } objGuiView
 */
function GameSettingsController( objLocalisation, 
								 objGuiController, 
								 objMainConsoleController, 
								 objSpinController, 
								 objReelsController,
								 objIntroLockAndSpin)
{
    
    this.objLockSpinIntroPopupController = objIntroLockAndSpin;
	/**
	 * @type {Localisation} 
	 */
	this.objLocalisation = objLocalisation;
    /**
     * The view with the panel controller
     * @type {GuiController}
     */
    this.objGuiController = objGuiController;
    /**
     * @type {MainConsoleController} 
     */
    this.objMainConsoleController = objMainConsoleController;
    /**
     * @type {SpinController} 
     */
    this.objSpinController = objSpinController;
    /**
     * @type {ReelsController} 
     */
    this.objReelsController = objReelsController;
    
    
    /**
     *  @type {GameSettings}
     */
	this.objGameSettings = GameSettings.getInstance(); //get singleton instance of game settings object
	
	/**
	 * Mark if auto-lock wilds is enabled at the moment
	 * This value is changed during "show" method
	 * @type {boolean} 
	 */
	this.blAutolockWildEnabled = false;

	//external controller
    this.objExternalController = null;

	//find elements, buttons etc.
	this.objTextHeader = this.objGuiController.getElementByID("settingsHeader");
	this.objTextDisableAutolock = this.objGuiController.getElementByID("disableAutoLock");

	this.objButtonClose = this.objGuiController.getElementByID("close");
	this.objButtonWildsOn = this.objGuiController.getElementByID("toggleOn");
	this.objButtonWildsOff = this.objGuiController.getElementByID("toggleOff");
	
    // Bindings
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);

	this.onCloseClick = this.onCloseClick.bind(this);
	this.onAutolockToggleClick = this.onAutolockToggleClick.bind(this);
    
    //initialise
    this.init();
}

/**
 * Derive LockAndSpinIntroPopupController from our base type to provide inheritance
 */
Class.extend(Class, GameSettingsController);

GameSettingsController.prototype.init = function()
{
	//setup + initialisation
    this.visible = false;
    this.hide();
    
    //assign texts
    
    //header text
    this.objTextHeader.getViewObject().setText(this.objLocalisation.getText("settings_header"));

	//auto-lock wilds text
    var objTextViewDisableWilds = this.objTextDisableAutolock.getViewObject();
    objTextViewDisableWilds.setAlignment(TextBoxView.ALIGN_LEFT);
    objTextViewDisableWilds.setText(this.objLocalisation.getText("settings_disable_autolock_wilds"));

	//assign click handlers
	this.objButtonClose.addListener(ButtonController.STATE_CLICK, this.onCloseClick);
}

/**
 * Show GameSettingsController 
 */
GameSettingsController.prototype.show = function ()
{
    
    this.objLockSpinIntroPopupController.getElementByID("okay").viewObject.blVisible = false;
    
    // reversed logic due to bad wording of the descriptive
	var blSettingsValue = this.objGameSettings.getItem(GameSettings.DISABLE_AUTOLOCK_WILDS);
	this.setAutoLockWilds(blSettingsValue);

	this.intReelsStateOnShow = this.objReelsController.intState;
    this.objReelsController.intState = ReelsController.STOP;
    //console.log("GameSettingsController.show( SpinController.MODAL_DIALOG=" + SpinController.MODAL_DIALOG +") calling mainConsoleController.setButtonStates");
	this.objMainConsoleController.setButtonStates(SpinController.MODAL_DIALOG); //set the state for modal dialogs, this disables buttons and clicking wilds

    this.objGuiController.objGuiView.setVisible(true);
    this.objGuiController.visible = true;
    this.visible = true;
}

/**
 * Hide GameSettingsController
 */
GameSettingsController.prototype.hide = function ()
{
	if (!this.visible)
	{
		return;
	}
	
	
	this.objLockSpinIntroPopupController.getElementByID("okay").viewObject.blVisible = true;
    this.objGuiController.objGuiView.setVisible(false);
    this.objGuiController.visible = false;
    
    this.objReelsController.intState = this.intReelsStateOnShow;

	//console.log("GameSettingsController.hide(this.objSpinController.intSpinButtonState=" + this.objSpinController.intSpinButtonState + ") calling mainConsoleController.setButtonStates");
	
    this.objMainConsoleController.setButtonStates(this.objSpinController.intSpinButtonState); //set the state as it was

	this.visible = false;
}

/**
 * On dialog close 
 */
GameSettingsController.prototype.onCloseClick = function(objEvent)
{
    
    // remove listeners.. This is a temporary fix for a bug raised during QA.
    // TODO a nicer solution would involve storing the listeners in an array and removing them all in a loop on calling this function.
    
    //remove button click handlers
    if (!this.blAutolockWildEnabled)
    {
        this.objButtonWildsOn.removeListener(ButtonController.STATE_CLICK, this.onAutolockToggleClick);
    }
    else
    {
        this.objButtonWildsOff.removeListener(ButtonController.STATE_CLICK, this.onAutolockToggleClick);
    }
    
	objEvent.stopPropagation();
	this.hide();
}

/**
 * On auto-lock toggle button click 
 */
GameSettingsController.prototype.onAutolockToggleClick = function(objEvent, objButtonView, intX, intY)
{
	//turn to off
	objEvent.stopPropagation();
	this.setAutoLockWilds(!this.blAutolockWildEnabled);
}

/**
 * Method to set auto-lock wilds enabled / disabled
 * Saves into GameSettings object
 * 
 * @param {boolean} blEnabled 
 */
GameSettingsController.prototype.setAutoLockWilds = function(blEnabled)
{    
    WildsSelector.blWildsSelected = this.objReelsController.updateLockSpinButton();
    
	//remember current state
	this.blAutolockWildEnabled = blEnabled;

	//save the state to game settings
	this.saveGameSettings(this.blAutolockWildEnabled);

	//set buttons visible / invisible
	this.objButtonWildsOn.getViewObject().setVisible(!blEnabled);
	this.objButtonWildsOff.getViewObject().setVisible(blEnabled);
	
	//assign button click handlers
	if (!this.blAutolockWildEnabled)
	{
		this.objButtonWildsOn.addListener(ButtonController.STATE_CLICK, this.onAutolockToggleClick);
		this.objButtonWildsOff.removeListener(ButtonController.STATE_CLICK, this.onAutolockToggleClick);
	}
	else
	{
		this.objButtonWildsOn.removeListener(ButtonController.STATE_CLICK, this.onAutolockToggleClick);
		this.objButtonWildsOff.addListener(ButtonController.STATE_CLICK, this.onAutolockToggleClick);
	}
    this.objReelsController.objSelectionIcon.draw();
}

/**
 * Save game settings
 * 
 * @param {boolean} blAutoLockEnabled 
 */
GameSettingsController.prototype.saveGameSettings = function(blAutoLockEnabled)
{
	this.objGameSettings.setItem(GameSettings.DISABLE_AUTOLOCK_WILDS, blAutoLockEnabled);
}
