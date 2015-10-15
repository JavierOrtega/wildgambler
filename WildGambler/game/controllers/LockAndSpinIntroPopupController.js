/**
 * @author Tim.Gudgion, Petr Urban
 *
 * This class handles the Initial pop up message
 */


/**
 * This file appears to be utterly redundant.
 * None of the comments are even close to being relevant.
 * None of its methods are called.
 * It is loaded, instantiated, and ignored. What a waste of resources!
 */


/**
 * Constructor
 * @param { Object } objGuiView The view.
 */
function LockAndSpinIntroPopupController(objGuiController, objReelsController)
{
    /*
     * The view with the panel controller
     */
    this.objGuiController = objGuiController;
    this.objReelsController = objReelsController;

	//elements
    this.btnOk = this.objGuiController.getElementByID("okay");
    this.objPanel = this.objGuiController.getElementByID("welcome");

    this.objExternalController = null;

    // Bindings
    this.setCallbackOnOK = this.setCallbackOnOK.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);

	//setup + initialisation
    this.objGuiController.objGuiView.blVisible = false;
    this.visible = false;

}

/**
 * Derive LockAndSpinIntroPopupController from our base type to provide inheritance
 */
Class.extend(Class, LockAndSpinIntroPopupController);


LockAndSpinIntroPopupController.prototype.setCallbackOnOK = function (func)
{
    this.callbackOnOK = func;
}

/**
 * 
 */
LockAndSpinIntroPopupController.prototype.show = function ()
{
    this.objGuiController.objGuiView.blVisible = true;    
    this.objGuiController.objGuiView.setDirty(true);
    this.objGuiController.visible = true;
}

/**
 * 
 */
LockAndSpinIntroPopupController.prototype.hide = function ()
{
    this.objGuiController.objGuiView.blVisible = false;
    this.objGuiController.visible = false;
}
