/**
 *
 * @author Petr Urban
 * @date 13/03/2013 
 * 
 * This class will manipulate and store the state of Text Box objects.
 * 
 * Modified 7/6/2013 maserlin
 * Added some basic multi-line support for plain text strings in large textboxes.
 * This was to accomodate multi-line error messages in our new ErrorDialog component.
 * @see methods setText and draw.
 * this.strText has been converted to an array and is now called this.arrStrText.
 * It will always have a length of 1 UNLESS the input was typeof string AND the string 
 * contained at least one "\n" (linebreak).
 * The maximum number of lines at present is 5.
 * The offsets for drawing the lines are held in 2D array this.arrYOffs which has an array for
 * each number of lines that we wish to draw. The array is indexed by this.arrStrText.length.
 * Single lines of text still draw where they used to ie are Y-offset by 0
 * Two lines draw at -20 and +20. Three lines draw at -30, 0 and +30, and so on.
 * NOTE these values are HARD-CODED and do NOT scale to font size at present.
 * 
 */
function TextBoxView (text, arrFontDetails, x, y, w, h) 
{
	this.strType = "txt";
	this.arrStrText=[""];
	this.strOriginalText = "";
	this.context;
	this.intX;
	this.intY;
	this.intWidth;
    this.intHeight;
	this.blVisible;
	
	this.setText = this.setText.bind(this);
	this.getText = this.getText.bind(this);
	
	//font preferences
	this.strColour;
	this.strFontFamily;
	this.intFontSize;
	this.strFontStyle;
	this.strFontUnits;
	this.textBoxController;
	this.getFontString = this.getFontString.bind(this);
	
	//alignment
	this.strAlignment = TextBoxView.ALIGN_CENTER;
	this.strVerticalAlign = TextBoxView.VERTICAL_ALIGN_MIDDLE;

	//stroke preferences	
	this.blStroke = false; //true for stroke
	this.blFillText = true; // IMPORTANT! Setting blFillText to false works only in case blStroke is true
	this.intStrokeWidth = 2; //default stroke 2px
	this.strStrokeColour = "#000000"; //default stroke colour is black
	
	this.setFont = this.setFont.bind(this);
	this.setFontSize = this.setFontSize.bind(this);
	this.setBorder = this.setBorder.bind(this);
	this.init = this.init.bind(this);
	this.draw = this.draw.bind(this);
	this.newElement = this.newElement.bind(this);
	this.newElement(text, arrFontDetails, x, y, w, h);
	this.useBorder = false;
	
	/*
	 * Arrays of Y offsets for multi-line text.
	 * NOTE hard-coded values do not scale to font size!
	 * Indexed by number of lines to draw. each individual array indexed by line number.
	 */
	this.arrYOffs = [[0],[0],[-20,20],[-30,0,30],[-40,-14,14,40],[-50,-24,0,24,50]];
	
	/**
     * This defines if we should apply or not the swipe change tho this element
     * @type {Boolean}
     */
    this.blSwipe = false;
	
	//shadow preferences
	this.blShadowEnabled = false;
	this.strShadowColour = "#000000"; //default shadow color is black
	this.intShadowOffsetX = 2;
	this.intShadowOffsetY = 2;
	this.intShadowBlur = 0;
	
	this.intSwipeX = 0;
	this.intSwipeY = 0;
	
	this.setAlignment(TextBoxView.ALIGN_CENTER);
	this.setVerticalAlign(TextBoxView.VERTICAL_ALIGN_MIDDLE);
}

Class.extend(ElementView, TextBoxView);

TextBoxView.ALIGN_CENTER = "center";
TextBoxView.ALIGN_LEFT = "left";
TextBoxView.VERTICAL_ALIGN_MIDDLE = "middle";

/**
 *  
 */
