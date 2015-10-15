
/**
 * Object to control actions of the SPIN button,
 * sequencing of animation etc during win, big win, win summary etc
 *
 * @param objDeviceModel: Contains device-specific information
 * @param objMainConsoleController: Console 
 * @param objReelsController: Reels & symbols
 * @param objDeviceModel: Winlines display
 */
function SpinController( objDeviceModel,			 
						 objGuiController,
						 objMainConsoleController, 	
						 objReelsController, 		
						 objWinLinesController,
						 objBigWinController,
						 objFreeSpinController, 
						 objAutoplayController,
                         objSoundController,
                         objSidebarCommController,
                         onjAnimationController )    	
{
    
	this.objDeviceModel = objDeviceModel;
	
	this.onjAnimationController = onjAnimationController;

	this.objMainConsoleController = objMainConsoleController;
	
	this.objMainConsoleController.setSpinController(this);

	this.objReelsController = objReelsController;
	this.objReelsController.setSpinController(this);
	
	this.objWinLinesController = objWinLinesController;
	this.objBigWinController = objBigWinController;
	
	this.objFreeSpinController = objFreeSpinController;
	this.objFreeSpinController.setSpinController(this);
	
	this.objAutoplayController = objAutoplayController;
	this.objSoundController = objSoundController;
	this.objSidebarCommController = objSidebarCommController;
	
	this.objMainConsoleController.objBetController.setSpinController (this);

	//	
	var objGuiView = objGuiController.objGuiView;
	
	/*
	 * Might want to refactor logo and spin messages into an object
	 * Meantime, Q&D implementation :)
	 */
	this.logoSpins = objGuiView.getElement(0,"wildgamblertitle.png");
	var ph = objGuiView.getPlaceHolder("pixel2");
	this.logoSpins.intX = ph.intX;
	
	this.spinMessage=[this.logoSpins];
	for(var m=1; m<7; ++m)
	{
		this.spinMessage.push(objGuiView.getElement(0,"topmessage000"+m+".png"));
		this.spinMessage[this.spinMessage.length-1].intX = ph.intX;
		this.spinMessage[this.spinMessage.length-1].blVisible = false;
	}
	
	this.intSpinMsg = 0;
	this.setSpinMessage = this.setSpinMessage.bind(this);
	this.objAutoplayController.setSpinMessage = this.setSpinMessage;
	this.startAutoplays = this.startAutoplays.bind(this);
	this.objAutoplayController.setOnStartCallback(this.startAutoplays)		
	
	/*
	 *  Which SPIN button was clicked, "spin" or "lockspin".
	 */
	this.objButtonClicked;
	
	/**
	 * Whether a request for quick-stop is pending 
	 */	
	this.blQuickStop = false;

	/**
	 * Spin response data 
	 */
	this.objSpinResponseData = {};

	/**
	 * Control button actions allowed by setting its state.
	 */
	this.intSpinButtonState;	
	this.setButtonState = this.setButtonState.bind(this);
	this.setButtonState(SpinController.IDLE);
	
	/**
	 *  Array to hold WinlineResults for "long animation" 
	 */
	this.arrWinlineAnimations;

	/**
	 * Used to regulate the time between WinLineAnimations 
	 */	
	this.intTimeoutId;
	
	/*
	 * Wait after showing final winline, before running idle animation.
	 */
	this.intRunIdleResultsDelay = 1500;
	
	/*
	 * Normally true, may be false if a console button or wild symbol 
	 * was pressed as soon as the reels have stopped.
	 * Reset to true when a result arrives, before stopping the reels.
	 */
	this.blRunAnimations = true;
	
	/*
	 * Remember if we had a big win: if TRUE we do NOT do a count up in the total win field
	 * If FALSE then we should do a count up in the total win field.
	 */
	this.blBigWin = false;
	
	/**
	 * Spin Methods 
	 */
	this.updateBalanceDisplay = this.updateBalanceDisplay.bind(this);
	this.onSpinButtonPressed = this.onSpinButtonPressed.bind(this);
	this.initiateSpin = this.initiateSpin.bind(this);
	this.spin = this.spin.bind(this);
	this.receiveBetResponse = this.receiveBetResponse.bind(this);
	this.getEmergencyStopData = this.getEmergencyStopData.bind(this);
	
	// Handle callback when all reels have stopped
	this.onReelsStopped = this.onReelsStopped.bind(this);

	// Handle callback when each reel stops in turn
	this.onEachReelStop  = this.onEachReelStop.bind(this);
	
	//
	this.onMeerkatsComplete = this.onMeerkatsComplete.bind(this);
	this.meerkCheerSoundComplete = this.meerkCheerSoundComplete.bind(this);
	this.meerkCheerSoundInterval = null;
	this.meerkCheering = false;
	
	/*
	 * Win animations
	 */	
	this.onBreakJailAnimComplete = this.onBreakJailAnimComplete.bind(this);
	this.displayWinSummary = this.displayWinSummary.bind(this);
	this.onWinSummaryComplete = this.onWinSummaryComplete.bind(this);
	this.showWinLineAnimation = this.showWinLineAnimation.bind(this);
	this.onSymbolAnimationComplete = this.onSymbolAnimationComplete.bind(this);
	this.doNextWinLineAnimation = this.doNextWinLineAnimation.bind(this);
	this.runIdleResults = this.runIdleResults.bind(this);

	/*
	 * Bonus (freespins)
	 */
	this.assignController = this.assignController.bind(this);
	this.bonusIsFlagged = this.bonusIsFlagged.bind(this);
	this.loadBonus = this.loadBonus.bind(this);
	this.startBonus = this.startBonus.bind(this);
	this.onFreespinsComplete = this.onFreespinsComplete.bind(this);
	
	/*
	 * Callback after final autoplay/autoplay cancelled
	 */
	this.onAutoplaysComplete = this.onAutoplaysComplete.bind(this);

	
	/*
	 * Callback for when symbols clicked on to lock wilds
	 * All winline animations etc to be cancelled
	 */
	this.onWildSelected = this.onWildSelected.bind(this);
	
	/*
	 *  Listener for any other console button i.e. autoplay or line bet
	 * All winline animations etc to be cancelled
	 */
	this.onConsoleButtonPressed = this.onConsoleButtonPressed.bind(this);
	
	/*
	 *  Set callback AFTER binding to "this"
	 */
	this.objReelsController.setWildSelectedCallback(this.onWildSelected);
	
	/*
	 * Clear all animations if they are running
	 */
	this.cancelCurrentAnimations = this.cancelCurrentAnimations.bind(this);
	
	/*
	 * Determine if there were line wins which might have started an animation
	 */
	this.resultHasLineWins = this.resultHasLineWins.bind(this);
	
	/*
	 * Lockspin requests must often be OK'd by player
	 */
	this.onShowingDialog = this.onShowingDialog.bind(this);
	this.onLockspinDecision = this.onLockspinDecision.bind(this);
	
	// -- 
	this.arrControllers = [];
	this.objMeerkats;
	
    // callback function, flag & timer for winline sound complete
	this.onWinLineSoundComplete = this.onWinLineSoundComplete.bind(this);
	this.winLineSoundsPlaying = false;
	this.winLineSoundTimerId = null;
	this.killWinSoundInterval = this.killWinSoundInterval.bind(this);

	//
	this.onMaxWinDialogDismissed = this.onMaxWinDialogDismissed.bind(this);
	
	this.blInFreespins = false;
	this.blFreespinsUseBlackLockIcon = false;
}
Class.extend(Class,SpinController);

