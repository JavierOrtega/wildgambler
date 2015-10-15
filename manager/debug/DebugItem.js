/**
 * @author Petr Urban
 * 
 * Item for Queue of debug actions
 */

/**
 * DebugItem Constructor
 * 
 * @param { String } strActionId
 */
function DebugItem(strActionId)
{
	/**
	 * ID of the action
	 *
	 * @type {String} 
	 */
    this.strActionId = strActionId;
}

/**
 * Extend
 */
Class.extend(Class, DebugItem);

/**
 * Retrieve action id
 * 
 * @return {String}
 */
DebugItem.prototype.getActionId = function()
{
	return this.strActionId;
}
