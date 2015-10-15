/**
 * Helper for scrolling 
 */

/**
 * Scroll helper consturctor
 *  
 * @param {number} intCurrentValue
 * @param {number} intMinValue
 * @param {number} intMaxValue
 */
var ScrollHelper = function(intCurrentValue, intMinValue, intMaxValue)
{
	this.intCurrentValue = null;
	this.intMinValue = intMinValue;
	this.intMaxValue = intMaxValue;
	
	this.onChangeCallback = null;

	this.setValue(intCurrentValue);
}

//extend class
Class.extend(Class, ScrollHelper);

/**
 * Set maximal value
 * 
 * @param {number} intMaxValue
 * @throws {Error} in case current value is out of bonds
 */
ScrollHelper.prototype.setMaxValue = function(intMaxValue)
{
	//check current value
	if (this.intCurrentValue > intMaxValue)
	{
		throw new Error("ScrollHelper - setMaxValue - current value out of bounds");
	}

	this.intMaxValue = intMaxValue;
}

/**
 * Set minimal value
 * 
 * @param {number} intMinValue
 * @throws {Error} in case current value is out of bonds
 */
ScrollHelper.prototype.setMinValue = function(intMinValue)
{
	//check current value
	if (this.intCurrentValue < intMinValue)
	{
		throw new Error("ScrollHelper - setMinValue - current value out of bounds");
	}

	this.intMinValue = intMinValue;
}

/**
 * Retrieve current max value 
 *
 * @return {number}
 */
ScrollHelper.prototype.getMaxValue = function()
{
	return this.intMaxValue;
}

/**
 * Retrieve current min value 
 *
 * @return {number}
 */
ScrollHelper.prototype.getMinValue = function()
{
	return this.intMinValue;
}

/**
 * Set current value
 * IMPORTANT: If the value is out of min/max bounds, value of minimal or maximal bounds will be set instead !!
 * 
 * @param {number} intValue 
 */
ScrollHelper.prototype.setValue = function(intValue)
{
	var originalValue = this.intCurrentValue;

	if (intValue > this.intMaxValue)
	{
		this.intCurrentValue = this.intMaxValue;
	}
	else if (intValue < this.intMinValue)
	{
		this.intCurrentValue = this.intMinValue;
	}
	else
	{
		this.intCurrentValue = intValue;
	}
	
	if (this.intCurrentValue != originalValue)
	{
		this.runOnChangeCallback(this.intCurrentValue - originalValue);
	}
}

/**
 * Retrieve current value 
 *
 * @return {number}
 */
ScrollHelper.prototype.getValue = function(intValue)
{
	return this.intCurrentValue;
}

/**
 * Set on change callback function 
 *
 * @pararm {Function} callback 
 */
ScrollHelper.prototype.setOnChangeCallback = function(callback)
{
	this.onChangeCallback = callback;
}

/**
 * Run the callback if available
 * @param {number} intDiff - difference from last time 
 */
ScrollHelper.prototype.runOnChangeCallback = function(intDiff)
{
	if (this.onChangeCallback)
	{
		this.onChangeCallback(this.intCurrentValue, intDiff);
	}
}