/**
 * State constants for SPIN button 
 */
SpinController.IDLE = 0;
SpinController.SPIN_START = 1;
SpinController.QUICKSTOP = 2;
SpinController.SPIN_RECEIVED = 3;
SpinController.BIG_WIN = 4;
SpinController.WIN_SUMMARY = 5;
SpinController.WIN_ANIMATION = 6;
SpinController.BONUS_START = 7; 
SpinController.BONUS_PLAYING = 8;
SpinController.AUTOPLAY = 9;
SpinController.AUTOPLAY_SELECT = 10;
SpinController.AUTOPLAY_CANCEL = 11;
SpinController.INACTIVE = 12;
SpinController.MODAL_DIALOG = 13; //in case any modal dialog is visible (ie. Settings Panel)

// for console.log only
SpinController.arrStates = [ "IDLE",
				  "SPIN_START",
				  "QUICKSTOP",
				  "SPIN_RECEIVED",
				  "BIG_WIN",
				  "WIN_SUMMARY",
				  "WIN_ANIMATION",
				  "BONUS_START",
				  "BONUS_PLAYING",
				  "AUTOPLAY",
				  "AUTOPLAY_SELECT",
				  "AUTOPLAY_CANCEL",
				  "INACTIVE",
				  "MODAL_DIALOG" ];


/**
 * 
 */
SpinController.prototype.assignController = function(strName,objController)
{
	this.arrControllers[strName] = objController;
	if( strName == "panelsController")
	{
	    this.objMeerkats = this.arrControllers[strName].objMeerkatView;

	    // callback once All meerkat animations have finished.
	    this.objMeerkats.fnAnimationCompleteCallback = this.onMeerkatsComplete;

	    // callback once each kat has finished it's animation (for synchronising with sound)
	    this.objMeerkats.fnKatPopupAnimationCompleteCallback = this.onKatPopupAnimationComplete;
    }
}

/**
 * Set state (ie the actions allowed) of SPIN buttons
 * Also handle dimming/enabling of graphics of them and any other buttons visible
 */
SpinController.prototype.setButtonState = function( intState )
{
	/*
	 * Set the internal (to this object) state of the spin buttons 
	 * to control its actions when pressed. (see SpinController.onSpinButtonPressed)
	 */
	this.intSpinButtonState = intState;

	/*
	 * BottomBar will set the states of other console buttons	
	 * according to the state of the spin button (which is the state of this Object, in a sense - 
	 * certainly it is the state of the progress of the spin)
	 */	
	this.objMainConsoleController.setButtonStates(intState);
}

/**
 * Make the actual logo invisible
 * Find and show a new spin message at random, not the same as the last.
 */
SpinController.prototype.setSpinMessage = function()
{
	if(this.spinMessage[0].blVisible)
	{
		this.spinMessage[0].blVisible = false;
		var rand;
		do
		{
		    // +1: We never want spin message 0, it's the logo.
			rand = Math.floor(((Math.random() * 100)) % (this.spinMessage.length-1) ) + 1;
		}
		while(rand == this.intSpinMsg);
		
		this.intSpinMsg = rand;
		this.spinMessage[this.intSpinMsg].blVisible = true;
	}
	else
	{
		this.spinMessage[0].blVisible = true;
		this.spinMessage[this.intSpinMsg].blVisible = false;
	}
}

/**
 * Determine if there were line wins. 
 * Don't just check if there are winlines because these might be bonus/scatter winlines
 * which do not carry a line win result and so will not trigger a winline animation. 
 */
SpinController.prototype.resultHasLineWins = function()
{
	// undefined means no results yet: first spin being made!
	if(this.objSpinResponseData.Spin == undefined)
	{
		return false;
	}
	
	// Otherwise, did we have any cash wins?
	return this.objSpinResponseData.Spin.flSpinWin > 0 ? true : false
}

