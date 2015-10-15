/**
 * Constructor
 * 
 * This object runs the autoplays.
 * It can spin the reels, display results and do next 
 * until they are all finished. The animation sequence is different to the 
 * normal run of spins, more like freespins as therte is a big win and win summary ONLY
 * between the spins (no "long animation").
 * It can also be cancelled.
 * 
 * @param {DeviceModel} deviceModel
 * @param {object} objInitReponseData
 * @param {boolean} blAutoplayAvailable - when set to false, the autoplay is not available at all
 */
function AutoplayController( deviceModel,
							 objInitResponseData,
							 blAutoplayAvailable,
							 objLocalisation,
							 objSoundController )
{
    
    this.objSoundController = objSoundController;
	this.deviceModel = deviceModel;
	this.objInitResponseData = objInitResponseData;

	this.objAutoplaySelect = null; 
	this.setSpinMessage;
	
	this.objLocalisation = objLocalisation;
	
	this.blAvailable = blAutoplayAvailable;
	this.arrAvailableOptions = objInitResponseData.arrAutoplays;

	// Callback to SpinCOntroller to make 
	// if player wants to start autoplays
	this.fnOnStartCallback;
	
	/*
	 * For starting the next spin
	 */
	this.intTimeoutId;
	this.intSpinDelay = 500;
	
	/*
	 * Callback on complete 
	 */ 
	this.fnAutoplaysComplete;
	
	/*
	 * Spin results
	 */
	this.objSpinResponseData;
	
	/*
	 * Set to true to cue up to cancel 
	 * after current spin/win animation
	 */
	this.blCueCancel = false;
	
	/*
	 * Gets result from objBigWin.isBigWin(flMx) 
	 */
	this.blBigWin = false;
	
	this.blIsActive = false;
	
	this.intAutoplaysRemaining = 0;
	this.onChangeCallback = null;

	/*
	 * 
	 */
	this.initialise = this.initialise.bind(this);
	this.run = this.run.bind(this);
	this.cueCancel = this.cueCancel.bind(this);
	this.cancel = this.cancel.bind(this);
	this.doNextAutoplay = this.doNextAutoplay.bind(this);
	this.displayWinSummary = this.displayWinSummary.bind(this);
	this.onWinSummaryComplete = this.onWinSummaryComplete.bind(this);
	this.receiveBetResponse = this.receiveBetResponse.bind(this);
	this.onReelsStopped = this.onReelsStopped.bind(this);
	this.bonusIsFlagged = this.bonusIsFlagged.bind(this);
	this.isActive = this.isActive.bind(this);
	this.resetController = this.resetController.bind(this);
	this.cueNextSpin = this.cueNextSpin.bind(this);
	this.isAvailable = this.isAvailable.bind(this);
	this.getAvailableOptions = this.getAvailableOptions.bind(this);
	this.getAutoplaysRemaining = this.getAutoplaysRemaining.bind(this);
	this.setAutoplaysRemaining = this.setAutoplaysRemaining.bind(this);
	this.setOnChangeCallback = this.setOnChangeCallback.bind(this);
	this.runOnChangeCallback = this.runOnChangeCallback.bind(this);
	this.setOnStartCallback = this.setOnStartCallback.bind(this);
	this.startAutoplays = this.startAutoplays.bind(this);
	this.onMaxWinDialogDismissed = this.onMaxWinDialogDismissed.bind(this);
}

//Class.extend(SpinController, AutoplayController);
Class.extend(Class, AutoplayController);

/**
 * Spin controller must now set this at some point before autoplays can start. 
 */
AutoplayController.prototype.setOnStartCallback = function(fnCallback)
{
	this.fnOnStartCallback = fnCallback;
}

/**
 * There must be a function to call with the result of the decision
 * whether to continue. This will have been set in SpinController's constructor
 */
AutoplayController.prototype.startAutoplays = function(blContinueAccepted)
{
	
	if(this.fnOnStartCallback == null)
	{
		throw new Error("AutoplayController.prototype.startAutoplays fnOnStartCallback not defined");
	}
	else
	{
		this.fnOnStartCallback(blContinueAccepted);
	}
	
}

/**
 * Is Autoplay available? 
 */
AutoplayController.prototype.isAvailable = function()
{
	return this.blAvailable;
}

/**
 * Retrieve available autoplay options 
 */
AutoplayController.prototype.getAvailableOptions = function()
{
	return this.arrAvailableOptions;
}
/**
 * How many autoplays to go?
 * 
 * @return {integer}
 */
AutoplayController.prototype.getAutoplaysRemaining = function()
{
	return this.intAutoplaysRemaining;
}

/**
 * Set number of autoplays to go
 * 
 * @param {integer} intRemaining - anything from interval <0,Infinity)
 * @throws {AutoplayException} - when autoplay functionality is not available 
 */
