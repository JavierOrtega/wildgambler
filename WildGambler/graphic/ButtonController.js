/**
 * Extends basic elementController by adding click handling.
 * 
 * @param {Object} viewObject
 */
function ButtonController(viewObject)
{
    if (viewObject)
    {
	   this.newElement(viewObject);
	}
	this.onClick = this.onClick.bind(this);

	this.addListener = this.addListener.bind(this);
	this.removeListener = this.removeListener.bind(this);
	
	this.viewObject = viewObject;

	this.arrListeners = new Array();
	
	this.blEnabled = true;
	this.blTouchStarted = false; //true when touch starts on this button
	
	this.blGroupClicked = false;
	this.blAllowAutoStateChange = true;
	
	this.strIdGroup = "";
}
Class.extend(ElementController,ButtonController);

ButtonController.STATE_NORMAL = "normal";
ButtonController.STATE_PRESSED = "pressed";
ButtonController.STATE_INACTIVE = "inactive";
ButtonController.STATE_CLICK = "click";
ButtonController.ON_TOUCH_START = "genericOnTouchStartEvent";
ButtonController.ON_TOUCH_END = "genericOnTouchEndEvent";

/**
 *  Enable / disable button, changes state of the button
 *
 * @param {boolean} blEnabled 
 */
ButtonController.prototype.setEnabled = function( blEnabled )
{
	this.blEnabled = blEnabled;

	if ( blEnabled )
	{
	    this.viewObject.setState( ButtonController.STATE_NORMAL );
	}
	else
	{
	    this.viewObject.setState( ButtonController.STATE_INACTIVE );
	}
	this.viewObject.update();
}

/**
 * Handles when onClick happened.
 * Returns the viewObject i.e. the button clicked on.
 * Use obj.strIdButton to check which it is.
 * 
 * @param {EventControllerEvent} objEvent
 * @param {number} intX
 * @param {number} intY
 */
ButtonController.prototype.doOnClick = function(objEvent, intX, intY)
{
    for (var index in this.arrListeners [ButtonController.STATE_CLICK])
    {
        if (this.viewObject.blVisible && this.viewObject.objParent.blVisible)
        {
            this.arrListeners[ButtonController.STATE_CLICK][index].call(this, objEvent, this.viewObject, intX, intY);
            
            if (this.blGroupClicked)
            {
                objEvent.stopPropagation(); 
                if (objEvent.isPropagationStopped())
                {
                	break;
                }
            }
        }
    }
}

/**
 * @param {String} strID This is the id for the group 
 */
ButtonController.prototype.setGroupID = function (strID)
{
    this.strIdGroup = strID;
}

/**
 * Handles when onClick happened
 * @param { String } strEvent
 * @param { Object } objFunction
 */
ButtonController.prototype.addListener = function(strEvent, objFunction)
{
    if (!this.arrListeners[strEvent])
    {
        this.arrListeners[strEvent] = new Array();
    }
    for ( var index in this.arrListeners[strEvent])
    {
        if (this.arrListeners[strEvent][index] == objFunction)
        {
            return;
        }
    }
    this.arrListeners[strEvent].push(objFunction);
}

/**
 * 
 */
ButtonController.prototype.removeListener = function(strEvent, objFunction)
{
	var arrNew = [];
    for ( var index in this.arrListeners[strEvent])
    {
        if (this.arrListeners[strEvent][index] != objFunction)
        {
        	if(!arrNew[strEvent])
        	{
        		arrNew[strEvent] = new Array();
        	}
            arrNew[strEvent][index] = this.arrListeners[strEvent][index];
        }
    }
    
    this.arrListeners  = arrNew;
}

/**
 * onTouchStart changes state to pressed
 * 
 * @param {EventControllerEvent} objEvent
 * @param {number} intX
 * @param {number} intY
 * @param {boolean} blFirstTouch - true if this is the first touch
 */
