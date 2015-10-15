

/**
 * Object to handle the response to clicking the lockspin button
 * while autoplays are active.
 */
function AutoplayWarningController(objGuiController, objSoundController)
{
	this.objGuiView = objGuiController.getGuiView();
	this.objSoundController = objSoundController;
	
	this.objGuiView.setVisible(false); 
	
	this.btnYes	= objGuiController.getElementByID("yes");
	this.btnNo	= objGuiController.getElementByID("no");
	
    this.fnCallback;
	
	this.show = this.show.bind(this);
	this.onClick = this.onClick.bind(this);
}
Class.extend(Class, AutoplayWarningController);

/**
 * 
 */
AutoplayWarningController.prototype.show = function(fnCallback)
{
	this.fnCallback = fnCallback;
	this.btnYes.addListener(ButtonController.STATE_CLICK, this.onClick);
	this.btnNo.addListener(ButtonController.STATE_CLICK, this.onClick);
	this.objGuiView.setDirty( true );
	this.objGuiView.blVisible = true;
}

/**
 * 
 */
AutoplayWarningController.prototype.onClick = function(objEvent, objButton, intX, intY)
{
	objEvent.stopPropagation();
	
    // play click sound
    this.objSoundController.playButtonClickSound();
	
	//
    this.btnYes.removeListener(ButtonController.STATE_CLICK, this.onClick);
    this.btnNo.removeListener(ButtonController.STATE_CLICK, this.onClick);
	
	//
	this.objGuiView.setVisible(false);

	//
	if(objButton.strIdButton == "yes")
	{
		this.fnCallback(true);
	}
	else
	{
		this.fnCallback(false);
	}
}
