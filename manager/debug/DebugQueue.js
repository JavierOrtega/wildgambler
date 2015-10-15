/**
 * @author Petr Urban
 * 
 * Queue of debug actions
 */

/**
 * DebugMenu Constructor
 * 
 * @param { Object } objDeviceModel Device model
 * @param { Object } objGuiController The height of the bottom bar
 */
function DebugQueue()
{
	/**
	 * Queue of items to debug 
	 *
	 * @type {Array} 
	 */
    this.arrItems = [];
}

/**
 * Extend 
 */ 
Class.extend(Class, DebugQueue);

/**
 * Is DebugQueue empty?
 * @return {boolean} 
 */
DebugQueue.prototype.isEmpty = function()
{
	return (this.arrItems.length == 0);
}

/**
 * Retrieve count of items in queue
 * 
 * @return {boolean}
 */
DebugQueue.prototype.getItemsCount = function()
{
	return this.arrItems.length;
}

/**
 * Add item to debug queue
 * @param {object} object
 * @throws {DebugException}
 */
DebugQueue.prototype.addItem = function(object)
{
	if (!(object instanceof DebugItem)) {
		throw new DebugException("only instance of DebugItem can be added to debug queue");
	}
	this.arrItems.push(object);
}

/**
 * Add item to debug queue
 * 
 * @return {object}
 */
DebugQueue.prototype.getCurrentItem = function()
{
	if (this.isEmpty())
	{
		return null;
	}
	else
	{
		return this.arrItems[0];
	}
}

/**
 * Mark item as processed 
 * @param {Object} object
 */
DebugQueue.prototype.markItemAsProcessed = function(object)
{
	if (!(object instanceof DebugItem)) {
		throw new DebugException("only instance of DebugItem can be in debug queue");
	}

	for (var i = 0; i < this.arrItems.length; i++)
	{
		if (this.arrItems[i] == object)
		{
			this.arrItems.splice(i, 1);
			break;
		}
	}
}

/**
 * Clear items from debug queue 
 */
DebugQueue.prototype.clear = function()
{
	this.arrItems = [];
}
