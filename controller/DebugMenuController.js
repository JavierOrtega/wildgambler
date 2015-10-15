/**
 * @author Petr Urban
 * 
 * This class will handle the specific functionalities for the DebugPanel menu
 */

/**
 * DebugMenu Constructor
 * 
 * @param { Object } objDeviceModel Device model
 * @param { Object } objGuiController The height of the bottom bar
 * @param { ScreenCoverController } objScreenCoverController
 * @param { IFrameController } objIframeController
 */
function DebugMenuController(objGuiController, objDeviceModel, objMenuController, objScreenCoverController, objIframeController)
{
    /**
     * @type {MenuController}
     */
    this.objMenuController = objMenuController
	
    this.resourcesLoaded = this.resourcesLoaded.bind (this);
    this.handleClickOpenTab = this.handleClickOpenTab.bind (this);
    
    
    /**
     * A refernce to the Gui controller for the reels
     * @type {Object}
     */
    this.objGuiController = objGuiController;

    /**
     * This is the div container for the canvas
     * @type {Object}
     */
    this.objDivContainer = document.getElementById('debugPanelArea');
    
    /**
     * This canvas reference
     * @type {Object}
     */    
    this.objCanvas = document.getElementById('debugPanel');

    this.model = new MenuModel();

    this.create(objDeviceModel, objGuiController );

    this.objScreenCoverController = objScreenCoverController;
    this.objIframeController = objIframeController;

    /**
     * The assets Factory
     * @type {Object}
     */
    this.objAssetsFactory = new AssetsFactory(); 

	//bind
    this.run = this.run.bind(this);

	//add to loop
	var objMainLoop = MainLoop.getInstance();
	objMainLoop.addItem(this.run);
	objMainLoop.start(); //make sure the loop is running
    /*
    var that = this;
    this.mainRunLoop = setInterval(function() 
    {
        that.run();
    }, 40);
    */

    /**
     * The state
     * @type {int}
     */  
    this.intState = MenuController.STOP;

    this.arrHandlers = [];

    this.loadNeededResources();
    
    this.objMenuView = objGuiController.objGuiView;
    
    this.arrBtn = [];
    
//    window.addEventListener('resize', this.resize, false);
//    window.addEventListener('orientationchange', this.resize, false);    
    
    /**
     *  Specifies the initial value of the animation property.
     * @type { integer }
     */
    this.intInitX;
    /**
     * Specifies the total change in the animation property.
     * @type { integer } 
     */
    this.intChangeX;
    /**
     * Specifies the duration of the motio
     * @type { integer }
     */
    this.intTotalTime = 2000;
    /**
     * Specifies the current time, between 0 and duration inclusive.
     * @type { integer }
     */
    this.intCurrentTime;
    
    this.intOffsetRight = -14;
    /**
     * X coordinate for the hidding position
     * 
     * @type { int }
     */
    this.intXHiddingPosition = -MenuController.HIDE_WIDTH;
 
    /**
     *
     * X coordinate for the showing position 
     * @type { int }
     */
    this.intXShowingPosition = 0;
    
    /**
     * Time when the animation starts
     * @type { integer }
     * 
     */
    this.intInitTime = 0;    
    
//    this.objMenuView.getButtonView("glow").blVisible = false;

	/**
	 * True when on hide / on show callback should be called 
	 *
	 * @type {boolean} 
	 */
    this.blOnAnimationProcessed = true;
	
    this.hideBar = this.hideBar.bind(this);
    
    /**
     * List of debug buttons
     * @type {Array} 
     */
    this.arrDebugButtons = [];
    
    /**
     * Queue of debug items 
     * @type {DebugQueue}
     */
    this.objDebugQueue = new DebugQueue();
    
    /**
     * @type {ButtonView}
     */
    this.btnTabOpen;
    /**
     * @type {ButtonView}
     */
    this.btnTabClose;
    
    this.blOpen = true;
    
    /**
     * This is used to remember position of open button (when showing / hiding bar) 
     *
     * @type {Number}
     */
    this.btnTabOpenPositionY = 0;
    
    this.onDebugButtonClick = this.onDebugButtonClick.bind(this);
    this.onCoverScreenClick = this.onCoverScreenClick.bind(this);
}

/**
 * Derive MenuController from our base type to provide inheritance
 */ 
Class.extend(ScreenLogicController, DebugMenuController);
/**
 * Callback to be called when all the extra resources needed are ready
 * @param { Array } arrResources The array containing the image for the reels
 */ 
