/**
 * @author Javier.Ortega
 * 
 * This class controls the bet
 */

/**
 * Constructor
 * @param {Object} objCommsController Reference to the State Factory
 * @param {Array} arrWinlines Array of win lines  
 * @param {Object} objReceiveBetResponse callback for the response of the Bet
 */
function BetController( objConfigData,
                        objCommsController, 
						arrWinlines, 
						fnReceiveBetResponse, 
						objStakeWarningController )
{
    this.objConfigData = objConfigData;
    this.objStakeWarningController = objStakeWarningController;
    this.sendBet = this.sendBet.bind(this);
    this.sendBetWithLockWilds = this.sendBetWithLockWilds.bind(this);
    this.checkBetLimits = this.checkBetLimits.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this.changeWilds = this.changeWilds.bind(this);
    this.onThresholdResponse = this.onThresholdResponse.bind(this);
    this.onIntroResponse = this.onIntroResponse.bind(this);
    this.autoLockWildsDisabled = this.autoLockWildsDisabled.bind(this);
    this.setSpinController = this.setSpinController.bind (this);
    this.objSpinController = null;
        
    this.arrThresholds=[10,100,1000];
    this.intCurThreshold = 0;
 
    /*
     * Returns the total stake played on the last spin.
     * Used to display info on the Win Bar (if there are wins)
     */
    this.getTotalAmountStaked = this.getTotalAmountStaked.bind(this);
  
  /*
   * Recorded on SPIN. We used to return flTotalCost but this is 
   * sometimes updated when the spin result arrives (if player has selected auto-lock wilds)
   * which means that we would be showing the next spin's cost on the Win Bar by mistake.
   */
  this.flCostOfPreviousSpin = 0;

  /*
   * Sets the bet level before spinning
   */
  this.setBet = this.setBet.bind(this);
  
  /*
   * Controller for gateway/server comms
   */
  this.objCommsController = objCommsController;
  
  /*
   * Required by costs calculator to work out how much the
   * wilds pattern is going to cost. 
   */
  this.arrWinlines = arrWinlines;
  
  /*
   * Callback for when response is received.
   * This is actually the StateController's receiveBetResponse function
   */
  this.fnReceiveBetResponse = fnReceiveBetResponse;
  
   /*
    * This object will be used to calculate the cost of the wilds
    */
   this.objWildCosts = new WildGamblerWilds();
   
   /*
    * The total line stake i.e. line stake x number of winlines in play
    */
   this.flTotLineStake = 1;
   
   /*
    * Cost of just the wilds
    */
   this.flWildStake = 0.00;
   
   /*
    * 
    */
   this.flTotalCost = 1;
   
   this.arrHeldWilds = [];
   
   /**
    * Popup for first bet is required to be shown 
    */
   this.blLockedBetsAccepted = false;
   this.betRequestJson;
   this.fnCallbackOnLockspinDecision;
}

/**
 * Derive BetController from our base type to provide inheritance
 */ 
Class.extend(Class, BetController);

/**
 *  
 */
BetController.prototype.autoLockWildsDisabled = function()
{
	return this.objStakeWarningController.btnIntroCheckbox.blChecked;
}

/**
 * Changing the line stake using the line bet buttons
 * causes this to be called from the bottom bar.
 * this.flTotalLineStake is used to calculate all other values. 
 */
BetController.prototype.setBet = function( flTotalLineStake )
{
	this.flTotLineStake = flTotalLineStake;
}

/**
 *
 * @return { float } Return the cost for the Spin Stake 
 * 				     IF WILDS NOT HELD
 */
BetController.prototype.getSpinStake = function ()
{    
    return this.flTotLineStake;
}

/**
 * @return { float } Return the cost for the Lock and Spin Stake 
 * 				     IF WILDS ARE HELD
 */
BetController.prototype.getLockSpinStake = function ()
{    
    return this.objWildCosts.getCostOfWilds(this.flTotLineStake,
                                         this.arrHeldWilds, 
                                         this.arrWinlines);
}

/**
 * Returns the total cost of the previous spin
 * Used to display the bet on the pop-up win bar
 * after the result has arrived and we are displaying wins.
 */
