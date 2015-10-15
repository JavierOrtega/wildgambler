/**
 * @author Javier.Ortega
 * 
 * This class will contain the model functionality for the model
 */


/**
 * Constructor  
 */
function GuiModel()
{
    /**
     * The Json definition for the current Gui.
     * @type { Object }
     */
    this.objLayout;
    
    /**
     * The Json file with the list of resources to be loaded.
     * @type { Object }
     */
    this.objResources;
    
     /**
     * The list from where we will store all the different resources images, sounds, etc...
     * @type { Array }
     */
    this.arrResources;
}

/**
 * Derive GuiModel from our base type to provide inheritance
 */ 
Class.extend(Class, GuiModel);

/**
 * This returns an understandable array with the necessary resources files to display this screen.
 * @return {Array} List of resources to be loaded
 */
GuiModel.prototype.getResourcesToLoad = function ( )
{
    var arrNeededResources = new Array();
    
    if ( this.objResources )
    {
        for (var i in this.objResources.list)
        {
            arrNeededResources.push (this.objResources.list[i].url)
        }
    }
    return arrNeededResources;
}

/**
 * Returns a resource by the name
 * @return {String} strName The name of the resource to be returned
 */
GuiModel.prototype.getResourceByName = function (  strName )
{
    for (var i in this.arrResources)
    {
        if( i == strName)
        {
            return this.arrResources[strName];
        }
    }
}