/**
 * Callback from other bottom bar buttons (LineBet and Autoplay).
 * Do nothing here if we are already running Autoplay.
 * Otherwise cancel all animations. 
 * NOTE: Animations may have not yet started, or may be in progress.
 */

SpinController.prototype.onConsoleButtonPressed = function(objEvent, obj, intX, intY)
{
    // Stop click-through.
	objEvent.stopPropagation();

    // Which button was clicked?
	this.objButtonClicked = obj;

	/*
	* Any button cancels animations
	*/
	this.cancelCurrentAnimations();
	  	  
	//	
	switch(this.objButtonClicked.strIdButton)
	{
		case STRINGS.BTN_SPIN:
		    this.objSoundController.playSpinSound(0);
			break;		
		case STRINGS.BTN_LINE_BET_MINUS:
		    this.objSoundController.playLineBetMinusSound();
			break;
		case STRINGS.BTN_LINE_BET_PLUS:
		    this.objSoundController.playLineBetPlusSound();
			break;
		default:
		    this.objSoundController.playButtonClickSound();
			break;
	}

    /*
     * MainConsoleController has an autoplay button handler 
     * which has ALREADY RUN: this will have set isActive
     */
	if (this.objAutoplayController.isActive() == false)
	{
		if(this.objButtonClicked.strIdButton == STRINGS.AUTOPLAY)
		{
		    /*
		     * MainConsoleController has an autoplay button handler 
		     * which has ALREADY RUN: this will have made the SELECT panel
		     * visible. 
		     */
			if(this.objAutoplayController.objAutoplaySelect.blVisible)
			{
				this.setButtonState(SpinController.AUTOPLAY_SELECT);
				this.objAutoplayController.setOnStartCallback(this.startAutoplays);
			} else {
				// this was previously set up on the setVisible function of the panel, but this also triggered
				// when the panel was closing to go to the warning
				this.setButtonState(SpinController.IDLE);
			}
		}
		
		/*
		 * Any button cancels animations
		 */
		// BGB commented this call out and moved to the start of the function, but still hasn't fixed the issue
	  //  this.cancelCurrentAnimations();
	}
	/*
	 * Active is true: are we trying to cancel?
	 */
	else
	{
        /*
         * SELECT panel is invisible: is the player trying to cancel all autoplays?
         * If so we need to make sure ALL button are switched off until
         * the spin result arrives and normal operation resumes.
         */
        if(this.objAutoplayController.blCueCancel == true)
        {
            this.setButtonState(SpinController.AUTOPLAY_CANCEL);
        }
	}
}


/**
 * Callback from ReelsController that a symbol has been clicked on
 * turning it to/from a wild.
 * When this happens we need to cancel all winline animations
 * regardless of if we are in summary, long or idle.
 * Note: This callback method is not called by ReelsController when
 * wilds clicks are disabled (	this.objReelsController.setWildSelectionEnabled( false ); )
 * for example during freespins and (I think) autoplay.
 * 
 * @param { Boolean } blSelectedWild It indicates if the wild is being selected, or unselected
 * 
 */
SpinController.prototype.onWildSelected = function(blSelectedWild)
{
    if (blSelectedWild)
    {
        this.objSoundController.playWildSelectedSound();
    }

	this.cancelCurrentAnimations();
	this.objReelsController.objGuiController.objGuiView.setDirty(true);
}



/**
 * If animations have not already been cancelled
 * and the screen cleared, stop them now.
 */
SpinController.prototype.cancelCurrentAnimations = function()
{
	if( this.blRunAnimations == true )
	{
		/*
		 * this.intSpinButtonState should indicate the state of SpinController
		 * Depending on what's happening
		 * we do something to cancel animations
		 */ 
		switch(this.intSpinButtonState)
		{
			// In IDLE: cancel animations IF ANY!
			case SpinController.IDLE:
            {
                // This seems redundant?
                // BGB commenting call to setbuttons to idle out for testing
		    	//this.setButtonState(SpinController.IDLE);
				if( this.resultHasLineWins() )
				{
					this.objWinLinesController.resetWinLines();
					this.objMainConsoleController.hideWinPanel();
				}
				
				this.objReelsController.hideOverlays();
				
				this.blRunAnimations = false;
			}
			break;
				
			// In AUTOPLAY_SELECT: cancel animations IF ANY!
			case SpinController.AUTOPLAY_SELECT:
            {
				if( this.resultHasLineWins() )
				{
                    this.killWinSoundInterval();
					this.objReelsController.stopSlotAnimations();
					this.objWinLinesController.resetWinLines();
					this.objMainConsoleController.hideWinPanel();
				}
				this.blRunAnimations = false;
			}
			break;

			// Pre-empt animations
			case SpinController.SPIN_RECEIVED:
				this.blRunAnimations = false;
			break;
				
			    // Skip to end of BIG_WIN and don't show summary
			case SpinController.BIG_WIN:
				this.blRunAnimations = false;
			break;
				
			// Already in summary: cancel it and don't start long animations
			case SpinController.WIN_SUMMARY:
            {
		    	this.setButtonState(SpinController.IDLE);
				if( this.resultHasLineWins() )
				{
					this.objWinLinesController.resetWinLines();
					this.objMainConsoleController.hideWinPanelNow();
				}
				this.blRunAnimations = false;
				
				this.objReelsController.hideOverlays();
			}
			break;
				
			// Interrupt the long animations and don't show idle animations
			case SpinController.WIN_ANIMATION:
			{
		    	this.setButtonState(SpinController.IDLE);

				TimerManager.getInstance().stop(this.intTimeoutId);

				if( this.resultHasLineWins() )
				{
                    this.killWinSoundInterval();
					this.objReelsController.stopSlotAnimations();
					this.objWinLinesController.resetWinLines();
					this.objMainConsoleController.hideWinPanel();
				}
				this.objReelsController.hideOverlays();
				this.blRunAnimations = false;
			}
			break;
				
			/*
			 * Bonus starting: clear idle anims
			 * TODO NOTE should we set  this.blRunAnimations = false; -???
			 */
			case SpinController.BONUS_START:
				if( this.resultHasLineWins() )
				{
					this.objWinLinesController.resetWinLines();
					this.objMainConsoleController.hideWinPanel();
				}
			break;
			
			// BONUS_PLAYING, SPIN_START, AUTOPLAY
			default:
				// -- Do nothing
			break;
		}
	}
}

