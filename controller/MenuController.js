/**
 * @author Javier.Ortega
 * 
 * This class will handle the specific functionalities for the Menu Controler,
 * sidebar in the left
 */


/**
 * Constructor
 * @param { Object } objBottomBar The height of the bottom bar
 * @param { Object } objGuiController The height of the bottom bar
 * @param { Object } intHeightBottomBar The height of the bottom bar
 */
function MenuController( objBottomBar, objDeviceModel, objGuiController, objIframeController, objScreenCoverController , fncCallLangLoaded)
{
    this.resourcesLoaded = this.resourcesLoaded.bind (this);
    
    this.handlerSymbolClicked = this.handlerSymbolClicked.bind (this);
    
    this.handleClickOpenTab = this.handleClickOpenTab.bind (this);
    
    this.handleClickSound = this.handleClickSound.bind(this);  
    
    this.handleStart = this.handleStart.bind(this);
    
    this.handleClickPayTable = this.handleClickPayTable.bind(this);
    this.handleClickSettings = this.handleClickSettings.bind(this);
    this.handleClickHelp = this.handleClickHelp.bind(this);

    this.getArrStrElements = this.getArrStrElements.bind(this);
    
    this.fncCallLangLoaded = fncCallLangLoaded;

    /**
     * This is the controller for the Iframe
     * 
     * @type { Object }
     * 
     */
    this.objIframeController = objIframeController;
    
    /**
     * This is the div container for the canvas
     * @type {Object}
     */
    this.objDivContainer = document.getElementById('sideBarArea');
    
    /**
     * This canvas reference
     * @type {Object}
     */    
    this.objCanvas = document.getElementById('sideBar');
    
    this.model = new MenuModel();
    
    /**
     * A reference to the controller for the Bottombar
     * @type {Object}
     */    
    this.objBottomBar = objBottomBar;
    
    /**
     * A refernce to the Gui controller for the reels
     * @type {Object}
     */
    this.objGuiController = objGuiController;
    
    this.objGuiController.blEnableGroup = true;
    this.objScreenCoverController = objScreenCoverController;
    
    this.create(objDeviceModel, objGuiController );

    /**
     * The assets Factory
     * @type {Object}
     */
    this.objAssetsFactory = new AssetsFactory(); 

	/*    
    var that = this;
    this.mainRunLoop = setInterval(function() 
    {
        that.run();
    }, 40 );
    */

	this.run = this.run.bind(this);
	//add to loop
	var objMainLoop = MainLoop.getInstance();
	objMainLoop.addItem(this.run);
	objMainLoop.start(); //make sure the loop is running
    
    /**
     * The state
     * @type {int}
     */  
    this.intState = MenuController.STOP;
    
    this.arrHandlers = [];
    
    this.loadNeededResources();
    
    this.objMenuView = objGuiController.objGuiView;
    
    this.arrBtn = [];

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
    this.intTotalTime = 4000;
    /**
     * Specifies the current time, between 0 and duration inclusive.
     * @type { integer }
     */
    this.intCurrentTime;
    
    /**
     * Y coordinate for the hidding position
     * 
     * @type { int }
     */
    this.intXHiddingPosition = this.objMenuView.intX - MenuController.HIDE_WIDTH;
 
    /**
     * Y coordinate for the showing position 
     * @type { int }
     */
    this.intXShowingPosition = this.objMenuView.intX;
    
    /**
     * Time when the animation starts
     * @type { integer }
     * 
     */
    this.intInitTime = 0;    
    
    this.objMenuView.getButtonView("glow").setVisible(false);
    
    this.hideBar = this.hideBar.bind(this);
    this.onCoverScreenClick = this.onCoverScreenClick.bind(this);
    
    this.intLastTouchPositionY = 0;
    
    this.arrScrollableElements = [];
    this.intScrollableElementsHeight = [];
    
    this.blDisableButtonClick = false;
    
    this.intrelation = 1;
    
    this.objMenuView.blVisible = false;
}

MenuController.WIDTH = 240;
MenuController.HEIGHT = 768;

MenuController.INIT_Y = 25;
MenuController.INIT_OFFSET_Y = 89;
MenuController.INIT_TEXT_OFFSET_Y = 50;

