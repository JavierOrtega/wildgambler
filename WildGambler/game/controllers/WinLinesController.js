/**
 * @author Javier.Ortega
 * 
 * This class will handle the specific functionalities for the WinLinesView
 * Scaling up or down and centering for all the different devices
 */


/**
 * Constructor
 * @param { Object } objMainConsole The height of the bottom bar
 * @param { Object } objGuiController The height of the bottom bar
 * @param { Object } intHeightBottomBar The height of the bottom bar
 */
function WinLinesController( objMainConsole, objDeviceModel, objGuiController )
{
    this.initWinLinesView = this.initWinLinesView.bind (this);
    this.resetWinLines = this.resetWinLines.bind (this);
    this.displayWinSummary = this.displayWinSummary.bind (this);
    this.drawWinLine = this.drawWinLine.bind(this);
    this.clearWinLines = this.clearWinLines.bind (this);
    this.runIdleResults = this.runIdleResults.bind(this);
    this.clear = this.clear.bind (this);
    this.displayWinSummaryUntilCleared = this.displayWinSummaryUntilCleared.bind(this);
    
    
    /**
     * The winlines information from the game configuration 
     */
    this.objConfigDataWinlines;
    
    /**
     * This is the div container for the canvas
     * @type {Object}
     */
    this.objDivContainer = document.getElementById('winLinesArea');
    
    /**
     * This canvas reference
     * @type {Object}
     */    
    this.objCanvas = document.getElementById('winLines');
    
    /**
     * A refernce to the controller for the Bottombar
     * @type {Object}
     */    
    this.objMainConsole = objMainConsole;
    
    /**
     * A refernce to the Gui controller for the reels
     * @type {Object}
     */
    this.objGuiController =  objGuiController;
    
    this.create(objDeviceModel, objGuiController );

    /**
     * The array of the reel animations
     * @type {Array}
     */    
    this.arrWinLinesController = new Array();
    
    this.objWinLinesView =  new WinLinesView(objGuiController.objGuiView);
    
    //objGuiController.objGuiView.addElement(10,"winlinesView",this.objWinLinesView);
    this.fnCallback;
    this.intTimeoutId;
    
    this.dataReceived = this.dataReceived.bind(this);
    this.objAssetsFactory = new AssetsFactory(); 
}

/**
 * Derive WinLinesController from our base type to provide inheritance
 */ 
Class.extend(ScreenLogicController, WinLinesController);

/**
 * Call from StateFactory.prototype.initMainGame
 * To initialise the winlines 
 */
WinLinesController.prototype.initWinLinesView = function( objConfigData )
{
	var arrSymbolBounds = [];
	for(var c=0; c<ReelsController.COLUMNS; ++c )
	{
		for(var r=0; r<ReelsController.ROWS; ++r )
		{
			arrSymbolBounds.push(this.getSymbolBounds(c,r));
		}
	}
	
	this.objConfigDataWinlines = objConfigData.Winlines;
	
	var config = this.objConfigDataWinlines;
	config.strCurrencyCode = objConfigData.strCurrencyCode;
	this.objWinLinesView.initialise( config, arrSymbolBounds );
}

WinLinesController.prototype.dataReceived = function(arrResources)
{
	this.image = arrResources;
}

/**
 * This assigns a reference to the animation controller
 */
WinLinesController.prototype.assignAnimationController = function (objAnimationController)
{
    this.objWinLinesView.assignAnimationController(objAnimationController);
}


/**
 * Called when a new spin is started.
 * MAY need to continue the spin process after this has finished doing something
 * perhaps using a callback since that is our design pattern....
 * That way we might delay the start of the spin until animations have finished
 * but this depends on how we are running any win animations etc. These SEEM to 
 * be running from here using this.arrWinLinesController??
 */
WinLinesController.prototype.resetWinLines = function( fnCallback )
{
	this.objWinLinesView.clear( fnCallback );
}

/**
 * Here we receive command from FreeSpinController to display a summary of wins.
 * We will clear the sumamry when we are ready by calling clearWinLines
 */
WinLinesController.prototype.displayWinSummaryUntilCleared = function( arrWinlines, fnCallback )
{
    // WinLinesView needs the winline id's in an array
    var arrWinlineIds = [];
    
    for( var wl in arrWinlines )
    {
        arrWinlineIds.push(arrWinlines[wl].intId)
    }

    this.fnCallback = fnCallback;

    this.objWinLinesView.drawLine(arrWinlineIds);
}

/**
 * Here we receive command from SpinController to display a summary of wins.
 * fnCallback will be called when summary is complete. 
 * WinLinesController could be in charge of the display time (since we are Controller) -?
 */
