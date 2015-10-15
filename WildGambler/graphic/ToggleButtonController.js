/**
 * Adds toggle functionality to a button:
 * Used for toggle buttons, checkboxes, radio buttons
 */

function ToggleButtonController(viewObject, blChecked)
{
	this.blChecked = blChecked;
	this.toggleState = this.toggleState.bind(this);
	
	this.onClick = this.onClick.bind(this);
	this.addListener = this.addListener.bind(this);
	this.removeListener = this.removeListener.bind(this);
	
	// Initialise standard Button things 
    if (viewObject)
    {
	   this.newElement(viewObject);
	}
	this.viewObject = viewObject;

	// Initialise the graphic to show checked/unchecked
	if( this.blChecked )
	{
		this.viewObject.setState( ButtonController.STATE_NORMAL );
	}
	else
	{
	    this.viewObject.setState( ButtonController.STATE_INACTIVE );
	}
	
	//
	this.arrListeners = new Array();
	this.blEnabled = true;
	this.blTouchStarted = false; //true when touch starts on this button
}
Class.extend(ButtonController, ToggleButtonController);


/**
 * Toggle the state of thsi control.
 */
ToggleButtonController.prototype.toggleState = function()
{
	this.setChecked(!this.blChecked);
}

/**
 * Update graphics etc. accodring to current checked state
 */
ToggleButtonController.prototype.updateCheckedState = function()
{
	if ( this.blChecked )
	{
		this.viewObject.setState( ButtonController.STATE_NORMAL );
	}
	else
	{
	    this.viewObject.setState( ButtonController.STATE_INACTIVE );
	}
} 

/**
 * Is checked / in state active?
 * 
 * @return {boolean} 
 */
ToggleButtonController.prototype.isChecked = function()
{
	return this.blChecked;
}

/**
 * Set this button checked / active
 * 
 * @param {boolean} blChecked 
 */
ToggleButtonController.prototype.setChecked = function(blChecked)
{
	this.blChecked = blChecked;
	this.updateCheckedState();
}

/**
 * handle onClick event. Do everything the normal button does
 * ALSO toggle our internal state and change the graphic to permanatly show
 * either the ticked or cleared checkbox.
 * 
 * @param {EventControllerEvent} objEvent
 * @param {number} intX
 * @param {number} intY
 */
ToggleButtonController.prototype.onClick = function(objEvent, intX, intY)
{
	if (!this.blEnabled || !this.blTouchStarted)
	{
		// ignore if disabled or if touch did not start on this button
		return;
	}

	if (this.blTouchStarted)
	{
		if (this.collides(intX, intY))
		{
			this.toggleState();
			this.doOnClick(objEvent, intX - this.viewObject.getX(), intY - this.viewObject.getY());
		}
	}
	
   	//reset to default
   	this.blTouchStarted = false;
}
