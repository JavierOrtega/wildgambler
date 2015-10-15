/**
 * @author Javier.Ortega
 * 
 * This class will handle the specific functionalities for the Loading Screen View
 * Scaling up or down and centering the reels for all the different devices
 */


/**
 * Constructor
 * @param { Object } objGuiController The height of the bottom bar
 */
function LoadingViewController( objDeviceModel, objGuiController)
{
    /**
     * This is the div container for the canvas
     * @type {Object}
     */
    this.objDivContainer = document.getElementById('loadingArea');
    
    /**
     * This canvas reference
     * @type {Object}
     */    
    this.objCanvas = document.getElementById('loading');
    
    /**
     * A refernce to the Gui controller for the reels
     * @type {Object}
     */
    this.objGuiController =  objGuiController;
    
    this.create(objDeviceModel, objGuiController );

    //this.resize ( );
}

/**
 * Derive LoadingViewController from our base type to provide inheritance
 */ 
Class.extend(ScreenLogicController, LoadingViewController);
    
/**
 * Height for this canvas
 * @type { integer }  
 */
LoadingViewController.INT_HEIGHT = 520;

/**
 * Height for this canvas
 * @type { integer }  
 */
LoadingViewController.INT_OFFSET_HEIGHT = 0;

/**
 * Width for this canvas
 * @type { integer }  
 */
LoadingViewController.INT_WIDTH = 1024;

/**
 * To resize the reels canvas, when it is needed
 * 
 */
LoadingViewController.prototype.resize = function()
{
        
    var intWidth = StateFactory.WIDTH_CONTAINER;
    var intHeight = StateFactory.HEIGHT_CONTAINER;
    
    
   // The original relation width / height for the original design
    var widthToHeight = intWidth / intHeight;

    
    var newWidthToHeight = newWidth / newHeight;
    
    // To detect what dimension we should use to fill the maximum screen area possible
    if (newWidthToHeight > widthToHeight)
    {
        this.intrelation = newHeight / intHeight;
    }
    else
    { // window height is too high relative to desired game height
        this.intrelation = newWidth / intWidth;
    }

    //We apply the correct relation depending of the platform
    var intCanvasWidth = intWidth / this.intrelation;
    var intCanvasHeight = intHeight / this.intrelation;
    
    this.objDivContainer.style.marginTop = (1) + 'px';
    this.objDivContainer.style.marginLeft = (0)  + 'px';
    
    if ( this.objDeviceModel.platform == OS.IOS || this.objDeviceModel.platform == OS.WINDOWS )
    {
	    intCanvasWidth = intWidth;
	    intCanvasHeight = intHeight;
        
        this.objDivContainer.style.marginTop = (0) + 'px';
        this.objDivContainer.style.marginLeft = (0)  + 'px';
        
        this.objCanvas.style.width = (intWidth *this.intrelation)+ 'px';
        this.objCanvas.style.height = (intHeight * this.intrelation) + 'px';
    }
    else
    {
        if(this.objDivContainer.style.webkitTransform != undefined)
        {
            this.objDivContainer.style.webkitTransform = "scale(" + this.intrelation +  "," + this.intrelation + ")";            
        }
        else if(this.objDivContainer.style.MozTransform != undefined)
        {
            this.objDivContainer.style.MozTransform = "scale(" + this.intrelation +  "," + this.intrelation + ")";
        }
        else if(this.objDivContainer.style.OTransform != undefined)
        {
            this.objDivContainer.style.OTransform = "scale(" + this.intrelation +  "," + this.intrelation + ")";
        }
    }
    
    if (this.objCanvas.width != intCanvasWidth)
    {
        this.objCanvas.width = intCanvasWidth;
    }
    
    if (this.objCanvas.height != intCanvasHeight)
    {
        this.objCanvas.height = intCanvasHeight;
    }
  
    this.objGuiController.objGuiView.setDirty (true);

	window.scrollTo(0, 1);
}
