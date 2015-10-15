/**
 * The main draw object for this class. While WinLinesView is the manager in charge 
 * of drawing and clearing winlines, this object holds the description of the line
 * and also encapsulates its draw method.
 * NOTE There are one hell of a lot of magic numbers in here :(
 */
function WinLineDescription( intId, 
							 context, 
							 objWinLineData, 
							 intAlign )
{
   // Which winline this is, and its draw context.
	this.intId = intId;
	this.objContext = context;
	
	
	this.intAlign = intAlign;

	// Winline data
  	this.strColour = objWinLineData.arrWinlines[this.intId].strColour;
  	this.intLineWidth = objWinLineData.arrWinlines[this.intId].intLineWidth;
  	this.strFont = objWinLineData.strFont;
  	this.strFontColour = objWinLineData.strFontColour;
  	this.strBoxBgColour = objWinLineData.strBoxBgColour;
  	this.strCurrencyCode = objWinLineData.strCurrencyCode;
	
	// Record just the name of our font
	this.strFontName = getFontName( this.strFont );
	
	// Record just the size of our font
	this.intFontSize = getFontSize(this.strFont);
	
	// Construct a range of font sizes to reduce win box text by if we get a huge win
	this.arrFontSizes = [];
	for(var i=this.intFontSize-1; i>=4; --i)
	{
		this.arrFontSizes.push(i);
	}
	
	// Object describing a win box to display win amount during "long animation".
	this.objWinBoxDesc;
	
	// List of points to draw to/between
	this.arrPoints = [];
	this.intMarginXOff = 8;
	this.intMarginYOff = 0;
	this.intAdjustXMargin = 1 + 4;
	
	// How many symbols to draw a bounding box around
	this.intSymbolsInWin = 0;
	
	// How much to display in the win box
	this.flWinAmount = 0;
	
	//
	this.arrSymbolBounds = [];
	for(var m in objWinLineData.arrWinlines[this.intId].arrMapping)
	{
		this.arrSymbolBounds.push(objWinLineData.arrSymbolBounds[objWinLineData.arrWinlines[this.intId].arrMapping[m]])
	}
	
	// false = middle symbol top/middle row
	// true = middle symbol on the bottom row
	this.blWinBoxOnTop = false;
	
	
	// Construct the draw points set for this line.
	this.setPoints( {x:objWinLineData.layouts[this.intId].x,
					 y:objWinLineData.layouts[this.intId].y},
					 objWinLineData.arrWinlines[this.intId].arrMapping);
					 
	// set this in mode() to draw appropriately
	this.fnDrawMethod;
	
	// Methods
	this.mode = this.mode.bind(this);
	this.drawLine = this.drawLine.bind(this);
	this.drawLineSummary = this.drawLineSummary.bind(this);
	this.drawBoundingBoxes = this.drawBoundingBoxes.bind(this);
	this.drawLineNumber = this.drawLineNumber.bind(this);
	this.setDropShadowParams = this.setDropShadowParams.bind(this);
	this.clearDropShadowParams = this.clearDropShadowParams.bind(this);
	this.drawWinBox = this.drawWinBox.bind(this);
}
Class.extend(Class, WinLineDescription);

/**
 * enum for alignment, mode, draw metrics 
 */
WinLineDescription.ALIGN_LEFT = 0;
WinLineDescription.ALIGN_RIGHT = 1;
WinLineDescription.SUMMARY = 0;
WinLineDescription.VERBOSE = 1;

/**
 * Set the drawing mode for this draw event.
 * WinLineDescription.SUMMARY draws just the line
 * WinLineDescription.VERBOSE draws the line, bounding boxes and win amount.
 * TODO Maybe separate into methods for SUMMARY, VERBOSE and ALIGNMENT
 */