AutoplayController.prototype.setAutoplaysRemaining = function(intRemaining)
{
	//input check
	if (intRemaining != 0 && !this.isAvailable())
	{
		//throw exception if autoplay functionality is unavailable and we try to set anything but 0
		throw new AutoplayException("cannot set autoplays remaining, autoplay is disabled");
	}
	if (intRemaining !== parseInt(intRemaining,10))
	{
		//throw exception if number is string or not valid integer from interval <0,Infinity)
		throw new AutoplayException("value is not valid integer number (" + intRemaining + ")");
	}
	else if (intRemaining < 0)
	{
		throw new AutoplayException("cannot accept negative value (" + intRemaining + ")");
	}

	//ready to set value
	if (this.intAutoplaysRemaining != intRemaining)
	{
		//set remaining
		this.intAutoplaysRemaining = intRemaining;
        
        /*
         * If >0 there is at least one more to do.
         */		
		if(this.intAutoplaysRemaining > 0)
		{
			this.blIsActive = true;
		}
		
		/*
		 * If 0, setting this to false on the final spin
		 * will make the SpinController handle the result.
		 * We want this because the last spin's animations
		 * should play out as if it were an ordinary spin
		 */
		else
		{
			this.blIsActive = false;
		}
	}

	//run callback (even if the this.intAutoplaysRemaining did not change)
	this.runOnChangeCallback();	
}

/**
 * Set callback function that will be called when the number of autoplays to go changes
 * 
 * @param {Object} callback function with 1 parameter - intAutoplaysRemaining
 */
AutoplayController.prototype.setOnChangeCallback = function(callback)
{
	//set callback
	this.onChangeCallback = callback;
	//run it
	this.runOnChangeCallback();
}

/**
 * Run onChangeCallback 
 */
AutoplayController.prototype.runOnChangeCallback = function()
{
	//run callback if available
	if (this.onChangeCallback)
	{
		this.onChangeCallback(this.intAutoplaysRemaining);
	}
}


/**
 * Initialise with whatever we need to spin and show wins. 
 */
AutoplayController.prototype.initialise = function( objMainConsoleController, 
										   			objReelsController, 
										   			objWinLinesController,
										   			objBigWinController)
{
	this.objMainConsoleController = objMainConsoleController; 
	this.objReelsController = objReelsController; 
	this.objWinLinesController = objWinLinesController;
	this.objBigWinController = objBigWinController; 
}

/**
 * 
 */
AutoplayController.prototype.isActive = function()
{
	return this.isActive();
}

AutoplayController.prototype.isActive = function()
{
	return (this.blAvailable && this.blIsActive )//this.getAutoplaysRemaining() > 0);
}
/**
 * 
 */
AutoplayController.prototype.run = function( fnCompleteCb )
{
	this.fnAutoplaysComplete = fnCompleteCb;
	this.blCueCancel = false;
	this.doNextAutoplay();
}

/**
 * Cue this up to be the final one. 
 */
AutoplayController.prototype.cueCancel = function()
{
	this.blCueCancel = true;
	// bit of a hack to use the main console controller to get gui view - refa
	this.objMainConsoleController.objGuiController.objGuiView.getTextView("autoplay").setText(this.objLocalisation.getText("autoplayOff"));
	this.objAutoplaySelect.setVisibleButtonNormal();
	//this.setAutoplaysRemaining(0);
}

/**
 * Once this.objAutoplay.setAutoplaysRemaining receives 0 the object
 * marks itself as deactivated. Back in SpinController, this means that
 * when the result arrives it will be handled as per a regular spin
 * (which is what we want) i.e. there will be "long animations" etc.
 */
AutoplayController.prototype.doNextAutoplay = function()
{
	// Cancel if required
	if(	this.blCueCancel )
	{
		this.cancel();
	}
	// Or do next
	else
	{
		if( this.intAutoplaysRemaining > 0 )
		{
		    this.objSoundController.playSpinSound(0);
			this.setSpinMessage();
			this.objReelsController.stopSlotAnimations();
			this.objWinLinesController.resetWinLines();
			this.objReelsController.spin();
			this.setAutoplaysRemaining(this.intAutoplaysRemaining-1);
		}
	}
}

/**
 * 
 */
AutoplayController.prototype.receiveBetResponse = function( objData )
{
	this.objSpinResponseData = objData;
	
	this.onReelsStopped();
}


/**
 * Reels have stopped: OK to display any wins.
 * NOTE THE final result of all our autoplays DOES NOT LAND HERE
 * because we have already been made "inactive" by having set autoplays reamining to 0.
 * The result will be played out in the main reels controller which is OK as we will get
 * all the win animations and results idle state etc "for free" as it were.
 */
