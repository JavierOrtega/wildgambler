/**
 *
 * @author Mark Serlin
 * @date 22/03/2013 
 * 
 * Overrides TextBoxView
 * Adds a second line of text in smaller font for drawing winline number.
 * 
 */
function LineWinTextBoxView (text, arrFontDetails, x, y, w, h) 
{
	this.newElement(text, arrFontDetails, x, y, w, h);	
	
	// Line number text
	this.strLineTxt;
	
	// Line number font
	this.strLineFont;
	
	//
	this.getLineFontString = this.getLineFontString.bind(this);
	
	//
	this.setFontSize(20);
}
Class.extend(TextBoxView, LineWinTextBoxView);

/**
 * Overrides TextBoxView setFontSize
 * Sets the size of the text that draws the line number
 */
LineWinTextBoxView.prototype.setFontSize = function(intFontSize)
{
	this.intFontSize = intFontSize;
	this.intLineFontSize = intFontSize * 0.8;
}

/**
 * Return the font description for the smaller (line number) text 
 */
LineWinTextBoxView.prototype.getLineFontString = function()
{
	return ("" + this.intLineFontSize + this.strFontUnits + " " + this.strFontFamily);
}

/**
 * Overrides the TextBoxView draw method.
 * Draws a second line of text in a smaller font, which is the line number of the win.  
 */
LineWinTextBoxView.prototype.draw = function(intOffsetX, intOffsetY) {

	
	this.intOffsetX = (intOffsetX == null || intOffsetX == undefined) ? 0 : intOffsetX;
	this.intOffsetY = (intOffsetY == null || intOffsetY == undefined) ? 0 : intOffsetY;
	
	if ( this.blVisible )
    {        
		var intFinalXPos = this.intX + this.intOffsetX;
		var intFinalYPos = this.intY + this.intOffsetY;
		
        //Temporal solution to be able to draw text, later modify it properly/////////////////////
		this.context.save();
        this.context.font = this.getFontString();
        this.context.strokeStyle = this.strColour;
        this.context.fillStyle = this.strColour;
        this.context.textBaseline = "middle";
        this.context.textAlign = "center";
        //var x = x + (this.intWidth / 2);
        
        //this.context.fillText(this.strText, intFinalXPos+(this.intWidth/2), intFinalYPos+(this.intHeight/2));
        this.context.fillText(this.strText, intFinalXPos+(this.intWidth/2), intFinalYPos);
        this.context.stroke();

        this.context.textBaseline = "bottom";
        this.context.font = this.getLineFontString();
        this.context.fillText(this.strLineText, intFinalXPos+(this.intWidth/2), intFinalYPos+this.intHeight);
		
		/* Bounding box for dev help       
        this.context.strokeRect(intFinalXPos,intFinalYPos ,this.intWidth,this.intHeight);
        this.context.stroke();
         */
        
        
        this.context.restore();
        ///////////////////////////////////////////////////////////////////////////////////////////
	}
}

