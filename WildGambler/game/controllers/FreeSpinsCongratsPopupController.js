/**
 * @author Javier.Ortega
 *
 * This class handles the WinPanel
 */

/**
 * Constructor
 * @param { Object } objGuiView The view.
 */
function FreeSpinsCongratsPopupController(objGuiController, objSoundController)
{
    /*
     * The view with the panel controller
     */
    this.objGuiView = objGuiController.objGuiView;
    this.btnOk = objGuiController.getElementByID("start");
    this.fsPanel = objGuiController.getElementByID("popup_freespins_message.png");

    // Bindings
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.setVisible = this.setVisible.bind(this); 
	
	//
	this.fnCallbackOnOK;
	this.onOK = this.onOK.bind(this);

	//
	this.objGuiView.blVisible = false;

	this.objSoundController = objSoundController;
}
Class.extend(Class, FreeSpinsCongratsPopupController);

/**
 * Show the panel
 * @param the callback to trigger on OK 
 */
FreeSpinsCongratsPopupController.prototype.show = function ( fnCallbackOnOK )
{
	this.fnCallbackOnOK = fnCallbackOnOK;
    this.btnOk.addListener(ButtonController.STATE_CLICK, this.onOK);
    this.objGuiView.blVisible = true;
    this.objGuiView.setDirty(true);
    

    // play free spins intro loop on load
    this.objSoundController.playFreeSpinsIntroLoop();
}

/**
 *
 * Set the screen to visible
 *  
 */
FreeSpinsCongratsPopupController.prototype.setVisible = function()
{
    this.objGuiView.blVisible = true;
    this.objGuiView.setDirty(true);
}

/**
 * OK Clicked to clear dialog and start freespins 
 */
FreeSpinsCongratsPopupController.prototype.onOK = function(objEvent, objButton, intX, intY)
{
	//stop event propagation
	objEvent.stopPropagation();
	
    this.objGuiView.blVisible = false;
    this.fnCallbackOnOK();
    
    this.btnOk.removeListener(ButtonController.STATE_CLICK, this.onOK);

    // play free spins start sound (leading into main free spins loop)
    this.objSoundController.playFreeSpinsStartButtonSound();
    
}

/**
 * Hide the panel
 */
FreeSpinsCongratsPopupController.prototype.hide = function ()
{
    this.objGuiController.objGuiView.blVisible = false;
    
}