TextBoxView.prototype.newElement = function(text, colour, x, y, w, h) 
{
    // Layout defined TextBox
    if (text == undefined)
    {
        this.arrStrText = [""];
        this.strColour = "white";
        this.strFontFamily = "arial";
        this.intFontSize = 20;
        this.strFontStyle = "normal";
        this.strFontUnits = "px";
        this.intStrokeWidth = 4;
        this.blStroke = false;
        this.blVisible = true;
    }
    else
    {
        this.setText(text);
        this.strColour = colour || "white";
        this.strFontFamily = "arial";
        this.intFontSize = 20;
        this.strFontStyle = "normal";
        this.strFontUnits = "px";
        this.intX = x;
        this.intY = y;
        this.intWidth = w;
        this.intHeight = h;
        this.blVisible = true;
        //this.textBoxController = new TextBoxController(this);
    }

    /**
     * Scale Width
     * @type {number}
     */
	this.flScaleX = 1;
    /**
     * Scale Height
     * @type {number}
     */
	this.flScaleY = 1;

}


/**
 * Overriding ElementView .init()
 * 
 * Removing parameter img as it is no longer needed.
 * 
 * @param contextIn - The context which
 * 
 * 
 */
TextBoxView.prototype.init =  function(contextIn, width, height, fontSize) 
{   
    this.context = contextIn;
    
    this.intWidth = width;
    this.intHeight = height;
    this.intFontSize = fontSize;
   
};


/**
 * Overriding ElementView .processJSONLayout()
 *  
 */
TextBoxView.prototype.processJSONLayout = function(objJSONData)
{
	var arrTxtDetails   = objJSONData.id.split("_");
	this.strID = arrTxtDetails[1];
	
	var strSizeDesc = arrTxtDetails[3];
	this.intFontSize = parseInt( strSizeDesc.substring( 0, strSizeDesc.indexOf("pt") ), 10 );
	
	this.strColour = "#"+arrTxtDetails[4].toUpperCase();
	
	var arrFontDetails = this.processFontName(arrTxtDetails[2]);
	this.strFontStyle = arrFontDetails[0];
	this.strFontFamily = arrFontDetails[1];
	
	this.intFontSize = parseInt(arrTxtDetails[3].substring(0,arrTxtDetails[3].indexOf("p")), 10);
	
	this.intX = parseInt(objJSONData.x);
	this.intY = parseInt(objJSONData.y);
	
	// Reset width & height with values adjusted for photoshop wierdness
	this.intWidth = parseInt(objJSONData.width) - this.intX; 
	this.intHeight = parseInt(objJSONData.height) - this.intY;
}

/**
 * 
 */
TextBoxView.prototype.processFontName = function(strToProcess) {
	
	var arrFontDetails = [];
	arrFontDetails[0] = "";
	arrFontDetails[1] = strToProcess;
	
	if(strToProcess.indexOf("Bold") != -1){
		var x = strToProcess.indexOf("Bold");
		arrFontDetails[0]="bold";
		arrFontDetails[1]= strToProcess.substring(0,x);
	}
	if(strToProcess.indexOf("Italics") != -1){
		var x = strToProcess.indexOf("Italics");
		arrFontDetails[0]="italics";
		arrFontDetails[1]= strToProcess.substring(0,x);
	}

	return arrFontDetails;
}

/**
 * Warning this assumes the id of the TextBox is found in the second element of
 * 
 * @param Sring ID to parse 
 */
//TODO Fix the assumption this function makes.
TextBoxView.getIDFromString = function (strOriginalID)
{
	var arr = strOriginalID.split("_");
	return arr[1];
} 



/**
 * Overriding ElementView.draw()
 */
