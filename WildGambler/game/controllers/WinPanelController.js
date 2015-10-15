/**
 * @author Javier.Ortega
 *
 * This class handles the WinPanel
 */

/**
 * Constructor
 * @param { Object } objGuiView The view.
 */
function WinPanelController(objGuiView, objSoundController)
{
    /*
     * The view with the panel controller
     */
    this.objGuiView = objGuiView;

    // reference for sound controller
    this.objSoundController = objSoundController;

    //console.log("this.objSoundController: " + this.objSoundController);
    
    /*
     * Show total cost of bet in normal spins
     * Number of winning lines in freespins
     */
    this.txtLinewin = this.objGuiView.getTextView("bet");
    this.txtLinewin.intY -= 4;

	/*
	 * Always shows total winnings for the current spin/freespin. 
	 */
    this.txtTotalwin = this.objGuiView.getTextView("totalWin");
    this.txtTotalwin.intY -= 4;
    
	/*
	 * New 23/04/13 built-in animation control (not via PanelController)
	 */
    this.slideIn = this.slideIn.bind(this);
    this.slideOut = this.slideOut.bind(this);
    this.intTimerId;
    
	/*
	 * Receives game configuration data
	 */
	this.configure = this.configure.bind(this);
	
	/*
	 * Receives a win amount
	 */
	this.setLineWinText = this.setLineWinText.bind(this);

	/*
	 * Receives total stake
	 */
	this.setTotalStakeText = this.setTotalStakeText.bind(this);

	/*
	 * Receives a total win amount
	 */
	this.setTotalWinText = this.setTotalWinText.bind(this);
	
	/*
	 * Show
	 */
	this.show = this.show.bind(this);
	
	/*
	 * Hide immediately
	 */
	this.hideNow = this.hideNow.bind(this);

	/*
	 * Hide 
	 */
	this.hide = this.hide.bind(this);
	
	/*
	 * return true if this.guiView.intY == this.intYHidingPosition
	 */
	this.isHidden = this.isHidden.bind(this);

    /*
     * Callback to kill the countup sound once the win text countup is complete
     */
	this.endTotalWinCountup = this.endTotalWinCountup.bind(this);

	/*
	 * Set in method configure by objConfigData (the game's configuration)
	 */
	this.strCurrencyCode;
    
    /**
     *  Specifies the initial value of the animation property.
     * @type { integer }
     */
    this.intInitY;
    /**
     * Specifies the total change in the animation property.
     * @type { integer } 
     */
    this.intChangeY;
    /**
     * Specifies the duration of the motio
     * @type { integer }
     */
    this.intTotalTime = 8000;
    /**
     * Specifies the current time, between 0 and duration inclusive.
     * @type { integer }
     */
    this.intCurrentTime;
    
    /**
     * Y coordinate for the hidding position
     * @type { int }
     */
    this.intYHidingPosition = 0;
 
    /**
     * Y coordinate for the showing position 
     * @type { int }
     */
    this.intYShowingPosition = 0;
    
    /**
     * Time when the animation starts
     * @type { integer }
     * 
     */
    this.intInitTime = 0;
    
    /**
     * The state for the animations 
     * @type {int} 
     */
    this.intState = WinPanelController.NORMAL;
    
    /*
     * Callback on show and hide: need not be used.
     */
    this.fnCallback;

	/*
	 * 
	 */
    this.objTextCounter = new TextCounter();


    //
    this.init();   
}

/**
 * Derive WinPanelController from our base type to provide inheritance
 */
Class.extend(Class, WinPanelController);



/**
 * To configure the settings from the game configuration 
 */
WinPanelController.prototype.configure = function(objConfigData)
{
	this.strCurrencyCode = objConfigData.strCurrencyCode;
   	this.objTextCounter.initialise(this.objGuiView, this.txtTotalwin, this.strCurrencyCode);
}

/**
 * New code : we run our own timer and slide up in a quicker and simpler way.
 * Timer stops when we're in position 
 */
WinPanelController.prototype.show = function( flTotalWinAmount, 
                                              blDoCountup, 
                                              fnCallbackOnShowing,
                                              fnCallbackCountupComplete )
{
	this.fnCallback = fnCallbackOnShowing;
	
	this.setTotalWinText(flTotalWinAmount, blDoCountup, fnCallbackCountupComplete);
	
	this.intTimerId = setInterval(this.slideIn, 30);
	this.objGuiView.blVisible = true;
	this.objGuiView.setDirty(true);
}

/**
 * slide up to show position 
 */
