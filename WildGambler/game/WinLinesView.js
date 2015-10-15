/**
 * @author maserlin
 * This class aggregates information from various sources and uses the data
 * to create a winline object which draws itself on demand given an id.
 * The intIds run from 0-20 (currently, for WildGambler) where winline 0 
 * runs across the middle of the screen.
 */


/**
 * Constructor
 * @param { Object }  objView The view to draw
 */
function WinLinesView( objView )
{
	/**
	 * Data received from ReelsController 
	 */
	this.objAssetsFactory = new AssetsFactory(); 
	this.objView = objView;
	
	/**
	 * Draw context and "Z-order"
	 */
	//var c=document.getElementById("winlines");
	this.objContext = objView.context;
	this.objView.addElement(10,"winLines",this);
	
	/** 
	 * Attractor mode
	 */	
	this.intLineId = 0;
	this.intAttractorSpeed = 1500;
	this.intTimeoutId = 0;

    /**
     * Owns Text object to write line win value and line number 
     */
    this.objBottomBar;

	
	/**
	 * An array of WinLineDescriptions. Each description has been built
	 * using various parts of our received data and can draw itself appropriately. 
	 * It knows its colour, width, shape, direction etc.
	 */
	this.arrWinLineDesc = [];

	/**
	 * Draw buffer holding array of winLineDescription objects.
	 * When empty, nothing draws. 
	 */
	this.arrLineBuffer = [];

	/**
	 * Locally held translation of whatever we might need from
	 * various sources (config, buttons json, colours etc).
	 * Holds Configuration.objWinlineData, JSON data from ReelController
	 * and further JSON data describing symbol positions and sizes etc.
	 */ 
	this.objWinLineData;
	
	
	/**
	 * Bound methods 
	 */
	this.initialise = this.initialise.bind(this);
	this.dataReceived = this.dataReceived.bind(this);
	
	this.clear = this.clear.bind(this);
	this.continueClear = this.continueClear.bind(this);
	this.draw = this.draw.bind(this);

	this.drawLine = this.drawLine.bind(this);
	this.drawWinLine = this.drawWinLine.bind(this);
	this.runAttractor = this.runAttractor.bind(this);
	
	// Mostly for testing and setup
	this.drawLineAndBox = this.drawLineAndBox.bind(this);


	/**
	 * Fake results for testing only 
	 */
	this.idleResults = fakeResults();
	this.initialiseIdleResults = this.initialiseIdleResults.bind(this);
	this.runIdleResults = this.runIdleResults.bind(this);
	this.makeCallback = this.makeCallback.bind(this);
}
Class.extend( ElementView, WinLinesView );



/**
 * Call from StateFactory.prototype.initMainGame VIA ReelsController.prototype.initWinLinesView
 * To initialise the winlines.
 * @param objConfigData is the winlines configuration
 * We also need the winline buttons JSON
 */
WinLinesView.prototype.initialise = function(objConfigData, arrSymbolBounds)
{
	/**
	 * Get the configuration's winline array which gives the 
	 * pattern of symbols in each winline. This initialises our
	 * data object.
	 * Also the bounds data for each symbol from ReelsController
	 */
	this.objWinLineData = objConfigData;
	this.objWinLineData.arrSymbolBounds = arrSymbolBounds;

	/** 
	 * Get the JSON file describing where to start drawing each line.
	 */
	this.objAssetsFactory.getResources(this.dataReceived, ["winlineButtons.json"]);
}

/**
 * Receives JSON description of the winline buttons: most importantly
 * each object describes where to start drawing the winline.
 * The resources are stored in our objWinLineData which holds relevant stuff
 * from various sources. 
 */