//States for the different animations//////////////
MenuController.STOP = -1;
MenuController.START_SHOW = 0;
MenuController.SHOWING = 1;
MenuController.START_HIDING = 2;
MenuController.HIDDING = 3;
MenuController.VISIBLE = 4;
MenuController.HIDDEN = 5;
///////////////////////////////////////////////////
MenuController.ANIMATION_T = 80;
MenuController.HIDE_WIDTH = 165;

/**
 * Derive MenuController from our base type to provide inheritance
 */ 
Class.extend(ScreenLogicController, MenuController);
/**
 * Callback to be called when all the extra resources needed are ready
 * @param { Array } arrResources The array containing the image for the reels
 */ 
MenuController.prototype.resourcesLoaded = function (arrResources)
{
    var i;
    this.objEnabledOptions = arrResources["optionsSideBar.json"];
    
    // HACK to deal with HTC Desire X
    if (navigator.userAgent.match (/HTC_DESIRE_X/i))
    {
        for (i = 0 ; i < this.objEnabledOptions.options.length ; i++)
        {
            if(this.objEnabledOptions.options[i].name == "soundOn" ||  this.objEnabledOptions.options[i].name == "soundOff")
            {
                this.objEnabledOptions.options[i].enabled = false;
            }
        }
        
    }

    /**
     * Which game to load: 
     * Currently if we are building for VF there's a game name in the startup params.
     * Legacy sidebar code has it that we hardcode the game name in the optionsJSON file.
     * This does not scale to >1 game.
     * Instead, here we are specifying "#defines" to use either that (if not VF build) or the 
     * engine name arriving in the URI.
     */
    var a = document.createElement('a');
    
    /*
     * Default setting for non-VF builds
     */
    var strHref = this.objEnabledOptions.gameUrl;


    /*
     * Load whatever we specified above.
     */
    a.href = strHref;
    console.log("Sidebar is loading " + a.href + " into the game iFrame.");
    IFrameController.appUrl = a.href;

    /*
     * 
     * We use this boolean to avoid unnecessary resizes, since this is creating memory leaks in some devices
     * If the loading screen exists, since this screen is not part of the Iframe, it will not be a problem
     */
    if (IFrameController.blResized)
    {
        DomBuilder.createLoaderScreen();
        this.objIframeController.objIFrame.src = IFrameController.appUrl;
    }
    
    this.objLang = arrResources["langSideBar.json"];
    
    
    this.fncCallLangLoaded(this.objLang);
    
    this.enableVFBtn();
    
    this.initButtons();
    this.initButtonHandlers();
    this.addListeners();
    
    var objGlowView = new ElementView (this);    
    var imState = arrResources["btn_glow.png"];
    
    objGlowView.init(this.context,  imState);    
    objGlowView.intWidth = imState.width;
    objGlowView.intHeight = imState.height;
    objGlowView.setVisible(false);
    
    //this.objMenuView.addElement(3,"glow",objGlowView);
   
   this.initScreenCoverController();
   this.handleClickOpenTab();
   
   this.setHidden(true);
   
   this.objMenuView.blVisible = true;
}

MenuController.prototype.initScreenCoverController = function()
{
	this.objScreenCoverController.addOnHideCallback(this.onCoverScreenClick);
}

/**
 * Initialize the set of buttons
 * 
 */ 
MenuController.prototype.initButtonHandlers = function ()
{
	/**
	 * These are the button/handler links for any url's that arrive
	 * in the server config startup e.g. from VF. It gives us
	 * an automated way to handle sidebar linking.
	 * Any custom buttons we want to link to a URI we do in the normal
	 * way of linking a CLICK handler elsewhere (e.g. Paytable button) 
	 */
    this.arrHandlers ['home'] = this.handleClickLobby;
    this.arrHandlers ['Sounds'] = this.handleClickSound;
    this.arrHandlers ['help'] = this.handleClickHelp;
    this.arrHandlers ['info'] = this.handleClickInfo;
    this.arrHandlers ['deposit'] = this.handleClickDeposit;
    this.arrHandlers ['withdraw'] = this.handleClickWithDraw;
    this.arrHandlers ['cashier'] = this.handleClickCashier;
    this.arrHandlers ['support'] = this.handleClickSupport;
    this.arrHandlers ['transactions'] = this.handleClickTransactions;
    this.arrHandlers ['playForReal'] = this.handleClickPlayForReal;
    this.arrHandlers ['login'] = this.handleClickLogin;
    this.arrHandlers ['logout'] = this.handleClickLogout;
    this.arrHandlers ['responsiblegamblinglink2'] = this.handleClickGambling2;
    this.arrHandlers ['responsiblegamblinglink3'] = this.handleClickGambling3;
}

