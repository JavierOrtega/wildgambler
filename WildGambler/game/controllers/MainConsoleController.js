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
function MainConsoleController( objDeviceModel, 
							  objLocalisation,
						      objConfigData,
							  objAutoplayController,
							  objLinebet,
							  objGuiController,
							  objGuiControllerAutoplayPanel,
							  objAutoplayWarningGuiController,
							  objSoundController,
							  objSidebarCommController,
							  objFreeSpinConsoleController )
{
	this.objAutoplayWarningController = new AutoplayWarningController(objAutoplayWarningGuiController,
							  objSoundController );
	this.objLocalisation = objLocalisation;
    
    //Binding
    this.changeWilds = this.changeWilds.bind (this);
    this.spin = this.spin.bind(this);
    this.assignController = this.assignController.bind(this);
	this.showWinPanel = this.showWinPanel.bind(this);
	this.hideWinPanel = this.hideWinPanel.bind(this);
	this.setLineWinText = this.setLineWinText.bind(this);
	this.setTotalWinText = this.setTotalWinText.bind(this);
	this.setLockStakeText = this.setLockStakeText.bind(this);
	this.setStakeText = this.setStakeText.bind(this);
	this.onLinebetClicked = this.onLinebetClicked.bind(this);
	this.onLinebetTouchStart = this.onLinebetTouchStart.bind(this);
	this.onLinebetTouchEnd = this.onLinebetTouchEnd.bind(this);
	this.hideWinPanelNow = this.hideWinPanelNow.bind(this);
	this.resetLineBetButton = this.resetLineBetButton.bind(this);
	this.onCountupComplete = this.onCountupComplete.bind(this);
	this.autoLockWildsDisabled = this.autoLockWildsDisabled.bind(this);
	this.winPanelHidden = this.winPanelHidden.bind(this); 

	this.onLinebetPlusClicked = this.onLinebetPlusClicked.bind(this);
	this.onLinebetMinusClicked = this.onLinebetMinusClicked.bind(this);
	this.onAutoplayButtonClick = this.onAutoplayButtonClick.bind(this);
	
	this.setAutoplayButtonDisplayStates = this.setAutoplayButtonDisplayStates.bind(this);
	this.onLinebetChange = this.onLinebetChange.bind(this);

    this.objDivContainer = document.getElementById('buttonsArea');    
    this.objCanvas = document.getElementById('buttons');
 
 	// 
    this.objWinPanel;
    this.objConfigData = objConfigData;
    
    // Hacky and needs to be removed to be cleaner used to access the wild overlays on button change state.
    this.objReelsController;
    
    this.objAutoplayController = objAutoplayController;
    this.objFreeSpinConsoleController = objFreeSpinConsoleController;
    
    this.objLinebet = objLinebet;
    this.objSpinController;
    /**
     * Background image for Bottombar
     */
    this.imgPanel = null;
    
    /*
     * 
     * Indices of held wilds. Can be empty array (or left out completely if no wilds)
     * This will be provided by the ReelsController.
     * 
     * { Array }
     */
    this.arrHeldWilds;
    
    /*
     * Total basic stake
     * 
     * { Float }
     */
    this.flTotLineStake = 0.0;
    
    /**
     * @type {SidebarCommController} 
     */
    this.objSidebarCommController = objSidebarCommController;
    
    /*
     * Total cost for the current bet, including the cost for the wilds 
     */
    this.getTotalAmountStaked = this.getTotalAmountStaked.bind(this);
    
    this.setButtonStates = this.setButtonStates.bind(this);
    
    /**
     * This is the text used to show the stake for the spin
     * @type { Text } The textfield where to show the stake
     */
    this.txtSpinStake;
    
    this.create(objDeviceModel, objGuiController );
    
    this.arrControllers = [];
    
    //all enabled by default    
    this.buttonStates = 
    {
		"lines": true,
		"lineBetMiddle": true,
		"autoplay": true, 
		"spin": true,
		"lockspin": true
    };
    
    //GuiController for showing autoplay buttons
    this.objGuiControllerAutoplayPanel = objGuiControllerAutoplayPanel;
    this.objReelsController = null;

    // Countup object
    this.objTextCounter = new TextCounter();
    
    this.initBackground();
    
	this.blAutoplayButtonHidden = false;
	
	this.blExistingWilds = false;
}
/**
 * Derive MainConsoleController from our base type to provide inheritance
 */
Class.extend(ScreenLogicController, MainConsoleController)

/**
 * 
 */
MainConsoleController.prototype.autoLockWildsDisabled = function()
{
	return this.objBetController.autoLockWildsDisabled();
}


MainConsoleController.prototype.getTotalAmountStaked = function()
{
	return this.objBetController.getTotalAmountStaked();
}