WinLineDescription.prototype.mode = function( intMode, objWinlineJSON )
{
    this.intMode = intMode;
	switch(intMode)
	{
		case WinLineDescription.SUMMARY:
			this.intSymbolsInWin = 0;
			this.flWinAmount = 0;
			this.fnDrawMethod = this.drawLineSummary;
			break;
			
		case WinLineDescription.VERBOSE:
			if(objWinlineJSON == null)
			{
				alert("ERROR: WinLineDescription VERBOSE mode requires winline JSON data.");
				return;
			}
			this.intSymbolsInWin = objWinlineJSON.intCount;
			this.flWinAmount = objWinlineJSON.flWin * objWinlineJSON.flLineBet;
			this.fnDrawMethod = this.drawBoundingBoxes;
			break;
		
		default:
			alert("ERROR: WinLineDescription unknown mode " + intMode);
			break;
	}
	
}




/**
 * Draw the bounding box around the symbol. This entails:
 * Set dropshadow
 * draw lines (loop 1)
 * draw bounding box
 * Unset dropshadow
 * draw flat lines on top of everything (loop 2).
 * Next: (in fn clearCenters)
 * Cut out the center of the box and re-create dropshadow inside the box
 */
WinLineDescription.prototype.drawBoundingBoxes = function()
{
	var bp;
	
	// Draw with drop shadow, then cancel it and draw again on top.
	// This makes the boxes and lines appear joined rather than drawn
	// one on top of the other.  	
    this.setDropShadowParams();

    // generate the array of boundary positions. this used to copy it from arrPoints,
    // but the line points are now different to the centre points of the symbols
    var arrBoxPoints = new Array();
    for ( i = 0 ; i < 5 ; i++ )
     {
        symbolX = this.arrSymbolBounds[i][0] + (this.arrSymbolBounds[i][2] / 2) + this.intMarginXOff;
        symbolY = this.arrSymbolBounds[i][1] + (this.arrSymbolBounds[i][3] / 2) + this.intMarginYOff;
        arrBoxPoints.push({x:symbolX,y:symbolY});
     }
         
    //
    var objWinBoxRect;
	    
	// Remove any not in win
	arrBoxPoints = arrBoxPoints.slice(0, this.intSymbolsInWin);

	// Draw twice, second time with no shadow.
	for(var loop=0; loop<2; ++loop)
	{
	    // Draw the basic line. 
	    this.drawLine();

	    //
	    for(var bp in arrBoxPoints)
	    {
	    	// this.intAdjustXMargin : because there's always a fiddle somewhere.
	    	var intCentreX = arrBoxPoints[bp].x-(this.arrSymbolBounds[bp][2]/2)-this.intAdjustXMargin;
	    	var intCentreY = arrBoxPoints[bp].y-(this.arrSymbolBounds[bp][3]/2);
	    	
	    	// Draw symbol bounding box
	    	this.objContext.strokeRect(	intCentreX,
	    								intCentreY,
	    								this.arrSymbolBounds[bp][2]-this.intLineWidth,
	    								this.arrSymbolBounds[bp][3]);
	    	
	    	// draw win box on middle bounding box (bp == "2").
	    	if( bp == "2" )
	    	{
	    		this.drawWinBox(arrBoxPoints[bp],this.arrSymbolBounds[bp]);
		    }
	    }

	    
	    // Remove shadow and re-draw
	  	this.clearDropShadowParams();
    }
	
	// Re-create the box's internal shadow that was removed by clearRect.   
	this.clearCenters(arrBoxPoints, objWinBoxRect);
}

/*
 * Draw the win box below the symbol for those on top or middle lines
 * and above for those on the bottom line.
 * Text colour/box bg colour and font are specified in the config file for the game.
 * 
 * TODO put in the appropriate currency code and center the text.
 */
