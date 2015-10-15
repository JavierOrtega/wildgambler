/**
 * Object to handle interaction from user
 * Clicks, presses etc. 
 * 
 * @param {Object} viewObject
 * 
 */
function ElementController(viewObject)
{
	this.newElement = this.newElement.bind(this);
	this.collides = this.collides.bind(this);
	this.updateBounds = this.updateBounds.bind(this);
	
	if (viewObject)
	{
	// Contruct...
	   this.newElement(viewObject);
	}
	this.doOnClick = this.doOnClick.bind(this);
	
	
	/**
     * External Callback to be called when the button is clicked
     * @type { Object }
     */
    this.onClickCallBack;
}
Class.extend(Class,ElementController);

/**
 * de-facto contructor for child classes
 * 
 * @param {Object} viewObject
 */
ElementController.prototype.newElement = function(viewObject)
{
	this.viewObject = viewObject;
	
	this.bounds = new Object();

	
	this.updateBounds();
}

/**
 * Update the bounds 
 */
ElementController.prototype.updateBounds = function()
{
    this.bounds.left = this.viewObject.getX();
    this.bounds.right = this.viewObject.getX() + this.viewObject.getWidth();
    this.bounds.top = this.viewObject.getY();
    this.bounds.bottom = this.viewObject.getY() + this.viewObject.getHeight();
}

/**
 * abstract, function that handles when onClick happened
 * @param {EventControllerEvent} objEvent
 * @param {number} intX
 * @param {number} intY
 */
ElementController.prototype.doOnClick = function( objEvent, intX, intY )
{
	// -- Nothing
}

/**
 * Fast-ish bounds checking for click event.
 * 
 * @param {number} intX input from click event?
 * @param {number} intY input from click event?
 */
ElementController.prototype.collides = function( intX, intY )
{
	//update current bounds
	this.updateBounds();

	// Check if it's this button in the row we are pressing
	if( intX < this.bounds.left + this.viewObject.intParentOffsetX)
	{
		return false;
	}
	else if( intX > this.bounds.right + this.viewObject.intParentOffsetX)
	{
		return false;
	}
	
	// Check top/bottom of button bounds
	if( intY < this.bounds.top  + this.viewObject.intParentOffsetY)
	{
		return false;
	}
	if( intY > this.bounds.bottom  + this.viewObject.intParentOffsetY)
	{
		return false;
	}
	
	//
	return true;
}

/**
 * onTouchStart
 * 
 * @param {EventControllerEvent} objEvent
 * @param {number} intX
 * @param {number} intY
 * @param {boolean} blFirstTouch
 */
ElementController.prototype.onTouchStart = function(objEvent, intX, intY, blFirstTouch)
{
	// -- Nothing
}

/**
 * onTouchMove
 * 
 * @param {EventControllerEvent} objEvent
 * @param {number} intX X Offset
 * @param {number} intY Y Offset
 */
ElementController.prototype.onTouchMove = function(objEvent, intX, intY)
{
	this.viewObject.intSwipeX = intX;
	this.viewObject.intSwipeY = intY;
	
	if (this.viewObject.blSwipe)
	{
	    this.viewObject.update();
	}
}

/**
 * onTouchMove
 * 
 * @param {EventControllerEvent} objEvent
 * @param {number} intX
 * @param {number} intY
 */
ElementController.prototype.onTouchEnd = function(objEvent, intX, intY)
{
	// -- Nothing
}

/**
 * Handle onClick event
 * Note: override this function if more logic is needed before calling doOnClick
 * 
 * @param {EventControllerEvent} objEvent
 * @param {number} intX
 * @param {number} intY
 */
ElementController.prototype.onClick = function(objEvent, intX, intY)
{
    if (intX >= this.bounds.left &&  intX <= this.bounds.right  && 
        intY >= this.bounds.top &&  intY <= this.bounds.bottom )
    {
        this.doOnClick(objEvent, intX,intY);   
    }
}

/**
 * Retrieve view object
 *
 * @return {ElementView}
 */
ElementController.prototype.getViewObject = function()
{
	return this.viewObject;
}
