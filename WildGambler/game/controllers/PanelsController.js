/**
 * @author Javier.Ortega
 * 
 * This class will handle the specific functionalities for the Reels View
 * Scaling up or down and centering the reels for all the different devices
 */


/**
 * Constructor
 * @param { Object } objMainConsole The height of the bottom bar
 * @param { Object } objGuiController The height of the bottom bar
 * @param { Object } intHeightBottomBar The height of the bottom bar
 */
function PanelsController( objMainConsole, objDeviceModel, objGuiController, objSymbolAnimations, objSoundController, objLocalisation )
{
    /**
     * This is the div container for the canvas
     * @type {Object}
     */
    this.objDivContainer = document.getElementById('panelsArea');
    
    this.objSymbolAnimations = objSymbolAnimations;
    
    /**
     * This canvas reference
     * @type {Object}
     */    
    this.objCanvas = document.getElementById('panels');
    
    /**
     * A refernce to the controller for the Bottombar
     * @type {Object}
     */    
    this.objMainConsole = objMainConsole;
    
    /**
     * A refernce to the Gui controller for the reels
     * @type {Object}
     */
    this.objGuiController =  objGuiController;
	this.objLocalisation = objLocalisation;
    
    this.create(objDeviceModel, objGuiController );

    this.resize ( this.objMainConsole.intrelation );
    
    this.objWinPanel = new WinPanelController(objGuiController.objGuiView, objSoundController);
    this.objMeerkatView = new MeerkatController( objGuiController.objGuiView );
   
    /**
     * Autoplay select component 
     */
    this.objAutoplaySelect = null;

	/*    
    //Main loop for this controller
    var that = this;
    this.mainRunLoop = setInterval(function() 
    {
        that.mainRun();
    }, 30 );
    */
	this.mainRun = this.mainRun.bind(this);
	MainLoop.getInstance().addItem(this.mainRun);
}

/**
 * Derive PanelsController from our base type to provide inheritance
 */ 
Class.extend(ScreenLogicController, PanelsController);




/**
 * Main loop run
 *
 * @param {int} intTimeDiff [miliseconds] time change from last call
 * @param {int} intTime [miliseconds] currentTime
 */
PanelsController.prototype.mainRun = function(intTimeDiff, intTime)
{
    //this.objWinPanel.run();
	this.objMeerkatView.run(intTimeDiff, intTime);
}

/**
 * Height for this canvas
 * @type { integer }  
 */
PanelsController.INT_HEIGHT = 520;

/**
 * Height for this canvas
 * @type { integer }  
 */
PanelsController.INT_OFFSET_HEIGHT = 0;

/**
 * Width for this canvas
 * @type { integer }  
 */
PanelsController.INT_WIDTH = 1024;

/**
 * To resize the reels canvas, when it is needed
 * 
 */
PanelsController.prototype.resize = function(intRelation)
{
    this.intrelation = this.objMainConsole.intrelation;
 
    var newWidth = StateFactory.WIDTH_CONTAINER ;
    
    var newHeight =  StateFactory.HEIGHT_CONTAINER - this.objMainConsole.intHeightBottomBar;
 
 
    this.objCanvas.width = 1024;
    this.objCanvas.height = 520;
    
    
    this.objCanvas.style.width = (1024 *this.intrelation)+ 'px';
    this.objCanvas.style.height = (520 * this.intrelation) + 'px';
    
    //if ( this.objDeviceModel.platform == OS.IOS || this.objDeviceModel.platform == OS.WINDOWS )
    if ( this.objDeviceModel.platform == OS.WINDOWS )
    {
        this.objDivContainer.style.marginTop = (window.innerHeight - ( 86 + 520 ) *  this.intrelation   ) + 'px';    
        this.objDivContainer.style.marginLeft = (newWidth/2 - (ReelsController.WIDTH  * this.intrelation/ 2)) + 'px';
    }
    else
    {
        //this.objDivContainer.style.marginTop = ((-96 )  * this.intrelation  ) + 'px';
        
        
        if (navigator.userAgent.match("HTC Desire"))
        {
            this.objDivContainer.style.marginTop = (window.innerHeight - ( 86 + 520 )  *  this.intrelation   ) + 'px';              
        }
        else
        {
            this.objDivContainer.style.marginTop = (window.innerHeight - ( 86 + 520 )*  this.intrelation   ) + 'px';    
        }
        
        
        this.objDivContainer.style.marginLeft = (newWidth/2 - (ReelsController.WIDTH  * this.intrelation/ 2))  + 'px';        
    }
    
    this.objGuiController.objGuiView.setDirty(true);
        
    window.scrollTo(0, 1);
}
