/**
 * @param { String } strName
 * @param { TextBoxView } objTextBoxView
 * @param {String} strButtonActionId - id of debug button action
 */
function DebugButtonView( strName, objTextBoxView, strButtonActionId )
{
    this.strIdButton = strName;
    
    this.objTextBoxView = objTextBoxView;
    this.intTextOffsetY = 10;
	
	this.newElement();
	this.strButtonActionId = strButtonActionId;
}

Class.extend(TextBoxButtonView, DebugButtonView);

/**
 * @return {String} 
 */
DebugButtonView.prototype.getDebugActionId = function()
{
	return this.strButtonActionId;
}

/**
 * Set currently selected 
 *
 * @return {String} 
 */
DebugButtonView.prototype.setSelected = function(blSelected)
{
	this.blSelected = blSelected;
	if (this.blSelected)
	{
		this.setState("on");
	}
	else
	{
		this.setDefaultState();
	}
}

/**
 * Is currently selected? 
 *
 * @return {String} 
 */
DebugButtonView.prototype.isSelected = function()
{
	return this.blSelected;
}

/**
 * Set into default state 
 *
 * @return {String} 
 */
DebugButtonView.prototype.setDefaultState = function()
{
	this.setState("off");
}
