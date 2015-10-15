/**
 * @author Petr Urban
 * 
 * This class will handle the specific functionalities for the Portrait Screen
 * - resizing
 * - localisatoin
 * 
 */


/**
 * Constructor
 * 
 * @param { Object } objGuiController The height of the bottom bar
 */
function PortraitController(objGuiController, objDomNode)
{
	/**
	 * Main DOM Node - DIV
	 * @type {HTMLElement} 
	 */
	this.objDomNode = objDomNode;
	
	/**
	 * GuiController with loaded images
	 * @type {GuiController}
	 */
	this.objGuiController = objGuiController;
	
	/**
	 * Image - rotate
	 * @type {HTMLElement} 
	 */
	this.objDomNodeImage;

	/**
	 * Text - rotate
	 * @type {HTMLElement} 
	 */
	this.objDomNodeText;
	
	/**
	 * Visibility
	 * @type {boolean} 
	 */
	this.blVisible = false;
	
	//initialise
	this.init();
}

/**
 * Derive PortraitController from our base type to provide inheritance
 */ 
Class.extend(Class, PortraitController);

/**
 * Initialisation.
 * Get the portrait resources (images) and attach to objDomNode.
 * 
 */
PortraitController.prototype.init = function()
{
	//find image
	this.objDomNodeImage = this.getGuiImage("landscape_msg_graphic_ipad.png");
	this.objDomNodeImage.className = "portrait-image";
	
	//find text image
	this.objDomNodeText = this.getGuiImage("landscape_msg_text_ipad.png");
	this.objDomNodeText.className = "portrait-text";
	
	//add to the page
	this.objDomNode.appendChild(this.objDomNodeImage);
	this.objDomNode.appendChild(this.objDomNodeText);
}

/**
 * Get image from GuiController / GuiView
 * @param {Image} image
 */
PortraitController.prototype.getGuiImage = function(strAssetName)
{
	var intLayer = 0;
	return this.objGuiController.getGuiView().getElement(intLayer, strAssetName).imImage.objImage;
}

/**
 * Set visibility of portrait screen
 * @param {boolean} isVisible 
 */
PortraitController.prototype.setVisible = function(blVisible)
{
	//skip if not necessary
	if( blVisible != this.blVisible )
	{
    	this.blVisible = blVisible;
    	this.objDomNode.style.display = (this.blVisible) ? "block" : "none";
    }
}

/**
 * Retrieve visibility
 * @return {boolean} 
 */
PortraitController.prototype.isVisible = function()
{
	return this.blVisible;
}