/**
 * TODO Not straightforward, this...
 */
MainConsoleController.prototype.initLinebet = function()
{
	//assign onchange callback
	this.objLinebet.setOnChangeCallback(this.onLinebetChange);

	//init linebet buttons	
    this.initLinebetButtons();
}

/**
 * This is called every time current linebet is changed
 * @param {number} flLineStake IN CENTS
 */
MainConsoleController.prototype.onLinebetChange = function( flLineStakeInCents )
{
	/*
	 * Send the bet controller the line stake * the number of winlines in play.
	 * Always 20 in WildGambler but other games may have variable/selectable lines
	 * which this module may know about, but bet controller does not.
	 */
	this.objBetController.setBet( flLineStakeInCents * this.objConfigData.Winlines.intMaxWinlines );

	/*
	 * Change text in buttons
	 * TODO this could be done in the line bet object:
	 * It should know how to display its own data. 
	 */
	this.setLineBetText( flLineStakeInCents );

	/*
	 * StakeText is the total stake without holding wilds
	 * Should be linebet * numWinLines (always 20 in WildGambler)
	 */ 
	this.setStakeText( this.objBetController.getSpinStake() );
	
	/*
	 * LockStakeText displays total cost of spin with any held wilds.
	 */
	this.setLockStakeText( this.objBetController.getLockSpinStake() );
}

// Hacky and needs to be removed to be cleaner used to access the wild overlays on button change state. //TODO
MainConsoleController.prototype.setReelsController = function(objReelsController)
{
    this.objReelsController = objReelsController;
}


/**
 * TODO
 * Close the line bet chooser if open and make sure that the 
 * correct stake is showing on-screen. 
 * NB do we need this?
 */
MainConsoleController.prototype.resetLineBetButton = function()
{
	
}

/**
 * 
 */
MainConsoleController.prototype.assignController = function(strName,objController)
{
	this.arrControllers[strName] = objController;
	if( strName == "panelsController")
	{
	    this.objWinPanel = this.arrControllers[strName].objWinPanel;
	    this.objWinPanel.configure(this.objConfigData);
    	this.objWinPanel.hideNow();
    }
}


/**
 *
 * Ensure that the background image is treated as a texture and is tiled horizontally across the screen. 
 */
MainConsoleController.prototype.initBackground = function() 
{
	
	var objButtonBgTexture = new TextureView("buttonBg");
	
	this.imgPanel = this.objGuiController.objGuiView.getElement(0,"hud_bg.png");
	objButtonBgTexture.setTexture(0, // this.objLeftImage.intX + this.objLeftImage.intWidth 
                              0, // this.objLeftImage.intY
                             1204,//BottomController.intWidth, // - this.objRightImage.intWidth,
                             100,//BottomController.intHeight,
                             this.imgPanel);    
    this.objGuiController.objGuiView.addElement(0,"buttonBg",objButtonBgTexture);    
}

/**
 * This will enable the Lock and Spin Button only in the case that there are Wilds in the reels
 */


MainConsoleController.prototype.enableLockSpin = function ()
{
 
    this.buttonStates.lockspin = this.blExistingWilds;
    
    /*if (this.blExistingWilds)
    {
         this.buttonStates.lockspin = true;
    }
    else if (!this.autoLockWildsDisabled())
    {
        this.buttonStates.lockspin = true;
    }
    else
    {
        this.buttonStates.lockspin = false;
    }*/
}

/**
 * SpinController calls this method whenever the state of the spin & lockspin
 * buttons is changed (this controls spin button action in different states of the machine).
 * Here we use that state to determine the visible state of each button on the bottom bar
 * and also to enable/disable them.
 */