TextBoxView.prototype.draw = function( intOffsetX, intOffsetY )
{
	if ( this.blVisible )
    {
    	var arrText = [];
    	//handle localisation text multiline
    	if (this.arrStrText.length == 1 && this.arrStrText[0] instanceof LocalisationText)
    	{
    		arrText = this.arrStrText[0].getTextMultiline();
    	}
    	else
    	{
			arrText = this.arrStrText;
		}
    	
    	/*
    	 * Since 7/6/13 This now draws multi-line in a loop for each line of text.
    	 * Multi-line currently only available for ordinary strings ie not numbers or localisationText.
    	 */
        for(var eachLine=0; eachLine<arrText.length; ++eachLine)
        {
	        this.intOffsetX = (intOffsetX == null || intOffsetX == undefined) ? 0 : intOffsetX;
	        this.intOffsetY = (intOffsetY == null || intOffsetY == undefined) ? 0 : intOffsetY + this.arrYOffs[arrText.length][eachLine];
	        
	        //TODO: please call some reasonable method instead of this
	        // this is basically used to refresh this.intFinalXPos as far as I understand at the moment
	        this.setAlignment(this.strAlignment);
	        
	        if (this.blSwipe)
	        {
	            this.intOffsetX += this.intSwipeX;
	            this.intOffsetY += this.intSwipeY;
	        }
	         
			this.context.save();
	        this.context.font = this.getFontString();
	        //console.log(this.arrStrText[eachLine] + " " + this.context.font);
	        
	        this.context.fillStyle = this.strColour;
	        this.context.textBaseline = this.strVerticalAlign;
	        this.context.textAlign = this.strAlignment;

	        if (this.blShadowEnabled)
	        {
	        	this.context.shadowColor = this.strShadowColour;
			    this.context.shadowOffsetX = this.intShadowOffsetX;
			    this.context.shadowOffsetY = this.intShadowOffsetY;
			    this.context.shadowBlur = this.intShadowBlur;
			}
			
			// Stroke text
	        if (this.blStroke)
	        {
	        	/*
	        	 * In case of stroke and shadow at the same time, 
	        	 * the text needs to be drawn twice, 
	        	 * first with shadow than without 
	        	 */
		        if (this.blShadowEnabled && this.blFillText)
		        {
		        	// Draw the text with shadow first
		        	this.context.fillText(arrText[eachLine].toString(), this.intFinalXPos + this.intOffsetX, this.intFinalYPos + this.intOffsetY );
	
		        	// Do the text stroke
			        this.context.strokeStyle = this.strStrokeColour;
			        this.context.lineWidth = this.intStrokeWidth;
			        this.context.strokeText(arrText[eachLine].toString(), this.intFinalXPos + this.intOffsetX, this.intFinalYPos + this.intOffsetY );
	
		        	// After that disable shadow
		        	this.context.shadowColor = null;
				    this.context.shadowOffsetX = null;
				    this.context.shadowOffsetY = null;
				    this.context.shadowBlur = null;
		        }
	
	        	/*
	        	 * Do the text stroke
	        	 * The text will be drawn in next step
	        	 */
		        this.context.strokeStyle = this.strStrokeColour;
		        this.context.lineWidth = this.intStrokeWidth;
		        this.context.strokeText(arrText[eachLine].toString(), this.intFinalXPos + this.intOffsetX, this.intFinalYPos + this.intOffsetY );
	        }
	
			// Normal text
	    	if (!this.blStroke || (this.blStroke && this.blFillText))
	    	{
	    		//dont fill the text in case we want stroke only
		        this.context.fillText(arrText[eachLine].toString(), this.intFinalXPos + this.intOffsetX, this.intFinalYPos + this.intOffsetY );
	    	}
		
			// Bounding box for dev help only	
	        if (this.useBorder)
	        {
	            this.context.strokeRect(this.intX + this.intOffsetX, this.intY + this.intOffsetY, this.intWidth, this.intHeight);
	            this.context.stroke();
	        }
	        
        	//
    	    this.context.restore();
		}
	}
}


/**
 * Overriding ElementView.setContext()
 *  
 * Removing the passing of the context on to sprite.
 * 
 * @param {Object} objContext
 */
TextBoxView.prototype.setContext = function( objContext ) 
{
     this.context = objContext;
     //this.textBoxController.setContext(this.context);
}

