/**
 * 
 * @param {Object} objFreeSpinsData: details for each freespin
 * @param objDeviceModel: Contains device-specific information
 * @param objFreespinConsoleController: Console 
 * @param objReelsController: Reels & symbols
 * @param objDeviceModel: Winlines display
 */
function FreeSpinController( objDeviceModel,		 	 
 						     objGuiController,
						 	 objFreespinConsoleController, 
						     objReelsController, 	 
						     objWinLinesController,
						     objBigWinController,
						     objFSCongratsPopupController,
						     objFSSummaryPopupController,
						     objBackgroundController,
                             objSidebarCommController  )
{
	// Assignments
	this.objDeviceModel = objDeviceModel;
	this.objFreespinConsoleController = objFreespinConsoleController;
   	this.objFSSummaryPopupController = objFSSummaryPopupController;
	this.objFSCongratsPopupController = objFSCongratsPopupController;
	this.objReelsController = objReelsController;
	this.objWinLinesController = objWinLinesController;
	this.objBigWinController = objBigWinController;
	this.objBackgroundController = objBackgroundController;
	this.objSidebarCommController = objSidebarCommController;
	this.objSpinController;

	// Bindings
	this.initFreeSpins = this.initFreeSpins.bind(this);
	this.stopSpin = this.stopSpin.bind(this);
	this.performSpin = this.performSpin.bind(this);
	this.performNextSpin = this.performNextSpin.bind(this);
	this.onEachReelStop = this.onEachReelStop.bind(this);
	this.onReelsStopped = this.onReelsStopped.bind(this);
	this.onBreakJailAnimComplete = this.onBreakJailAnimComplete.bind(this);
	this.onBigWinComplete = this.onBigWinComplete.bind(this);
	this.displayWinSummary = this.displayWinSummary.bind(this);
	this.lockWildsAndSpin = this.lockWildsAndSpin.bind(this);
	this.onWildsLocked = this.onWildsLocked.bind(this);
	this.changeBackground = this.changeBackground.bind(this);
	this.onMaxWinDialogDismissed = this.onMaxWinDialogDismissed.bind(this);
	this.updateBalanceDisplay = this.updateBalanceDisplay.bind(this)
	
	// Data & callbacks
	this.objFreeSpinsData;
	this.objCurrentResult;
	this.fnCallbackOnComplete;
	
	/*
	 * On a plain WIN, we wait for BOTH countups to complete
	 * before allowing the next spin to start. 
	 * this int controls that, in onCountupComplete()
	 */
    this.intElementsComplete = 0;

	
	/*
	 * Set up the assets for LOGO and NUMBERS (spins remaining)
	 */	
	this.objGuiView = objGuiController.objGuiView;
	var ph = this.objGuiView.getPlaceHolder("pixel2");

	/*
	 * Two logos - "freespinS" and "freespiN" 
	 */
	this.arrLogoFreespins = [ this.objGuiView.getElement(0,"freespins.png"),
		 					  this.objGuiView.getElement(0,"freespin.png") ];
	this.arrLogoFreespins[0].blVisible = false;
	this.arrLogoFreespins[0].intX = ph.intX;
	this.arrLogoFreespins[1].blVisible = false;
	this.arrLogoFreespins[1].intX = ph.intX;

	/*
	 *  9 numbers: 0 - 8 inclusive: always 8 freespins in WildGambler
	 */	
	this.arrFreespinNumbers = [];
	for(var n=0; n<9; ++n )
	{
		var name = "freespins_" + n + ".png";
		this.arrFreespinNumbers.push(this.objGuiView.getElement(0,name));
		this.arrFreespinNumbers[n].blVisible = false;
	}
	
	// Sort them backwards so we can use the spins iterator directly
	this.arrFreespinNumbers.reverse();
	
	// WTF ? There shouldn't be a ninth freespin
	this.objGuiView.getElement(0, "freespins_9.png").blVisible = false;

	/*
	 * Vars to control spins
	 */	
	this.intTimeoutId;
	this.intSpinDelay = 1000;
	this.intSpinsIterator = 0;
	
	/* 
	 * Received in initFreeSpins so we can determine if there was a BigWin,
	 * as it is based on the stake level.
	 */
	this.flInitialStake = 0;

	/*
	 * Switch to false to make the main reels' background appear under the summary
	 * instead of the freespins background.
	 */
	this.blHoldBgUnderSummary = true;
	
	/*
	 * Set for each win summary
	 */
	this.blBigWin = false;
	
	/*
	 * Set true to cancel countups on slow devices
	 * maybe using this.objDeviceModel
	 */
	this.blSlowDevice = false;
	
	/*
	 * This will be set in setCountUp according to
	 * whether it's a BigWin and/or slow device  
	 */
	this.blDoCountUp = true;
	
	//
    this.setCountUp = this.setCountUp.bind(this);
    this.onCountupComplete = this.onCountupComplete.bind(this);
    this.onShowWinPanel = this.onShowWinPanel.bind(this);
	this.hideWinPanel = this.hideWinPanel.bind(this);
	
	/*
	 * Not sure if we're using this!'
	 */
	this.intState = FreeSpinController.IDLE;
}
Class.extend(Class,FreeSpinController);
FreeSpinController.IDLE = 0;
FreeSpinController.ACTIVE = 1;

