/**
 * @author Petr Urban
 * This class represents setup for Linebet
 * 
 * Has available linebet options + default option
 */

/**
 * Constructor for Linebet Setup
 *  
 * @param {array} arrAvailableOptions
 * @throws {LinebetException} for incorrect values
 */
function LinebetSetup(arrAvailableOptions)
{
	this.arrAvailableOptions = [];
	this.flDefaultValue;
	
	this.setAvailableOptions(arrAvailableOptions);
}

Class.extend(Class, LinebetSetup);

/**
 * Set available values for linebet
 * Available options are numbers greater than zero
 *
 * @param {array} arrAvailableOptions
 * @throws LinebetException for incorrect values
 */
LinebetSetup.prototype.setAvailableOptions = function(arrAvailableOptions)
{
	//test input values
	if( Object.prototype.toString.call( arrAvailableOptions ) !== '[object Array]' || arrAvailableOptions.length == 0 ) {
	    throw new LinebetException("invalid setup");
	}
	for (var i in arrAvailableOptions)
	{
		var flValue = arrAvailableOptions[i];
		if (flValue !== parseFloat(flValue) || flValue <= 0 || Math.abs(flValue) === Infinity)
		{
			throw new LinebetException("invalid setup value: " + arrAvailableOptions[i]);
		}
	}
	
	//set options
	this.arrAvailableOptions = arrAvailableOptions;
	
	this.setDefaultValue(this.arrAvailableOptions[0]);
};

/**
 * Update / find default value in available values
 * 
 * @param {number} flDefaultValue
 * @throws {LinebetException}
 */
LinebetSetup.prototype.setDefaultValue = function(flDefaultValue)
{
	if (flDefaultValue !== parseFloat(flDefaultValue))
	{
		throw new LinebetException("Invalid default value: " + flDefaultValue);
	}
	var blFound = false;
	for (var i in this.arrAvailableOptions)
	{
		if (this.arrAvailableOptions[i] == flDefaultValue)
		{
			blFound = true;
			break;
		}
	}
	if (blFound == false)
	{
		throw new LinebetException("Could not set default value, value is not in available options: " + flDefaultValue);
	}
	
	//set default value
	this.flDefaultValue = flDefaultValue;
};

/**
 * Retrieve default value
 * 
 * @return {number}
 */
LinebetSetup.prototype.getDefaultValue = function()
{
	return this.flDefaultValue;
};

/**
 * Retrieve available linebet options
 * @return { Array } 
 */
LinebetSetup.prototype.getAvailableOptions = function()
{
	return this.arrAvailableOptions;
};
