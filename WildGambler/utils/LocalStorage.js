/**
 * Local Storage
 */

/**
 * LocalStorage class
 * constructor
 * 
 * @param {object} window - optional, the window object used for storage
 */
function LocalStorage(objWindow)
{
	this.blSupported = null; //will get set to boolean once isSupported() is called
	this.blQuotaExceeded = false;
	this.objWindow = (objWindow != undefined) ? objWindow : window; //window object used for storage
};
/**
 * Derive LocalStorage from our base type to provide inheritance
 */ 
Class.extend(Class, LocalStorage);

/**
 * @param {LocalStorage} used for getInstance Singleton
 */
LocalStorage.objInstance = null;

/**
 * Retrieve LocalStorage singleton instance
 *
 * @return {LocalStorage} 
 */
LocalStorage.getInstance = function()
{
	if (LocalStorage.objInstance == null)
	{
		LocalStorage.objInstance = new LocalStorage();
	}
	return LocalStorage.objInstance;
};

/**
 * Is LocalStorage supported on current device?
 * 
 * @return {boolean} 
 */
LocalStorage.prototype.isSupported = function()
{
	//do the check just once, this is probably not going to change
	if (this.blSupported == null)
	{
		//do the check
		try
		{
	    	this.blSupported = 'localStorage' in this.objWindow && this.objWindow['localStorage'] !== null;
		}
		catch (e)
		{
			this.blSupported = false;
		}	
	}
	return this.blSupported;
};

/**
 * Retrieve stored object by given key
 * Calling getItem() with a non-existent key will return null rather than throw an exception
 * Remember: Stored item might not have been stored retrieved!
 * 
 * @param {String} strKey
 */
LocalStorage.prototype.getItem = function(strKey)
{
	if (!this.isSupported())
	{
		return null;
	}

	return this.objWindow.localStorage.getItem(strKey);
};

/**
 * Store object under given key
 * Remember: Stored item might not have been stored retrieved!
 * Sorry, NULL value is not supported while getItem of localStorage would return String
 * 
 * @param {String} strKey
 * @param {String} strValue
 * @throws {LocalStorageException}
 */
LocalStorage.prototype.setItem = function(strKey, strValue)
{
	if (typeof strKey != "string")
	{
		throw new LocalStorageException("key expected to be String: " + strKey);
	}
	if (strValue == null || typeof strValue != "string")
	{
		throw new LocalStorageException("value expected to be String or NULL: " + strValue);
	}

	if (!this.isSupported())
	{
		return;
	}

	try
	{
		this.objWindow.localStorage.setItem(strKey, strValue);
	}
	catch (e)
	{
		if (e.name == "QuotaExceededError" || e.name == "QUOTA_EXCEEDED_ERR")
		{
			//console.log("Local Storage: Quota Exceeded");
		}
		else
		{
			console.log("Local Storage - unexpected error: " + e.name, e)
			//throw e;
		}
	}
	
};

/**
 * Remove item
 * Calling removeItem() with a non-existent key will do nothing.
 * 
 * @param {String} strKey
 */
LocalStorage.prototype.removeItem = function(strKey)
{
	if (typeof strKey != "string")
	{
		throw new LocalStorageException("key expected to be String: " + strKey);
	}

	if (!this.isSupported())
	{
		return;
	}

	this.objWindow.localStorage.removeItem(strKey);
};

/**
 * Clear the storage
 */
LocalStorage.prototype.clear = function()
{
	if (!this.isSupported())
	{
		return;
	}

	this.objWindow.localStorage.clear();
};