/*
 * Rough plan of action:
 * 1. Set all metrics to 0 
 * 2. Show intro dialog, change logo, change console.
 * 3. On Click, clear dialog.
 * 4. IF finished goto 9.
 * 5. set all wilds showing to LOCKED
 * 6. spin reels
 * 7. Wait, stop reels with next result
 * 8. Animate any win summary
 * 		GO TO 4
 * 9. Show outro dialog
 * 10. On CLick return to main reels. (Change logo, change console) 
 */


/**
 * Set all metrics to 0 and prepare for freespins.
 * @param objFreeSpinsData: All the freespin results in one group
 * @param fnCallbackOnStart: function to run when intro dialog is dismissed on OK
 * @param fnCallbackOnComplete:  function to run when freespins are done
 */
FreeSpinController.prototype.initFreeSpins = function ( objFreeSpinsData, 
														fnCallbackOnStart, 
														fnCallbackOnComplete,
														flInitialStake )
{
	this.flInitialStake = flInitialStake;
	
	this.intState = FreeSpinController.ACTIVE;

	this.intSpinsIterator = 0;
	this.objFreeSpinsData = objFreeSpinsData;
	this.fnCallbackOnComplete = fnCallbackOnComplete;
	    
	this.objFreespinConsoleController.show();
	this.objFSCongratsPopupController.show(fnCallbackOnStart);
}

/**
 * Return true if the freespins mode is enabled
 * 
 * @return {Boolean} 
 */
FreeSpinController.prototype.freeSpinsEnabled = function()
{
    return (this.intState == FreeSpinController.ACTIVE);   
}

/**
 * Spin the reels with the right reelset:
 * ReelController can be given reelset ID and stop positions,
 * also needs positions of wilds which auto-lock during freespins.
 * Handle callback when reels have stopped.
 */
FreeSpinController.prototype.performSpin = function()
{
	this.objReelsController.freespin();
	this.intTimeoutId = TimerManager.getInstance().start(this.stopSpin, this.intSpinDelay*2);	
}

/** 
 * Swap in the background & logo changes
 */
FreeSpinController.prototype.changeBackground = function(blMakeFsLogoVisible)
{
	// Hide main bg and show freespins bg
	// TODO hiding the main bg clears the entire screen :( - to be fixed -??
	//document.getElementById("bgMain").hidden = blLogoVisible;
	//document.getElementById("bgFreeSpins").hidden = !blMakeFsLogoVisible;
	//document.getElementById("bgFreeSpins").style.display = (!blMakeFsLogoVisible) ? "block" : "none";
	if (blMakeFsLogoVisible)
	{
		this.objBackgroundController.setBackgroundFreespins();
	}
	else
	{
		this.objBackgroundController.setBackgroundMain();
	}
	
	// Show/hide freespins logo and number	
	this.arrLogoFreespins[0].blVisible = blMakeFsLogoVisible;
	this.arrFreespinNumbers[this.intSpinsIterator].blVisible = blMakeFsLogoVisible;
	if(!blMakeFsLogoVisible)this.objFreespinConsoleController.hide();
}

/**
 * Spin is stopped after an arbitrary timeout (since we already have all the results) 
 */
FreeSpinController.prototype.stopSpin = function()
{
	this.objReelsController.updateReels( this.objFreeSpinsData.arrFreespin[this.intSpinsIterator], 
										 false, 
										 this.onReelsStopped,
										 this.onEachReelStop);
}

/**
 * No in-reel bonuses or scatters in WildGambler.
 * However, we don't want SpinController to receive this callback during freespins.
 */
FreeSpinController.prototype.onEachReelStop = function(intReelId)
{
	
}

/**
 * Run any wilds animations then continue
 */
FreeSpinController.prototype.onReelsStopped = function()
{
	// Get the current result and increment iterator
	this.objCurrentResult = this.objFreeSpinsData.arrFreespin[this.intSpinsIterator];
	++this.intSpinsIterator;

	// Change the number of free spins remaining
	this.arrFreespinNumbers[this.intSpinsIterator-1].blVisible = false;
	this.arrFreespinNumbers[this.intSpinsIterator].blVisible = true;
	
	// swap logo to show "[1] Free Spin", then swap back for final spin ("[0] Free Spins")
	if(this.intSpinsIterator == this.arrFreespinNumbers.length-2)
	{
		this.arrLogoFreespins[0].blVisible = false;
		this.arrLogoFreespins[1].blVisible = true;
	}
	else if(this.intSpinsIterator == this.arrFreespinNumbers.length-1)
	{
		this.arrLogoFreespins[0].blVisible = true;
		this.arrLogoFreespins[1].blVisible = false;
	}

	// Run wilds' jail break animations if they exist 
	this.objReelsController.startBreakJailAnimations(this.onBreakJailAnimComplete);
	
	//override wild red lock icon with black lock icon
	this.objSpinController.setFreespinsUseBlackIcon(true);
}

