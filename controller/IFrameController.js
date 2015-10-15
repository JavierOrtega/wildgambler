/**
 * @author Javier.Ortega
 *
 * Also POSTs to the container iframe which contains the game. This is received
 * by the FRAMEWORK's IFrameMessengerModel which is listening for window.post "message" events.
 */

/**
 * Constructor
 * @param { Object } objDeviceModel 
 * @param { Object } objBottomBar 
 */
function IFrameController(objDeviceModel, objBottomBar)
{
    this.objIFrame = document.getElementById('container');    
    
    this.objIFrameDiv = document.getElementById('containerArea');    

    IFrameController.objIFrame = this.objIFrame;

    /**
     * A reference to the controller for the Bottombar
     */
    this.objBottomBar = objBottomBar;

    this.create(objDeviceModel, null);
}

/**
 * 
 */ 
IFrameController.WIDTH = 1024;
IFrameController.HEIGHT = 768;

/**
 * Derive IFrameController from our base type to provide inheritance
 */
Class.extend(ScreenLogicController, IFrameController);

/**
 * This function will POST a message to the iframe container for the GAME
 * @param {String} strType The type/header of the message
 * @param {String} strMessage The message
 */
IFrameController.sendMessageToIframe = function(strType, strMessage)
{
    var obj = new Object();

    obj.type = strType;
    obj.message = strMessage;

    var strJSON = JSON.stringify(obj);
    if (IFrameController.appUrl)
    {
	    IFrameController.objIFrame.contentWindow.postMessage(strJSON, IFrameController.appUrl);
    }
}

/**
 * To resize the reels canvas, when it is needed
 *
 */
IFrameController.prototype.resize = function(flZoomRatio, intBottomBarHeightPx)
{   
    if ( window.innerWidth > window.innerHeight )
    {
        this.objIFrame.style.width = window.innerWidth + "px";
        this.objIFrame.style.height = (window.innerHeight - intBottomBarHeightPx) + "px";
        
        this.objIFrame.style.top = "0px";
        this.objIFrame.style.left = "0px";
        this.objIFrame.style.marginTop = "0px";
        this.objIFrame.style.marginLeft = "0px";
    
        IFrameController.WIDTH = window.innerWidth ;
        IFrameController.HEIGHT = (window.innerHeight - intBottomBarHeightPx);
    
        IFrameController.blResized = true;
    
        if (IFrameController.appUrl && this.objIFrame.src != IFrameController.appUrl)
        {
            /*
             * Also called from MenuController.prototype.resourcesLoaded.
             * WHAT IF it already exists?
             * Voodoo
             */
            DomBuilder.createLoaderScreen();
            this.objIFrame.src = IFrameController.appUrl;
        }   
    }   
}