/**
 * Finally decided to spin.
 * 1. Stop all animations.
 * 2. Set button state & quickstop
 * 3. Spin
 */
SpinController.prototype.initiateSpin = function()
{
	// Cancel animations if any
	this.cancelCurrentAnimations();
	
	// Close selection panels if open
	this.objAutoplayController.resetController();
	
	// Close line bet chooser if open
	this.objMainConsoleController.resetLineBetButton();
	
	// Override spin button state
	this.setButtonState(SpinController.MODAL_DIALOG);
	
	// Reset quickstop selection boolean
	this.blQuickStop = false;
	
	//
	this.blBigWin = false;
	
	// Go!
	this.spin();
}


/**
 * Check which spin button was pressed!
 */
SpinController.prototype.spin = function()
{
	switch(this.objButtonClicked.strIdButton)
	{
		case STRINGS.BTN_SPIN:
	    {
            this.setButtonState(SpinController.SPIN_START);
		
		    // play button spin sound
		    this.objSoundController.playSpinSound([0]);

			// reset the lockspin cost to match non-locked
			this.objMainConsoleController.setLockStakeText( this.objMainConsoleController.objBetController.getSpinStake() );
			
			//
			this.setSpinMessage();

			// Go
			this.objReelsController.spin();
		}
		break;
		
		// Lockspin bet can be cancelled first time around
		case STRINGS.BTN_LOCKSPIN:
		{
			if ( this.objReelsController.hasLockedWilds() )
			{
				this.objReelsController.lockspin(this.onLockspinDecision);
			}
			else
			{
                this.setButtonState(SpinController.SPIN_START);
    
    		    // play button spin sound
    		    this.objSoundController.playSpinSound([0]);
    
    			// reset the lockspin cost to match non-locked
    			this.objMainConsoleController.setLockStakeText( this.objMainConsoleController.objBetController.getSpinStake() );
    			
    			//
    			this.setSpinMessage();
    
    			// Go
    			this.objReelsController.spin();
			}
		}
		break;
	}
}

/**
 * Lockspin has a pair of dialogs it can show:
 * 1) are you sure
 * 2) bet threshold
 * In both cases if one is shown we need to lock out the spin buttons
 * until a decision has been made.
 */
SpinController.prototype.onShowingDialog = function()
{
    
}

/**
 * Lockspin wager accepted by player: spin is in progress, just set spin message.
 * Lockspin wager not accepted: Reels do nothing; reset UI.
 */
SpinController.prototype.onLockspinDecision = function( blBetAccepted )
{
	if(!blBetAccepted)
	{
		this.setButtonState(SpinController.IDLE);
	}
	else
	{
        this.setButtonState(SpinController.SPIN_START);
		this.setSpinMessage();
	}
}

/**
 * Checks Spin result for bonus start. 
 * Override in different games! 
 */
SpinController.prototype.bonusIsFlagged = function()
{
	if(this.objSpinResponseData.Spin.intBonusLetters == 5)
	{
		return true;
	}
	return false;
}

/**
 * Send the result to the autoplay controller if it is running
 * Otherwise handle it ourselves.
 * 1. Initially, allow win animations
 * 2. Direct the response appropriately
 * 
 * NOTES: Normal spins (not autoplay)
 * Until we recieve a bet response most interaction is disallowed:
 * The Spin buttons are ENABLED to allow double-tap (quick-stop) functionality.
 * LineBet and Autoplay buttons are DISABLED until the response is received.
 * As soon as the result is received they are re-enabled, allowing immediate access 
 * to change bet or intitate autoplay. Doing either of these things should cancel 
 * all win animations, including the win summary.
 * We listen for LineBet & Autoplay button presses in SpinController.onConsoleButtonPressed which
 * can only get fired once the buttons are active again.
 * 
 * NOTE: SpinController.setButtonState sets the state of the SPIN button so we can control its actions HERE.
 * it ALSO calls bottom bar controller with the state to set other console buttons appropriately.
 */
SpinController.prototype.receiveBetResponse = function( objData )
{
	/*
	 * If error, strip out error details and proceed with what should be
	 * a specially constructed (by DataParser) losing spin.
	 */
	if(objData.ERROR != null)
	{
		this.objSpinResponseData  = this.getEmergencyStopData(objData);
		
		// Cancel autoplay if active
		if( this.objAutoplayController.isActive() )
		{
		    this.objAutoplayController.cueCancel();
		}
	}

	// -- Stop reels etc

	this.blRunAnimations = true;
	this.objSpinResponseData = objData;
	
	// Do not change the spin button state during autoplays	
	if( this.objAutoplayController.isActive() == false )
	{
		
		if (!this.blQuickStop)
		{
		  this.setButtonState(SpinController.SPIN_RECEIVED);
        }
	}
	// Do, however, quick-stop the reels.	
	else
	{
		// BGB commented out, because autoplay spins are normal ending spins, not quick stop spins
		//this.blQuickStop = true;
	}

	//
	this.objReelsController.updateReels( objData.Spin, 
										 this.blQuickStop, 
										 this.onReelsStopped, // All reels stopped
										 this.onEachReelStop );// each reel stopped
	
	// notify debugPanel that result has been received
	this.objSidebarCommController.notifySpinResponseReceived();
}

