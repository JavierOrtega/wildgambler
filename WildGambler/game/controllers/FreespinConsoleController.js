/**
 * @author Javier.Ortega
 * 
 * This class will handle the specific functionalities for the BottomVar Controller
 * Scaling up or down and centering the reels for all the different devices
 */


/**
 * Constructor
 * @param {Object} objDeviceModel Reference to the device model
 * @param {Object} objGuiController Reference to the GuiController 
 * 
 */
function FreespinConsoleController( objDeviceModel, 
								      objConfigData,
									  objGuiController,
									  objLocalisation )
{
	this.objConfigData = objConfigData;
	this.strCurrencyCode = objConfigData.strCurrencyCode;
	
	this.objLocalisation = objLocalisation;
    
    this.assignController = this.assignController.bind(this);
	this.initBackground = this.initBackground.bind(this);
	this.showWinPanel = this.showWinPanel.bind(this);
	this.hideWinPanel = this.hideWinPanel.bind(this);
	this.resize = this.resize.bind(this);
	
	this.show = this.show.bind(this);
	this.hide = this.hide.bind(this);

	this.setLineWinText = this.setLineWinText.bind(this);
	this.setTotalWinText = this.setTotalWinText.bind(this);

    this.objDivContainer = document.getElementById('buttonsArea');    
    this.objCanvas = document.getElementById('buttons');

    /**
     * Background image for Bottombar
     */
    this.imgPanel = null;

    this.create(objDeviceModel, objGuiController );
    this.objGuiView = this.objGuiController.objGuiView;

    this.txtTotalWin = this.objGuiView.getTextView("freespinstotal");
	this.objTextCounter = new TextCounter();
	this.objTextCounter.initialise(this.objGuiView, this.txtTotalWin, this.strCurrencyCode);
	
	this.flTotalWinAmount = 0;
    
    this.arrControllers = [];
    
   	this.initBackground();
}
Class.extend(ScreenLogicController, FreespinConsoleController)


/**
 * Show called at start of freespins
 */
FreespinConsoleController.prototype.show = function()
{
    this.objGuiView.setDirty(true); 
	this.txtTotalWin.setText(Localisation.formatNumber(0));
	this.flTotalWinAmount = 0;
	this.objGuiView.blVisible = true; 
}

/**
 * Hide called at end of freespins 
 */
FreespinConsoleController.prototype.hide = function()
{
    this.objGuiView.blVisible = false; 
    this.objGuiView.setDirty(true); 
	this.txtTotalWin.setText("");
}


/**
 * Assignment of the win panel
 */
FreespinConsoleController.prototype.assignController = function(strName,objController)
{
	this.arrControllers[strName] = objController;
	if( strName == "panelsController")
	{
	    this.objWinPanel = this.arrControllers[strName].objWinPanel;
	    this.objWinPanel.configure(this.objConfigData);
    }
}


/**
 *
 * Ensure that the background image is treated as a texture and is tiled horizontally across the screen. 
 */
FreespinConsoleController.prototype.initBackground = function() 
{
	
	var objButtonBgTexture = new TextureView("fsButtonBg");
	
	this.imgPanel = this.objGuiController.objGuiView.getElement(0,"hud_bg.png");
	objButtonBgTexture.setTexture(0, // this.objLeftImage.intX + this.objLeftImage.intWidth 
                              0, // this.objLeftImage.intY
                             1204,//BottomController.intWidth, // - this.objRightImage.intWidth,
                             100,//BottomController.intHeight,
                             this.imgPanel);
    this.objGuiController.objGuiView.addElement(0, "fsButtonBg", objButtonBgTexture);   
    this.objGuiController.objGuiView.removeElement(0, "hud_bg.png");
    
    //
    //this.objGuiView.blVisible = false; 
}

/**
 * Set the amount for this freespin win on the popup win bar and show it.
 */
FreespinConsoleController.prototype.setLineWinText = function( flTotalLineWins )
{
	// --
}


/**
 * Set the value of the TotalWin text field on the console panel
 * This means that freespins have won something.
 */
FreespinConsoleController.prototype.setTotalWinText = function( flTotalWinAmount, 
                                                                blDoCountup,
                                                                fnCallbackOnCountupComplete )
{
	if(!blDoCountup)
	{
        this.txtTotalWin.setText(Localisation.formatNumber(flTotalWinAmount));
        
        if(fnCallbackOnCountupComplete)
        {
            setTimeout(fnCallbackOnCountupComplete, 10);
        }
	}
	// Do countup
	else
	{
	    this.fnCallbackOnCountupComplete = fnCallbackOnCountupComplete;
	    
        // Start countup from 1p OR from where we left off
        var flCountFrom = this.flTotalWinAmount == 0 ? 0.01 : this.flTotalWinAmount;
		
        // Remember for next time, to count up from here.
		this.flTotalWinAmount = flTotalWinAmount;

        // Init countup
		this.objTextCounter.start(flCountFrom, flTotalWinAmount, fnCallbackOnCountupComplete, 1.10);
	
	    // Animate it.
		this.objTextCounter.drawNext();
	}
}

/**
 * This function initialize the proper texts for the Bottom bar
 *  
 */
FreespinConsoleController.prototype.initTexts = function ( )
{
	/*
	// -- Spins
    
    // Button comes from GuiController
    var btnSpin = this.objGuiController.getElementByID("spin");
    
    // Textbox comes from GuiController.GuiView
    this.txtSpinStake = this.objGuiController.objGuiView.getTextView("totalbet");
    this.setStakeText( this.objBetController.getSpinStake() );

	// -- Locked spins
    
    // Button comes from GuiController
    var btnLockSpin = this.objGuiController.getElementByID("lockspin");
    
    // Textbox comes from GuiController.GuiView
    this.txtLockSpinStake = this.objGuiController.objGuiView.getTextView("lockandspinbet");
    var stake = this.objBetController.getLockSpinStake();
    this.setLockStakeText( stake );
	
	// -- Line bet

    // Button comes from GuiController
    var btnLineBet = this.objGuiController.getElementByID("linebet");
    
    // Textbox comes from GuiController.GuiView
    this.txtLineBet = this.objGuiController.objGuiView.getTextView("linebet");
    stake = (this.objBetController.getSpinStake() / 20).toFixed(2);
    this.setLineBetText( stake );
    
    var txtLines = this.objGuiController.objGuiView.getTextView("lines");
    txtLines.setText("20");
    */
}

/**
 * Show if not already in the process of showing
 */
FreespinConsoleController.prototype.showWinPanel = function( intNumLines, 
															 flTotalLineWins, 
															 blDoCountup,
															 fnCallbackOnShow,
															 fnCallbackOnCountupComplete)
{
	var strText = "("+intNumLines;
	if(intNumLines == 1)
	{
		strText += " line)";
	}
	else
	{
		strText += " lines)";
	}
	this.objWinPanel.txtLinewin.setText( strText );
	
	//
	this.objWinPanel.show( flTotalLineWins, 
	                       blDoCountup, 
	                       fnCallbackOnShow,
	                       fnCallbackOnCountupComplete);
}
    
/**
 * Hide if not hidden.
 */
FreespinConsoleController.prototype.hideWinPanel = function(fnCallback)
{
	this.objWinPanel.hide(fnCallback);
}


/**
 * To handle an error
 * @param {String} strMessage The string for the error message
 */
FreespinConsoleController.prototype.resize = function()
{    
    this.objGuiView.setDirty(true);
    window.scrollTo(0, 1);
}

