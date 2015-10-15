/**
 * The "win box" is a bounding box attached to the top or bottom of the 
 * central symbol bounding box. It displays the amount won by it's corresponding winline.
 * 
 * The win boxes attached to each winline during the "long animation"
 * must be drawn in two stages in order to provide continuous dropshadows
 * around all the outlines.
 * First draw the outline along with the winlines first with and then without a dropshadow.
 * Then we have to clear the inside of each symbol bounding box and recreate the dropshadow
 * in the inside of the box.
 * Following this we black out the inside of the win box and add the win amount text.
 * 
 * To do all this we need to remember some settings etc: This class does this for us.
 */
function WinBoxDescription()
{
	this.intX;
	this.intY;
	this.intWidth;
	this.intHeight;
	
	this.ctxFont;
	this.strText;
	this.intTextX;
	this.intTextY;
	
	this.setBounds = this.setBounds.bind(this);
	this.setTextParams = this.setTextParams.bind(this);
}
Class.extend(Class, WinBoxDescription);
WinBoxDescription.WIN_BOX_HEIGHT = 50;


WinBoxDescription.prototype.setBounds = function(intX, intY, intWidth, intHeight)
{
	this.intX = intX;
	this.intY = intY;
	this.intWidth = intWidth;
	this.intHeight = intHeight;
}


WinBoxDescription.prototype.setTextParams = function( strText, strFont, intTextX, intTextY)
{
	this.strText = strText;
	this.ctxFont = strFont;
	this.intTextX = intTextX;
	this.intTextY = intTextY;
}