/**
 * Game-specific emergency stop data used on error to spin response.
 * NOTE: This isn't really necessary as subsequent code only looks for SPIN data!
 * 
 * This method strips out the error information and returns just the 
 * Spin result part.
 * @param objData has 3 parts:
 * objData.ERROR, ERROR.errorCode
 * objData.Spin... A fully-formed Spin result giving lose positions
 * 				   with no bonus or freespins start.
 * objData.flPlayerBalance, the balance that the player had BEFORE the spin.
 */
SpinController.prototype.getEmergencyStopData = function(objData)
{
	var spinData = {};
	spinData.Spin = objData.Spin;
	spinData.flPlayerBalance = objData.flPlayerBalance;
	
	//retrun displayed balance to the previous balance amount before the bet was placed.
	var flBalance = ServerData.getInstance().flPlayerBalance;
    this.objSidebarCommController.updateBalanceDisplay(flBalance);
    
	return spinData;	
}

/**
 * Each time a reel stops we have to show a meerkat (WildGambler).
 * In other games we might have to "pop" a scatter symbol, play a reel stop sound,
 * set up "suspense" on the reel timings or something else not thought of yet :)
 * Individual meerkat popups have no sound of their own as we can only play one at a time.
 */
SpinController.prototype.onEachReelStop = function( intReelId )
{
    /*
     * If bonusLetters is 0 no meerkats will show
     */
	if( intReelId < this.objSpinResponseData.Spin.intBonusLetters )
	{
        this.objMeerkats.show(intReelId);
        
        /*
         * Final reel,and we are showing a meerkat: bonus start! 
         * Play special sound. Reelspin sound will have stopped by now anyway.
         */
        if( intReelId == 4 )
        {
            if(SidebarCommController.soundEnabled())
            {
                this.objSoundController.playMeerkatCheerSound();
                this.meerkCheering = true;
                this.meerkCheerSoundInterval = setInterval(this.meerkCheerSoundComplete, 1100);

            }
            else
            {
                this.objMeerkats.hide( 1000 );
            }
        }
	}
}

SpinController.prototype.meerkCheerSoundComplete = function ()
{ 
    clearInterval(this.meerkCheerSoundInterval);
    this.meerkCheerSoundInterval = null;
    this.meerkCheering = false;
    this.objMeerkats.hide();
}

/**
 * Reels have stopped: OK to display any wins
 * Jailbreak animations run if there are any, after which callback is made.
 * OR callback made immediately.
 */
SpinController.prototype.onReelsStopped = function()
{
	this.setSpinMessage();
	
	if( this.objSpinResponseData.Spin.intBonusLetters > 0 )
	{
    	// No bonus: hide the meerkats.
    	// If bonus == true they will hide when sound has played.
    	if(this.bonusIsFlagged() == false)
    	{
    	    this.objMeerkats.hide( 1000 );
    	}
    }
    // No meerkats
    else
    {
        this.onMeerkatsComplete();
    }
}

/**
 * Callback made after the last meerkat animation is finished. 
 */
SpinController.prototype.onMeerkatsComplete = function()
{
    if (this.meerkCheering == false)
    {
        // kill the sound when the reels stop (unless the meerkat is cheering, i.e. bonus triggered)
        this.objSoundController.stopSound();
    }
    
    /*
     * Only run the jailbreak animation on wilds if Autoplay NOT active
     */
    if( this.objAutoplayController.isActive() )
    {
        this.onBreakJailAnimComplete();
    }
    else
    {
        this.objReelsController.startBreakJailAnimations(this.onBreakJailAnimComplete);
    }
}

/**
 * Callback from wilds breaking the jail cage is complete.
 * Check for big win and/or win summary 
 */
SpinController.prototype.onBreakJailAnimComplete = function()
{
    
    this.onjAnimationController.objGuiController.objGuiView.setVisible (true);
	/*
	 * If Autoplay is running we have very different keyhandling and a 
	 * reduced animation requirement. We've shown the meerkats and 
	 * jailbreak animations, and just need to run a big win/win summary
	 * or do the next spin. We are handling that in the autoplay controller
	 * so that we can handle the UI in a different way to a normal spin.
	 */
	if( this.objAutoplayController.isActive() )
	{
		this.objAutoplayController.receiveBetResponse(this.objSpinResponseData);
	}
	/* 
	 * We have some wins.
	 * Check the win amount not arrWinlines.length to determine this:
	 * In other games there may be bonus triggers described in a WinlineResult
	 * which nevertheless probably won't have a win value as they are just scatter symbols.
	 * Another way of telling is to check the winline number: probably 0.
	 * 
	 * this.blRunAnimations is false if something (autoplay,line bet or a symbol)
	 * was clicked when the reels stopped. In that case we skip bigwin/animations and 
	 * either go straight to bonus or await spin.
	 * TODO perhaps block this interaction if a bonus is due to start.
	 */ 
	else
	{
		if( this.resultHasLineWins() && this.blRunAnimations )
		{
			var winMx = this.objSpinResponseData.Spin.flSpinWin/this.objMainConsoleController.getTotalAmountStaked();
			this.blBigWin = this.objBigWinController.isBigWin(winMx);
			
		    if( this.blBigWin )
		    {
		    	// Control spin button. Click to finish big win only allowed.
		        this.setButtonState(SpinController.BIG_WIN);	
		        this.objBigWinController.startBigWin(this.objSpinResponseData.Spin.flSpinWin, this.displayWinSummary);
		    }
		    else
		    {
		    	// Control spin button and run summary.
		    	this.displayWinSummary();
		    }
		}
		
		// No wins but we have a bonus trigger
		else if( this.bonusIsFlagged() )
		{
			// Control spin button
			this.setButtonState(SpinController.BONUS_START);
			
			// 
			this.loadBonus();
		}
		
		// No wins. Nada.
		else
		{
            // In case balance changed due to funds update.
            this.updateBalanceDisplay();
			
		    // Control spin button. Ready to spin. (Unless error dialog is present!)

            if (this.objMainConsoleController.intState != SpinController.MODAL_DIALOG)
            {
                this.setButtonState(SpinController.IDLE);
            }
		}
	}
}



