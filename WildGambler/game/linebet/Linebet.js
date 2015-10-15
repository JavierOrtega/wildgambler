/**
 * @author Petr Urban
 * This class represents current Linebet state
 * 
 * API:
 * - getCurrentLinebet() / setCurrentLinebet(floatValue) / setCurrentLinebetIndex(integerValue)
 * - setOnChangeCallback(callback) - assign function to be called when current linebet changes
 * - getSetup() - retrieve setup object
 */

/**
 * Constructor 
 * @param {LinebetSetup} objLinebetSetup
 */
function Linebet(objLinebetSetup) {
	this.objSetup = objLinebetSetup;
	
	this.flCurrentLinebet; //value of current linebet
	this.onChangeCallback = null;
	
	this.setCurrentLinebet(this.objSetup.getDefaultValue());
}

/**
 * Retrieve current linebet
 * 
 * @return {integer}
 */
Linebet.prototype.getCurrentLinebet = function()
{
	return this.flCurrentLinebet;
}

/**
 * Set current linebet
 * 
 * @param {number} flLinebet - accepts only values that are available in setup object, throws exception otherwise
 * @throws {LinebetException} - when setting incorrect linebet value 
 */
Linebet.prototype.setCurrentLinebet = function(flLinebet)
{
	if (flLinebet !== parseFloat(flLinebet))
	{
		throw new LinebetException("cannot set linebet, value not allowed: " + flLinebet);
	}
	//input check
	var availableValues = this.getSetup().getAvailableOptions();
	var blFound = false;
	for (var i in availableValues)
	{
		if (availableValues[i] == flLinebet)
		{
			blFound = true;
			break;
		}
	}
	
	if (blFound === false)
	{
		//throw exception if the value is not available in setup
		throw new LinebetException("cannot set linebet, value not allowed: " + flLinebet);
	}

	this.flCurrentLinebet = flLinebet;

	//run callback
	this.runOnChangeCallback();
}

/**
 * Set current linebet index (index from setup array)
 * 
 * @param {integer} intLinebetIndex - accepts only values that are available in setup object, throws exception otherwise
 * @throws {LinebetException} - when setting incorrect linebet index 
 */
Linebet.prototype.setCurrentLinebetIndex = function(intLinebetIndex)
{
	//input check
	var availableValues = this.getSetup().getAvailableOptions();
	if (availableValues[intLinebetIndex] == undefined)
	{
		//throw exception if the value is not available in setup
		throw new LinebetException("cannot set linebet index, index not in setup: " + intLinebetIndex);
	}

	this.flCurrentLinebet = availableValues[intLinebetIndex];

	//run callback
	this.runOnChangeCallback();
}

/**
 * Get current linebet index (index from setup array)
 * 
 * @return {integer}
 */
Linebet.prototype.getCurrentLinebetIndex = function(intLinebetIndex)
{
	//input check
	var availableValues = this.getSetup().getAvailableOptions();
	for (var intIndex in availableValues)
	{
		if (availableValues[intIndex] == this.flCurrentLinebet)
		{
			return parseInt(intIndex);
		}
	}
}

/**
 * Is the current linebet the first from the setup?
 * 
 * @return {boolean} 
 */
Linebet.prototype.isFirstLinebetSelected = function()
{
	return (this.getCurrentLinebetIndex() == 0);
}

/**
 * Is the current linebet the last from the setup? 
 * 
 * @return {boolean} 
 */
Linebet.prototype.isLastLinebetSelected = function()
{
	return (this.getCurrentLinebetIndex() == (this.getSetup().getAvailableOptions().length - 1));
}


/**
 * Set callback function that will be called when current linebet changes
 * 
 * @param {Object} callback function with 1 parameter - intCurrentLinebet
 */
Linebet.prototype.setOnChangeCallback = function(callback)
{
	//set callback
	this.onChangeCallback = callback;
	//run it
	this.runOnChangeCallback();
}

/**
 * Run onChangeCallback
 */
Linebet.prototype.runOnChangeCallback = function()
{
	//run callback if available
	if (this.onChangeCallback)
	{
		this.onChangeCallback(this.flCurrentLinebet);
	}
}

/**
 * Retrieve setup object
 * @return {AutoplaySetup} 
 */
Linebet.prototype.getSetup = function()
{
	return this.objSetup;
}