WinLinesView.prototype.dataReceived = function( arrResources )
{
	/**
	 * Add the layout information.
	 * NOTE data is in .layers[5] - MUST NOT CHANGE THIS!
	 */
	this.objWinLineData.layouts = [];
	var elements = arrResources["winlineButtons.json"].layers[0].elements;
	
	/*
	 * We want all but the opposing 01 button w01b.png
	 * WATCH OUT if this name changes!
	 */
	var layouts = [];
	for(var layout=0; layout<elements.length; ++layout)
	{
		var element = elements[layout];
		// Skip w01b.png
		if(element.name != "w01b.png")
		{
			// ensure integers
			element.x = parseInt(element.x,10);
			element.y = parseInt(element.y,10);	
			// Keep
			this.objWinLineData.layouts.push(element);
		}
	}
	
 	// Sort layout pixel info into winline order 
	this.objWinLineData.layouts.sort(this.sortFunc);
	
	// Discover left/right (rough calc)
	var intLeftSideX = this.objWinLineData.layouts[0].x + 50; 

	// Create a description of each basic line from the data received.
	// These will be the actual draw objects
	for( var wl=0;wl<this.objWinLineData.arrWinlines.length; ++wl )
	{
		// Determine whether to draw each line L->R or R->L
		var intAlign = this.objWinLineData.layouts[wl].x > intLeftSideX ? WinLineDescription.ALIGN_RIGHT : WinLineDescription.ALIGN_LEFT;
			
		//
		this.arrWinLineDesc.push( new WinLineDescription( wl,
														  this.objContext,
														  this.objWinLineData,
														  intAlign) );
	}
	
	for ( var i = 0 ; i < this.arrWinLineDesc.length ; i++)
	{
	    //console.log("Line " + (i+1));
	    var points = this.arrWinLineDesc[i].arrPoints;
	    for ( var j = 0 ; j < points.length ; j++ ){
	    //   console.log(points[j]);    
	    }
	    
	}
	/** Test a line, bounding box and win box
	var winlineTest=2;
	var symbols=[0,3,6,9,12];
	this.drawLineAndBox(winlineTest, { arrSymbols:symbols,
										 flLineBet:0.1,
										 flWin:10,
										 intCount:5,
										 intId:winlineTest,
										 intSymbolId:0} );
	*/
	
	/** Test all winlines*/
    //this.drawLine([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]);
    //this.drawLine([3,4,5,6,8,9,11,12,13]); //right side alignment
    //this.drawLine([0,1,2,10,14,15,16,17,18,19]); // left side alignment;
		
	/** Run attractor
	this.runAttractor();
	setTimeout(this.clear, 2000)
	this.runIdleResults();
	*/
}

/**
 * This assigns a reference to the animation controller
 */
WinLinesView.prototype.assignAnimationController = function (objAnimationController)
{
    this.objAnimationController = objAnimationController; 
}

/**
 * 
 */
WinLinesView.prototype.initialiseIdleResults = function(arrWinlineResults)
{
	this.idleResults = arrWinlineResults;
	this.intLineId = 0;
	this.runIdleResults();
}

/**
 * 
 */
WinLinesView.prototype.runIdleResults = function()
{
    this.clear();
    
    // Line summary drawing one at a time.
    this.objView.setDirty (true);
    
    //
    var winlineResult = this.idleResults[this.intLineId];
    
    //
    this.drawWinLine(winlineResult);
    
    // Control next to show, if there's more than 1 
    if(this.idleResults.length > 1)
    {
        this.intLineId = this.intLineId < this.idleResults.length-1 ? this.intLineId+1 : 0;
        if(this.intLineId >= 0)
        {
            this.intTimeoutId = TimerManager.getInstance().start(this.runIdleResults, this.intAttractorSpeed * 0.66);
        }
    }
    else
    {
        this.intLineId = 0;
    }
}

/**
 * Attractor mode shows lines one by one in sequence.
 */
WinLinesView.prototype.runAttractor = function()
{
    this.clear();

    //
    this.objView.setDirty (true);

    // Line summary drawing.
    this.drawLine([this.intLineId]);
    
    // Control next to show. 
    this.intLineId = this.intLineId < this.arrWinLineDesc.length-1 ? this.intLineId+1 : 0;
    if(this.intLineId >= 0)
    {
        this.intTimeoutId = TimerManager.getInstance().start(this.runAttractor, this.intAttractorSpeed);
    }
} 

/**
 * Sort layout pixel info into winline order 
 */
WinLinesView.prototype.sortFunc = function (arr1,arr2)
{
    var a = parseInt(arr1.name.substr(1,3),10);
    var b = parseInt(arr2.name.substr(1,3),10);
    
    return a-b;
}


/**
 * this draw method is called in the main loop while the app is running.
 * The Object in the arrLineBuffer (a WinLineDescription) must have a
 * valid fnDrawMethod assigned. 
 * This will either draw a plain winline or include symbol bounding boxes.
 */