/**
 *  To initialize all the buttons
 */
MenuController.prototype.initButtons = function()
{
    var name;

    var intEnabled;

    var intBtnY;

    var intTextX;

    var intCount = 0;
    var intBottomLimit = 0;
    
    this.arrScrollableElements = [];

    // order objMenuView layers to match optionsSideBar.json and store in "arrElements2d"
    var arrElements2d =  this.getArrStrElements();

    //Hide all the options which are not defined in optionsSideBar.json
    for (var i = 0; i < arrElements2d.length; i++)
    {
        for (var x = 0; x < arrElements2d[i].length; x++)
        {
            var strElement = arrElements2d[i][x];

            intEnabled = this.lookForEnabledID(strElement)
            
            //The button is in optionsSideBar.json but is not enabled
            if (intEnabled == -2)
            {
                this.objMenuView.arrLayers[i][strElement].setVisible(false);                                
                //intCount++;
            }
             //The button is in  defined in optionsSideBar.json, so we will enable it
            else if (intEnabled != -1)
            {
                intBtnY = MenuController.INIT_Y + MenuController.INIT_OFFSET_Y * intEnabled;

                if ( this.objMenuView.arrLayers[i][strElement].strType == "txt" )
                {                   
                   intBtnY += MenuController.INIT_TEXT_OFFSET_Y;                   
                   this.objMenuView.arrLayers[i][strElement].setText( this.objLang[this.model.arrNames[strElement]].text );
                }
                
                this.objMenuView.arrLayers[i][strElement].intX = (MenuController.HIDE_WIDTH / 2) -  (this.objMenuView.arrLayers[i][strElement].intWidth /2);
                this.objMenuView.arrLayers[i][strElement].intY = intBtnY;
                this.objMenuView.arrLayers[i][strElement].setVisible(true);
                this.objMenuView.arrLayers[i][strElement].blGroupClicked = true;
                this.objGuiController.getButtonByID(strElement).blGroupClicked = true;
                
                this.objMenuView.arrLayers[i][strElement].blSwipe = true;
                
                this.objGuiController.elementControllers[i][strElement].updateBounds();
              
              	var intNewBottomLimit = intBtnY + this.objMenuView.arrLayers[i][strElement].intHeight + MenuController.INIT_TEXT_OFFSET_Y;
				if (intNewBottomLimit > intBottomLimit)
				{
					intBottomLimit = intNewBottomLimit;
				}
                
                this.arrScrollableElements.push(this.objMenuView.arrLayers[i][strElement]);
                this.intScrollableElementsHeight = intBottomLimit;
            }
        }
    }
    
    
    console.log ("intBottomLimit:" + intBottomLimit);
    this.objGuiController.intSwipeBottomY = -intBottomLimit + 200;
    this.objMenuView.getButtonView("soundOff").intX = this.objMenuView.getButtonView("soundOn").intX;
    this.objMenuView.getButtonView("soundOff").intY = this.objMenuView.getButtonView("soundOn").intY;
    this.objMenuView.getButtonView("soundOff").blSwipe = true;
    this.objMenuView.getButtonView("soundOff").blGroupClicked = true;
    
    this.objGuiController.getButtonByID("soundOff").blGroupClicked = true;
    
    this.objGuiController.getButtonByID("soundOff").updateBounds();
    
    this.updateScrollLimits();
}