MainConsoleController.prototype.setButtonStates = function(intState)
{
    if(this.objReelsController.objWildsSelector)
    {
      this.objReelsController.objWildsSelector.arrOverlayWilds = new Array();  
    } 
	
	var blSidebarEnabled = false;
	
	this.intState = intState;
	
	switch(intState)
	{
		/*
		 * Waiting for spin: enable all 
		 */
		case SpinController.IDLE:
			this.buttonStates.spin = true;
			
			this.enableLockSpin();

			this.buttonStates.autoplay = true;
			this.buttonStates.lineBetMiddle = true;
			this.objReelsController.setWildSelectionEnabled(true);
			blSidebarEnabled = true;
		break;
		
		/*
		 * Click either spin button to quick-stop.
		 * If autoplay active, click to stop autoplay
		 */
		case SpinController.SPIN_START:
            this.buttonStates.spin = true;
            this.enableLockSpin();
			this.buttonStates.lineBetMiddle = false;
			this.objReelsController.setWildSelectionEnabled(false);
			this.buttonStates.autoplay = this.objAutoplayController.isActive();			
			break;
		
		/*
		 * Quick-stop was pressed.
		 */
		case SpinController.QUICKSTOP:
			this.buttonStates.spin = false;
			this.buttonStates.lockspin = false;
			this.objReelsController.setWildSelectionEnabled(false);
			break;

		/* Result arrived, reels stopping.
		 * No spin action till summary finished.
		 * Click autoplay or line bet to cancel animations and 
		 * start autoplay or raise/lower stakes.
		 */
		case SpinController.SPIN_RECEIVED:
			this.buttonStates.spin = false;
			this.buttonStates.lockspin = false;
			this.objReelsController.setWildSelectionEnabled(false);
			this.buttonStates.autoplay = false;
			this.buttonStates.lineBetMiddle = false;
			break;

		/*
		 * Bigwin should be treated as modal.
		 * Click it to skip, usually, but no other interaction.
		 */

		case SpinController.BIG_WIN:
			this.buttonStates.spin = false;
			this.buttonStates.lockspin = false;
			this.buttonStates.autoplay = false;
			this.buttonStates.lineBetMiddle = false;
			this.objReelsController.setWildSelectionEnabled(false);
			break;

		/*
        * Disable interface, used during loading / intro popup
        */

	    case SpinController.INACTIVE:
	        this.buttonStates.spin = false;
	        this.buttonStates.lockspin = false;
	        this.buttonStates.autoplay = false;
	        this.buttonStates.lineBetMiddle = false;
   			this.objReelsController.setWildSelectionEnabled(false);
   			blSidebarEnabled = true;
	        break;
		
		/*
		 * Usually, cannot spin off from a win summary,
		 * but can change stake or start autoplays, both of which 
		 * will cancel the win summary and all future animations.
		 */
		case SpinController.WIN_SUMMARY:
			// -- No change during Win Summary
			this.buttonStates.spin = false;
			this.buttonStates.lockspin = false;
			this.objReelsController.setWildSelectionEnabled(false);
			this.buttonStates.autoplay = false;
			this.buttonStates.lineBetMiddle = false;
			break;
			
		/*
		 * Click any button to cancel animations and skip to bonus or spin.
		 * Autoplay button skips animations and sets autoplays.
		 * Disabled if bonus coming.
		 */
		case SpinController.WIN_ANIMATION:
			// if we've got a bonus queued up ready to go, only enable the spin buttons to act as a SKIP button
			// for win lines/animations etc, everything else should be inactive 
			if ( this.objSpinController.bonusIsFlagged() == true )
			{
				this.buttonStates.spin = true;
				this.objReelsController.setWildSelectionEnabled(false);
				this.enableLockSpin();
				this.buttonStates.autoplay = false;
				this.buttonStates.lineBetMiddle = false;
				blSidebarEnabled = false;	
			} 
			else 
			{
				this.buttonStates.spin = true;
				this.objReelsController.setWildSelectionEnabled(true);
				this.enableLockSpin();
				this.buttonStates.autoplay = true;
				this.buttonStates.lineBetMiddle = true;
				blSidebarEnabled = true;	
			}
			break;
			
		/*
		 * only spin enabled for now to start freespins
		 */
		case SpinController.BONUS_START: 
			this.buttonStates.spin = false;
			this.objReelsController.setWildSelectionEnabled(false);
			this.buttonStates.lockspin = false;
			this.buttonStates.autoplay = false;
			this.buttonStates.lineBetMiddle = false;
			break;

		case SpinController.BONUS_PLAYING:
			this.buttonStates.spin = false;
			this.buttonStates.lockspin = false;
			this.buttonStates.autoplay = false;
			this.objReelsController.setWildSelectionEnabled(false);
			this.buttonStates.lineBetMiddle = false;
			// -- No change
			break;		
		
		/*
		 * Selecting autoplay: autoplay and spin buttons cancel autoplays.
		 * Cannot change stake.
		 */
		case SpinController.AUTOPLAY_SELECT:
			this.buttonStates.autoplay = true;
			this.buttonStates.spin = false;
			this.buttonStates.lockspin = false;
			this.objReelsController.setWildSelectionEnabled(false);
			this.buttonStates.lineBetMiddle = false;
			this.objReelsController.intState = ReelsController.STOP
			break;

		/*
		 * During autoplay: autoplay button cancel autoplays.
		 * Cannot change stake.
		 */
		case SpinController.AUTOPLAY:
			this.buttonStates.autoplay = true;
			this.buttonStates.spin = false;
			this.buttonStates.lockspin = false;
			this.objReelsController.setWildSelectionEnabled(false);
			this.buttonStates.lineBetMiddle = false;
			break;

        /*
         * Player has requested to stop all autoplays
         */
        case SpinController.AUTOPLAY_CANCEL:
            this.buttonStates.spin = false;
            this.buttonStates.lockspin = false;
            this.objReelsController.setWildSelectionEnabled(false);
            this.buttonStates.autoplay = false;
            this.buttonStates.lineBetMiddle = false;
            break;

		/*
		 * During modal dialogs (ie. Settings Panel)
		 * Buttons and wild selection are all disabled
		 */
		case SpinController.MODAL_DIALOG:
			this.buttonStates.autoplay = false;
			this.buttonStates.spin = false;
			this.buttonStates.lockspin = false;
			this.objReelsController.setWildSelectionEnabled(false);
			this.buttonStates.lineBetMiddle = false;
			blSidebarEnabled = true;
			break;
			
		default:
			alert("No such state as " + arrStates[intState]);
			break;
	}

    //disable autoplay button in case it is not allowed (jurisdiction reasons)
    if (!this.objAutoplayController.isAvailable())
    {
    	this.buttonStates.autoplay = false;

    	if (!this.blAutoplayButtonHidden)
    	{
    		this.hideAutoplayButton();
    	}
    }

	//set states
	for (var strKey in this.buttonStates)
	{
		this.objGuiController.getElementByID(strKey).setEnabled(this.buttonStates[strKey]);
	}
	
	//Added to redraw again the Free Spin Console when we update the buttons in the normal one
	//In other way the free spins console will disapear
	//DON'T REMOVE IT!
	if (this.objFreeSpinConsoleController.objGuiView.blVisible)
	{
	    this.objFreeSpinConsoleController.objGuiView.blDirty = true;
	}
	
	
	//set linebet +/- buttons the same state as linebetMiddle button
	if (this.buttonStates.lineBetMiddle) {
		this.setLinebetButtonsEnabledState();
	} else {
		this.objGuiController.getElementByID("lineBetPlus").setEnabled(false);
		this.objGuiController.getElementByID("lineBetMinus").setEnabled(false);
	}
	//notify sidebar to enable or disable
	this.objSidebarCommController.setSidebarEnabled(blSidebarEnabled);
}
	

