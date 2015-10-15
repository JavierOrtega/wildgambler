/**
 * A class to control animations that need a timing loop 
 */
function PopupsController( objDeviceModel, 
 						   objConfig, 
 						   objGuiController,
						   objSoundController)
{
   
    this.objDivContainer = document.getElementById('loadingArea');
    this.objCanvas = document.getElementById('loading');
    this.objGuiController =  objGuiController;
    
    
    /*
     * Needs to be set to enable mouse/touch interaction
     * Need to implement resize method to achieve this. 
     */
    this.intrelation;

	/*
	 * Inheritance workaround
	 */    
    this.create(objDeviceModel, objGuiController );
    this.resize();
        
	/*
	 * 
	 */
	this.objBigWinController = new BigWinController( objDeviceModel, 
   											   	     objConfig, 
												   	 objGuiController, 
												     objSoundController );

    //Main loop for this controller
    /*
    var that = this;
    this.mainRunLoop = setInterval(function() 
    {
        that.mainRun();
    }, 30 );
    */
	this.mainRun = this.mainRun.bind(this);
	MainLoop.getInstance().addItem(this.mainRun);
}
Class.extend(ScreenLogicController, PopupsController);

/**
 * Main loop run
 * 
 * @param {int} intTimeDiff [miliseconds] time change from last call
 * @param {int} intTime [miliseconds] currentTime
 */
PopupsController.prototype.mainRun= function(intTimeDiff, intTime)
{
	this.objBigWinController.run(intTimeDiff, intTime);
}

/**
 * To resize the reels canvas, when it is needed
 * 
 */
PopupsController.prototype.resize = function()
{
    // The original relation width / height for the original design
    var widthToHeight = 1024 / 520;
    
    var newWidth = StateFactory.WIDTH_CONTAINER ;
    
    var newHeight = StateFactory.HEIGHT_CONTAINER;
    
    var newWidthToHeight = newWidth / newHeight;
    
    // To detect what dimension we should use to fill the maximum screen area possible
    if (newWidthToHeight > widthToHeight)
    {
        this.intrelation = newHeight / 520;
    }
    else
    { // window height is too high relative to desired game height
        this.intrelation = newWidth / 1024;
    }
    
    //We apply the correct relation depending of the platform
    this.objCanvas.width = 1024 / this.intrelation;
    this.objCanvas.height = 520 / this.intrelation;
    
    this.objDivContainer.style.marginTop = (1) + 'px';
    this.objDivContainer.style.marginLeft = (newWidth/2 - (ReelsController.WIDTH  * this.intrelation/ 2))  + 'px';
    
    if ( this.objDeviceModel.platform == OS.IOS || this.objDeviceModel.platform == OS.WINDOWS )
    {
        this.objCanvas.width = 1024;
        this.objCanvas.height = 520;
        
        this.objDivContainer.style.marginTop = (0) + 'px';
        this.objDivContainer.style.marginLeft = (newWidth/2 - (ReelsController.WIDTH  * this.intrelation/ 2)) + 'px';
        
        this.objCanvas.style.width = (1024 *this.intrelation)+ 'px';
        this.objCanvas.style.height = (520 * this.intrelation) + 'px';
    }
    else
    {
        if(this.objDivContainer.style.webkitTransform != undefined)
        {
            this.objDivContainer.style.webkitTransform = "scale(" + this.intrelation +  "," + this.intrelation + ")";            
        }
        else if(this.objDivContainer.style.MozTransform != undefined)
        {
            this.objDivContainer.style.MozTransform =  "scale(" + this.intrelation +  "," + this.intrelation + ")";            
        }
        else if(this.objDivContainer.style.OTransform != undefined)
        {
            this.objDivContainer.style.OTransform  =  "scale(" + this.intrelation +  "," + this.intrelation + ")";
        }
    }
    
    this.objGuiController.objGuiView.setDirty(true);
    
	/*    
    for (var i in this.arrControllers)
    {
        this.arrControllers[i].resize(this.intrelation);
    }
    */
    window.scrollTo(0, 1);
}