MenuController.prototype.getArrStrElements = function ()
{
    // Create arrElements2d to store elements
    var arrElements2d = new Array(this.objMenuView.arrLayers.length);

    // populate arrElements2d with strElements
    for (var a = 0; a < this.objMenuView.arrLayers.length; a++)
    {
        arrElements2d[a] = new Array();

        for (strElement in this.objMenuView.arrLayers[a])
        {
            arrElements2d[a].push(strElement);
        }
    }

    // bubble sort arrStrElements to match optionsSideBar.json
    var tempElement = null;

    for (var i = 0; i < this.objEnabledOptions.options.length; i++)
    {
        for (var layerCount = 0; layerCount < arrElements2d.length; layerCount++)
        {
            for (var layerElement = 0; layerElement < arrElements2d[layerCount].length; layerElement++)
            {
                var strElement = arrElements2d[layerCount][layerElement];
                if ((this.objEnabledOptions.options[i].name == strElement)
                    && (i < layerElement))
                {
                    tempElement = arrElements2d[layerCount][i];
                    arrElements2d[layerCount][i] = strElement;
                    arrElements2d[layerCount][layerElement] = tempElement;
                }
            }
        }
    }

    return arrElements2d;
}

MenuController.prototype.updateScrollLimits = function()
{
	//find scroll value for touch scrolling
    var intMaxValue = 0;
    var intScrollOffsetBottom = 200;
    var intCanvasHeight = this.objGuiController.getCanvas().height;
    
    if ((this.intScrollableElementsHeight + intScrollOffsetBottom) > (intCanvasHeight))
    {
    	intMaxValue = ((this.intScrollableElementsHeight + intScrollOffsetBottom) - intCanvasHeight);
    }
    
}

/**
 *  To look for the button in the list of enabled elements
 * @return A number with the index of the element or -1 if the element is not in
 * the list
 */

MenuController.prototype.lookForEnabledID = function(strID)
{
    var intCount = 0;
    for ( var i = 0; i < this.objEnabledOptions.options.length; i++ )
    {
        if ( strID == this.objEnabledOptions.options[i].name )
        {
            if ( this.objEnabledOptions.options[i].enabled == "true" )
            {
                return intCount;
            }
            else
            {
                return -2;
            }
        }
        
        if (this.objEnabledOptions.options[i].enabled == "true")
        {
            intCount++;
        }
    }
    return -1;
}

/**
 * This adds the listeners 
 */
MenuController.prototype.addListeners = function()
{
	/*
	 * These are special-state buttons only, not the normal menu buttons.
	 * Use this style for buttons requiring special states/dual states
	 */
    this.btnTabOpen = this.objGuiController.objGuiView.getElement(1,"leftMenu");
    this.btnTabClose = this.objGuiController.objGuiView.getElement(1,"leftMenuNeg");
    this.objGuiController.getButtonByID("leftMenu").addListener(ButtonController.STATE_CLICK, this.handleClickOpenTab);
    this.objGuiController.getButtonByID("leftMenuNeg").addListener(ButtonController.STATE_CLICK, this.handleClickOpenTab);
    //TO DO
    this.objGuiController.getButtonByID("soundOn").addListener(ButtonController.STATE_CLICK, this.handleClickSound);
    this.objGuiController.getButtonByID("soundOff").addListener(ButtonController.STATE_CLICK, this.handleClickSound);

    this.objGuiController.getButtonByID("leftMenuNeg").addListener(ButtonController.STATE_CLICK, this.handleStart);
    this.objGuiController.getButtonByID("soundOn").addListener(ButtonController.STATE_CLICK, this.handleStart);
    this.objGuiController.getButtonByID("soundOff").addListener(ButtonController.STATE_CLICK, this.handleStart);
    
    this.objGuiController.getButtonByID("paytable").addListener(ButtonController.STATE_CLICK, this.handleClickPayTable);
    
    this.objGuiController.getButtonByID("settings").addListener(ButtonController.STATE_CLICK, this.handleClickSettings);
    
    //TO DO
    //this.btnTabOpen.blEnableOffsetY = false;
    var strName;
        
        
    /*
     * Array of standard menu button handlers for common sidebar items
     */
    for (var i = 0; i < this.model.arrButtons.length; i++)
    {
        strName = this.model.arrButtons[i];
        
        this.arrBtn[strName] =  this.objGuiController.getButtonByID( strName);
        
        if (this.arrBtn[strName])
        {
            this.arrBtn[strName].handleStart = this.handleStart;

            if (this.arrHandlers[strName])
            {
                this.arrHandlers[strName] = this.arrHandlers[strName].bind (this);
                this.arrBtn[strName].addListener(ButtonController.STATE_CLICK, this.arrHandlers[strName]);                
            }
        }
    }
}