/**
 * Always set spin button to disallow interaction.
 * Run summary using the WinLinesController 
 */
SpinController.prototype.displayWinSummary = function()
{
    
    this.onjAnimationController.objGuiController.objGuiView.setVisible (false);
	if(this.blRunAnimations)
	{
		// Will show the bet and, if not a big win, do a countup of the total
		this.objMainConsoleController.showWinPanel(this.objSpinResponseData.Spin.flSpinWin, !this.blBigWin);
		
		// Control console buttons.
		if(this.objSpinResponseData.Spin.blMaxWin == false)
		{
			this.setButtonState(SpinController.WIN_SUMMARY);
		}
	
		// Display summary
		this.objWinLinesController.displayWinSummary( this.objSpinResponseData.Spin.arrWinlines, 
													  this.onWinSummaryComplete );
													  
	}	
}

/**
 * Here we can unlock the spin button to allow skip-to-bonus or skip-to-spin
 * and display the one-by-one winline animations.
 * Also we need to handle maxWin.
 * AFAIK if we get maxWin no a normal spin, we don't play out any freespins or bonus.
 */
SpinController.prototype.onWinSummaryComplete = function()
{
	if(this.objSpinResponseData.Spin.blMaxWin == true)
	{
		ErrorDialog.getInstance().show("maxWin","","",this.onMaxWinDialogDismissed,[Localisation.formatNumber(this.objSpinResponseData.Spin.flSpinWin) + ""]);
	}
	else
	{
		/* 
		 * If we have line wins, show them and allow skip-to-bonus/spin.
		 * Check the win amount not arrWinlines.length to determine this:
		 * in other games there may be bonus triggers described in a WinlineResult
		 * which nevertheless probably won't have a win value.
		 */ 
		if( this.resultHasLineWins() && this.blRunAnimations )
		{
			// Control spin button
			this.setButtonState(SpinController.WIN_ANIMATION);
			
			/**
			 * Run line animations, control sequence, go to bonus or idle state when done.
			 *
			 * Copy winlines into our array. Slice = shallow copy so don't change them!
			 * TODO If any have bonus scatters described in winlines we will have to 
			 * copy them one by one ignoring the scatter "winlines".
			 */
			this.arrWinlineAnimations = this.objSpinResponseData.Spin.arrWinlines.slice();
	
			this.showWinLineAnimation();
		}
		
		// No line wins, straight to bonus if we have it
		else if( this.bonusIsFlagged() )
		{
			// Control spin button
			this.setButtonState(SpinController.BONUS_START);
			
			// TODO 
			this.loadBonus();
		}
	}
	
	//
	this.updateBalanceDisplay();
}

/**
 * Update the player's balance on the sidebar or wherever
 * after the win summary has been played out.
 * NOTE the way Playtech/GTS do this is changing, so this is the best compromise for now.
 * May want to move this to after the big win or win summary countup is complete?
 */
SpinController.prototype.updateBalanceDisplay = function()
{
    var flBalance = Number(ServerData.getInstance().flPlayerBalance);
    
    // We may want to deduct freespin/bonus winnings from the player's balance update?
    if( this.bonusIsFlagged() )
    {
        flBalance -= Number(this.objSpinResponseData.Freespins.arrFreespin[7].flFreespinsWin);
    }
    
    
    // if less than 0.00 (possible because player can update their balance elsewhere and this wouldn't be updated in the game until sending another spin request)
    // then set balance Displayed to 0.00 (preventing  crazy -ve balances)
    // TODO this could probably be handled better. Discuss.
    if(flBalance < 0)
    {
        flBalance=0.00;
    } 

    // Force to 2 decimal places
    flBalance = Number(flBalance).toFixed(2);
    
    // Display    
    this.objSidebarCommController.updateBalanceDisplay(flBalance);
}


/**
 * Max win reached, bigWin, summary and dialog shown. Revert to idle state.
 */
SpinController.prototype.onMaxWinDialogDismissed = function()
{
	this.setButtonState(SpinController.IDLE);
}

/**
 * To load bonus, first show the intro screen. 
 * Cancel win animations (idle cycle).
 * Change backgound. logo and console.
 * Disable wilds clicks.
 * init freespins manager
 * Set popup callback on show
 */
SpinController.prototype.loadBonus = function()
{
	this.cancelCurrentAnimations();
	
	// Disable wilds
	//ReelsController.setWildSelectionEnabled( false );
	
	// Set freespins metrics to 0 etc
    this.objFreeSpinController.initFreeSpins(this.objSpinResponseData.Freespins,
    									     this.startBonus,
    									     this.onFreespinsComplete, 
    									     this.objMainConsoleController.getTotalAmountStaked() );
    									     
   this.objReelsController.intState = ReelsController.STOP;
	
	// Logo and background
	this.logoSpins.blVisible = false;
	this.objFreeSpinController.changeBackground(true);
	this.objReelsController.objGuiController.objGuiView.setDirty(true);

	// Main Console
	this.objMainConsoleController.objGuiController.objGuiView.blVisible = false;
	this.objMainConsoleController.objGuiController.objGuiView.setDirty(true);
	
	//save wilds and restore them after freespins are finished
	this.objReelsController.objWildsSelector.saveWildsSelected();

	//mark we are in freespins
	this.blInFreespins = true;
	this.setFreespinsUseBlackIcon(false);
}