/**
 * Returns a CSS style font description string constructed
 * from our font parameters, to set the context text style.
 * NOTE String MUST be constructed in this order (size then name) or context
 * will not accept and and remain set to its default.
 * 
 * @return String
 */
TextBoxView.prototype.getFontString = function()
{
	if (this.strFontStyle != "bold" && this.strFontStyle!= "italic")
	{
		this.strFontStyle = "normal"
	}
	var strFont = this.strFontStyle + " " + (this.intFontSize * this.getScaleY()) + this.strFontUnits + " " + this.strFontFamily;
	return strFont;
}

TextBoxView.prototype.computeTextSize = function()
{
    //start with height
    var fontSize = this.viewObject.intHeight + 1;

    do
    {
        fontSize--;
        this.context.font = this.fontStyle + ' ' + fontSize + this.fontSizeUnits + ' ' + this.fontFamily;
        textDimensions = ctx.measureText(this.text);
    }
    while (textDimensions.width > this.viewObject.intWidth && fontSize > 1);

    this.viewObject.setFontSize(fontSize);
    this.textSizeComputed = true;
}

/**
 * Set the font for the Textbox 
 */
TextBoxView.prototype.setFont = function(strFontName, intFontSize)
{

	this.strFontFamily = strFontName;
	this.strFontStyle = "normal"
	if(intFontSize != null && intFontSize > 0)
	{
	   this.setFontSize(intFontSize);
	}
}

TextBoxView.prototype.setFontSize = function(intFontSize)
{
	this.intFontSize = intFontSize;
}

/**
 * Set alignment
 * @param {String} should be constant ie.TextBoxView.ALIGN_CENTER  
 */
TextBoxView.prototype.setAlignment = function(strAlignment)
{
    this.strAlignment = strAlignment;
    
    switch (this.strAlignment)
    {
        case TextBoxView.ALIGN_CENTER:
            this.intFinalXPos = this.intX + (this.getWidth() / 2);
            this.intFinalYPos = this.intY+ (this.getHeight() / 2);
        break;
        
        case TextBoxView.ALIGN_LEFT:
            this.intFinalXPos = this.intX;
            this.intFinalYPos = this.intY+ (this.getHeight() / 2);
        break;
        
        default:
        	console.log("TextBix - unknown alignment:" + strAlignment);
        break;
    }
}

/**
 * Set vertical alignment
 * @param {String} should be constant ie.TextBoxView.VERTICAL_ALIGN_MIDDLE  
 */
TextBoxView.prototype.setVerticalAlign = function(strAlignment)
{
    this.strVerticalAlign = strAlignment;
    
    switch (this.strVerticalAlign)
    {
        case TextBoxView.VERTICAL_ALIGN_MIDDLE:
            //this.intFinalXPos = this.getX() + (this.getWidth() / 2);
            //this.intFinalYPos = this.getY() + (this.getHeight() / 2);
        break;

        default:
        	console.log("TextBix - unknown vertical alignment:" + strAlignment);
        break;
    }
}

/**
 * @param boolean determining if the text box's border should be shown
 */
TextBoxView.prototype.setBorder = function (useBorder)
{
    this.useBorder = useBorder;
}


/**
 * @param string describing font colour in simple terms e.g. "FFFFFF"
 * TODO Some fancy processing that cleans up whether the text is Hex or text and processes
 */
TextBoxView.prototype.setColour = function(strColour) 
{
	this.strColour = strColour;
}

/**
 * Enable / disable font stroke
 * 
 * @param {boolean} blEnabled
 * @param {boolean} blFillEnabled (default to true)
 */
TextBoxView.prototype.setStrokeEnabled = function(blEnabled, blFillEnabled)
{
	if (blFillEnabled == undefined)
	{
		blFillEnabled = true;
	}

	if(typeof(blEnabled) == "boolean")
	{
		this.blStroke = blEnabled;
	}
	else
	{
		//console.log("Value passed to .setStroke() is not the correct type. (stroke disabled)");
		this.blStroke = false;
	}
	
	this.blFillText = blFillEnabled;
}