BetController.prototype.getTotalAmountStaked = function()
{
	return this.flCostOfPreviousSpin;
}


/**
 * Send a bet to the server.
 * TODO SURELY this should jsut send the flTotLineStake as we
 * are NOT holding wilds on this spin>> ??
 *  
 */
BetController.prototype.sendBet = function ()
{
    /*
     * MUST clear out the held wilds array or the server will place them 
     * back on the reels, as it thinks they are HELD! 
     */
    this.arrHeldWilds = [];
    
    /*
     * No need to calculate wilds costs, as we are not holding any.
     */    
    this.flTotalCost = this.flTotLineStake;

    // Construct JSON request. 
    this.betRequestJson = {code:STRINGS.BET,
                          stake:this.flTotalCost,
                          line:this.flTotLineStake,
                          wilds:0,
                          indices:this.arrHeldWilds};
                          
    /*
     * Bet cannot exceed max bet if we have contructed the 
     * stakes correctly. No need to check bet limit here.
     */
    this.sendRequest();
}


/**
 * As in the Flash version, before finally sending the bet we must check 
 * that it does not exceed the max bet limit.
 * It cannot be less than the min bet as that option will not be in the 
 * list of allowable stakes that the Player can choose from.
 */
BetController.prototype.checkBetLimits = function()
{
    if(this.betRequestJson.stake > this.objConfigData.Stakes.flMaxStake)
    {
        /*
         * Callback to game, no spin
         */
        this.fnCallbackOnLockspinDecision(false);

        /*
         * Show error dialog
         * NOTE: MUST DO AFTER the above callback as this sets button state to idle
         * which switches wilds & buttons on.
         */
        var displayAmount = Localisation.formatNumber(this.objConfigData.Stakes.flMaxStake);
        ErrorDialog.getInstance().show( "maxBet", "", "", null, [displayAmount] );
            
    }
    else
    {
        this.sendRequest();
        
        /*
         * Callback to game, allow spin
         */
        this.fnCallbackOnLockspinDecision(true);
    }
}


/**
 * Send a bet to the server.
 * On first lockspin bet, player must confirm through our dialog.
 * After that we can always send, subject to further confirmation dialogs
 * when the bet passes certain thresholds stored in this.arrThresholds.
 */
BetController.prototype.sendBetWithLockWilds = function( fnCallback )
{
	this.fnCallbackOnLockspinDecision = fnCallback;
	
    /*
     * Get cost of held wilds incl. line stake for lines with no wilds
     * ACTUALLY: arrIndices MUST currently exist for this method, but can be []
     * NOTE THE COMMENTS FOR THIS METHOD IN WildGamblerWilds.js!!! 
     */
    this.flTotalCost = this.objWildCosts.getCostOfWilds(this.flTotLineStake, 
                                         this.arrHeldWilds, 
                                         this.arrWinlines);
                                         
    /*
     * Extra cost of wilds for display to player (also required by engine)  
     */
    this.flWildStake = this.flTotalCost - this.flTotLineStake;
	
	/*
	 * Construct JSON request. We could change this to just code, total cost and (optional) arrIndices
	 */    
    this.betRequestJson = {code:STRINGS.BET, 
                          stake:this.flTotalCost, 
                          line:this.flTotLineStake, 
                          wilds:this.flWildStake, 
                          indices:this.arrHeldWilds};
    
    /*
     * Check if OK to play locks for the first time
     */
    if(this.blLockedBetsAccepted == false)
    {
    	this.objStakeWarningController.showIntro(this.flTotalCost, this.onIntroResponse);
    }
    
    /*
     * Check if OK to exceed current threshold.
     * If this.checkThresHold() returns true code will continue
     * from onThresholdResponse(bool).
     * 
     * If false (warning not shown) we continue.
     */
    else if( this.checkThresHold() == false )
    {
    	this.onIntroResponse(true);		    		
    }
    
    //    
    return false;
}

/**
 * Checks if the current bet is overpassing the current Threshold 
 *  
 * @return { Boolean } True if the bet is overpassing the Threshold
 */
