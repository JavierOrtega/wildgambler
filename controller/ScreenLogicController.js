/**
 * @author Javier.Ortega
 * 
 * This class will provide a base for the specific functionalitie to handle the screen
 * 
 */


/**
 * Constructor
 * @param {Object} objDeviceModel Reference to the device model
 * @param {Object} objGuiController Reference to the GuiController 
 * 
 */
function ScreenLogicController( objDeviceModel, objGuiController )
{  
    this.create (objDeviceModel, objGuiController); 
}

/**
 * Derive ScreenLogicController from our base type to provide inheritance
 */
Class.extend(Class, ScreenLogicController);

/**
 * To create an object
 *
 */
ScreenLogicController.prototype.create = function(objDeviceModel, objGuiController)
{
    // --
    //Binding the necessary methods 
    this.resize = this.resize.bind(this);
    
    this.objDeviceModel = objDeviceModel;
    
    this.objGuiController = objGuiController;
    
    this.intrelation;
 
    //this.resize ();   
}

/**
 * To handle an error
 * @param {String} strMessage The string for the error message
 */
ScreenLogicController.prototype.load = function()
{
    
}

/**
 * To handle an error
 * @param {String} strMessage The string for the error message
 */
ScreenLogicController.prototype.resize = function()
{
    
}
