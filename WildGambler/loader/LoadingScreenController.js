/**
 * @author Tim.Gudgion
 */

/**
 * Constructor
 */
function LoadingScreenController()
{
    
}

/**
 * Derive Loader from our base type to provide inheritance
 */
Class.extend(Loader, LoadingScreenController);

/*
 * Track number of resource files loaded
 */
LoadingScreenController.resourcesLoaded = 0;

/*
 * MAGIC NUMBER - UPDATE WHEN ASSET COUNT CHANGES!
 */
LoadingScreenController.EXPECTED_ASSET_COUNT = 612; // WILDGAMBLER!
//LoadingScreenController.EXPECTED_ASSET_COUNT = 20; // VIRTUALDOGS! (or try 33 :S)

/*
 * 
 */
LoadingScreenController.intState = LoadingScreenController.STATE_LOADING_VIEW;
LoadingScreenController.STATE_LOADING_VIEW = 0;
LoadingScreenController.STATE_GUI_LOADED = 1;

LoadingScreenController.TO_LOAD = "toload";
LoadingScreenController.LOADED = "loaded";

/*
 * This tells framework.GuiView to NOT draw anything but the loading screen
 * while the loading is in progress.
 * @see GuiView.js line 564 (draw() method)
 */
LoadingScreenController.blHide = false;

/**
 * Process the different state
 * @param { Object } objCanvasQueue The canvas queue to add the screen
 */
LoadingScreenController.load =  function (objCanvasQueue)
{
    if(LoadingScreenController.fnResourcesLoaded == null)
    {
        throw new Error("LoadingScreenController.fnResourcesLoaded MUST be defined")
    }
    
    // The objGuiFactory used to load the resources for the view related with this controller
    LoadingScreenController.objGuiFactory = new GuiFactory();
    
    LoadingScreenController.objCanvasQueue = objCanvasQueue;
    
    LoadingScreenController.objGuiFactory.getGuis(["loadingScreen"]);
    
    LoadingScreenController.objGuiFactory.objCallBack = LoadingScreenController.guiLoaded;
}

/**
 * Process the different state.
 * This does absolutely nothing!
 */
LoadingScreenController.process =  function ()
{
    switch (LoadingScreenController.intState)
    {
        case LoadingScreenController.STATE_LOADING_VIEW:
        break;
        
        case LoadingScreenController.STATE_GUI_LOADED :
        break;
    }
}

/**
 * Callback to be called when the gui elements are loaded
 * @param {Array } The different gui's loaded in this case only one
 */
LoadingScreenController.guiLoaded =  function (arrGuiControllers)
{
    LoadingScreenController.objGuiController = arrGuiControllers["loadingScreen"];
    
    LoadingScreenController.objAssetsFactory = new AssetsFactory(); 
    
    LoadingScreenController.objCanvasQueue.addView ( LoadingScreenController.objGuiController.objGuiView, "loading" , 1024,520);
        
    LoadingScreenController.progressTextBox = LoadingScreenController.objGuiController.objGuiView.getTextView("loadingcountup");
    
    LoadingScreenController.objLoadingViewController = new LoadingViewController(LoadingScreenController.deviceModel, 
                                                                                 arrGuiControllers["loadingScreen"]);    
    arrGuiControllers["loadingScreen"].objExternalController = LoadingScreenController.objLoadingViewController;
    
    LoadingScreenController.objAssetsFactory.getResources(LoadingScreenController.fncResourcesLoaded,null ,["loading_inGameAni"]);
    
    LoadingScreenController.deviceModel.callBack = LoadingScreenController.objLoadingViewController.resize;
    
    LoadingScreenController.objIcon = LoadingScreenController.objGuiController.objGuiView.getElement (0,"loading_inGameAni.png");
    
    LoadingScreenController.objIcon.blVisible = false;
    
    LoadingScreenController.intState = LoadingScreenController.STATE_GUI_LOADED
}

/**
 * Callback to be called when the extra needed graphics elements are loaded
 * @param {Array }  arrResources The different graphics element
 */
LoadingScreenController.fncResourcesLoaded =  function (arrResources)
{
    LoadingScreenController.objIcon.setVisible(false);
    
    var objAnimation = new Animation ( LoadingScreenController.objAssetsFactory , "loading_inGameAni", 0,0);
    objAnimation.context = LoadingScreenController.objGuiController.objGuiView.context;    
    objAnimation.initAnimation();
    
    LoadingScreenController.objGuiController.objGuiView.addElement(5,"loading_inGameAnimation", objAnimation);
    
    objAnimation.intX = LoadingScreenController.objIcon.intX;
    objAnimation.intY = LoadingScreenController.objIcon.intY;    
    
    objAnimation.blVisible = false;
    objAnimation.blContinuous = true;
    objAnimation.startAnimation();
    
    LoadingScreenController.objIcon = objAnimation;
    
    LoadingScreenController.intState = LoadingScreenController.STATE_GUI_LOADED
    
    if ( LoadingScreenController.fnScreenLoaded )
    {
        LoadingScreenController.fnScreenLoaded();
    }
}

/**
* Update the loading text values when new load request / completion message are received
 * @param { String } type the message type (request or completion notification)
 * @param { integer } value The numeric value to increment the request / completion queue by
*/