/**
 * Set the text of the line bet.
 * Text field is ON the Line Bet button.
 * @param flLineStakeInCents: line stake in cents
 */
MainConsoleController.prototype.setLineBetText = function(flLineStakeInCents)
{
	this.txtLineBet.setText(Localisation.formatNumber(flLineStakeInCents));	
}

/**
 * Set the text of the spin cost ON the spin button.
 * NO LINE CONTROLLER as we are using FIXED 20 LINES
 * @param flLineStakeTotal: line stake x numOfWinlines in play
 */
MainConsoleController.prototype.setStakeText = function(flLineStakeTotal)
{
    this.txtSpinStake.setText(Localisation.formatNumber(flLineStakeTotal));	
}

/**
 * Set the text of the lockspin cost ON the Lock & Spin button
 * NO LINE CONTROLLER as we are using FIXED 20 LINES
 * @param flLineStakeTotal: pre-calculated total cost of spinning with held wilds
 */
MainConsoleController.prototype.setLockStakeText = function(flLineStakeTotal)
{
   this.txtLockSpinStake.setText(Localisation.formatNumber(flLineStakeTotal));
}

/**
 * Callback to process the different selected wilds
 * 
 * @param { Array } arrWilds This array will contain the selected wilds in the reels 
 */
MainConsoleController.prototype.changeWilds = function ( arrWilds )
{
    this.objBetController.changeWilds(arrWilds);
    
    if (this.txtSpinStake)
    {
        this.setStakeText( this.objBetController.getSpinStake() );
    }
    
    if (this.txtLockSpinStake)
    {
        this.setLockStakeText( this.objBetController.getLockSpinStake() );
    }
    
    /*
     * This is to control the freespins console during a big win!!
     * Pretty much voodoo, but otherwise the fsTotal disappears and reappears.
     * It's to do with the big win and wilds being on the same canvas,
     * and this and the FreeSpinConsoleController being on the same canvas,
     * even though this (main cosole) part is hidden.
     */
    this.objFreeSpinConsoleController.objGuiView.setDirty(true);
}


/**
 * This function initialize the proper texts for the Bottom bar
 *  
 */
MainConsoleController.prototype.initTexts = function ( )
{
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
}

/**
 * initialize linebet buttons
 */
MainConsoleController.prototype.initLinebetButtons = function()
{
	this.objGuiController.getElementByID("lineBetPlus").addListener(ButtonController.STATE_CLICK, this.onLinebetPlusClicked);
	this.objGuiController.getElementByID("lineBetMinus").addListener(ButtonController.STATE_CLICK, this.onLinebetMinusClicked);
	this.setLinebetButtonsEnabledState();
}