WinLinesController.prototype.displayWinSummary = function( arrWinlines, fnCallback )
{
	// WinLinesView needs the winline id's in an array
	var arrWinlineIds = [];
	
	for( var wl in arrWinlines )
	{
		arrWinlineIds.push(arrWinlines[wl].intId)
	}

	
	this.objWinLinesView.drawLine(arrWinlineIds);
	this.fnCallback = fnCallback;
	this.intTimeoutId = TimerManager.getInstance().start(this.clearWinLines, this.objWinLinesView.intAttractorSpeed);
}

/**
 * Recieved a request to draw a winline with bounding box and win amount.
 * Request from SpinController requires the positions of the symbols 
 * to give to the ReelsController.
 */
WinLinesController.prototype.drawWinLine = function( objWinLineResult )
{
	var arrSymbolPositions = [];
	for( var s=0; s<objWinLineResult.intCount; ++s)
	{
		arrSymbolPositions.push( this.objConfigDataWinlines.arrWinlines[objWinLineResult.intId].arrMapping[s] );
	}
	
	// Add in the line bet amount for wins display:
	// The winline's flWin is a mutliplier not a winamount
	objWinLineResult.flLineBet = this.objMainConsole.objLinebet.getCurrentLinebet()
	this.objWinLinesView.drawWinLine( objWinLineResult );
	
	return arrSymbolPositions;
}

/**
 * Run around in circles with the results 
 */
WinLinesController.prototype.runIdleResults = function(arrWinlineResults)
{
	this.objWinLinesView.initialiseIdleResults(arrWinlineResults);
}

/**
 * Simple clear command which we assume will proceed OK 
 */
WinLinesController.prototype.clear = function()
{
	TimerManager.getInstance().stop(this.intTimeoutId);
	this.objWinLinesView.clear();
}

/**
 * 
 */
WinLinesController.prototype.clearWinLines = function()
{
	this.resetWinLines( this.fnCallback );
}

/**
 * To return the bounds for a symbol
 * @param { int } intX The x coordinate for the symbol
 * @param { int } intY The y coordinate for the symbol
 * @return { Array } Array with the bounds (x,y,w,h) for the symbol
 */
WinLinesController.prototype.getSymbolBounds = function (intX, intY)
{
    var arrBounds = [];
    
    arrBounds[0] = ReelsController.INIT_X  + intX * (ReelSlotView.WIDTH + ReelsController.GAP_X ) ;
    arrBounds[1] = ReelsController.INIT_Y + intY * (ReelSlotView.HEIGHT + ReelsController.GAP_Y ) ;
    arrBounds[2] = ReelSlotView.WIDTH;
    arrBounds[3] = ReelSlotView.HEIGHT ;
    
    return arrBounds;
}
/**
 * To resize the reels canvas, when it is needed
 * 
 */
WinLinesController.prototype.resize = function()
{
    // The original relation width / height for the original design
    var widthToHeight = ReelsController.WIDTH / ReelsController.HEIGHT;
    
    var newWidth = StateFactory.WIDTH_CONTAINER ;
    
    var newHeight =  StateFactory.HEIGHT_CONTAINER - this.objMainConsole.intHeightBottomBar;
    
    var newWidthToHeight = newWidth / newHeight;
    
    // To detect what dimension we should use to fill the maximum screen area possible
    if (newWidthToHeight > widthToHeight)
    {
        this.intrelation = newHeight / ReelsController.HEIGHT;
    }
    else
    { // window height is too high relative to desired game height
        this.intrelation = newWidth / ReelsController.WIDTH;
    }
    
    //We apply the correct relation depending of the platform
    this.objCanvas.width = ReelsController.WIDTH / this.intrelation;
    this.objCanvas.height = ReelsController.HEIGHT / this.intrelation;
    
    this.objDivContainer.style.marginTop = (1) + 'px';
    this.objDivContainer.style.marginLeft = (newWidth/2 - (ReelsController.WIDTH  * this.intrelation/ 2))  + 'px';
    
    if ( this.objDeviceModel.platform == OS.IOS || this.objDeviceModel.platform == OS.WINDOWS )
    {
        this.objCanvas.width = ReelsController.WIDTH;
        this.objCanvas.height = ReelsController.HEIGHT;
        
        this.objDivContainer.style.marginTop = (0) + 'px';
        this.objDivContainer.style.marginLeft = (newWidth/2 - (ReelsController.WIDTH  * this.intrelation/ 2)) + 'px';
        
        this.objCanvas.style.width = (ReelsController.WIDTH *this.intrelation)+ 'px';
        this.objCanvas.style.height = (ReelsController.HEIGHT * this.intrelation) + 'px';
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
    
    this.objGuiController.objGuiView.setDirty(true);
    
        
    window.scrollTo(0, 1);
}
