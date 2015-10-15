/**
 * @author Javier.Ortega
 * 
 * This is wrapper for the canvas controller
 */


/**
 * Constructor  
 * @param { String } strNameCanvas This is the name of the canvas
 * @param { DeviceModel } deviceModel containing all environment information
 * @param { int } intWidth Optional parameter to specify the width
 * @param { int } intHeight Optional parameter to specify the height
 */
function CanvasController( strNameCanvas, deviceModel, intWidth, intHeight )
{
	//this.deviceModel = deviceModel;
	
    /**
     * The name of the canvas in the HTML document
     * @type { String }
     */
    this.strNameCanvas = strNameCanvas;
    
    /**
     * This elemenet will store the canvas DOM object
     * @type { Object }
     */
    this.objGraphics = document.getElementById( this.strNameCanvas );
    
    
    /**
     * The view to be drawn
     * @type { GuiView }
     */
    this.objCurrentView;

    /**
     * The different in time with the last process
     * @type { Integer }
     */    
    this.intDiffTime;
    
    
    /**
     * The last time when the controller was proccesed 
     * @type {Date}
     */ 
    this.objLastTime = new Date();
    
    /**
     * The current time 
     * @type {Date}
     */
    this.objNowTime = new Date();
    
    /**
     * The current time 
     * @type {Integer}
     */
    this.intFps;

    /**
     * The frame counting 
     * @type { Integer }
     */    
    this.intFrameCount;
    
     /**
     * The loop to draw
     * @type {Object}
     */
    this.mainRunLoop;
    
    /**
     * Enable/Disable the draw process
     * @type {Object}
     */
    this.blVisible = true;
    
    /**
     * To indicate when a canvas is semitransparence or not
     * @type {Boolean}
     */
    this.blSemitransparence = false;
    
    this.objContext = this.objGraphics.getContext("2d");
    
    /**
     * Collection of views for this canvas controller
     * @type { Array }  
     */
    this.arrGuiView = [];

    this.enableDoubleBuffer = this.enableDoubleBuffer.bind(this);
    
    this.disableDoubleBuffer = this.disableDoubleBuffer.bind(this);
    
    this.draw = this.draw.bind(this);
    
    this.init();
}




/**
 * Derive CanvasController from our base type to provide inheritance
 */ 
Class.extend(Class, CanvasController);


/**
 * To init this class
 */
CanvasController.prototype.init = function() 
{
	/*
    var that = this;
    this.mainRunLoop = setInterval(function() 
    {
        that.draw();
    }, 30 );
    */

   
    
    /*this.secondLoop = setInterval(function() 
    {
        window.scrollTo(0, 1);
    }, 3000 );*/
}

/**
 * To init this class
 * 
 */
CanvasController.prototype.setCurrentView = function( objCurrentView, intWidth, intHeight ) 
{
    objCurrentView.setContext (this.objGraphics.getContext("2d"), intWidth, intHeight);
    
    this.arrGuiView.push(objCurrentView);
}

/**
 * To remove a view
 * 
 * @param { Object } objView View to be removed 
 */
CanvasController.prototype.removeView = function( objView ) 
{   
    
    var newArray = [];
    for (var i in this.arrGuiView)
    {
        if ( this.arrGuiView[i] != objView )
        {
            newArray.push (this.arrGuiView[i]);
        }
    }
    
    this.arrGuiView = newArray;
}

//Double Buffering
CanvasController.prototype.enableDoubleBuffer = function( intScaleWidth, intScaleHeight)
{
    
    if (this.objContext.canvas.parentNode.parentNode)
    {
        /*this.objOfflineCanvas = this.objContext.canvas;        
        
        this.objOfflineContext = this.objOfflineCanvas.getContext("2d");
        
        this.objOfflineContext.id2 = "Test";*/
        
        this.objContext.canvas.parentNode.parentNode.removeChild(this.objContext.canvas.parentNode);
    }
    
    this.intScaleWidth = intScaleWidth;
    
    this.intScaleHeight = intScaleHeight;
    
    if (!CanvasQueue.objMainCanvas)
    {
           
        CanvasQueue.objMainCanvas = document.createElement('canvas');
        CanvasQueue.objMainCanvas.id = "MainCanvas";
        CanvasQueue.objMainCanvas.width = window.innerWidth;
        CanvasQueue.objMainCanvas.height = window.innerHeight;
        CanvasQueue.objMainCanvas.style.zIndex = 20;
        CanvasQueue.objMainCanvas.style.position = "absolute";
        CanvasQueue.objMainCanvas.style.left = "0%";
        CanvasQueue.objMainCanvas.style.top = "0%";
        CanvasQueue.objMainCanvas.style.overflow = "hide";
                
        CanvasQueue.objMainContext = CanvasQueue.objMainCanvas.getContext("2d");
        
        document.getElementsByTagName('body')[0].appendChild(CanvasQueue.objMainCanvas);
    }
    
    
    
    this.blDoubleBuffer = true;    
}


CanvasController.prototype.disableDoubleBuffer = function()
{
    
    //To change the context ( To the offline one ) for all the views for this canvas
    
    for (i in this.arrGuiView)
    {
        this.arrGuiView[i].changeContext(this.objOfflineContext);
    }
    
    this.blDoubleBuffer = false;    
}

/**
 * To draw the current Gui
 * 
 * @param {int} intTimeDiff [miliseconds] time change from last call
 * @param {int} intTime [miliseconds] currentTime
 */
CanvasController.prototype.draw = function(intTimeDiff, intTime) 
{
    if (this.blVisible )
    {
        //this.intDiffTime = Math.ceil((this.objNowTime.getTime() - this.objLastTime.getTime()));
		this.intDiffTime = Math.ceil(intTimeDiff);

        //find out if we need to redraw one of them
        var blNeedsRedraw = false;

        var i;
        for (i in this.arrGuiView)
        {
            if (this.arrGuiView[i].isDirty() )
            {
                blNeedsRedraw = true;             
                break;
            }
        }
        
        if (blNeedsRedraw)
        {
            //clean canvas  only for Samsung Galaxy S 2, since this fix kills the memory for other android devices like Samsung Galaxy S 3
            if (this.blSemitransparence && navigator.userAgent.match(/GT-I9100/i))
            {
                this.objContext.canvas.width = this.objContext.canvas.width;  //clean the canvas on Samsung Android 4.1.1 / 4.1.2 (https://code.google.com/p/android/issues/detail?id=39247)
            }
            
            this.objContext.clearRect(0, 0, this.objContext.canvas.width, this.objContext.canvas.height);
            

            //draw all of them
            for (i in this.arrGuiView)
            {

                this.objCurrentView = this.arrGuiView[i];
                
                // TO DO :  This is forcing a continue update for all the Gui's
                //this.objCurrentView.update(); //set blDirty to true, we need to draw all of them
                this.objCurrentView.draw();
            }
            
            if (this.blDoubleBuffer)
            {
                CanvasQueue.objMainContext.drawImage(this.objContext.canvas,0, 0,this.objContext.canvas.width,this.objContext.canvas.height, 
                                                                            0, 0,this.intScaleWidth, this.intScaleHeight); 
            }
        }
    }
    else 
    {
        alert ("Invisible:" + this.strNameCanvas);
    }
}