/**
 * 
 */
MainConsoleController.prototype.onLinebetPlusClicked = function(objEvent, objButton, intX, intY)
{
	var arrAvailableValues = this.objLinebet.getSetup().getAvailableOptions();
	var flCurrentValue = this.objLinebet.getCurrentLinebet();
	for (var i = 0; i < arrAvailableValues.length; i++)
	{
		if (arrAvailableValues[i] == flCurrentValue && arrAvailableValues[i+1] != undefined)
		{
			this.objLinebet.setCurrentLinebet(arrAvailableValues[i+1]);
			break;
		}
	}
	this.setLinebetButtonsEnabledState();
}

/**
 * 
 */
MainConsoleController.prototype.onLinebetMinusClicked = function(objEvent, objButton, intX, intY)
{
	var arrAvailableValues = this.objLinebet.getSetup().getAvailableOptions();
	var flCurrentValue = this.objLinebet.getCurrentLinebet();
	for (var i = 0; i < arrAvailableValues.length; i++)
	{
		if (arrAvailableValues[i] == flCurrentValue && arrAvailableValues[i-1] != undefined)
		{
			this.objLinebet.setCurrentLinebet(arrAvailableValues[i-1]);
			break;
		}
	}
	this.setLinebetButtonsEnabledState();
}

MainConsoleController.prototype.setLinebetButtonsEnabledState = function()
{
	var blPlusButtonEnabled = true;
	var blMinusButtonEnabled = true;
	if (this.objLinebet.isFirstLinebetSelected())
	{
		//disable minus button
		blMinusButtonEnabled = false;
	}
	else if (this.objLinebet.isLastLinebetSelected())
	{
		//disable plus button
		blPlusButtonEnabled = false;
	}
	
	this.objGuiController.getElementByID("lineBetPlus").setEnabled(blPlusButtonEnabled);
	this.objGuiController.getElementByID("lineBetMinus").setEnabled(blMinusButtonEnabled);
}

/**
 * 
 */
MainConsoleController.prototype.onLinebetClicked = function(objEvent, objViewObject, intX, intY)
{
	if (intX > (objViewObject.getWidth() / 2))
	{
		this.onLinebetPlusClicked();
	}
	else
	{
		this.onLinebetMinusClicked();
	}
}

/**
 * 
 */
MainConsoleController.prototype.onLinebetTouchStart = function(objEvent, objViewObject, intX, intY)
{
	var objButtonController = null;
	//if (intX > (objViewObject.getWidth() / 2))
	
	if (intX > ((objViewObject.getWidth()*3.5)  / 5))
	{
		objButtonController = this.objGuiController.getElementByID("lineBetPlus")
	}
	else if (intX < ((objViewObject.getWidth()*2)  / 5))
	{
		objButtonController = this.objGuiController.getElementByID("lineBetMinus");
	}
	var viewObject = objButtonController.getViewObject();
	
	objButtonController.onTouchStart(objEvent, viewObject.getX(), viewObject.getY(), true);

	//stop event propagation
	objEvent.stopPropagation();
}

/**
 * 
 */
MainConsoleController.prototype.onLinebetTouchEnd = function(objEvent, objViewObject, intX, intY)
{
	objButtonController = this.objGuiController.getElementByID("lineBetPlus")
	var viewObject = objButtonController.getViewObject();
	objButtonController.onTouchEnd(objEvent, 0, 0);
	
	objButtonController = this.objGuiController.getElementByID("lineBetMinus")
	var viewObject = objButtonController.getViewObject();
	objButtonController.onTouchEnd(objEvent, 0, 0);

	//stop event propagation
	objEvent.stopPropagation();
}

/**
 * Init the bet controller
 * @param {Object} objCommsController Reference to the State Factory
 * @param {Array} arrWinlines Array of win lines  
 * @param {Object} objReceiveBetResponse callback for the response of the Bet
 */
MainConsoleController.prototype.initBetController = function ( objCommsController, 
															   arrWinlines, 
															   fnReceiveBetResponse, 
															   objReelsController,
															   objStakeWarningController )
{
    this.objBetController = new BetController( this.objConfigData,
                                               objCommsController, 
    										   arrWinlines, 
    										   fnReceiveBetResponse,
    										   objStakeWarningController);

    this.initTexts();
    this.initAutoplay(objReelsController);
    this.initLinebet();
}


/**
 * Spin the reels
 */
MainConsoleController.prototype.spin = function ( )
{
    this.objBetController.sendBet();
}

/**
 * Show if not already in the process of showing
 */