WinLineDescription.prototype.drawWinBox = function(arrBoxPoints, arrSymbolBounds)
{
	this.objContext.save();

	this.objContext.fillStyle = this.strBoxBgColour;
	
	/*
	 * Scale the font to fit the available width
	 */
	
	// the text we wish to write to the win box
    var strText = Localisation.formatNumber(this.flWinAmount);
	
	this.objContext.font = this.strFont;
	
	// Width of the text
	var w1 = this.objContext.measureText(strText).width;

	// width of the available space
	var w2 = arrSymbolBounds[2]-(this.intLineWidth*2);
	
	var next=0;
	var intFinalFontSize = this.intFontSize;
	var intTextTopMargin = this.intFontSize;
	
	// While width of text is too wide
	while( w1 > w2 )
	{
		// Set smaller font
		intFinalFontSize = this.arrFontSizes[next++];
		
		// Set smaller top margin,as the height will change too
		intTextTopMargin = this.intFontSize + ((this.intFontSize-intFinalFontSize)*0.2);

		// Set the new font
		this.objContext.font = intFinalFontSize + 'px ' + this.strFontName;

		// Re-measure the new width
		w1 = this.objContext.measureText(strText).width;
	}

	// Quick hack to center text :)
	var intTextXOff = ((w2-w1)/2)-8;
	
	// metrics for positioning
	var intWbx, intWby, intTextX, intTextY;
	
	// I have NO IDEA why this needs to be -3 to line up perfectly with the symbol bounding box.
	intWbx = arrSymbolBounds[0] + (this.intLineWidth)-3;
	intTextX = intWbx + (this.intLineWidth*2);
	
	//
	if( this.blWinBoxOnTop )
	{
		intWby = arrSymbolBounds[1] - WinBoxDescription.WIN_BOX_HEIGHT;
		
		intTextY = intWby + intTextTopMargin;
									
		this.objContext.fillRect(	intWbx,
									intWby,
									arrSymbolBounds[2] - this.intLineWidth, 
									WinBoxDescription.WIN_BOX_HEIGHT );
		
		this.objContext.strokeRect(	intWbx,
									intWby,
									arrSymbolBounds[2] - this.intLineWidth, 
									WinBoxDescription.WIN_BOX_HEIGHT );
	}
	else
	{
		//intWbx = arrSymbolBounds[0] + (this.intLineWidth);
		intWby = arrSymbolBounds[1] + arrSymbolBounds[3];
		
		//intTextX = intWbx + (this.intLineWidth*2);
		intTextY = intWby + intTextTopMargin;
									
		this.objContext.fillRect(	intWbx,
									intWby,
									arrSymbolBounds[2] - this.intLineWidth, 
									WinBoxDescription.WIN_BOX_HEIGHT );
		
		this.objContext.strokeRect(	intWbx,
									intWby,
									arrSymbolBounds[2] - this.intLineWidth, 
									WinBoxDescription.WIN_BOX_HEIGHT );
	}
	
	/*
	 * Internal use: A description of the win box parameters, useful later for drawing.
	 * We have all the params now so we can set up everything in it.
	 */
	this.objWinBoxDesc = new WinBoxDescription();
	this.objWinBoxDesc.setBounds( intWbx + (this.intLineWidth/2),
						  		  intWby + (this.intLineWidth/2),
						  		  arrSymbolBounds[2] - (this.intLineWidth*2),
						  		  WinBoxDescription.WIN_BOX_HEIGHT - this.intLineWidth );
	//
	this.objWinBoxDesc.setTextParams(strText, this.objContext.font, intTextX+intTextXOff, intTextY);

	// 
	this.objContext.stroke();
	this.objContext.restore();
}


/**
 * Quick hack to get size of font from stylesheet info 
 */
function getFontName(strFontDesc)
{
	var arrParts = strFontDesc.split(" ");
	for(var i=0; i<arrParts.length; ++i)
	{
		var i1 = arrParts[i].indexOf("px");
		var i2 = arrParts[i].indexOf("pt");
		if(i1 == -1 && i2 == -1)
		{
			return arrParts[i];
		}
	}
}


/**
 * Quick hack to get size of font from stylesheet info 
 */
function getFontSize(strFontDesc)
{
	var arrParts = strFontDesc.split(" ");
	for(var i=0; i<arrParts.length; ++i)
	{
		var i1 = arrParts[i].indexOf("px");
		var i2 = arrParts[i].indexOf("pt");
		if(i1 != -1 || i2 != -1)
		{
			return parseInt(arrParts[i].substring(0,arrParts[i].indexOf("p")),10);
		}
	}
}


/**
 * Draw "shadow" lines inside the top & left of each box
 * to replace those eradicated by the clearRect draw. 
 */