LoadingScreenController.updateLoadingValues = function (type, value)
{
    //console.log ("Loaded :" + (LoadingScreenController.resourcesLoaded + value));
    
    /*
     * While loading, update progress.
     */
    if( type == LoadingScreenController.LOADED )
    {
        LoadingScreenController.resourcesLoaded += value;
        LoadingScreenController.percentOfResourcesLoaded = Number((100 / LoadingScreenController.EXPECTED_ASSET_COUNT) * (LoadingScreenController.resourcesLoaded)).toFixed(0);
        
        /*
         * update screen textbox if it exists
         */
        if (LoadingScreenController.progressTextBox)
        {
            LoadingScreenController.progressTextBox.setText(String(LoadingScreenController.percentOfResourcesLoaded) + "%");
            LoadingScreenController.objGuiController.objGuiView.blDirty = true;
        }
        
        /*
         * Update Wrapper or Sidebar progress if it exists
         */
        if(LoadingScreenController.fnProgressUpdate)
        {
            LoadingScreenController.fnProgressUpdate();
        }

        var obj = JSON.stringify({type:"loadingScreen",message:"progress",loaded:LoadingScreenController.resourcesLoaded, percent:LoadingScreenController.percentOfResourcesLoaded});
        IFrameMessengerModel.sendMessage(obj)
        
    }

    /**
     * NOTE: MAGIC NUMBER  LoadingScreenController.EXPECTED_ASSET_COUNT
     *          - must be updated with the current asset count!
     * PLUS : only run this once, even if it's an asset or two too early
     */
    if (LoadingScreenController.resourcesLoaded >= LoadingScreenController.EXPECTED_ASSET_COUNT)
    {
        if( LoadingScreenController.fnResourcesLoaded )
        {
            LoadingScreenController.fnResourcesLoaded();
            LoadingScreenController.fnResourcesLoaded = null;
            LoadingScreenController.hide();
        }
    }
}

/**
 *  This function will be called if there are unexpected resources to be loaded
 */
LoadingScreenController.startUnexpectedLoadingValues = function ()
{
    LoadingScreenController.objIcon.blVisible = true;
    LoadingScreenController.objGuiController.objGuiView.blVisible = true;
    LoadingScreenController.objGuiController.objGuiView.getElement (0,"loading_sunrise.png").blVisible = false;
    LoadingScreenController.objGuiController.objGuiView.getElement (0,"loadingcountup").blVisible = false;
    
    if (!LoadingScreenController.nodeScreenCover) 
    {
        LoadingScreenController.nodeScreenCover = document.createElement("div");
        LoadingScreenController.nodeScreenCover.id = "screen-cover";
        LoadingScreenController.nodeScreenCover.style.height = window.innerHeight + "px";
        LoadingScreenController.nodeScreenCover.style.width = window.innerWidth + "px";    
    }
    
    document.body.appendChild(LoadingScreenController.nodeScreenCover);
    
    MainLoop.getInstance().addItem(LoadingScreenController.updateLoadingIcon);
}

/**
 * Update the loading icon
 */
LoadingScreenController.updateLoadingIcon = function ()
{
    LoadingScreenController.objGuiController.objGuiView.blDirty = true;
    LoadingScreenController.objGuiController.objGuiView.context.canvas.style.display="block";
} 

/**
 *  This function will be called if when the unexpected resources are already loaded
 */
LoadingScreenController.endUnexpectedLoadingValues = function ()
{
    MainLoop.getInstance().removeItem(LoadingScreenController.updateLoadingIcon);
    LoadingScreenController.objGuiController.objGuiView.blVisible = false;
    LoadingScreenController.objIcon.blVisible = false;
    
    LoadingScreenController.objGuiController.objGuiView.context.canvas.style.display="none";
    
    if (LoadingScreenController.nodeScreenCover)
    {
	    document.body.removeChild(LoadingScreenController.nodeScreenCover);
    }
}

/**
 * To hide the Loading screen 
 */
LoadingScreenController.hide = function ()
{
    var element = document.getElementById("loadingArea");
    element.ontouchstart = function(event) {EventBase.preventDefault(event) }
    element.ontouchmove = function(event) { EventBase.preventDefault(event) }
    
    LoadingScreenController.blHide = true;
    
    if ( !LoadingScreenController.objIcon.blVisible)
    {
        LoadingScreenController.objGuiController.objGuiView.context.canvas.style.display="none";
    }
    else
    {
        LoadingScreenController.objGuiController.objGuiView.getElement (0,"loading_sunrise.png").blVisible = false;
        LoadingScreenController.objGuiController.objGuiView.getElement (0,"loadingcountup").blVisible = false;
        LoadingScreenController.objGuiController.objGuiView.blDirty = true;    
    }
    
    LoadingScreenController.showMainBackground();
}

/**
 * To show the main back ground, when all the things are loaded
 */
LoadingScreenController.showMainBackground = function ()
{
    //document.body.setAttribute("id", "bgMain");
    var objNode = document.getElementById("background");
    if (objNode)
    {
	    objNode.style.display = "block"; //show background
    }
}