/**
 *  Load the needed resources
 * 
 */ 
MenuController.prototype.loadNeededResources = function ()
{
    this.objAssetsFactory.getResources(this.resourcesLoaded, ["optionsSideBar.json","langSideBar.json","btn_glow.png"]);
}


/**
 * Handle the symbol selected in the reels
 * @param { Integer } intX The clicked x coordinate
 * @param { Integer } intY The clicked y coordinate 
 */
MenuController.prototype.handlerSymbolClicked = function ( intX, intY )
{

}

/**
 * This reads info from VF to enable buttons or not 
 */
MenuController.prototype.enableVFBtn = function()
{

    var objBtn;
    for (var i = 0; i < this.model.arrButtons.length; i++)
    {
        objBtn = this.lookDataForButton(this.model.arrButtons[i]);
        if (objBtn)
        {
            if (MenuController.config[this.model.arrUrls[i]])
            {
                objBtn.enabled = "true";
                objBtn.url = MenuController.config[this.model.arrUrls[i]];
            }
            else
            {
                objBtn.enabled = "false";
                this.setEnabledID(this.model.arrButtons[i]);
            }
        }
    }
}

MenuController.prototype.handleStart = function(objElement)
{
    this.selectButton(objElement);
}

/**
 *  To look for the button in the list of enabled elements
 * @return A number with the index of the element or -1 if the element is not in the list
 */
MenuController.prototype.setEnabledID = function(strID)
{
    var intCount = 0;
    for (var i = 0; i < this.objEnabledOptions.options.length; i++)
    {
        if (this.objEnabledOptions.options[i].enabled == "true")
        {
            if (strID == this.objEnabledOptions.options[i].name)
            {
                this.objEnabledOptions.options[i].enabled = "false";
            }
        }
    }
} 


/**
 *  To look for the button in the list of enabled elements
 * @return A url for this button or "" if the btn doesn't exist in the list
 */
MenuController.prototype.lookForEnabledURL = function(strID)
{

    for (var i = 0; i < this.objEnabledOptions.options.length; i++)
    {
        if (strID == this.objEnabledOptions.options[i].name)
        {
            return this.objEnabledOptions.options[i].url;
        }
    }
    return "";
}

/**
 * 
 */
MenuController.prototype.lookDataForButton = function(strID)
{
    for (var i = 0; i < this.objEnabledOptions.options.length; i++)
    {
        if (strID == this.objEnabledOptions.options[i].name)
        {
            return this.objEnabledOptions.options[i];
        }
    }
    return null;
}


/**
 *  To  initialize the object
 */
MenuController.prototype.handleClickOpenTab = function()
{
    if (this.intState == MenuController.START_SHOW ||
        this.intState == MenuController.START_HIDING)
    {
        return;
    }

/*
    if ( MenuController.blOpenEnable )
    {
        // this.objMenuView.move(0, 0);
    }
    else
    {
        //this.objMenuView.move(-deviceProperties.intWidthSideBar, 0);
        this.btnTabOpen.blVisible = true;
        this.btnTabClose.blVisible = false;
        this.intState = MenuController.START_HIDING;
        this.btnTabClose.update();
        MenuController.blOpenEnable = true;
        this.setScreenCoverVisibility(false);
    }

    this.unSelectButton();
*/
	this.setHidden(this.isVisible());
};

/**
 * Set visibility (start hide / show animation)
 * @param {boolean} blHidden
 */
MenuController.prototype.setHidden = function(blHidden)
{
	if (this.blVisible == !blHidden)
	{
		return;
	}
	
	this.blVisible = !blHidden;

	if (this.blVisible)
	{
	    IFrameController.sendMessageToIframe("panel", "showing");
		this.showBar();
	}
	else
	{
		this.hideBar();
	}
}

/**
 * is visible?
 * @return {boolean}
 */
MenuController.prototype.isVisible = function()
{
	return this.blVisible;
}

/**
 * called on cover screen click 
 */