/**
 * Callback from wilds breaking the jail cage is complete.
 * Check for big win and/or win summary 
 */
FreeSpinController.prototype.onBreakJailAnimComplete = function()
{
	if(this.objCurrentResult.flSpinWin > 0)
	{
		var winMx = this.objCurrentResult.flSpinWin/this.flInitialStake;
		this.blBigWin = this.objBigWinController.isBigWin(winMx);
		
		// Stop countup in total win and win bar if big win or slow device
		this.setCountUp();
		
		//
	    if( this.blBigWin )
	    {
	    	// Control spin button. Click to finish big win only allowed.
	        this.intSpinButtonState = SpinController.BIG_WIN;	
	        this.objBigWinController.startBigWin(this.objCurrentResult.flSpinWin, this.onBigWinComplete);
	    }
	    else
	    {
	    	// Control spin button and run summary.
	    	this.displayWinSummary();
	    }
	}
	// No wins. Nada.
	// introduce short delay to allow the reelController's wildsView animation stack to unwind.
	else
	{
		this.intTimeoutId = TimerManager.getInstance().start(this.performNextSpin, 30);
	}
}


/**
 *
 */
FreeSpinController.prototype.onBigWinComplete = function()
{
	this.displayWinSummary();
}

/**
 * Run freespins complete sequence if we're done OR
 * lock wilds and spin off. 
 */
FreeSpinController.prototype.performNextSpin = function()
{
	// All spins complete
	if(this.intSpinsIterator == this.objFreeSpinsData.arrFreespin.length)
	{
		var flTotalWin = this.objCurrentResult.flFreespinsWin;

		/*
		 * Have the summary dialog call the SpinController's callback if you want to 
		 * hold the freespins background under the summary.
		 * Make the callback here immediately if you want the background to revert to main
		 * underneath the summary panel.
		 * You have the option to hide the Free Spins logo, or just the number.
		 */
		this.blHoldBgUnderSummary = true;
		
		if(this.blHoldBgUnderSummary)
		{
		    
			//this.objFreespinConsoleController.hide();
			this.objFSSummaryPopupController.show( flTotalWin, this.fnCallbackOnComplete );
			this.arrFreespinNumbers[this.intSpinsIterator].blVisible = false; 
			this.objGuiView.setDirty (true);
		}
		else
		{
			this.objFSSummaryPopupController.show( flTotalWin );
			this.fnCallbackOnComplete();
		}
		this.intState = FreeSpinController.IDLE;
	}
	else
	{
		// Send the previous spin's data
		this.lockWildsAndSpin(this.objFreeSpinsData.arrFreespin[this.intSpinsIterator-1].arrSymbols);
	}
}

/**
 * Before spinning off, lock all wilds to the reels.
 * The first freespin is triggered by SpinController on intro panel OK: SpinController.prototype.startBonus
 * @param the reel map _currently_ on the reels
 * 
 */
FreeSpinController.prototype.lockWildsAndSpin = function( symbolData )
{
	this.objReelsController.lockWilds(symbolData, this.onWildsLocked);
	
	this.objFreespinConsoleController.objGuiView.blVisible = true; 
    this.objFreespinConsoleController.objGuiView.setDirty(true); 
}

/**
 * 
 */
FreeSpinController.prototype.onWildsLocked = function()
{
	this.performSpin();
}


/**
 * Do not use countup in win bar or total win field
 * if a big win OR a slow device 
 */
FreeSpinController.prototype.setCountUp = function()
{
    // No countup on big win
    this.blDoCountUp = !this.blBigWin;
    
    // If not a big win, check device
    if(this.blDoCountUp)
    {
        this.blDoCountUp = !this.blSlowDevice;    
    }
}


/**
 * WIN SUMMARY
 * We have two things to wait for if we get wins in freespins.
 * We show the win panel and do a countup (or not)
 * We set the total win text and do a countup (or not)
 * 
 * MADE A CALLBACK TO HANDLE ALL THESE
 * See onCountupComplete. 
 * Called by both of the above as they finish.
 * When the counter hits 2 we can continue.
 * 
 */

/**
 * Now shows the win bar. Summary shows when bar is showing.
 * Freespins win bar shows the number of winning lines (where BET used to show in main spins)
 * And does a countup from 0 with the amount won (if not a big win).
 * Should not count up if it was a big win because big win did its own countup.
 */
