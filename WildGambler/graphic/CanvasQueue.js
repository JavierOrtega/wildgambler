/**
 * @author Javier.Ortega
 *
 * This is a wrapper for the canvas controller
 */

/**
 * Constructor
 */
function CanvasQueue(objDeviceModel)
{

    /**
     * This object represents de data of the Device
     * @type { Object }
     */
    this.objDeviceModel = objDeviceModel;

    /**
     * Collection of canvases conbtrollers
     * @type { Array }
     */
    this.arrCanvasControllers = [];

    /**
     * An array holding the visibility state of each canvas.
     * Populated when hideAll() is called and accessed to restore canvas's to the previous display state.
     * @type { Array }
     */
    this.arrCanvasVisibilityStates = [];

    this.refresh = this.refresh.bind(this);
    this.draw = this.draw.bind(this);
    
    
   var objMainLoop = MainLoop.getInstance();
   objMainLoop.addItem(this.draw);
   objMainLoop.start();
}

/**
 * Derive CanvasController from our base type to provide inheritance
 */
Class.extend(Class, CanvasQueue);


//singleton
CanvasQueue.objInstance = null;

/**
 * @return {CanvasQueue}
 */
CanvasQueue.getInstance = function(objDeviceModel )
{
    if (CanvasQueue.objInstance == null)
    {
        CanvasQueue.objInstance = new CanvasQueue(objDeviceModel);
    }
    return CanvasQueue.objInstance;
}

/**
 * To remove a view
 *
 * @param { Object } objView View to be removed
 */
CanvasQueue.prototype.removeView = function(objView)
{

    for (var i in this.arrCanvasControllers)
    {
        this.arrCanvasControllers[i].removeView(objView);
    }
}
/**
 * To init this class
 */
CanvasQueue.prototype.addView = function(objGuiView, strName, intWidth, intHeight)
{

    if (!this.arrCanvasControllers[strName])
    {
        this.arrCanvasControllers[strName] = new CanvasController(strName, this.objDeviceModel);
    }
    var objCanvasController = this.arrCanvasControllers[strName];

    objCanvasController.setCurrentView(objGuiView, intWidth, intHeight);
}
/**
 * Retrieve CanvasController Object
 */
CanvasQueue.prototype.getCanvasController = function(strName)
{
    if (this.arrCanvasControllers[strName])
    {
        return this.arrCanvasControllers[strName];
    }
    return null;
}
/**
 * refresh all the graphics and draw to screen once assets have loaded
 */
CanvasQueue.prototype.refresh = function()
{
    for (var x in this.arrCanvasControllers)
    {

        
        if (this.arrCanvasControllers[x])
        {
            this.arrCanvasControllers[x].draw()
        }
    }
}

//Double Buffering
/**
 * To draw all the Canvas Controllers
 */
CanvasQueue.prototype.draw = function()
{
    
    if (CanvasQueue.objOfflineContext )
    {
        CanvasQueue.objOfflineContext.clearRect (0,0, CanvasQueue.objMainOfflinCanvas.width,  CanvasQueue.objMainOfflinCanvas.height );
    }
    
    for (var x in this.arrCanvasControllers)
    {
        if (this.arrCanvasControllers[x])
        {
            this.arrCanvasControllers[x].draw()
        }
    }
}


/**
 * hide all canvas's
 */
CanvasQueue.prototype.hideAll = function()
{
    for (var x in this.arrCanvasControllers)
    {
    	if (x == "loading")
    	{
    		continue; //dont hide loading canvas
    	}
        this.arrCanvasVisibilityStates[x] = this.arrCanvasControllers[x].blVisible;
        if (this.arrCanvasControllers[x])
        {
            this.arrCanvasControllers[x].objContext.canvas.parentNode.style.display = "none";
        }
    }
}

CanvasQueue.prototype.showOnly = function(strCanvasID)
{
    for (var x in this.arrCanvasControllers)
    {
        this.arrCanvasVisibilityStates[x] = this.arrCanvasControllers[x].blVisible;
        if (this.arrCanvasControllers[x])
        {
            if(this.arrCanvasControllers[x].objContext.canvas.id != strCanvasID)
            {
		    	if (x == "loading")
		    	{
		    		continue; //dont hide loading canvas
		    	}
                this.arrCanvasControllers[x].objContext.canvas.parentNode.style.display = "none";
            }
        }
    }
}

/**
 * Restores all canvas's to their previous visibility
 */
CanvasQueue.prototype.restoreAll = function()
{
    for (var x in this.arrCanvasControllers)
    {
        if (this.arrCanvasControllers[x])
        {
            this.arrCanvasControllers[x].objContext.canvas.parentNode.style.display = "block";
        }
    }
}
/**
 * show all canvas's
 */
CanvasQueue.prototype.showAll = function()
{
    for (var x in this.arrCanvasControllers)
    {
        if (this.arrCanvasControllers[x])
        {
            this.arrCanvasControllers[x].blVisible = this.arrCanvasVisibilityStates[x];
        }
    }
}


/**
 * To force the redraw for all the views
 */
CanvasQueue.prototype.forceRedraw = function()
{
    for (var x in this.arrCanvasControllers)
    {
        if (this.arrCanvasControllers[x])
        {
            this.arrCanvasControllers[x].objCurrentView.blDirty = true;
        }
    }
}

/**
 * show a canvas
 * @param { object } The canvas you wish to display
 */
CanvasQueue.prototype.show = function(canvas)
{
    if (this.arrCanvasControllers[canvas])
    {
        this.arrCanvasControllers[canvas].blVisible = true;
    }
}