MenuController.prototype.onCoverScreenClick = function()
{
	if (this.isVisible())
	{
		this.setHidden(true);
	}
}


/**
 *  To hide or show the sidebar
 * @param { Boolean } blShow 
 */
MenuController.prototype.showSideBar = function(blShow)
{
    this.intState = MenuController.START_SHOW;
}

/**
 *  Place the image glow in the correct place
 * @param {Object} button
 */
MenuController.prototype.selectButton = function(button)
{
    //this.imGlow.intX = button.intX + (button.imImage.objImage.width / 2 ) - (MenuController.GLOW_WIDTH / 2);
    //this.imGlow.intY = button.intY + (button.imImage.objImage.height / 2 ) - (MenuController.GLOW_HEIGHT / 2);
    //this.imGlow.imImage.setXY(this.imGlow.intX, this.imGlow.intY);
    //this.imGlow.blVisible = true;
    //this.objMenuView.blDirty = true;
}

MenuController.GLOW_WIDTH = 24;
MenuController.GLOW_HEIGHT = 24;

/**
 * Make the glow not visible
 * @param {Object} button
 */
MenuController.prototype.unSelectButton = function(button)
{
    //this.imGlow.blVisible = false;
    //this.objMenuView.blDirty = true;
}

/**
 *  To  initialize the object
 */

MenuController.prototype.handleClickLobby = function(x, y)
{
	if (this.blDisableButtonClick)
	{
		return;
	}

    this.unSelectButton();
    window.location.href = this.lookForEnabledURL("home");
}

MenuController.prototype.handleClickPayTable = function(x, y)
{
	if (this.blDisableButtonClick)
	{
		return;
	}
    IFrameController.sendMessageToIframe("Button", "paytable");
/*	// HACK
    //IFrameController.sendMessageToIframe("Button", "PayTable");
    var obj = {};
    obj.freespins = true;
    obj.arrReelPositions = [2,3,4,5,6];
    var msg = JSON.stringify(obj);
	IFrameController.sendMessageToIframe("DebugPanel", msg);
*/

	this.setHidden(true);
}

MenuController.blSound = true;

MenuController.prototype.handleClickSound = function(x, y)
{
	if (this.blDisableButtonClick)
	{
		return;
	}

    if (MenuController.blSound)
    {
        MenuController.blSound = false;

        this.objGuiController.objGuiView.getButtonView("soundOff").setVisible(true);
        this.objGuiController.objGuiView.getButtonView("soundOn").setVisible(false);
        
        IFrameController.sendMessageToIframe("Button", "sound_off");
    }
    else
    {
        MenuController.blSound = true;
        
        this.objGuiController.objGuiView.getButtonView("soundOff").setVisible(false);
        this.objGuiController.objGuiView.getButtonView("soundOn").setVisible(true);
        
        IFrameController.sendMessageToIframe("Button", "sound_on");
    }
    
    this.objGuiController.objGuiView.blDirty = true;

	//hide this
    this.setHidden(true);
};

/**
 *  Call this to hide the bar
 */
MenuController.prototype.hideBar = function()
{
	//will be called when bar is hiding
    this.btnTabOpen.setVisible(true);
    this.btnTabClose.setVisible(false);

    this.intState = MenuController.START_HIDING;
	
    this.handleClickOpenTab();
    this.unSelectButton();
    
    this.objScreenCoverController.setVisible(false);
}

/**
 *  Call this to show the bar
 */
MenuController.prototype.showBar = function()
{
    this.btnTabOpen.setVisible(false);
    this.btnTabClose.setVisible(true);

    this.intState = MenuController.START_SHOW;

	this.objScreenCoverController.setVisible(true);
}

MenuController.prototype.handleClickHelp = function(x, y)
{
    if (this.blDisableButtonClick)
    {
        return;
    }
    
    this.unSelectButton(); 
    //window.location.href = this.lookForEnabledURL("help");
    IFrameController.sendMessageToIframe("Button", "help");
    this.hideBar();
}

MenuController.prototype.handleClickInfo = function(x, y)
{
    this.unSelectButton();   

	if (this.blDisableButtonClick)
	{
		return;
	}

    window.location.href = this.lookForEnabledURL("info");
}
MenuController.prototype.handleClickSupport = function(x, y)
{
    this.unSelectButton(); 

	if (this.blDisableButtonClick)
	{
		return;
	}

    window.location.href = this.lookForEnabledURL("support");
}