/**
 * Ok OK we can actually start the bonus (freespins)  
 */
SpinController.prototype.startBonus = function ()
{
	this.setButtonState(SpinController.BONUS_PLAYING);
    //this.objFSCongratsPopupController.hide();
	
	// First freespin: need to send the previous reelmap for wilds locking
	this.objFreeSpinController.lockWildsAndSpin( this.objSpinResponseData.Spin.arrSymbols );
}

/**
 * Clean up after freespins etc 
 * Show the outro panel for a fixed time then revert straight to main reels.
 * No "OK" required.
 */
SpinController.prototype.onFreespinsComplete = function()
{
	//mark we are not in freespins
	this.blInFreespins = false;
	this.setFreespinsUseBlackIcon(false);

    // Main Console
    this.objMainConsoleController.objGuiController.objGuiView.blVisible = true;
    this.objMainConsoleController.objGuiController.blDirty = true;  

	//
	this.setButtonState(SpinController.IDLE);
	
	// Logo and background. Freespins logo hidden already.
	this.logoSpins.blVisible = true;
	this.objFreeSpinController.changeBackground(false);
    
    // No idea why this is necessary
	this.objReelsController.objGuiController.objGuiView.setDirty(true);
    
    // No idea why this is necessary, or why it is here, not up there ^ with the others
	this.objMainConsoleController.objGuiController.objGuiView.setDirty(true);

	//restore wilds that were saved on freespins start
	this.objReelsController.objWildsSelector.restoreWildsSelected();
	
	//remember wilds that are currently selected
	this.objMainConsoleController.changeWilds(this.objReelsController.objWildsSelector.arrWilds);
}

/**
 * Retrieve if we should currently use black lock icon for selected wilds
 * This is true during freespins after first freespin has finished
 * 
 * @return {boolean} 
 */
SpinController.prototype.isBlackLockIconInFreespins = function()
{
	return this.blInFreespins && this.blFreespinsUseBlackLockIcon;
}

/**
 * Get the next winline result.
 * Tell the WinLinesController to draw it, returning us the symbols bounded.
 * Tell the ReelsCOntroller to animate the bounded symbols.
 */
SpinController.prototype.showWinLineAnimation = function()
{
	/*
	 * This seeks to ensure that we do not have a problem with pending callbacks/timeouts etc
	 * If the player has clicked to skip the spinButton will no longer be in this state
	 * and that tells us we should not run the next animation.
	 */
	if(this.intSpinButtonState == SpinController.WIN_ANIMATION)
	{
	    var winlineResult = this.arrWinlineAnimations.shift();

	    // play win animations based on which ever symbols are on the win line
	    this.objSoundController.playWinSound(winlineResult.intSymbolId, this.onWinLineSoundComplete);
	    this.winLineSoundsPlaying = true;

		var arrSymbolPositions = this.objWinLinesController.drawWinLine( winlineResult );
		this.objReelsController.startSlotAnimations( arrSymbolPositions, this.onSymbolAnimationComplete );

		// This now done by WinLinesView
		//this.objMainConsoleController.setLineWinText(winlineResult.flWin, winlineResult.intId+1);
		
		// Track the time this symbol animation takes to play out
		this.time = new Date().getTime();
	}
	/*
	 * This printing to the console tells us that
	 * our clause for intSpinButtonState has worked. 
	 */
	else
	{
		//console.log("showWinLineAnimation: spinButtonState is " + SpinController.arrStates[this.intSpinButtonState])
	}
}

SpinController.prototype.onWinLineSoundComplete = function ()
{
    console.log("onWinLineSoundComplete");
    this.winLineSoundsPlaying = false;
}


/**
 * Do next win animation or do bonus or do idle 
 */
SpinController.prototype.onSymbolAnimationComplete = function()
{
	// Do next if there is one	
	if( this.arrWinlineAnimations.length > 0 )
	{
		// Do the next winline animation in 1 second minus the time elapsed showing the last one
		var d = new Date().getTime();
		var delay = 1000-(d-this.time);
		if(delay > 0)
		{
			this.intTimeoutId = TimerManager.getInstance().start(this.doNextWinLineAnimation, delay);
		}
		else
		{
			this.doNextWinLineAnimation();
		}
	}
	
	// Start bonus
	else if( this.bonusIsFlagged() )
	{
		this.setButtonState(SpinController.BONUS_START);
		this.objWinLinesController.resetWinLines(this.loadBonus);
	}
	else
	{
		this.intTimeoutId = TimerManager.getInstance().start(this.runIdleResults, this.intRunIdleResultsDelay);
	}

}

/**
 * Next winline animates after a variable delay ensuring that
 * short symbol animations don't run too fast.
 * Includes linking symbol animations to sound.
 */
SpinController.prototype.doNextWinLineAnimation = function()
{
    // if the sound is not enabled (due to not being loaded or by side bar mute button)
    // OR.. freespins has been triggered
    // Then run the animations without sound.
    if ((StateFactory.BL_SOUND_ENABLED == false) || (SoundPlayer.BL_MUTE == true))
    {
        this.winLineSoundsPlaying = false;
    }

    // if a win line sound has finished playing, clear the interval and reset the win lines
    if (this.winLineSoundsPlaying == false)
    {
        clearInterval(this.winLineSoundTimerId);
        this.winLineSoundTimerId = null;
        this.objWinLinesController.resetWinLines(this.showWinLineAnimation);

    } else if(this.winLineSoundTimerId == null)
    {
        // otherwise if the winLineSound interval isn't running.. start it.
        clearInterval(this.winLineSoundTimerId);
        this.winLineSoundTimerId = setInterval(this.doNextWinLineAnimation, 200);
    }
}