TextBoxView.prototype.setStrokeColour = function(strStrokeColour)
{
	this.strStrokeColour = strStrokeColour;
}

/**
 *
 * Capable of accepting strings or objects which provide a toString() method (returning a string).
 *   
 * @param {Object} objText
 */
TextBoxView.prototype.setText = function(objText)
{
	var strType = typeof objText;
	
	/*
	 * String input. Split for line breaks: if none
	 * we will have a single string in array[0]
	 */
	if (strType == "string" )
	{
		this.arrStrText = objText.split("\n");
		this.strOriginalText = objText;
	}
	
	/*
	 * Always use one single line for localisationText at present.
	 */
	else if( objText instanceof LocalisationText)
	{
		this.arrStrText =[objText];
		this.strOriginalText = objText;
	}
	
	/*
	 * Numbers will not be multi-line, almost by definition.
	 */
	else if (strType == "number")
	{
		this.arrStrText = [objText.toString()];
		this.strOriginalText = objText.toString();
	}
	/*
	 * 
	 */
	else
	{
		throw new Error("Textbox .setText() - string expected");
	}

	//mark to redraw
	this.update();
}

TextBoxView.prototype.getText = function()
{
	var retval = "";
	
	if(this.arrStrText.length == 1)
	{
		retval = this.arrStrText[0];
	}
	else if(this.arrStrText.length > 1)
	{
		retval = this.arrStrText.join("\n");
	}
	
	return retval;
}


TextBoxView.prototype.setFontSize = function(intSize)
{
	
	this.intFontSize = intSize;
	return this.intFontSize;		
}

/**
 * Set Stroke Width 
 * @param {number} intStrokeWidth
 */
TextBoxView.prototype.setStrokeWidth = function(intStrokeWidth)
{
	
	this.intStrokeWidth = intStrokeWidth;		
}

/**
 * Set shadow enabled / disabled
 *  
 * @param {boolean} blEnabled
 */
TextBoxView.prototype.setShadowEnabled = function(blEnabled)
{
	this.blShadowEnabled = blEnabled;
}

/**
 * Find out if shadow is enabled at the moment
 * 
 * @return {boolean} 
 */
TextBoxView.prototype.isShadowEnabled = function()
{
	return this.blShadowEnabled;
}

/**
 * Set Shadow Colour 
 * @param {String} strColour
 */
TextBoxView.prototype.setShadowColour = function(strColour)
{
	this.strShadowColour = strColour;
}

/**
 * Retrieve Shadow Color
 * 
 * @return {String} 
 */
TextBoxView.prototype.getShadowColour = function()
{
	return this.strShadowColour;
}

/**
 * Set Shadow Offset X
 * 
 * @param {number} intOffsetX 
 */
TextBoxView.prototype.setShadowOffsetX = function(intOffsetX)
{
	this.intShadowOffsetX = intOffsetX;
}

/**
 * Retrieve Shadow Offset X
 * 
 * @return {number} 
 */
TextBoxView.prototype.getShadowOffsetX = function()
{
	return this.intShadowOffsetX;
}

/**
 * Set Shadow Offset Y
 * 
 * @param {number} intOffsetY 
 */
TextBoxView.prototype.setShadowOffsetY = function(intOffsetY)
{
	this.intShadowOffsetY = intOffsetY;
}

/**
 * Retrieve Shadow Offset Y
 * 
 * @return {number} 
 */
TextBoxView.prototype.getShadowOffsetY = function()
{
	return this.intShadowOffsetY;
}

/**
 * Set Shadow Blur
 * 
 * @param {number} intShadowBlur
 */
TextBoxView.prototype.setShadowBlur = function(intShadowBlur)
{
	this.intShadowBlur = intShadowBlur;
}

/**
 * Retrieve Shadow Blur
 * 
 * @return {number}
 */
TextBoxView.prototype.getShadowBlur = function()
{
	return this.intShadowBlur;
}