WinLineDescription.prototype.clearCenters = function(arrBoxPoints, objWinBoxRect)
{   
	this.objContext.save();

	this.objContext.beginPath();
	this.setDropShadowParams();
  	this.objContext.shadowOffsetX = 1;
  	this.objContext.shadowOffsetY = 1;
	
	this.objContext.strokeStyle = "rgba(0,0,0,0.6)";
	
	this.objContext.lineWidth = this.intLineWidth/4;

    //
    for(var bp in arrBoxPoints)
    {
    	var intCentreX = arrBoxPoints[bp].x-(this.arrSymbolBounds[bp][2]/2)-this.intAdjustXMargin;
    	var intCentreY = arrBoxPoints[bp].y-(this.arrSymbolBounds[bp][3]/2);
    	
    	/* fill center so we can see what we're doing
	    this.objContext.fillStyle = "white";
    	this.objContext.fillRect(	intCentreX+(this.intLineWidth/2),
    								intCentreY+(this.intLineWidth/2),
    								this.arrSymbolBounds[bp][2]-this.intLineWidth,
    								this.arrSymbolBounds[bp][3]-this.intLineWidth);
    	*/
    	
    	/*
    	 *  Clear the center of the rect to remove winlines inside.
    	 */
    	this.objContext.clearRect(	intCentreX+(this.intLineWidth/2),
    								intCentreY+(this.intLineWidth/2),
    								this.arrSymbolBounds[bp][2]-this.intLineWidth-this.intLineWidth,
    								this.arrSymbolBounds[bp][3]-this.intLineWidth);

		/*
		 * Re-create dropshadows
		 */
		var intTL = { x:this.arrSymbolBounds[bp][0]+this.intAdjustXMargin,
					  y:this.arrSymbolBounds[bp][1]+(this.objContext.lineWidth+2) };

		this.objContext.moveTo( intTL.x, intTL.y );
		this.objContext.lineTo( intTL.x+this.arrSymbolBounds[bp][2]-this.intLineWidth-this.intAdjustXMargin, intTL.y );
		this.objContext.moveTo( intTL.x+1, intTL.y-1 );
		this.objContext.lineTo( intTL.x+1, intTL.y+this.arrSymbolBounds[bp][3]-7 );
		
    }
	
	
	this.objContext.stroke();
	this.clearDropShadowParams();
	
	/*
	 * Having cleared the centers of the symbol bounding boxes,
	 * we now blank out the center of the win box so we can't see the winlines
	 * and draw the text over the top of the blacked-out box.
	 */

	/* Draw the win box
	 * using the previously calculated description
	 */
	this.objContext.fillStyle = this.strBoxBgColour;
	this.objContext.fillRect(this.objWinBoxDesc.intX,
							 this.objWinBoxDesc.intY,
							 this.objWinBoxDesc.intWidth,
							 this.objWinBoxDesc.intHeight);
	this.objContext.fillStyle = this.strFontColour;
	this.objContext.font = this.objWinBoxDesc.ctxFont;
	this.objContext.fillText( this.objWinBoxDesc.strText, this.objWinBoxDesc.intTextX, this.objWinBoxDesc.intTextY );

	this.objContext.restore();
}


/**
 * Method to draw the line number - dev use only 
 */
WinLineDescription.prototype.drawLineNumber = function()
{
  	this.objContext.strokeStyle = this.strColour;
	this.objContext.fillStyle = this.strColour;
  	this.objContext.lineWidth = this.intLineWidth/2;
  	this.objContext.font="40px Arial";

  	if(this.intAlign == WinLineDescription.ALIGN_LEFT)
  	{
  		var num = this.intId + 1;
  		var xoff = 0;
  		if(num > 9)xoff = -20
	  	this.objContext.strokeText( num,this.arrPoints[0].x-40+xoff,this.arrPoints[0].y+16);
	}
	else
	{
	  	this.objContext.fillText( (this.intId + 1 ),this.arrPoints[0].x+24,this.arrPoints[0].y+16);
	}
}


/**
 * Drawing drop shadow under winlines/boxes 
 */
WinLineDescription.prototype.setDropShadowParams = function()
{
  	this.objContext.shadowBlur = 5;
  	this.objContext.shadowColor = "#000000";
  	this.objContext.shadowOffsetX = 2;
  	this.objContext.shadowOffsetY = 2;
}