/**
 * 
 */
SpinController.prototype.runIdleResults = function()
{
	// idle winline animations. Pass the winlineResults to the WinLinesController
	// and let it run them as an idler. We don't need the WinlineResults now.
	this.objWinLinesController.runIdleResults(this.objSpinResponseData.Spin.arrWinlines);

	// Ready to spin.
	this.setButtonState(SpinController.IDLE);
}


/**
 * Recieved a callback from autoplay that start was finally chosen, or not :)
 */
SpinController.prototype.startAutoplays = function(blContinueAccepted)
{
	if(blContinueAccepted)
	{
		this.objMainConsoleController.setLockStakeText( this.objMainConsoleController.objBetController.getSpinStake() );
		this.setButtonState(SpinController.AUTOPLAY);
		this.objAutoplayController.run(this.onAutoplaysComplete);
	}
	else
	{
		//AutoplayWarningController dialog dismissed
		this.objAutoplayController.setAutoplaysRemaining(0);
		this.setButtonState(SpinController.IDLE);
	}
}

/**
 * 
 */
SpinController.prototype.onSpinButtonPressed = function(objEvent, obj, intX, intY)
{
	// Which button was clicked?
	this.objButtonClicked = obj;

	/* 
	 * Handle click 
	 */
	switch( this.intSpinButtonState )
	{
		/*
		 * Nothing happening: possible winlines in idle animation.
		 * Should only be in this state when we are OK to spin.
		 */
		case SpinController.IDLE:
		{
			this.initiateSpin();
			this.objAutoplayController.resetController();
		}
		break;
		
		/*
		 * Reel spin started, awaiting result.
		 * Only action is to set quick-stop.
		 */
		case SpinController.SPIN_START:
		{
			this.setButtonState(SpinController.QUICKSTOP);
			if(!this.blQuickStop)
			{
			    this.blQuickStop = true;
			}
		}
		break;

		/* 
		 * Reels spinning, result received.
	     * Allow nothing till reels have stopped.
	     */
		case SpinController.SPIN_RECEIVED:
		{
			// -- Allow nothing
		}
		break;
			
		/* 
		 * Reels Stopped, result received.
		 */
		case SpinController.BIG_WIN:
		{
            // -- Allow nothing. BigWin accepts a click event to skip-to-end.
		}
		break;
		
		/*
		 * Showing win summary
		 */
		case SpinController.WIN_SUMMARY:
		{
			// -- Allow nothing
		}
		break;
		
		/* Spin button clicked during win animations.
		 * Player wants to skip to bonus or spin.
		 */
		case SpinController.WIN_ANIMATION:
		{
		    this.blQuickStop = false;
			// This should run this.killWinSoundInterval() among other things;
		    this.cancelCurrentAnimations();

			// Skip to bonus just starts freespins in Wild Gambler.
			if( this.bonusIsFlagged() )
			{
				this.setButtonState(SpinController.BONUS_START);
			
				this.objWinLinesController.resetWinLines(this.loadBonus);
			}
			else
			{
				this.setButtonState(SpinController.SPIN_START);
			
				this.objWinLinesController.resetWinLines(this.spin);
			}
		}
		break;

		/* Freespins intro panel will show with OK button.
		 * When it's clicked we run the freespins. 
		 * No further user interaction here until freespins finsh.
		 */
		case SpinController.BONUS_START:
		{
		    // -- Allow nothing
		}
		break;

		case SpinController.BONUS_PLAYING:
		{
		    // -- Allow nothing
		}
		break;

		case SpinController.AUTOPLAY:
		{
			// 			
			this.objAutoplayController.cueCancel();
			//this.objAutoplayController.getAutoplay().setAutoplaysRemaining(0);
		}
		break;
	}
}

/**
 * Stop win sound ending from making a callback to doNextWinLineAnimation 
 */
SpinController.prototype.killWinSoundInterval = function()
{
    clearInterval(this.winLineSoundTimerId);
    this.winLineSoundTimerId = null;
    this.winLineSoundsPlaying = false;
}

/**
 * Callback from autoplays when it runs out of spins OR
 * player pressed SPIN/LOCKSPIN button (calling cancel) during autoplays.
 * @param intState indicates whether we have stopped because
 * a) ran out of autoplays (SpinController.IDLE) or 
 * b) hit the bonus (SpinController.BONUS_START)
 */
SpinController.prototype.onAutoplaysComplete = function( intState )
{
	if( intState == null)
	{
		this.setButtonState(SpinController.IDLE);
	}
	else
	{
		this.setButtonState(intState);
		
		/*
		 * IF the autoplays cancelled early because we got to the bonus...
		 */
		if(this.intSpinButtonState == SpinController.BONUS_START)
		{
			// Get a ref to the results, which were sent to the autoplays object.
			this.objSpinResponseData = this.objAutoplayController.objSpinResponseData;
			
			// Start the bonus process.
			this.objWinLinesController.resetWinLines(this.loadBonus);
		}
	}
}

/**
 * This will be called from FreeSpinsController and will result into drawing 
 * drawing black lock icon even in case the autolock is enabled
 * This is called when first freespin is finished
 * 
 * @param {Object} blFreespinsUseBlackIcon
 */
SpinController.prototype.setFreespinsUseBlackIcon = function(blFreespinsUseBlackIcon)
{
	this.blFreespinsUseBlackLockIcon = blFreespinsUseBlackIcon;
}