MainConsoleController.prototype.showWinPanel = function(flTotalWinAmount, blDoCountup, fnCallbackOnShowing)
{
	this.objWinPanel.setTotalStakeText( this.objBetController.getTotalAmountStaked() );
	this.objWinPanel.show(flTotalWinAmount, blDoCountup, fnCallbackOnShowing);
}
    
/**
 * Hide if not hidden.
 */
MainConsoleController.prototype.hideWinPanel = function()
{   
	this.objWinPanel.hide(this.winPanelHidden);	
}


MainConsoleController.prototype.winPanelHidden = function()
{   
    this.objAutoplayController.objAutoplaySelect.objGuiController.objGuiView.setDirty(true);
}

/**
 * Hide immediately regardless of state or position.
 */
MainConsoleController.prototype.hideWinPanelNow = function()
{
	this.objWinPanel.hideNow();
}

/**
 * The "Line win" text field is being used to display the total cost
 * of the wins you are now looking at in the total win field.
 * Individual line win values are displayed by the winlines only 
 * during the "long animation" phase.
 */
MainConsoleController.prototype.setLineWinText = function()
{
	this.objWinPanel.setTotalStakeText( this.objBetController.getTotalAmountStaked() );
}

/**
 * Set the value of the TotalWin text field on the pop-up panel 
 */
MainConsoleController.prototype.setTotalWinText = function(flTotalWinAmount, blDoCountup)
{
	this.objWinPanel.setTotalWinText(flTotalWinAmount, blDoCountup);
}

/**
 * 
 */
MainConsoleController.prototype.onCountupComplete = function()
{
	
}

/**
 * Lock the wilds and Spin the reels
 */
MainConsoleController.prototype.lockspin = function ( fnCallback )
{
    this.objBetController.sendBetWithLockWilds(fnCallback);
}

/**
 * Resize the current controller
 * @param {String} strMessage The string for the error message
 */
MainConsoleController.prototype.resize = function()
{
    //document.body.style.height = (window.outerHeight + 50) + 'px';
  
    var widthToHeight = 1024 / 86;
    
    var newWidth = StateFactory.WIDTH_CONTAINER;
    var newHeight = StateFactory.HEIGHT_CONTAINER;
    
    var newWidthToHeight = newWidth / newHeight;
    
    if ( newWidthToHeight > widthToHeight )
    {
        this.intrelation = newHeight / 86;
    }
    else
    {// window height is too high relative to desired game height
        this.intrelation = newWidth / 1024;
    }
    
    this.objCanvas.width = 1024;
    this.objCanvas.height = 86;
    
    
    this.objCanvas.style.width = (1024 *this.intrelation)+ 'px';
    this.objCanvas.style.height = (86 * this.intrelation) + 'px';
    
    //if ( this.objDeviceModel.platform == OS.IOS || this.objDeviceModel.platform == OS.WINDOWS )
    if ( this.objDeviceModel.platform == OS.WINDOWS )
    {
        this.objDivContainer.style.marginTop = (StateFactory.HEIGHT_CONTAINER - 86 *  ( this.intrelation)  ) + 'px';
            
        this.objDivContainer.style.marginLeft = (0) + 'px';
        this.intHeightBottomBar = 86 * this.intrelation ;
    }
    else
    {   
        
        
        if (navigator.userAgent.match("HTC Desire"))
        {
            this.objDivContainer.style.marginTop = (window.innerHeight- 86*  this.intrelation   ) + 'px';    
        }
        else
        {
            this.objDivContainer.style.marginTop = (window.innerHeight - 86 *  this.intrelation   ) + 'px';    
        }
        
                    
        
        this.objDivContainer.style.marginLeft = (0) + 'px';        
        this.intHeightBottomBar = 86 * this.intrelation ;    
    }
    
    this.objGuiController.objGuiView.setDirty(true);
    
    for ( var i in this.arrControllers )
    {
        this.arrControllers[i].resize(this.intrelation);
    }
    
    if (this.objAutoplaySelect) {
    	this.objAutoplaySelect.resize();
    }
    
    window.scrollTo(0, 1);
}

/**
 * 
 */