FreeSpinController.prototype.displayWinSummary = function()
{
    this.intElementsComplete = 0;

	this.objFreespinConsoleController.showWinPanel( this.objCurrentResult.arrWinlines.length,
													this.objCurrentResult.flSpinWin, 
													this.blDoCountUp,
													this.onShowWinPanel, 
													this.onCountupComplete);
}

/**
 * Called when the win panel is fully shown.
 * Show line summary. Count up total from current total to new total.
 * Win panel may or may not be doing a concurrent countup (depending on big win)
 */
FreeSpinController.prototype.onShowWinPanel = function()
{
    /*
     * Original code: performed a countup concurrent with other animations:
     * was finishing after the next spin had started.
     * Now we are waiting for the countup to finish.
     
	this.objFreespinConsoleController.setTotalWinText(this.objCurrentResult.flFreespinsWin, this.blDoCountUp);
    this.objWinLinesController.displayWinSummary(this.objCurrentResult.arrWinlines, this.hideWinPanel);
    */
    
    /*
     * New code: Need a callback when countups are complete:
     * Should always complete countups before starting the next spin.
     * No countups in the cases of big win/slow device:
     * callbacks will happen immediately after setting the win amount texts
     */
    this.objFreespinConsoleController.setTotalWinText(  this.objCurrentResult.flFreespinsWin, 
                                                        this.blDoCountUp,
                                                        this.onCountupComplete );
                                                        
    /*
     * Unline objWinLinesController.displayWinSummary, this will not clear itself
     * after a set amount of time. We are leaving the winlines on display until
     * the countup has finished.
     * 
     * We still need a callback: this will run as soon as the lines are gone.
     * We can then continue with the next spin.
     * 
     * To allow the winlines to clear themselves use .displayWinSummary!
     */                                                    
     if(this.blDoCountUp)
     {
        this.objWinLinesController.displayWinSummaryUntilCleared( this.objCurrentResult.arrWinlines, 
                                                                  this.hideWinPanel );
     }
     else
     {
        this.objWinLinesController.displayWinSummary( this.objCurrentResult.arrWinlines, 
                                                      this.hideWinPanel);
     }
}

/**
 * Each of the animated elements calls here when done:
 * The win bar
 * The free spins total
 * 
 * When both have returned we can do the next spin.
 */
FreeSpinController.prototype.onCountupComplete = function()
{
    ++this.intElementsComplete;
    console.log("FreeSpinController completed " + this.intElementsComplete);
    
    /*
     * >= for belt and braces
     */
    if(this.intElementsComplete >= 2)
    {
        this.intElementsComplete = 0;
        console.log("FreeSpinController element callbacks Complete");
        
        if(this.blDoCountUp)
        {
           this.objWinLinesController.clearWinLines();
        }
    }
}

/**
 * Called when the win lines have finished drawing.
 * Win panel hides then calls next spin.
 * Here also update player balance with the total so far.
 */
FreeSpinController.prototype.hideWinPanel = function()
{
	if(this.objCurrentResult.blMaxWin == true)
	{
		ErrorDialog.getInstance().show("maxWin","","",this.onMaxWinDialogDismissed);
	}
	else
	{
		this.objFreespinConsoleController.hideWinPanel(this.performNextSpin);
	}
    
    // Incremental balance update	
	this.updateBalanceDisplay();
}

/**
 * Update the balance to show how much we have won so far.
 * In games that have a fullscreen or other bonus, don't forget
 * to deduct that value too. 
 */
FreeSpinController.prototype.updateBalanceDisplay = function()
{
	// Get the total balance in the player's account.
    var flBalance = Number(ServerData.getInstance().flPlayerBalance);
    
    // Deduct the total freespins winnings.
    var flTotFreespinsWin = Number(this.objFreeSpinsData.arrFreespin[this.objFreeSpinsData.arrFreespin.length-1].flFreespinsWin);
    
    //
    var flDisplayedBalance = Number( flBalance - flTotFreespinsWin );
    
    // Add in the winnings so far.
    // flFreespinsWin is a running total
    flDisplayedBalance += Number(this.objCurrentResult.flFreespinsWin);

    // Force 2 dec places.
    flDisplayedBalance = Number(flDisplayedBalance).toFixed(2);
    
    // Display total won so far.
	this.objSidebarCommController.updateBalanceDisplay(flDisplayedBalance);
}

/**
 * 
 */
FreeSpinController.prototype.onMaxWinDialogDismissed = function()
{
	this.objFreespinConsoleController.hideWinPanel(this.performNextSpin);
}

/**
 * @param {SpinController} objSpinController
 */
FreeSpinController.prototype.setSpinController = function(objSpinController)
{
	this.objSpinController = objSpinController;
}