DebugMenuController.prototype.resourcesLoaded = function (arrResources)
{
    this.objEnabledOptions = arrResources["optionsSideBar.json"];
    
    this.objLang = arrResources["langSideBar.json"];
    
    this.addListeners();
    
    var objGlowView = new ElementView (this);
    var imState = arrResources["btn_glow.png"];

    objGlowView.init(this.context,  imState);    
    objGlowView.intWidth = imState.width;
    objGlowView.intHeight = imState.height;
    objGlowView.blVisible = false;
    
    this.objMenuView.addElement(3,"glow",objGlowView);
    
   this.initScreenCoverController();
   
   this.objCanvas.style.right = (this.intOffsetRight * this.intrelation) + "px";

   this.setHidden(true);   
}

/**
 * Hides/Shows the debug sidebar 
 * 
 * 
 * @param {Boolean} blVisible True => it will hide the debug bar using style display property
 */
DebugMenuController.prototype.setStyleBlock = function(blVisible)
{
    
    document.getElementById("debugPanelArea").style.display = blVisible ? "block" : "none";
    
}

/**
 * Add onhide callback to screen cover controller  
 */
DebugMenuController.prototype.initScreenCoverController = function()
{
	this.objScreenCoverController.addOnHideCallback(this.onCoverScreenClick);
}

/**
 * This adds the listeners 
 */
DebugMenuController.prototype.addListeners = function()
{

    this.btnTabClose = this.objGuiController.objGuiView.getElement(1,"debugClose");
    this.btnTabOpen = this.objGuiController.objGuiView.getElement(1,"debugOpen");
    this.btnDebugButtonTemplate = this.objGuiController.getButtonByID("debugBtn");
    this.btnDebugButtonTemplateView = this.objGuiController.objGuiView.getElement(1,"debugBtn");
    this.btnDebugButtonTemplateView.setVisible(false);

	this.btnTabOpen.setXY(this.btnTabClose.getX(), this.btnTabClose.getY());
	
	this.btnTabOpen.setVisible(false);

	var objBtnCtrlClose = this.objGuiController.getButtonByID("debugClose");
	var objBtnCtrlOpen = this.objGuiController.getButtonByID("debugOpen");
	
	objBtnCtrlClose.addListener(ButtonController.STATE_CLICK, this.handleClickOpenTab);
	objBtnCtrlClose.setAllowAutomaticStateChange(false);
	
	objBtnCtrlOpen.addListener(ButtonController.STATE_CLICK, this.handleClickOpenTab);
	objBtnCtrlOpen.setAllowAutomaticStateChange(false);  
}


/**
 *  Load the needed resources
 * 
 */ 
DebugMenuController.prototype.loadNeededResources = function ()
{
    this.objAssetsFactory.getResources(this.resourcesLoaded, ["btn_glow.png"]);
}

/**
 *  To  initialize the object
 */
DebugMenuController.prototype.handleClickOpenTab = function(event, x, y)
{
	if (event)
	{
		//this function can be called even without event
		event.stopPropagation();
	}
    if (this.intState == MenuController.START_SHOW ||
        this.intState == MenuController.START_HIDING)
    {
        return;
    }

	this.setHidden(this.isVisible());
};

/**
 * Set visibility (start hide / show animation)
 * @param {boolean} blHidden 
 */
DebugMenuController.prototype.setHidden = function(blHidden)
{
	if (this.blVisible == !blHidden)
	{
		return;
	}
	
	this.blVisible = !blHidden;
	if (this.blVisible)
	{
		this.onSidebarStartShowing();
		this.showBar();
	}
	else
	{
		this.hideBar();
	}
}



/**
 * called on cover screen click 
 */
DebugMenuController.prototype.onCoverScreenClick = function()
{
	if (this.isVisible())
	{
		this.setHidden(true);
	}
}

/**
 * is visible?
 * @return {boolean}
 */
DebugMenuController.prototype.isVisible = function()
{
	return this.blVisible;
}

/**
 *  To hide or show the sidebar
 * @param { Boolean } blShow 
 */
DebugMenuController.prototype.showSideBar = function(blShow)
{
    this.intState = MenuController.START_SHOW;
}


/**
 *  Call this to hide the bar
 */
DebugMenuController.prototype.hideBar = function()
{
	//will be called when bar is hiding
    this.btnTabOpen.setVisible(true);
    this.btnTabClose.setVisible(false);

    this.intState = MenuController.START_HIDING;
	
    this.handleClickOpenTab();

    this.objScreenCoverController.setVisible(false);
}

/**
 *  Call this to show the bar
 */
DebugMenuController.prototype.showBar = function()
{
    this.btnTabOpen.setVisible(false);
    this.btnTabClose.setVisible(true);

    this.intState = MenuController.START_SHOW;

	this.objScreenCoverController.setVisible(true);
}


DebugMenuController.OFFSET_X = 0;
/**

 * To resize the reels canvas, when it is needed
 * 
 */