/**
 * Un-drawing drop shadow under winlines/boxes 
 */
WinLineDescription.prototype.clearDropShadowParams = function()
{
  	this.objContext.shadowBlur = 0;
  	this.objContext.shadowOffsetX = 0;
  	this.objContext.shadowOffsetY = 0;
}

/**
 * Add drop shadow for summary 
 */
WinLineDescription.prototype.drawLineSummary = function()
{
	this.setDropShadowParams();
	this.drawLine();
	this.clearDropShadowParams();
}
/**
 * Draw a basic winline from its button via its symbols 
 * to the other side of the screen.
 */
WinLineDescription.prototype.drawLine = function()
{
	// Dev only
        //this.drawLineNumber();
	var str=""
	for(var a in this.arrPoints)
	{
		str += this.arrPoints[a].x + " " + this.arrPoints[a].y + "\n";
	}

	// 
    this.objContext.strokeStyle = this.strColour;
  	this.objContext.lineWidth = this.intLineWidth;
  	this.objContext.beginPath();
  	
    // Start point
    this.objContext.moveTo(this.arrPoints[0].x,this.arrPoints[0].y);
	
    // Draw 
    for(var p=1; p<this.arrPoints.length-1; ++p)
    {
    	// Line
    	this.objContext.lineTo(this.arrPoints[p].x,this.arrPoints[p].y);
    	
    	// symbol marker
    	//this.objContext.strokeRect(this.arrPoints[p].x-(this.intLineWidth/2),this.arrPoints[p].y-(this.intLineWidth/2),this.intLineWidth,this.intLineWidth);
    }


	// end of line to frame edge
   	this.objContext.lineTo(this.arrPoints[this.arrPoints.length-1].x,this.arrPoints[this.arrPoints.length-1].y)

    // Show before resetting line width
    this.objContext.stroke();
}

/**
 * 
 * @param {Object} intStartX : start point for draw
 * @param {Object} intStartY : start point for draw
 * @param {Object} arrShape  : The 5 symbols linked by this winline (as intId's)
 * @param {Object} drawLtoR  : Whether to draw L->R or R->L
 * 
 * Reel layout looks like this: * 
 *       0  |  3  |  6  |   9  |  12
 *      =============================
 *       1  |  4  |  7  |  10  |  13
 *      =============================
 *       2  |  5  |  8  |  11  |  14
 */
WinLineDescription.prototype.setPoints = function( objStartPoint, arrShape )
{
 // intPoints[0] is always the start point
    this.arrPoints.push(objStartPoint);
    
    // Follow the shape of the winline according to which symbols are in the win line
    var i, symbolX, symbolY, finalX;
      
      // make sure that any line that uses the same symbol alignment as the first one, joins up to 
      // the same y position across the line, otherwise use the centre of the symbol instead.
    if(this.intAlign == WinLineDescription.ALIGN_LEFT)
    {     
        var baseline = this.getSymbolPos(arrShape[0])
        for ( i = 0 ; i < arrShape.length ; i++ )
        {
            symbolX = this.arrSymbolBounds[i][0] + (this.arrSymbolBounds[i][2] / 2) + this.intMarginXOff;
            if (this.getSymbolPos(arrShape[i]) != baseline )
            {
                symbolY = this.arrSymbolBounds[i][1] + (this.arrSymbolBounds[i][3] / 2) + this.intMarginYOff;
            }
            else 
            {
                symbolY = this.arrPoints[0].y;
            }
            this.arrPoints.push({x:symbolX,y:symbolY});
        }
        // hard code the last point to be the same y pos as the last symbol on screen
        finalX = this.arrPoints[this.arrPoints.length-1].x + this.arrSymbolBounds[4][2]/2;
    }
    else
    {
        var baseline = this.getSymbolPos(arrShape[4])
        for( i=arrShape.length-1; i>=0; --i )
        {
            symbolX = this.arrSymbolBounds[i][0] + (this.arrSymbolBounds[i][2] / 2) + this.intMarginXOff;
            if (this.getSymbolPos(arrShape[i]) != baseline )
            {
                symbolY = this.arrSymbolBounds[i][1] + (this.arrSymbolBounds[i][3] / 2) + this.intMarginYOff;;
            }
            else 
            {
                symbolY = this.arrPoints[0].y;
            }           
            this.arrPoints.push({x:symbolX,y:symbolY});
        }

        // End point: add half a symbol
        finalX = this.arrPoints[this.arrPoints.length-1].x - this.arrSymbolBounds[0][2]/2; 
    }
    
    // Denotes where to draw win box
    if(this.arrPoints[3].y > 300)
    {
        this.blWinBoxOnTop = true;
    }
    // final point which is in line with the last symbol of the win line
    this.arrPoints.push( { x:finalX, y:symbolY } );
}