AutoplayController.prototype.onReelsStopped = function()
{
	/* 
	 * We have some wins.
	 * Check the win amount not arrWinlines.length to determine this:
	 * in other games there may be bonus triggers described in a WinlineResult
	 * which nevertheless probably won't have a win value.
	 */ 
	if(this.objSpinResponseData.Spin.flSpinWin > 0)
	{
		// Autoplays run off the line bet stake, never the lockspin stake.
		var winMx = this.objSpinResponseData.Spin.flSpinWin/this.objSpinResponseData.Spin.flStake;
		this.blBigWin = this.objBigWinController.isBigWin(winMx);

	    if( this.blBigWin )
	    {
	        this.objBigWinController.startBigWin(this.objSpinResponseData.Spin.flSpinWin, this.displayWinSummary);
	    }
	    else
	    {
			this.displayWinSummary();
	    }
	}
	
	// No wins but we have a bonus trigger.
	else if( this.bonusIsFlagged() )
	{
		this.cancel(SpinController.BONUS_START);
	}
	// No wins. Nada.
	else
	{
		this.cueNextSpin();
	}
}

/**
 * 
 */
AutoplayController.prototype.displayWinSummary = function()
{
	// Will show the bet. Passing false will stop it doing a countup.
	this.objMainConsoleController.showWinPanel(this.objSpinResponseData.Spin.flSpinWin, false);

	// Display winning winlines
	this.objWinLinesController.displayWinSummary(this.objSpinResponseData.Spin.arrWinlines, this.onWinSummaryComplete);
}


/**
 * 
 */
AutoplayController.prototype.onWinSummaryComplete = function()
{
	this.objMainConsoleController.hideWinPanel();
	
	if(this.objSpinResponseData.Spin.blMaxWin == true)
	{
		// Diasable all console buttons
		if(this.fnAutoplaysComplete != null)
		{
			this.fnAutoplaysComplete( SpinController.MODAL_DIALOG );
		}

		ErrorDialog.getInstance().show("maxWin","","",this.onMaxWinDialogDismissed);
	}
	// We have a bonus trigger
	else if( this.bonusIsFlagged() )
	{
		this.cancel(SpinController.BONUS_START);
	}
	// Ready to spin.
	else
	{
		this.cueNextSpin();
	}
}


/**
 * 
 */
AutoplayController.prototype.onMaxWinDialogDismissed = function()
{
	this.cancel();
}

/**
 * Replacing the timeout, which seems unreliable on iPads (?)
 * with this rather more complicated but fail-safe system; 
 * basically, this uses a persistent setInterval in MainLoop, managed by TimerManager
 */
AutoplayController.prototype.cueNextSpin = function()
{
	this.intTimeoutId = TimerManager.getInstance().start(this.doNextAutoplay, this.intSpinDelay);
}



/**
 * Typically this gets called if the selection panels are open but the 
 * player hits SPIN instead (or decides to change stake, etc)
 */
AutoplayController.prototype.resetController = function()
{
	if (this.objAutoplaySelect && this.objAutoplaySelect.isVisible())
	{
		this.objAutoplaySelect.setVisible(false);
	}
}

/**
 * Make callback if it exists i.e. if we have been running.
 * @param intState indicates whether we have stopped because
 * a) ran out of autoplays (SpinController.IDLE) or 
 * b) hit the bonus (SpinController.BONUS_START)
 * Cancel may be called as a result of clicking lockspin
 * in which case it may not have been set yet.
 */
AutoplayController.prototype.cancel = function( intState )
{
	//
	TimerManager.getInstance().stop(this.intTimeoutId);
	
	// 
	this.blCueCancel = false;
	
	// Sets this.objAutoplay.blIsActive to false	
	this.setAutoplaysRemaining(0);
	
	if(this.fnAutoplaysComplete != null)
	{
		this.fnAutoplaysComplete( intState );
		this.fnAutoplaysComplete = null;
	}
}


/**
 * Do a spin
 * @throws AutoplayException - when not ready for spinning 
 */
AutoplayController.prototype.spin = function()
{
	if (!this.isReadyForSpin()) {
		throw new AutoplayException("not ready for spinning");
	}
	
	if (this.isActive())
	{
		//decrease number of autoplays to go
		this.setAutoplaysRemaining(this.intAutoplaysRemaining-1);
	}

	//do a spin
}

/**
 * This functions gets called after all procedures after spinning has been finished and we are ready for new spin 
 */
AutoplayController.prototype.onSpinFinished = function()
{
	if (this.isActive())
	{
		//autoplay still active, there are more autoplay spins to go
		this.spin();
	}
}

/**
 * Checks Spin result for bonus start. 
 * Override in different games! 
 */
AutoplayController.prototype.bonusIsFlagged = function()
{
	if(this.objSpinResponseData.Spin.intBonusLetters == 5)
	{
		return true;
	}
	return false;
}

AutoplayController.prototype.setAutoplaySelect = function(objAutoplaySelect)
{
	this.objAutoplaySelect = objAutoplaySelect;
}