DebugMenuController.prototype.resize = function(flZoomRatio, intBottomBarHeightPx)
{
	//console.log("!!! debug menu controller");
	var intHeightAvailable = (window.innerHeight - intBottomBarHeightPx);
	intFinalCanvasHeight = intHeightAvailable / flZoomRatio;

	this.objCanvas.width = MenuController.WIDTH;
	this.objCanvas.height = intFinalCanvasHeight;
	
    //this.objDivContainer.style.height = intHeightAvailable + 'px';

    this.objCanvas.style.width = (MenuController.WIDTH * flZoomRatio) + 'px';
    this.objCanvas.style.height = intHeightAvailable + 'px';

    this.objGuiController.objGuiView.blDirty = true;
    
    this.intrelation = flZoomRatio;
    this.flZoomRatio = flZoomRatio;

    if (this.intState == MenuController.HIDDEN)
    {
    	this.objDivContainer.style.right = (this.intXHiddingPosition * this.intrelation) + "px";
    }

    this.objCanvas.style.right = (this.intOffsetRight * this.intrelation) + "px";

    if (!this.blOpen)
    {
    	this.onSidebarHidden();
    }
}

/**
 * To init this class
 */
DebugMenuController.prototype.run = function()
{
    switch ( this.intState )
    {
        case MenuController.START_HIDING :
            this.intInitX = this.intXShowingPosition;
            this.intChangeX = this.intXHiddingPosition - this.intXShowingPosition;
            this.intInitTime = (new Date()).getTime();
            this.intCurrentTime = 0;
            this.intState = MenuController.HIDDING;
            break;
        case MenuController.START_SHOW :
            this.intInitX = this.intXHiddingPosition;
            this.intChangeX = this.intXShowingPosition - this.intXHiddingPosition;
            this.intInitTime = (new Date()).getTime();
            this.intCurrentTime = 0;
            this.intState = MenuController.SHOWING;
            break;
        case MenuController.HIDDING:case MenuController.SHOWING:
            
            var intNow = (new Date()).getTime();
        
            var intGapTime = ( intNow - this.intInitTime);
            
            var intExecutionTimes = Math.floor (intGapTime / MenuController.ANIMATION_T);
            
            if (intExecutionTimes > 3)
            {
                intExecutionTimes = 3;
            }
             
            this.intCurrentTime += intExecutionTimes * MenuController.ANIMATION_T;
            
            if (this.intCurrentTime <= this.intTotalTime )
            {
				this.objDivContainer.style.right = (Bounce.easeOut(this.intCurrentTime, this.intInitX, this.intChangeX, this.intTotalTime ) * this.intrelation) + "px";
                this.objMenuView.blDirty = true;
            }
            else
            {
            	//do the last bit
           		this.objDivContainer.style.right = (Bounce.easeOut(this.intTotalTime, this.intInitX, this.intChangeX, this.intTotalTime ) * this.intrelation) + "px";
           		
            	if (this.intState == MenuController.HIDDING)
            	{
            		this.intState = MenuController.HIDDEN;
            		this.blOnAnimationProcessed = false;
            		this.onSidebarHidden();
            	}
            	else
            	{
            		this.intState = MenuController.VISIBLE;
            		this.blOnAnimationProcessed = false;
            	}
            }
            break;
        case MenuController.HIDDEN:
        	
        	break;
        case MenuController.VISIBLE:
        	
        	break;
    }
}

/**
 * Called when menu hiding is finished 
 */
DebugMenuController.prototype.onSidebarHidden = function()
{
	this.blOpen = false;

	//remember current position
	this.btnTabOpenPositionY = this.btnTabOpen.getY();

	//for other devices we can remove even the top transparent part that is on top of the button
	this.objDivContainer.style.height = (this.btnTabOpen.getHeight() * this.intrelation) + "px";
	this.objDivContainer.style.top = Math.floor(this.btnTabOpenPositionY * this.intrelation) + "px";

	//position canvas to the original position of the button
	this.objCanvas.style.top = (-1 * this.btnTabOpenPositionY * this.intrelation) + "px";
}

/**
 * Called before menu starts showing 
 */
DebugMenuController.prototype.onSidebarStartShowing = function()
{
	this.blOpen = true;
	this.objDivContainer.style.height = "auto";
	
	this.objDivContainer.style.top = 0;

	//position canvas to the original position of the button
	this.objCanvas.style.top = 0;
}

/**
 * called to remove current debug buttons and another elements 
 */
DebugMenuController.prototype.removeAllDebugItems = function()
{
	for (var i in this.arrDebugButtons)
	{
		var button = this.arrDebugButtons[i];
		
		//start removing from controller and from view
		this.objGuiController.removeElementByObject(button);
		this.objGuiController.getGuiView().removeElementByObject(button.getViewObject());
	}
	//empty the array of debug buttons
	this.arrDebugButtons = [];

	//set debug inactive
	this.setDebugActive(false);
}

