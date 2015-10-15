/**
 * @author Petr Urban
 * This class represents game seetings
 */

/**
 * Constructor 
 */
function GameSettings()
{
	//simple key-value storage
	this.arrValues = [];
	
	this.blInitialised = false;
	this.initDefaultValues();
}

GameSettings.DEFAULT_VALUES = {};
GameSettings.LANGUAGE = "language";

GameSettings.DEFAULT_VALUES[GameSettings.LANGUAGE] = "en";

/**
 * @param {LocalStorage} used for getInstance Singleton
 */
GameSettings.objInstance = null;

/**
 * Retrieve LocalStorage singleton instance
 *
 * @return {LocalStorage} 
 */
GameSettings.getInstance = function()
{
	if (GameSettings.objInstance == null)
	{
		GameSettings.objInstance = new GameSettings();
	}
	return GameSettings.objInstance;
}

/**
 * Initialise default values 
 */
GameSettings.prototype.initDefaultValues = function()
{
	if (!this.blInitialised)
	{
		for (var strIndex in GameSettings.DEFAULT_VALUES)
		{
			this.setItem(strIndex, GameSettings.DEFAULT_VALUES[strIndex]);
		}

		this.blInitialised = true;
	}
}

/**
 * Store item in settings
 * 
 * @param {String} strKey
 * @param {Object} strValue
 * @throws {GameSettingsException}
 */
GameSettings.prototype.setItem = function(strKey, strValue)
{
	if (typeof strKey != "string")
	{
		throw new GameSettingsException("key expected to be String: " + strKey);
	}

	//save it
	this.arrValues[strKey] = strValue;
}

/**
 * Get item from settings
 *  
 * @param {String} strKey
 * @throws {GameSettingsException}
 * 
 * @return {Object}
 */
GameSettings.prototype.getItem = function(strKey)
{
	if (typeof strKey != "string")
	{
		throw new GameSettingsException("key expected to be String: " + strKey);
	}

	if (this.arrValues[strKey] != undefined)
	{
		return this.arrValues[strKey]; 	
	}

	return null;
}

/**
 * Remove item from settings 
 * @param {String} strKey
 * @throws {GameSettingsException}
 */
GameSettings.prototype.removeItem = function(strKey)
{
	if (typeof strKey != "string")
	{
		throw new GameSettingsException("key expected to be String: " + strKey);
	}

	if (this.arrValues[strKey] != undefined)
	{
		delete this.arrValues[strKey];
	}
}

/**
 * Clear all saved settings 
 */
GameSettings.prototype.clear = function()
{
	this.arrValues = [];
}