WinPanelController.prototype.slideIn = function()
{
	this.objGuiView.setDirty(true);
	this.objGuiView.intY -= 10;
	if(this.objGuiView.intY <= this.intYShowingPosition )
	{
		clearInterval(this.intTimerId);
		this.objGuiView.intY = this.intYShowingPosition;
		
		// Make callback (if it exists) now that we are visible.
		if(this.fnCallback)
		{
			this.fnCallback();
		}
		
		// Do countup if required, this can run during win summary,
		// No need to wait for it to complete.
		if(this.blDoCountup)
		{
		    this.objSoundController.totalWinCountupActive = true;
		    this.objSoundController.playWinCountupSound();

			this.objTextCounter.drawNext();
		}
	}
}

/**
 * Slide down to hide position. 
 */
WinPanelController.prototype.slideOut = function()
{
	this.objGuiView.setDirty(true);
	this.objGuiView.intY += 20;
	
	if(this.objGuiView.intY >= this.intYHidingPosition )
	{
		clearInterval(this.intTimerId);
		this.objGuiView.intY = this.intYHidingPosition;
		this.objGuiView.blVisible = false;
		
		/*
		 * May have been assigned to a function
		 * when this.hide was called.  
		 */
		if(this.fnCallback)
		{
			this.fnCallback();
		}
	}
	
	//
	//this.objGuiView.blDirty = true;
}

/**
 * Immediate hide regardless of state or position.
 */
WinPanelController.prototype.hideNow = function()
{
	clearInterval(this.intTimerId);
	this.objTextCounter.stop();
	this.objGuiView.blVisible = false;
	this.objGuiView.setDirty(true);
	this.objGuiView.intY = this.intYHidingPosition;
	this.fnCallback = null;
	this.txtLinewin.setText("");
	this.txtTotalwin.setText("");
}

/**
 * Hide normally - animate to hidden position.
 */
WinPanelController.prototype.hide = function(fnCallbackOnHide)
{
	this.objTextCounter.stop();
	this.intTimerId = setInterval(this.slideOut, 30);
	this.fnCallback = fnCallbackOnHide;
	this.txtLinewin.setText("");
	this.txtTotalwin.setText("");
}

/**
 * To init this class
 * 
 * +26px added to show less of the bar as it obscrues the reels and was
 * showing too high anyway: should only see a tiny bit of the legs.
 * 
 * +80px added to hide position as showing the meerkats also shows the win bar?!
 * This is because of something to do with the objViewGui which is shared.
 */
WinPanelController.prototype.init = function()
{
	this.intYOffset = 0;
	this.objGuiView.intX = (this.objGuiView.context.canvas.width / 2) - (this.objGuiView.intInitWidth / 2);
    var intY = ( this.objGuiView.context.canvas.height ) - (this.objGuiView.intInitHeight );
    this.objGuiView.intY = intY+this.intYOffset;
        
    this.intYShowingPosition = intY + this.intYOffset;    
    this.intYHidingPosition = this.intYShowingPosition + this.objGuiView.arrLayers[0]["hud_win_panel.png"].intHeight;    
    this.objGuiView.intY = this.intYHidingPosition;   
    this.objGuiView.blVisible = false;
}

/**
 * State for the normal state
 * @type { constant }
 */
WinPanelController.NORMAL = 0;
/**
 * State for the showing state
 * @type { constant }
 */
WinPanelController.SHOWING = 1;
/**
 * State for the hidding state
 * @type { constant }
 */
WinPanelController.HIDING = 2;
/**
 * State for the init_hidding state
 * @type { constant }
 */
WinPanelController.INIT_HIDING = 3;
/**
 * State for the init_showing state
 * @type { constant }
 */
WinPanelController.INIT_SHOWING = 4;

WinPanelController.HIDED = 5;

/**
 * The period time for the animation\
 *
 * @type {constant} 
 */
WinPanelController.ANIMATION_T = 40;

/**
 * convert winamount to string and include currency code 
 * TODO currency code
 */
WinPanelController.prototype.setLineWinText = function( flWinAmount, intLineNumber )
{
	var strWinText = "";
	var strLineText = "";
	
	if(flWinAmount > 0)
	{
		//strWinText = "from " + this.strCurrencyCode + " " + flWinAmount.toFixed(2) + " bet";
		strWinText = "from " + Localisation.formatNumber(flWinAmount) + " bet";
		
		strLineText = "(line " + intLineNumber + ")";
	}
	this.txtLinewin.setText(strWinText);
	this.txtLinewin.strLineText = strLineText;
}

/**
 * convert winamount to string and include currency code 
 * TODO currency code
 */
WinPanelController.prototype.setTotalStakeText = function(flTotalStake)
{
	var strText = "";
	if(flTotalStake > 0)
	{
        //strText = "from " + this.strCurrencyCode + " " + flTotalStake.toFixed(2) + " bet";
        strText = "from " + Localisation.formatNumber(flTotalStake) + " bet";
	}
	this.txtLinewin.setText(strText); 
}