/**
 * Add debug button
 * 
 * @param {String} strIdAction
 * @param {String} strButtonText
 */
DebugMenuController.prototype.addDebugButton = function(strIdAction, strButtonText)
{
	var objGuiView = this.objGuiController.getGuiView();
	var strNewButtonId = "debug_button_" + this.arrDebugButtons.length;
	var objImage = this.btnDebugButtonTemplateView.arrStates["off"].objImage; //get image of original state

	//create text box for button
	var objButtonTextView = new TextBoxView(strButtonText, "black", 0, 0, objImage.width, objImage.height);
	
	//create button view
	var objDebugButtonView = new DebugButtonView(strNewButtonId, objButtonTextView, strIdAction);
	objDebugButtonView.setContext(objGuiView.context);

	//init view object
    objDebugButtonView.init(objGuiView.context, objImage);
    objDebugButtonView.arrStates = this.btnDebugButtonTemplateView.arrStates;

    //set parent of this view object
    objDebugButtonView.setParent(objGuiView);

	var intButtonSpacing = 10;
	var intOffsetTop = 20;
	
	var y = intOffsetTop + ((this.btnDebugButtonTemplateView.getHeight() + intButtonSpacing) * this.arrDebugButtons.length);
	objDebugButtonView.setXY(this.btnDebugButtonTemplateView.getX(), y);

	var objButtonController = new ButtonController(objDebugButtonView);
	
	//assign onclick event
	objButtonController.addListener(ButtonController.STATE_CLICK, this.onDebugButtonClick);
	
	//add the button
	this.arrDebugButtons.push(objButtonController);

	var intLayer = 1;
	this.objGuiController.addElement(intLayer, strNewButtonId, objButtonController);
	objGuiView.addElement(intLayer, strNewButtonId, objDebugButtonView);
}

/**
 * On Debug Button Click
 * At the moment only one selected button at a time is supported
 * TODO: Add more than one item into DebugQueue
 *
 * @param {EventControllerEvent} objEvent
 * @param {Object} objButtonView
 * @param {Number} x
 * @param {Number} y
 */
DebugMenuController.prototype.onDebugButtonClick = function(objEvent, objButtonView, x, y)
{
	objEvent.stopPropagation();

	//ignore queue for now
	this.objDebugQueue.clear();
	
	//button visible states
	var blAddDebugAction = true;
	
	for (var i in this.arrDebugButtons)
	{
		var objButton = this.arrDebugButtons[i];
		var objButtonViewTemp = objButton.getViewObject();

		if (objButtonViewTemp.isSelected())
		{
			if (objButtonViewTemp == objButtonView)
			{
				//on this case don't add debug action
				blAddDebugAction = false;
			}
			objButtonViewTemp.setSelected(false);
		}
	}
	
	if (blAddDebugAction) {
		//add new debug item into debug queue
		
		var strDebugActionId = objButtonView.getDebugActionId();
		var objDebugItem = new DebugItem(strDebugActionId);
		
		objButtonView.setSelected(true);
		
		this.objDebugQueue.addItem(objDebugItem);
	}

	this.notifyGameCurrentDebug(this.objDebugQueue.getCurrentItem());
}

/**
 * Send a message to the game to fix next result (or not to fix in case of objDebugItem == null)
 * 
 * @param {mixed} objDebugItem (null in case of "no debug")
 */
DebugMenuController.prototype.notifyGameCurrentDebug = function(objDebugItem)
{
	var strDebugActionId = null;
	if (objDebugItem != null)
	{
		strDebugActionId = objDebugItem.getActionId();
	}
	console.log("notify debug", strDebugActionId);
	
	var objMessage = new Object();
	objMessage.strDebugActionId = strDebugActionId;
	var strMessage = JSON.stringify({ type: "debug", actionId: strDebugActionId });
	IFrameController.sendMessageToIframe("debug", strMessage);

	//set if the debugging is active at the moment
	this.setDebugActive((objDebugItem == null) ? false : true);
}

DebugMenuController.prototype.onDebugResponseReceived = function()
{
	console.log("onDebugResponseReceived");
	//clear debug queue
	//TODO: change to support debug queue
	this.objDebugQueue.clear();

	for (var i in this.arrDebugButtons)
	{
		var objButton = this.arrDebugButtons[i];
		var objButtonViewTemp = objButton.getViewObject();

		if (objButtonViewTemp.isSelected())
		{
			objButtonViewTemp.setSelected(false);
		}
	}
	this.setDebugActive(false);

}

/**
 * Set if the debug is active at the moment (will change buttons to green / black state) 
 * @param {boolean} blActive
 */
DebugMenuController.prototype.setDebugActive = function(blActive)
{
	var strState = "normal";
	if (blActive) {
		strState = "active";
	}
	this.btnTabOpen.setState(strState);
	this.btnTabClose.setState(strState);
}