MainConsoleController.prototype.initAutoplay = function(objReelsController)
{
	//controllers - source and destination for buttons
	var objCtrlButtons = this.objGuiController;
	
	//find autoplay buttons
    var objButtonViewAutoplayTop = new ButtonView("blank_top");
    objButtonViewAutoplayTop.addState(objCtrlButtons.objGuiModel.getResourceByName("btn_autoplay_selection_top_normal.png"), ButtonController.STATE_NORMAL);
    objButtonViewAutoplayTop.addState(objCtrlButtons.objGuiModel.getResourceByName("btn_autoplay_selection_top_pressed.png"), ButtonController.STATE_PRESSED);
    
    var objButtonViewAutoplayMiddle = new ButtonView("blank_middle");
    objButtonViewAutoplayMiddle.addState(objCtrlButtons.objGuiModel.getResourceByName("btn_autoplay_selection_middle_normal.png"), ButtonController.STATE_NORMAL);
    objButtonViewAutoplayMiddle.addState(objCtrlButtons.objGuiModel.getResourceByName("btn_autoplay_selection_middle_pressed.png"), ButtonController.STATE_PRESSED);
	
    var objButtonViewAutoplayBottom = new ButtonView("blank_bottom");
    objButtonViewAutoplayBottom.addState(objCtrlButtons.objGuiModel.getResourceByName("btn_autoplay_selection_bottom_normal.png"), ButtonController.STATE_NORMAL);
    objButtonViewAutoplayBottom.addState(objCtrlButtons.objGuiModel.getResourceByName("btn_autoplay_selection_bottom_pressed.png"), ButtonController.STATE_PRESSED);
    
    var objButtonViewAutoplay = new Object();
    objButtonViewAutoplay.top = objButtonViewAutoplayTop;
    objButtonViewAutoplay.middle = objButtonViewAutoplayMiddle;
    objButtonViewAutoplay.bottom = objButtonViewAutoplayBottom;
	
	//hide autoplay buttons, remove from MainConsoleController and its view
	this.objGuiController.objGuiView.removeElement(1, "autoplay_selection_top");
	this.objGuiController.removeElement(1, "autoplay_selection_top");

	this.objGuiController.removeElement(1, "autoplay_selection_middle");
	this.objGuiController.objGuiView.removeElement(1, "autoplay_selection_middle");

	this.objGuiController.removeElement(1, "autoplay_selection_bottom");
	this.objGuiController.objGuiView.removeElement(1, "autoplay_selection_bottom");

	//autoplay button
    var objButtonAutoplay = this.objGuiController.getElementByID("autoplay");
    var objButtonView = objButtonAutoplay.getViewObject();
    var objAutoplayTextView = this.objGuiController.objGuiView.getTextView("autoplay");

	//autoplay stop button view
    var objButtonViewAutoplayStop = new ButtonView("autoplay_stop");
    objButtonViewAutoplayStop.addState(objCtrlButtons.objGuiModel.getResourceByName("btn_autoplay_stop_normal.png"), ButtonController.STATE_NORMAL);
    objButtonViewAutoplayStop.addState(objCtrlButtons.objGuiModel.getResourceByName("btn_autoplay_stop_pressed.png"), ButtonController.STATE_PRESSED);
    objButtonViewAutoplayStop.addState(objCtrlButtons.objGuiModel.getResourceByName("btn_autoplay_stop_inactive.png"), ButtonController.STATE_PRESSED);
    
	var that = this;
	/**
	 * When resizing of the window happens, this function is called
	 * It will find correct X position for autoplay buttons
	 * 
	 * @return {number}
	 */
    var onResizeCallback = function()
    {
		var intButtonCenterX = objButtonView.getX() + (objButtonView.getWidth() / 2);
		intButtonCenterX *= (objCtrlButtons.objExternalController.intrelation / that.objGuiControllerAutoplayPanel.objExternalController.intrelation);
		intButtonCenterX -= that.objGuiControllerAutoplayPanel.getX() / that.objGuiControllerAutoplayPanel.objExternalController.intrelation;
    	return intButtonCenterX;
    };

	//create autoplay select object
	var intButtonCenterX = onResizeCallback();
    this.objAutoplaySelect = new AutoplaySelect( this.objGuiControllerAutoplayPanel, 
    											 this.objAutoplayWarningController,
    											 objButtonAutoplay, 
    											 this.objAutoplayController, 
    											 objButtonViewAutoplayStop, 
    											 objButtonViewAutoplay, 
    											 intButtonCenterX, 
    											 objReelsController,
    											 this,
    											 this.objLocalisation);
    this.objAutoplaySelect.setOnResizeCallback(onResizeCallback);
    this.objAutoplayController.setAutoplaySelect(this.objAutoplaySelect);
    
    
    this.objAutoplayController.setOnChangeCallback(this.setAutoplayButtonDisplayStates);

    objButtonAutoplay.addListener(ButtonController.STATE_CLICK, this.onAutoplayButtonClick);
    
    //this.resize();
}

MainConsoleController.prototype.setReelsController = function(objReelsController)
{
	this.objReelsController = objReelsController;
}

/*
 * Listener for autoplay button and "stop autoplay" button
 * Makes buttons visible / invisible
 */