WinLinesView.prototype.draw = function()
{
        
    if (this.arrLineBuffer && this.arrLineBuffer[0] && this.arrLineBuffer[0].intMode ==  WinLineDescription.SUMMARY && this.objAnimationController)
    {
        this.objAnimationController.objGuiController.objGuiView.blVisible = true;
        this.objAnimationController.objGuiController.objGuiView.setDirty(true);
    }
    
    if(this.arrLineBuffer.length > 0)
    {
        for( var i=0; i<this.arrLineBuffer.length; ++i )
        {
            this.arrLineBuffer[i].fnDrawMethod();
        }
    }
}

/**
 * Clears the line buffer so that nothing draws.
 * If there is a new callback to make, keep a ref to it
 * but do not set the timer to fire the callback directly.
 * On some devices, the previous call to clear the current timeout
 * actually clears the new one! Doubtless due to interpreter issues and 
 * processor speed. Always ths is on iOS so maybe some "smart" Apple/Safari
 * javascript interpretation aka simulated multithreading or similar is to blame.
 * In any case, we cancel the current animation timer and introduce a timeout
 * to allow the stack to unwind before starting a new timer process.
 */
WinLinesView.prototype.clear = function( fnCallback )
{
	if(this.intTimeoutId != 0)
	{
		TimerManager.getInstance().stop(this.intTimeoutId);
		this.intTimeoutId = 0;
	}
	this.arrLineBuffer = [];
    this.objView.setDirty (true);
	
	/*
	 * Record the callback and run a short timeout to allow
	 * the callstack to unwind, before setting a new timer event.
	 * In this way we seek to avoid the above "stop" from stopping
	 * this new event rather than the one we intended!
	 */	
	if(fnCallback)
	{
		this.fnCallback = fnCallback;
		setTimeout(this.continueClear, 50);
	}
}

/**
 * Here we have allowed the callstack to unwind and we can set a new timer event
 * to fire : it will usually be calling back to the game to set a new spin in motion.
 * Or, to prompt the showing of the next winline. Our big problem came from hitting SPIN
 * as soon as the initial win animation/s had finished, however, so that is the problem 
 * we are seeking to solve by this method. Hope that makes sense :)
 */
WinLinesView.prototype.continueClear = function()
{
	this.intTimeoutId = TimerManager.getInstance().start(this.makeCallback,300);
}

/*
 * 
 */
WinLinesView.prototype.makeCallback = function()
{
	//clearTimeout(this.intTimeoutId);
	//alert("callback: " + this.fnCallback)
	this.fnCallback();
	//this.fnCallback = null;
}

/**
 * Accepts a JSON object which is ONE of the WinlineResult objects
 * from our common data format.
 * TODO The symbol bounding boxes are drawn.
 * TODO a small box on the middle box showing the win amount. 
 */
WinLinesView.prototype.drawWinLine = function(objWinlineJSON)
{
	var winlineResult = objWinlineJSON;
	
	//console.log("Details: " + objWinlineJSON);
	if(this.arrWinLineDesc[winlineResult.intId] != null)
	{
		this.arrWinLineDesc[winlineResult.intId].mode(WinLineDescription.VERBOSE, winlineResult);
		
		this.arrLineBuffer.push(this.arrWinLineDesc[winlineResult.intId])

        // Update the line win text on the console
        //this.objBottomBar.setLineWinText((winlineResult.flWin * winlineResult.flLineBet), winlineResult.intId+1);
        
        this.objView.blVisible = true;
        this.objView.setDirty (true);
    }
    else
    {
        alert("objWinlineJSON.intId " +objWinlineJSON.intId + " " + this.intLineId);
    }
}

/**
 * Accepts an array of winline intId's.
 * All the winlines get drawn one on top of the other
 * in the order they were sent.
 * The symbol bounding boxes are not drawn.
 */
WinLinesView.prototype.drawLine = function(arrIds)
{
    for(var id in arrIds)
    {
        // Set the description mode to draw just the winline
        this.arrWinLineDesc[arrIds[id]].mode(WinLineDescription.SUMMARY);
        this.arrLineBuffer.push(this.arrWinLineDesc[arrIds[id]]);
    }

    this.objView.setDirty (true);
}

/**
 * Accepts an array of winline intId's.
 * All the winlines get drawn one on top of the other
 * in the order they were sent.
 * The symbol bounding boxes are not drawn.
 */
WinLinesView.prototype.drawLineAndBox = function(lineId, JSONData)
{
    // Set the description mode to draw the winline and box
    this.arrWinLineDesc[lineId].mode(WinLineDescription.VERBOSE, JSONData);
    this.arrLineBuffer.push(this.arrWinLineDesc[lineId]);
    this.objView.setDirty (true);
}