MenuController.prototype.handleClickDeposit = function(x, y)
{
    this.unSelectButton();    

	if (this.blDisableButtonClick)
	{
		return;
	}

    window.location.href = this.lookForEnabledURL("deposit");
}

MenuController.prototype.handleClickWithDraw = function(x, y)
{
    this.unSelectButton();

	if (this.blDisableButtonClick)
	{
		return;
	}

    window.location.href = this.lookForEnabledURL("withdraw");
}
MenuController.prototype.handleClickCashier = function(x, y)
{
    this.unSelectButton();

	if (this.blDisableButtonClick)
	{
		return;
	}

    window.location.href = this.lookForEnabledURL("cashier");
}

MenuController.prototype.handleClickTransactions = function(x, y)
{
    this.unSelectButton();

	if (this.blDisableButtonClick)
	{
		return;
	}

    window.location.href = this.lookForEnabledURL("transactions");
}

MenuController.prototype.handleClickPlayForReal = function(x, y)
{
    this.unSelectButton();

	if (this.blDisableButtonClick)
	{
		return;
	}

    window.location.href = this.lookForEnabledURL("playForReal");
}

MenuController.prototype.handleClickSettings = function(objEvent, objButtonView, x, y)
{
	if (this.blDisableButtonClick)
	{
		return;
	}

	//send message to iframe
	IFrameController.sendMessageToIframe("Button", "settings");

	//hide sidebar on click
    this.setHidden(true);
}

MenuController.prototype.handleClickLogin = function(x, y)
{
    this.unSelectButton();

	if (this.blDisableButtonClick)
	{
		return;
	}

    window.location.href = this.lookForEnabledURL("logIn");
}

MenuController.prototype.handleClickLogout = function(x, y)
{
    this.unSelectButton();

	if (this.blDisableButtonClick)
	{
		return;
	}

    window.location.href = this.lookForEnabledURL("logOut");
}
//invite friend/share

MenuController.prototype.handleClickGambling2 = function(x, y)
{
    this.unSelectButton();

	if (this.blDisableButtonClick)
	{
		return;
	}


    if (this.objDeviceModel.platform != OS.ANDROID)
    {
        window.open(this.lookForEnabledURL("gambling2"));
    }
    else
    {
        this.openLinkInNewWindow(this.lookForEnabledURL("gambling2"));
    }
}

MenuController.prototype.handleClickGambling3 = function(x, y)
{
    this.unSelectButton();


	if (this.blDisableButtonClick)
	{
		return;
	}


    if (this.objDeviceModel.platform != OS.ANDROID)
    {
        window.open(this.lookForEnabledURL("gambling3"));
    }
    else
    {
        this.openLinkInNewWindow(this.lookForEnabledURL("gambling3"));    
    }
}

MenuController.prototype.openLinkInNewWindow = function(strUrl)
{
    //awful hack to avoid pop-up blocking by smart phone browser.
    var link = document.getElementById('hidden_link'), clickevent = document.createEvent('Event');

    link.href = strUrl;

    clickevent.initEvent('click', true, false);
    link.dispatchEvent(clickevent);
}

/**

 * To resize the reels canvas, when it is needed
 * 
 */
