/** 
 * @author Javier.Ortega
 * 
 * This class will provide build GUI's  to the Main Manager
 */


/**
 * Constructor
 * @param {String} strSrc The string for the source 
 */
function GuiFactory()
{   
    
    this.process = this.process.bind( this );
    
    /**
     * The state for the loading data.
     * @type { String }
     */
    this.STR_STOPPED = "strStopped";
    
    /**
     * The state for the loading data.
     * @type { String }
     */
    this.STR_LOADING_DATA = "strLoadingData";
    
    /**
     * The staste fot the loading resources
     * @type { String }
     */
    this.STR_LOADING_RESOURCES = "strLoadingResources";
    
    /**
     * The process for loadinf all the necesary resources for this screen is finished
     * @type { String }
     */
    this.STR_LOADING_FINISHED = "strLoadingFinished";
    
    /**
     * This controller will load all the necesary resources for the gui element asked.
     * @type {AssetsFactory}
     */
    this.objAssetsFactory = new AssetsFactory();
    
    /**
     * The current state
     * @type { String }
     */
    this.strState = this.STR_STOPPED;
    
    /**
     * The callBack
     * @type { Object }
     */
    this.objCallBack;
    
    /**
     * The current gui controller
     * @type { Object }
     */
    this.objCurrentGuiController;

    /**
     * The current gui controller
     * @type { Object }
     */    
    this.arrGuis = new Array();
    
    /**
     * The current gui controller
     * @type { Object }
     */    
    this.intCurrentGui = 0;

    /**
     * The collections of Gui Controlles to be loaded
     * @type { Object }
     */    
    this.arrControllers = new Array();
    
}

/**
 * Derive GuiFactory from our base type to provide inheritance
 */ 
Class.extend( Class, GuiFactory );

/**
 * This will handle the several steps to load a screen/ Gui element. 
 * @param {String} strName The name of the Gui/Screen.
 */
GuiFactory.prototype.getGui = function ( strName )
{
    this.objCurrentGuiController = new GuiController( strName );
    this.getDataGui (strName);
    this.strState = this.STR_LOADING_DATA;
}

/**
 * This will load a collection of Guis
 * @param { Array } arrNames The names of the Guis/Screens.
 */
GuiFactory.prototype.getGuis = function ( arrNames )
{
    this.intCurrentGui = 0;    
    this.arrGuis = arrNames;    
    this.arrControllers = new Array();    
    this.getGui(this.arrGuis[this.intCurrentGui]);
}

/**
 * This will load a collection of Guis 
 */
GuiFactory.prototype.nextGui = function ( arrNames )
{
    this.arrControllers[this.arrGuis[this.intCurrentGui]] = this.objCurrentGuiController;
    
    this.intCurrentGui++;
    
    if ( this.intCurrentGui >= this.arrGuis.length )
    {
        this.strState = this.STR_LOADING_FINISHED;
        if ( this.objCallBack )
        {
            this.objCallBack( this.arrControllers );
        }
        return;
    }
    
    this.getGui(this.arrGuis[this.intCurrentGui]);
}

/**
 * This method will get the data what defines the layout, and what graphics, sounds,... are needed 
 * @param {String} strName The name of the Gui/Screen es
 */
GuiFactory.prototype.getDataGui = function ( strName )
{
    var arrDataElments = [strName + "Data" + ".json", strName + "Res" + ".json"];    
    this.objAssetsFactory.getResources ( this.process, arrDataElments);
}

/**
 * This method will load the needed graphics, sounds,... to show the screen
 * @param {Array} arrElements List of elements to be loaded
 */
GuiFactory.prototype.getResourcesGui = function ( arrElements )
{  
   if (arrElements.length > 0)
   {
        this.objAssetsFactory.getResources ( this.process, arrElements);
   }
   else
   {
       this.strState = this.STR_LOADING_RESOURCES;
       this.process(null);
   }
}

/**
 * This method will check if the resources are already loaded. 
 * @param {Array} arrLoadedElements The loaded elements in the current step
 */
GuiFactory.prototype.process = function ( arrLoadedElements )
{
    switch( this.strState )
    {
        case this.STR_LOADING_DATA:
            this.objCurrentGuiController.setData(arrLoadedElements);
            this.getResourcesGui(this.objCurrentGuiController.getResourcesToLoad() );
            this.strState = this.STR_LOADING_RESOURCES;            
        break;
        case this.STR_LOADING_RESOURCES:
            this.objCurrentGuiController.objGuiModel.arrResources = arrLoadedElements;
            this.objCurrentGuiController.objGuiView.setData (this.objCurrentGuiController);
			this.objCurrentGuiController.processJSONLayout(this.objCurrentGuiController.objGuiModel.objLayout);
            this.nextGui();
        break;
    }
}