/**
 * convert winamount to string and include currency code 
 */
WinPanelController.prototype.setTotalWinText = function( flTotalWinAmount, 
                                                         blDoCountup, 
                                                         fnCallbackCountupComplete )
{
	var strWinText = "";
	this.blDoCountup = blDoCountup;
	
	if(flTotalWinAmount > 0)
	{
		if(!this.blDoCountup)
		{
		    this.fnCallbackCountupComplete = null;
		    
			//strWinText = this.strCurrencyCode + " " + flTotalWinAmount.toFixed(2);
			strWinText = Localisation.formatNumber(flTotalWinAmount);
			
			// Make callback if there is one
			if(fnCallbackCountupComplete)
			{
    			setTimeout(fnCallbackCountupComplete, 10);
            }
		}
		else
		{	
		    this.fnCallbackCountupComplete = fnCallbackCountupComplete;
			var intCountFrom = 0.01; 
			var flFactor = 1.10;
			this.objTextCounter.start(intCountFrom, flTotalWinAmount, this.endTotalWinCountup, flFactor);
			//alert("to do this countup!!!!");
		}
	}
	
	this.txtTotalwin.setText(strWinText); 
}

/** kill the sound when the total win countup is complete **/
WinPanelController.prototype.endTotalWinCountup = function ()
{
    this.objSoundController.killTotalWinCountupSound();
    
    if(this.fnCallbackCountupComplete)
    {
        this.fnCallbackCountupComplete();
    }
}


/**
 * 
 */
WinPanelController.prototype.isHidden = function()
{
	if( this.objGuiView.intY == this.intYHidingPosition )
	{
		return true;
	}
	return false;
}

/**
 * run acalled from win panel in a continuous loop at all times.
 * Big mistake IMO. I've taken this out now but leaving the code
 * for a while in case it gets re-instated.
 * Would also like to take the meerkats out of that loop too.
 */
WinPanelController.prototype.run = function()
{
    switch ( this.intState )
    {
        case WinPanelController.INIT_HIDING :
        {
            this.intInitY = this.intYShowingPosition;
            this.intChangeY = this.intYHidingPosition - this.intYShowingPosition;
            this.intInitTime = (new Date()).getTime();
            this.intCurrentTime = 0;
            this.intState = WinPanelController.HIDING;
            this.init();
        }
        break;
        
        case WinPanelController.INIT_SHOWING :
        {
            this.intInitY = this.intYHidingPosition;
            this.intChangeY = this.intYShowingPosition - this.intYHidingPosition;            
            this.intInitTime = (new Date()).getTime();
            this.intCurrentTime = 0;
            this.intState = WinPanelController.SHOWING;
            this.init();
        }
        
        break;
        
        case WinPanelController.HIDING:
        case WinPanelController.SHOWING:
        {    
            var intNow = (new Date()).getTime();
        
            var intGapTime = ( intNow - this.intInitTime);
            
            var intExecutionTimes = Math.floor (intGapTime / WinPanelController.ANIMATION_T);
            
            if (intExecutionTimes > 3)
            {
                intExecutionTimes = 3;
            }
             
            this.intCurrentTime  += intExecutionTimes * WinPanelController.ANIMATION_T;
            
            if (this.intCurrentTime <= this.intTotalTime )
            {   
                if (this.intState == WinPanelController.HIDING)
                {
                    this.objGuiView.intY  = Bounce.easeOut(this.intCurrentTime, this.intInitY, this.intChangeY, this.intTotalTime );
                }
                else
                {
                    this.objGuiView.intY  = Bounce.easeIn(this.intCurrentTime, this.intInitY, this.intChangeY, this.intTotalTime );    
                }   
                
                //console.log (this.objGuiView.intY);
                
                this.objGuiView.setDirty(true);
            }
            else
            {
            	// ensure panel completely "docked"
            	if (this.intState == WinPanelController.HIDING)
            	{
            		this.objGuiView.intY = this.intYHidingPosition;
            	}
            	// Ensure completely shown
            	else
            	{
            		this.objGuiView.intY = this.intYShowingPosition;
            	}
            	
            	//
                if (this.intState == WinPanelController.HIDING)
                {
                	if(this.fnCallback)this.fnCallback();
                    this.intState = WinPanelController.NORMAL;
                }
                else
                {
                	if(this.fnCallback)this.fnCallback();
                    this.intState = WinPanelController.NORMAL;
                }
                
                // It is  needed to redraw
                this.objGuiView.setDirty(true);

                
            }             
         }
         break;
    }
}
