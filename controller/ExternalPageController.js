/**
 * The intention here is to be in control of any pages we are launching
 * over and above the actual game. We have asked the game for the URI to 
 * a page (help, rules, paytable etc) and we want to launch it here in 
 * the sidebar project. 
 */
function ExternalPageController(deviceModel, objCanvasQueue, objContainer, objBottomBarController, objSidebarController, objDebugController, jsonMsg)
{
	ExternalPageController.objCanvasQueue = objCanvasQueue;
	this.deviceModel = deviceModel;
    this.objContainer = objContainer;
	this.objBottomBarController = objBottomBarController;
	this.objSidebarController = objSidebarController;
	
	this.objJSON = jsonMsg;

    this.closeButton;

	ExternalPageController.objIFrame;

	this.createIFrame = this.createIFrame.bind(this);
	this.closeExternalPage = this.closeExternalPage.bind(this);
	
	this.btnViewOpen = this.objSidebarController.objGuiController.getButtonByID("leftMenu").getViewObject();

	//init
    this.initCloseButton();
}
Class.extend(Class, ExternalPageController);

/**
 * Creates an IFrame and returns a reference to it. 
 */
ExternalPageController.prototype.createIFrame = function()
{
	/*
	 * Create IFrame
	 */
	ExternalPageController.objIFrame = document.createElement("iframe");
	ExternalPageController.objIFrame.id = "externalPage";
    ExternalPageController.objIFrame.ontouchstart = function(event) { EventBase.preventDefault(event); }
    ExternalPageController.objIFrame.ontouchmove = function(event) { EventBase.preventDefault(event);}
	
	//add onload function to the iframe
	var strUrl = this.objJSON.actionType;
	ExternalPageController.objIFrame.style.opacity = 0; //hide, show it after page is loaded
	ExternalPageController.objIFrame.onload = this.onPageLoad;
	ExternalPageController.objIFrame.onerror = this.onPageLoad;

	ExternalPageController.objIFrame.setAttribute("src", strUrl);
	ExternalPageController.objIFrame.setAttribute("frameBorder", 0); //remove borderv
	ExternalPageController.objIFrame.setAttribute("scrolling", "no"); //iOS fix
	
	this.resize();
	
	/*
	 * Interesting things
	 */
	ExternalPageController.objIFrame.className = this.objJSON.type;
	ExternalPageController.objIFrame.seamless = true;
	
	/*
	 * Lock sidebar
	 */
	this.objSidebarController.setSidebarEnabled(false);
	
    /*
     * Return to StateFactory
     */
    document.body.appendChild(ExternalPageController.objIFrame);
    ExternalPageController.objCanvasQueue.showOnly("bottom");
};

ExternalPageController.prototype.initCloseButton= function()
{
    /**
     * Create Div 
     */
    ExternalPageController.objDiv = document.createElement("div");
    ExternalPageController.objDiv.id = "closeButton";
    
    /**
     * Size 
     */
    ExternalPageController.objDiv.style.position = "absolute";
    ExternalPageController.objDiv.style.right = 0;
    /*
    ExternalPageController.objDiv.style.width = "75px";//window.innerWidth - (intXOffset * 2) + "px";
    ExternalPageController.objDiv.style.top = "7" + "%"//intYOffset + "px";
    ExternalPageController.objDiv.style.height = "52px";//window.innerHeight - (intXOffset + intHeightPx) + "px";
    */
   
	this.resizeCloseButton();
    ExternalPageController.objDiv.style.zIndex = 3;
    
    document.getElementById("sidebar-wrapper").appendChild(ExternalPageController.objDiv);
    
    /**
     * Event 
     */
    
    ExternalPageController.objDiv.addEventListener("click", this.closeExternalPage);
    ExternalPageController.objDiv.addEventListener("touchend", this.closeExternalPage);
};

ExternalPageController.prototype.closeExternalPage = function(event)
{
    /*
     * Unlock sidebar
     */
    this.objSidebarController.setSidebarEnabled(true);
    EventBase.preventDefault(event);
    event.stopPropagation();
    console.log("closing external page");
    ExternalPageController.closeController(); //hide close button + hide iframe + restore game
    
    
}

ExternalPageController.closeController = function()
{
    ExternalPageController.objCanvasQueue.restoreAll();
    if (ExternalPageController.objDiv.parentNode) 
    {
      ExternalPageController.objDiv.parentNode.removeChild(ExternalPageController.objDiv);
    }
    
    if(ExternalPageController.objIFrame.parentNode) 
    {
        ExternalPageController.objIFrame.parentNode.removeChild(ExternalPageController.objIFrame);
    }
    
    IFrameController.sendMessageToIframe("Button", "helpClose");
}

ExternalPageController.prototype.resize = function()
{
	if (!ExternalPageController.objIFrame)
	{
		return;
	}
	/*
	 * Size
	 */

	/*
    var intXOffset = 96 * window.innerWidth/ 1024;
    var intYOffset = 88 * window.innerHeight/ 768;

    ExternalPageController.objIFrame.style.width = window.innerWidth - (intXOffset * 2) + "px";
    ExternalPageController.objIFrame.style.top = intYOffset + "px";
    ExternalPageController.objIFrame.style.left = (intXOffset) + "px";
    ExternalPageController.objIFrame.style.height = window.innerHeight - (intXOffset + this.objBottomBarController.intHeightPx) + "px";
    */
    ExternalPageController.objIFrame.style.width = window.innerWidth + "px";
    ExternalPageController.objIFrame.style.height = (window.innerHeight - this.objBottomBarController.intHeightPx) + "px";
    
    this.resizeCloseButton();
}

ExternalPageController.prototype.onPageLoad = function()
{
	var strUrl = ExternalPageController.objIFrame.getAttribute("src");

	//make iframe visible
	ExternalPageController.objIFrame.style.opacity = 1;
	//send message to the game to hide loading
	IFrameController.sendMessageToIframe("Button", "externalPageLoaded");
}

ExternalPageController.prototype.resizeCloseButton = function()
{
	var intHeightOriginalImage = 52;
	var intHeight = (this.btnViewOpen.getHeight() * this.objSidebarController.intrelation);
	ExternalPageController.objDiv.style.width = (this.btnViewOpen.getWidth() * this.objSidebarController.intrelation) + "px";
	ExternalPageController.objDiv.style.height = intHeight + "px";
	ExternalPageController.objDiv.style.top = (this.btnViewOpen.getY() * this.objSidebarController.intrelation) + "px";
    ExternalPageController.objDiv.style.background = "url(res/btn_help_close.png) no-repeat top left";
    ExternalPageController.objDiv.style.backgroundSize = ((this.btnViewOpen.getHeight() / intHeightOriginalImage) * 100) + "%";
}

/**
 * Is external controller visible at the moment? 
 *
 * @return {boolean} 
 */
ExternalPageController.prototype.isVisible = function()
{
	//determine if the iframe is in the page
	if (ExternalPageController.objIFrame && ExternalPageController.objIFrame.parentNode != null) 
	{
		return true;
	}
	return false;
}