/***
 * Check to see which line (top/middle/bottom) each symbol is in 
 */
WinLineDescription.prototype.getSymbolPos = function( intReelPos )
{
    var reelPosLines = [ [ 0, 3, 6, 9, 12 ], [ 1, 4, 7, 10, 13 ], [ 2, 5, 8, 11, 14 ] ];
    for ( var i = 0 ; i < reelPosLines.length ; i++ )
    {
        if ( reelPosLines[i].indexOf(intReelPos) != -1 )
        {
            return i;
        }
    }
}    

/**
 * Fake up some winline results for testing 
 */
function fakeResults()
{
	// Fake JSON from xml_2json parsing of xml
	var arr = [];
	
	// Left 18,2,16,11,15,1,8,20,17,3,19
	arr.push({_id:0,_symbol:2,_count:3,_win:2.65,_symbols:"10,10,5,0,3"});
	
	arr.push({_id:19,_symbol:2,_count:4,_win:2.00,_symbols:"10,10,5,0,3"});
	
	arr.push({_id:1,_symbol:2,_count:3,_win:2.00,_symbols:"10,10,5,0,3"});
	arr.push({_id:2,_symbol:2,_count:4,_win:2.00,_symbols:"10,10,5,0,3"});
	arr.push({_id:7,_symbol:2,_count:5,_win:2.00,_symbols:"10,10,5,0,3"});
	arr.push({_id:10,_symbol:2,_count:3,_win:2.00,_symbols:"10,10,5,0,3"});
	arr.push({_id:14,_symbol:2,_count:4,_win:2.00,_symbols:"10,10,5,0,3"});
	arr.push({_id:15,_symbol:2,_count:3,_win:2.00,_symbols:"10,10,5,0,3"});
	arr.push({_id:16,_symbol:2,_count:5,_win:2.00,_symbols:"10,10,5,0,3"});
	arr.push({_id:17,_symbol:2,_count:3,_win:2.00,_symbols:"10,10,5,0,3"});
	arr.push({_id:18,_symbol:2,_count:5,_win:2.00,_symbols:"10,10,5,0,3"});

	
	// Right 4,12,7,9,1,14,10,6,13,5
	arr.push({_id:3,_symbol:2,_count:3,_win:2.00,_symbols:"10,10,5,0,3"});
	arr.push({_id:4,_symbol:2,_count:4,_win:2.00,_symbols:"10,10,5,0,3"});
	arr.push({_id:5,_symbol:2,_count:5,_win:2.00,_symbols:"10,10,5,0,3"});
	arr.push({_id:6,_symbol:2,_count:4,_win:2.00,_symbols:"10,10,5,0,3"});
	arr.push({_id:8,_symbol:2,_count:3,_win:2.00,_symbols:"10,10,5,0,3"});
	arr.push({_id:9,_symbol:2,_count:4,_win:2.00,_symbols:"10,10,5,0,3"});
	arr.push({_id:11,_symbol:2,_count:5,_win:2.00,_symbols:"10,10,5,0,3"});
	arr.push({_id:12,_symbol:2,_count:4,_win:2.00,_symbols:"10,10,5,0,3"});
	arr.push({_id:13,_symbol:2,_count:5,_win:2.00,_symbols:"10,10,5,0,3"});
	
	// Make actual results objects using common data format.
	var res = [];
	for(var r in arr)
	{
		res.push(new WinlineResult(arr[r]));
	}
	
	return res;
}

