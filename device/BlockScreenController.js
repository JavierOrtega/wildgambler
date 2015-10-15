
/**
 * 
 * @author Javier Ortega 
 *
 * This class will detect what specific Screen Logic to apply for one device or other
 * 
 * @class
 */
function BlockScreenController()
{
    
    //To add a class here to be checked
    this.arrClasseDevicesToCheck = [IphoneSafari7ScreenLogic];
    
    //Collection of screen device objects
    this.arrDevices = [];
         
}

Class.extend( Class, BlockScreenController );


/**
 * This function checks if the application is running in iOS7
 */
BlockScreenController.prototype.init = function ()
{
    //Check all the posibles screen modifiers
    for (var intIndex in this.arrClasseDevicesToCheck)
    {
        this.arrDevices[intIndex] = new this.arrClasseDevicesToCheck[intIndex];
        this.arrDevices[intIndex].check();
    }
}