MenuController.prototype.resize = function(flZoomRatio, intBottomBarHeightPx)
{
	var intHeightAvailable = (window.innerHeight - intBottomBarHeightPx);
	intFinalCanvasHeight = intHeightAvailable / flZoomRatio;

	this.objCanvas.width = MenuController.WIDTH;
	this.objCanvas.height = intFinalCanvasHeight;

    this.objDivContainer.style.height = intHeightAvailable + 'px';

    this.objCanvas.style.width = (MenuController.WIDTH * flZoomRatio) + 'px';
    this.objCanvas.style.height = intHeightAvailable + 'px';

    this.objGuiController.objGuiView.blDirty = true;

    this.intrelation = flZoomRatio;

    if (this.intState == MenuController.HIDDEN)
    {
    	this.objDivContainer.style.left = (this.intXHiddingPosition * flZoomRatio) + "px";
    }

    this.updateScrollLimits();
    
	/*
    // The original relation width / height for the original design
    var widthToHeight = (MenuController.WIDTH / StateFactory.BIG_BUTTONS) / (MenuController.HEIGHT / StateFactory.BIG_BUTTONS);
    
    var newWidth = window.innerWidth ;
    
    var newHeight = window.innerHeight ;
    
    var newWidthToHeight = newWidth / newHeight;
    
    // To detect what dimension we should use to fill the maximum screen area possible
    if (newWidthToHeight > widthToHeight)
    {
        this.intrelation = newHeight / ( MenuController.HEIGHT / StateFactory.BIG_BUTTONS);
    }
    else
    { // window height is too high relative to desired game height
        this.intrelation = newWidth / ( MenuController.WIDTH / StateFactory.BIG_BUTTONS) ;
    }
    
    
    //We apply the correct relation depending of the platform
    this.objCanvas.width = MenuController.WIDTH / this.intrelation;
    this.objCanvas.height = MenuController.HEIGHT / this.intrelation;
    
    this.objDivContainer.style.marginTop = (1) + 'px';
    this.objDivContainer.style.marginLeft = (0)  + 'px';
    
    if ( this.objDeviceModel.platform == OS.IOS || this.objDeviceModel.platform == OS.WINDOWS )
    {
        this.objCanvas.width = MenuController.WIDTH;
        this.objCanvas.height = MenuController.HEIGHT;
        
        this.objDivContainer.style.marginTop = (0) + 'px';
        this.objDivContainer.style.marginLeft = (0)  + 'px';
        
        this.objCanvas.style.width = (MenuController.WIDTH *this.intrelation)+ 'px';
        this.objCanvas.style.height = ((MenuController.HEIGHT + 10) * this.intrelation) + 'px';
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
    
    this.objGuiController.objGuiView.context.canvas.intOffsetLeft = this.objCanvas.parentNode.offsetLeft;
    this.objGuiController.objGuiView.context.canvas.intOffsetTop = this.objCanvas.parentNode.offsetTop;
    this.objGuiController.objGuiView.blDirty = true;
    
    
    for (var i in this.arrControllers)
    {
        this.arrControllers[i].resize(this.intrelation);
    }
    
    window.scrollTo(0, 1);

	if (this.nodeScreenCover)
	{
		this.nodeScreenCover.style.height = window.innerHeight + "px";
		this.nodeScreenCover.style.width = window.innerWidth + "px";
	}
	*/
}

/**
 * To init this class
 */
MenuController.prototype.run = function()
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
             
            this.intCurrentTime  += intExecutionTimes * MenuController.ANIMATION_T;
            
            if (this.intCurrentTime <= this.intTotalTime )
            {
                this.objDivContainer.style.left = (Bounce.easeOut(this.intCurrentTime, this.intInitX, this.intChangeX, this.intTotalTime ) * this.intrelation) + "px";
                this.objMenuView.blDirty = true;
            }
            else
            {
            	//do the last bit
                this.objDivContainer.style.left = (Bounce.easeOut(this.intTotalTime, this.intInitX, this.intChangeX, this.intTotalTime ) * this.intrelation) + "px";
                
                if (this.intState == MenuController.HIDDING)
                {
                	this.intState = MenuController.HIDDEN;
                	//this.objScroll.setValue(0); //scroll to the top
                }
                else
                {
                	this.intState = MenuController.VISIBLE;
                }
            }
            break;
        case MenuController.HIDDEN: case MenuController.VISIBLE:
            
        	//do nothing here
        break;
    }
}

/**
 * This is callback for ScrollHelper
 *  
 * @param {number} intScrollValue
 * @param {number} intDiff
 */
MenuController.prototype.onScrollChange = function(intScrollValue, intDiff)
{
	for (var i in this.arrScrollableElements)
	{
		var objElement = this.arrScrollableElements[i];
		objElement.setY(objElement.getY() - intDiff); //add the difference
	}
}

MenuController.prototype.removeMenu = function()
{
    
}

MenuController.prototype.setSidebarEnabled = function(blEnabled)
{
	this.objGuiController.getButtonByID("leftMenu").setEnabled(blEnabled);
}