BetController.prototype.checkThresHold = function ()
{
    if( this.flTotalCost > this.flTotLineStake * this.arrThresholds[this.intCurThreshold] )
    {
        this.objStakeWarningController.showThresholdWarning( this.flTotalCost, 
                                                             this.flTotLineStake,
                                                             this.arrThresholds[this.intCurThreshold],
                                                             this.onThresholdResponse );
       return true;   
    }
    
    //
    return false;
}


/**
 * Player has responded to bet threshold dialog. 
 * If bet accepted, move to next threshold and continue.
 * Else cancel the action.
 */
BetController.prototype.onThresholdResponse = function(blBetAccepted)
{
	if(blBetAccepted)
	{
	    /*
	     * Which threshold did we exceed?
	     * get the multiplier of the current bet
	     */
	    var mxCurBet = parseInt(this.flTotalCost / this.flTotLineStake, 10);
	    
	    // Do not overrun array of thresholds
	    for(var i=0; i<this.arrThresholds.length; ++i)
	    {
	        // Up the index 
	        if(mxCurBet > this.arrThresholds[i])
	        {
                ++this.intCurThreshold;
	        }
	        // Next threshold is greater than our current bet multiplier, so stop here.
	        else
	        {
	            break;
	        }
	    }
	    
		/*
		 * Having upped the threshold we recurse to onIntroResponse
		 */
		this.onIntroResponse(true);
	}
	else
	{
		this.fnCallbackOnLockspinDecision(false);
	}
}

/**
 * Player has responded to the intro dialog for locked spins or the threshold warning.
 * Record the decision.
 * If bet accepted, send bet to server.
 * Otherwise, cancel the action. 
 */
BetController.prototype.onIntroResponse = function( blBetAccepted )
{
	this.blLockedBetsAccepted = blBetAccepted;
    
    /*
     * Initial bet accepted. 
     * No need to show the threshold dialog on thr first spin.
     * Check bet limits before finally sending bet and spinning reels
     */	
	if(this.blLockedBetsAccepted)
	{
        this.checkBetLimits();
	}
	// locked bet cost not accepted: tell game we are not spinning.
	else
	{
        this.fnCallbackOnLockspinDecision(this.blLockedBetsAccepted);
	}
}

/**
 * This a set function for the SpinController object
 * 
 * @param {SpinController} The reference to the object
 *  
 */
BetController.prototype.setSpinController = function (objSpinController)
{
    this.objSpinController = objSpinController;
}

/** 
 * All decisions made by player (OK to play/OK to threshold)
 * Remember the cost of the bet for potential win bar display.
 * Send the bet to the server ONLY IF it is within the MAX BET param!
 */
BetController.prototype.sendRequest = function()
{
    // Record cost of bet for win panel display.
    this.flCostOfPreviousSpin = this.flTotalCost;
    
    // Send
    this.objCommsController.sendRequest( this.betRequestJson, this.fnReceiveBetResponse  );
}


/**
 * Callback to process the different selected wilds
 * @param { Array } arrWilds This array will contain the selected wilds in the reels 
 */
BetController.prototype.changeWilds = function ( arrWilds )
{
    var arrPlainWilds = [];
    for ( var intReel in arrWilds )
    {
        for ( var intSymbol in arrWilds[intReel] )
        {
            if (arrWilds[intReel][intSymbol])
            {
                arrPlainWilds.push((parseInt(intReel) * 3) + parseInt(intSymbol));
            }
        }    
    }

	// Linear array of symbol positions of held wilds 0-14
    this.arrHeldWilds = arrPlainWilds;
    
    // Get cost of held wilds incl. line stake for lines with no wilds
    // ACTUALLY: arrIndices MUST currently exist for this method, but can be []
    // TODO can recode method for no array perhaps. Or just stick with [] if none held.
    // NOTE THE COMMENTS FOR THIS METHOD IN WildGamblerWilds.js!!!
    this.flTotalCost = this.objWildCosts.getCostOfWilds(this.flTotLineStake, 
                                         this.arrHeldWilds, 
                                         this.arrWinlines);
}
