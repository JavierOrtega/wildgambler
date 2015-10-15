/**
 * Logging object
 *
 * Provides easy way to log things
 * 4 easy to use functions that make different colors in the log:
 * - write (gray)
 * - notify (green)
 * - error (red)
 * - variable (blue) - unlimited nr of parameters!
 *   i.e. log.variable(var1, var2, var3, var4)
 */

/**
 * Log constructor
 * 
 * @param {object} objNodeParent DomNode that we will append this log to
 * @param {number} intWidth width in pixels
 * @param {height} intWidth height in pixels
 */
var Log = function(objNodeParent, intWidth, intHeight)
{
	this.objNodeParent = objNodeParent;

	this.intWidth = intWidth;
	this.intHeight = intHeight;

	this.objNode = null;
	this.opacity = 0.8;

	this.blScrollDownNeeded = true;
	this.timeoutNotify = false;
	
	this.strStyleBorderRegular = "1px dashed #888";
	this.strStyleBorderNotify = "1px solid #f00";
	
	this.init();
};

Class.extend(Class, Log);

Log.prototype = {
	/**
	 * Initialization
	 * automatically run from constructor
	 */
	init: function()
	{
		this.objNode = document.createElement("div");
		
		this.objNode.style.color = "#000";
		this.objNode.style.position = "absolute";
		this.objNode.style.right = 0;
		this.objNode.style.top = 0;
		this.objNode.style.opacity = this.opacity;
		
		this.objNode.style.overflow = "auto";
		this.objNode.style.zIndex = 500;
		
		this.objNode.style.border = this.strStyleBorderRegular;
		this.objNode.style.padding = "1em 0";
		this.objNode.style.fontSize = "smaller";

		this.objNode.style.width = (this.intWidth + "px");
		this.objNode.style.height = (this.intHeight + "px");
		
		//append to the parent node
		this.objNodeParent.appendChild(this.objNode);
	},
	
	/**
	 * Do before write to log
	 */
	beforeLogWrite: function()
	{
		this.blScrollDownNeeded = true;
		//alert(this.objNode.scrollTop + " vs " + this.objNode.scrollHeight - this.objNode.offsetHeight);
		if (this.objNode.scrollTop < (this.objNode.scrollHeight - this.objNode.offsetHeight))
		{
			this.blScrollDownNeeded = false;
		}
	},

	/**
	 * Do after writing to log (after DomNode has been appended)
	 */
	afterLogWrite: function()
	{
		if (this.blScrollDownNeeded)
		{
			this.scrollDown();
		}
		this.notifyNewLog();
	},

	/**
	 * write to log (gray color)
	 * 
	 * @param {string} strMessage
	 */
	write: function(strMessage)
	{
		this.beforeLogWrite();
		this.objNode.appendChild(this.createNodeMessage(strMessage, "#ddd"));
		this.afterLogWrite();
	},

	/**
	 * write to log (green color)
	 * 
	 * @param {string} strMessage
	 */
	highlight: function(strMessage)
	{
		this.beforeLogWrite();
		this.objNode.appendChild(this.createNodeMessage(strMessage, "#d1ffd2"));
		this.afterLogWrite();
	},
	
	/**
	 * write to log (red color)
	 * 
	 * @param {string} strMessage
	 */
	error: function(strMessage)
	{
		this.beforeLogWrite();
		this.objNode.appendChild(this.createNodeMessage(strMessage, "#ffe5e5"));
		this.afterLogWrite();
	},
	
	/**
	 * write variable text to log (red blue)
	 * 
	 * @param {string} strMessage
	 */
	writeVariable: function(strMessage)
	{
		this.beforeLogWrite();
		this.objNode.appendChild(this.createNodeMessage(strMessage, "#bceeff"));
		this.afterLogWrite();
	},
	
	
	/**
	 * write to variable to log (red blue)
	 * 
	 * @param {arg1, arg2 ...} strMessage
	 */
	variable: function()
	{
		if (arguments.length > 0)
		{
			var args = [];
			for (var i = 0; i < arguments.length; i++)
			{
				var strText = arguments[i];
				if (strText === null)
				{
					strText = "{null}";
				}
				else if (strText === "")
				{
					strText = '"" {empty string}';
				}
				else if (strText === undefined)
				{
					strText = "{undefined}";
				}
				else if (strText === NaN)
				{
					strText = "{NaN}";
				}
				else if (Object.prototype.toString.call( strText ) === '[object Array]')
				{
					strText = "{Array ["+strText.length+"]}";
				}
				else if (typeof strText == 'object')
				{
					strText = "{Object}";
				}
				args.push(strText);
			}
		
			this.writeVariable("variable: " + args.join(", "));
		}
		else
		{
			this.writeVariable("variable: {empty}");
		}
	},

	/**
	 * create DomNode with message
	 * 
	 * @param {string} strMessage
	 * @param {string} strBackgroundColor format in CSS style ("#fff", "#ffffff", "white" etc.)
	 * @return {DomNode}
	 */
	createNodeMessage: function(strMessage, strBackgroundColor)
	{
		var objNodeMessage = document.createElement("p");
		
		objNodeMessage.style.display = "block";
		objNodeMessage.style.background = strBackgroundColor;
		objNodeMessage.style.width = "90%";
		objNodeMessage.style.padding = "0.1em 5%";
		objNodeMessage.style.margin = "0";
		objNodeMessage.style.borderBottom = "1px solid #888";

		var objNodeText = document.createTextNode(strMessage);
		objNodeMessage.appendChild(objNodeText);
		
		return objNodeMessage;
	},
	
	/**
	 * scroll the log down
	 */
	scrollDown: function()
	{
		this.objNode.scrollTop = this.objNode.scrollHeight - this.objNode.offsetHeight;
	},
	
	/**
	 * notify that something has changed in the log
	 */
	notifyNewLog: function()
	{
		var that = this;
		
		clearTimeout(this.timeoutNotify);
		this.objNode.style.border = this.strStyleBorderNotify;
		this.timeoutNotify = setTimeout(function()
			{
				that.objNode.style.border = that.strStyleBorderRegular;
			}, 500);
	}
};

/* singleton functionality */
Log.singletonInstance = null;

/**
 * Get singleton instance
 * @return {BrowserWindow}
 */
Log.getInstance = function()
{
	if (Log.singletonInstance == null)
	{
		Log.singletonInstance = new Log(document.body, 500, 400)
	}
	return Log.singletonInstance;
}
