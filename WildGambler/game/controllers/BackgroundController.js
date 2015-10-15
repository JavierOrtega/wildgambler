/**
 * @author Petr Urban
 *
 * This class handles background image, reswizing etc.
 */

/**
 * Constructor
 */
function BackgroundController()
{
	this.blVisible = true;
	this.objBackgroundDiv = document.getElementById("background");

	this.intImageWidth = 1024;
	this.intImageHeight = 768;
	
	this.resize = this.resize.bind(this);
}

/**
 * Set background visibility
 * 
 * @param {boolean} blVisible
 */
BackgroundController.prototype.setVisible = function(blVisible)
{
	this.blVisible = blVisible;
	this.objBackgroundDiv.style.display = (blVisible) ? "block" : "none";
}

/**
 * Is background visible at the moment?
 * 
 * @return {boolean} 
 */
BackgroundController.prototype.isVisible = function()
{
	return this.blVisible;
}

/**
 * do the background resizing 
 */
BackgroundController.prototype.resize = function()
{
	//get the size of window
	var intWidth = StateFactory.WIDTH_CONTAINER;
	var intHeight = StateFactory.HEIGHT_CONTAINER;
	
	//calculate ratios
	var flImageRatio = this.intImageWidth / this.intImageHeight;
	var flWindowRatio = intWidth / intHeight;
	
	//prepare values
	var intFinalWidth = intWidth;
	var intFinalHeight = intHeight;
	
	var intBgPositionX = 0;
	var intBgPositionY = 0;
	
	var ratio;
	//find ratio and adjust image size and image position
	if (flWindowRatio > flImageRatio)
	{
		ratio = intWidth / this.intImageWidth;
		intBgPositionY = - ((this.intImageHeight * ratio) - this.intHeight) / 2; //centre
	}
	else
	{
		ratio = intHeight / this.intImageHeight;
		intBgPositionX = - ((this.intImageWidth * ratio) - this.intWidth) / 2; //centre
	}
	
	//calculate final image size
	intFinalWidth = this.intImageWidth * ratio;
	intFinalHeight = this.intImageHeight * ratio;
	
	//set values
	this.objBackgroundDiv.style.width = intWidth + "px";
	this.objBackgroundDiv.style.height = intHeight + "px";

	this.objBackgroundDiv.style.backgroundSize = intFinalWidth + "px " + intFinalHeight + "px";

	this.objBackgroundDiv.style.backgroundPosition = intBgPositionX + "px " + intBgPositionY + "px";
}

/**
 * Set CSS class for background
 *  
 * @param {String} className
 */
BackgroundController.prototype.setBackgroundClass = function(className)
{
	this.objBackgroundDiv.className = className;
}

/**
 * Set main background
 */
BackgroundController.prototype.setBackgroundMain = function()
{
	this.setBackgroundClass("bgMain");
}

/**
 * Set freespins background
 */
BackgroundController.prototype.setBackgroundFreespins = function()
{
	this.setBackgroundClass("bgFreeSpins");
}