ButtonController.prototype.onTouchStart = function(objEvent, intX, intY, blFirstTouch)
{
	if (!this.blEnabled)
	{
		//ignore if not enabled
		return;
	}
	
	if (blFirstTouch)
	{
	   	//reset to default
	   	this.blTouchStarted = false;

		// Collision detection for bounds of button
		if(this.collides(intX, intY))
	    {
	        
	        if (this.strIdGroup != "")
	        {
                ButtonController.arrGroupIDS[this.strIdGroup] = true;
	        }
	        
	    	//mark that touch has started on this button
	    	this.blTouchStarted = true;
	    	
	    	this.intChangeY = 0;
	    	
			// Change state...
			if (this.blAllowAutoStateChange) {
			    this.viewObject.setState(ButtonController.STATE_PRESSED);
			}

			if (this.arrListeners[ButtonController.ON_TOUCH_START])
			{
				intX -= this.viewObject.getX();
				intY -= this.viewObject.getY();
				for (var index in this.arrListeners[ButtonController.ON_TOUCH_START])
				{
					this.arrListeners[ButtonController.ON_TOUCH_START][index].call(this, objEvent, this.viewObject, intX, intY);
				}
			}
		}
	}
	
}

/**
 * Array of group ID's 
 */
ButtonController.arrGroupIDS = [];

/**
 * onTouchMove changes states between normal and pressed
 * 
 * @param {EventControllerEvent} objEvent
 * @param {number} intX
 * @param {number} intY
 */
ButtonController.prototype.onTouchMove = function(objEvent, intX, intY,intSwipeY)
{
    this.viewObject.intSwipeY = intSwipeY;
    
    if (this.viewObject.blSwipe)
    {
        this.viewObject.update();
        
        if (!this.intChangeY)
        {
            this.intChangeY = 0;
        }
        this.intChangeY += intSwipeY;
    }

	if ( !this.blEnabled || !(this.blTouchStarted || ButtonController.arrGroupIDS[this.strIdGroup] )|| !this.blAllowAutoStateChange )
	{
		// ignore if disabled or if touch did not start on this button
		return;
	}
	
	// Collision detection for bounds of button
	if( this.collides(intX, intY) )
    {
		// Change state...
	    this.viewObject.setState(ButtonController.STATE_PRESSED);
	}
	else
	{
		// Change state...
	    this.viewObject.setState(ButtonController.STATE_NORMAL);
	}
}

/**
 * onTouchEnd changes state back to normal
 * 
 * @param {EventControllerEvent} objEvent
 * @param {number} intX
 * @param {number} intY
 */
ButtonController.prototype.onTouchEnd = function(objEvent, intX, intY)
{
	if (!this.blEnabled || !(this.blTouchStarted ||  ButtonController.arrGroupIDS[this.strIdGroup] ))
	{
		// ignore if disabled or if touch did not start on this button
		return;
	}
	if (this.arrListeners[ButtonController.ON_TOUCH_END])
	{
		intX -= this.viewObject.getX();
		intY -= this.viewObject.getY();
		for (var index in this.arrListeners[ButtonController.ON_TOUCH_START])
		{
			this.arrListeners[ButtonController.ON_TOUCH_END][index].call(this, objEvent, this.viewObject, intX, intY);
		}
	}

	//change state no matter if it collides or not

	// Change state...
	if (this.blAllowAutoStateChange)
	{
	    this.viewObject.setState(ButtonController.STATE_NORMAL);
	}
}


/**
 * Maximum Threshold for the y swipe
 *  
 */
ButtonController.THRESHOLD_Y = 10;

/**
 * handle onClick event
 * 
 * @param {EventControllerEvent} objEvent
 * @param {number} intX
 * @param {number} intY
 */
ButtonController.prototype.onClick = function(objEvent, intX, intY)
{
    
    var blClicked = false;
	if (!this.blEnabled || ! (this.blTouchStarted || ButtonController.arrGroupIDS[this.strIdGroup])
	    || Math.abs(this.intChangeY) > ButtonController.THRESHOLD_Y )
	{
		// ignore if disabled or if touch did not start on this button
		return;
	}

	if (this.blTouchStarted || ButtonController.arrGroupIDS[this.strIdGroup] )
	{
		if (this.collides(intX, intY) && this.viewObject.blVisible)
		{
			this.doOnClick(objEvent, intX - this.viewObject.getX(), intY - this.viewObject.getY());
			blClicked = true;
		}
	}
	
   	//reset to default
   	this.blTouchStarted = false;
   	
   	return blClicked;
}

/**
 * Allow automatic button behaviour (changing states on touch start/end)
 * @param {boolean} blAllow
 */
ButtonController.prototype.setAllowAutomaticStateChange = function(blAllow)
{
	this.blAllowAutoStateChange = blAllow;
}
