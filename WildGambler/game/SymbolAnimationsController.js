/**
 * @author Javier.Ortega
 * 
 * This class will handle the specific functionalities for the animations about the reels
 * 
 */


/**
 * Constructor
 * @param { Object } objMainConsole The height of the bottom bar
 * @param { Object } objGuiController The height of the bottom bar
 * @param { Object } intHeightBottomBar The height of the bottom bar
 */
function SymbolAnimationsController( objMainConsole, objDeviceModel, objGuiController)
{
    this.initAnimations = this.initAnimations.bind (this);
    this.checkAnimationsLoaded = this.checkAnimationsLoaded.bind(this);
    
    
    /**
     * This is the div container for the canvas
     * @type {Object}
     */
    this.objDivContainer = document.getElementById('animationsArea');
    
    /**
     * This canvas reference
     * @type {Object}
     */    
    this.objCanvas = document.getElementById('animations');
    
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
    
    //parent constructor
    this.create(objDeviceModel, objGuiController );

    /**
     * The array of animations
     * @type {Array}
     */    
    this.arrAnimation  = new Array();
    
    /**
     * This object will handle the assets to be loaded
     * @type { Object }
     */    
    this.objAssetsFactory = new AssetsFactory();
    
    /**
     * Array of symbol animations
     * @type { Array }
     */    
    this.arrSymbolAnimations = [];
    
}

/**
 * Derive SymbolAnimationsController from our base type to provide inheritance
 */ 
Class.extend(ScreenLogicController, SymbolAnimationsController);

SymbolAnimationsController.ANIMATIONS_ARRRAY = ["Icon0", "Icon1", "Icon2", "Icon3",
                                                "Icon4", "Icon5", "Icon6", "Icon7",
                                                "Icon8","Icon10","WildOverlay","CageBreaker"];
                                               



SymbolAnimationsController.prototype.init = function() 
{
    this.objAssetsFactory.getResources(this.initAnimations, [], SymbolAnimationsController.ANIMATIONS_ARRRAY);    
}

/**
 * This will load initially all the necesary sprites for the animations 
 */
SymbolAnimationsController.prototype.initAnimations = function() 
{
    
    this.intCounAnimations = 0;
    var i;
    for ( i in SymbolAnimationsController.ANIMATIONS_ARRRAY  )
    {
        //Intialize the animations
        var objAnimation = new Animation ( this.objAssetsFactory , SymbolAnimationsController.ANIMATIONS_ARRRAY[i], 0,0);
        objAnimation.context = this.objGuiController.objGuiView.context;
        objAnimation.loadedFinished =  this.checkAnimationsLoaded;
        this.intCounAnimations++;
        objAnimation.initAnimation();
        
        this.arrSymbolAnimations[SymbolAnimationsController.ANIMATIONS_ARRRAY[i]] = objAnimation;
    }
    
};

/**
 *  Check if all the animations are loaded
 * 
 */
SymbolAnimationsController.prototype.checkAnimationsLoaded = function ()
{
    this.intCounAnimations--;
    if (this.intCounAnimations <= 0)
    {
        
        if (this.objCallBack)
        {
            this.objCallBack(this);
        }    
    }
}
/**
 * To resize the reels canvas, when it is needed
 * 
 */
SymbolAnimationsController.prototype.resize = function(intRelation)
{
    this.intrelation = intRelation;
    
    //We apply the correct relation depending of the platform
    this.objCanvas.width = 1024 / this.intrelation;
    this.objCanvas.height = 520 / this.intrelation;
    
    var newWidth = StateFactory.WIDTH_CONTAINER;
    
    var newHeight = StateFactory.HEIGHT_CONTAINER  - this.objMainConsole.intHeightBottomBar;
    
    
    this.objDivContainer.style.marginTop = (1) + 'px';
    this.objDivContainer.style.marginLeft = (newWidth/2 - (ReelsController.WIDTH  * this.intrelation/ 2))   + 'px';
    
    if ( this.objDeviceModel.platform == OS.IOS || this.objDeviceModel.platform == OS.WINDOWS )
    {
        this.objCanvas.width = 1024;
        this.objCanvas.height = 520;
        
        this.objDivContainer.style.marginTop = (0) + 'px';
        this.objDivContainer.style.marginLeft = (newWidth/2 - (ReelsController.WIDTH  * this.intrelation/ 2))    + 'px';
        
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
    
    this.objGuiController.objGuiView.setDirty (true);
    
        
    window.scrollTo(0, 1);
}