MainConsoleController.prototype.onAutoplayButtonClick = function(objEvent, objButton, intX, intY)
{
	if (!this.objAutoplayController.isAvailable())
	{
		return;
	}

    /*
     * IF TRUE then autoplays are running
     */
	if (this.objAutoplayController.isActive())
	{
		// In case SELECT panel was open and we didn't pick a number
		this.objAutoplaySelect.setVisible(false);
		
		// Cue cancel
		this.objAutoplayController.cueCancel();
	}
	/*
	 * ELSE we are opening the SELECT panel
	 */
	else
	{
		if ( this.objAutoplaySelect.isVisible())
		{
			// re-enable buttons if we click outside of the AUTOPLAY button (e.g. hide the panel)
			// this is done here instead of the setVisible function, because the setVisible function is
			// called when hiding the panel to (e.g.) show the "Are you sure?" popup, when the buttons
			// should NOT be re-enabled.
			this.objSpinController.setButtonState(SpinController.IDLE) 
		}
		
		// Toggle visibility of autoplay settings
		this.objAutoplaySelect.setVisible(!this.objAutoplaySelect.isVisible());
	}
}

/**
 * This function is called on change of autoplays remaining
 * Set correct values for the text and button visibility
 *  
 * @param {number} intAutoplaysRemaining
 */
MainConsoleController.prototype.setAutoplayButtonDisplayStates = function(intAutoplaysRemaining)
{
	var strText = intAutoplaysRemaining; //make sure the number is as string for textbox view
	
	if (intAutoplaysRemaining == 0)
	{
		//strText = "OFF";
		strText = this.objLocalisation.getText("autoplayOff");
		this.objAutoplaySelect.setVisible(false);
	}

	//handle the autoplay button
	if (this.objAutoplayController.getAutoplaysRemaining() > 0)
	{
		//change states to "back button"
		this.objAutoplaySelect.setVisibleButtonStop();
	}
	else
	{
		//change states to original autoplay button
		this.objAutoplaySelect.setVisibleButtonNormal();
	}

	this.objGuiController.objGuiView.getTextView("autoplay").setText(strText);
	
	if (intAutoplaysRemaining == 0)
	{
	   this.objGuiController.getElementByID("autoplay").setEnabled(false);
    }
}

/**
 * 
 */
MainConsoleController.prototype.setSpinController = function(objSpinController)
{
	this.objSpinController = objSpinController;
	this.objAutoplaySelect.setSpinController(objSpinController);
}

/**
 * Hide autoplay button due to legislation reasons 
 */
MainConsoleController.prototype.hideAutoplayButton = function()
{
	this.blAutoplayButtonHidden = true;
	
	//hide autoplay button
	var objAutoplayButtonView = this.objGuiController.getElementByID("autoplay").getViewObject();
	objAutoplayButtonView.setVisible(false);
	this.objGuiController.objGuiView.getTextView("autoplay").setVisible(false);	
	this.objGuiController.getElementByID("autoplay_stop").getViewObject().setVisible(false);	
	this.objGuiController.getElementByID("blank").getViewObject().setVisible(false);
	
	var intAutoplayWidth = objAutoplayButtonView.getWidth();

	var objLinebetViewPlus = this.objGuiController.getElementByID("lineBetPlus").getViewObject();
	var intButtonSpacing = objAutoplayButtonView.getX() - (objLinebetViewPlus.getX() + objLinebetViewPlus.getWidth());

	var intDifference = (intAutoplayWidth / 2) + (intButtonSpacing / 2)

	//move everything on left
	
	var arrAssetsOnLeft = ["lineBetMinus", "lineBetMiddle", "lineBetPlus", "lines"];
	var arrTextsOnLeft = ["linebet", "lines"];
	
	for (var i in arrAssetsOnLeft)
	{
		var strId = arrAssetsOnLeft[i];
		var objView = this.objGuiController.getElementByID(strId).getViewObject();
		
		objView.setX(objView.getX() + intDifference);
	}

	for (var i in arrTextsOnLeft)
	{
		var strId = arrTextsOnLeft[i];
		var objView = this.objGuiController.getGuiView().getTextView(strId);
		
		objView.setX(objView.getX() + intDifference);
	}

	//move everything on right
	
	var arrAssetsOnRight = ["spin", "lockspin"];
	var arrTextsOnRight = ["lockandspinbet", "totalbet"];
	
	for (var i in arrAssetsOnRight)
	{
		var strId = arrAssetsOnRight[i];
		var objView = this.objGuiController.getElementByID(strId).getViewObject();
		
		objView.setX(objView.getX() - intDifference);
	}

	for (var i in arrTextsOnRight)
	{
		var strId = arrTextsOnRight[i];
		var objView = this.objGuiController.getGuiView().getTextView(strId);
		
		objView.setX(objView.getX() - intDifference);
	}
}
