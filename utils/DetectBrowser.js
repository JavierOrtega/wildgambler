/**
 * 
 */
function DetectBrowser () 
{

	/** External data */
	this.browser = "";
	this.version = "";
	
	/** Internal use */
	this.versionSearchString = "";

	/** Methods */
	
	this.init = this.init.bind(this);
	
	this.searchString = this.searchString.bind(this);
	
	this.searchVersion = this.searchVersion.bind(this);
	
	/** Set external data */
	this.init();
}
Class.extend(Class,DetectBrowser);

/**
 * Run the searches 
 */
DetectBrowser.prototype.init = function ()
{	
	this.browser = this.searchString(browserData.data) || "An unknown browser";	    
	this.version = this.searchVersion(navigator.userAgent) || 
								this.searchVersion(navigator.appVersion) || "an unknown version";
}

/**
 * Search for the occurence of a string either as a string or property
 * using either the supplied data structure or the userAgent string.
 */
DetectBrowser.prototype.searchString = function (data) 
{
	for (var i=0; i<data.length; ++i)
	{
		var dataString = data[i].string;
		var dataProp = data[i].prop;
	
		this.versionSearchString = data[i].versionSearch || data[i].identity;
	
		if (dataString) 
		{
			if (dataString.indexOf(data[i].subString) != -1)
			{   
				return data[i].identity;
			}
		}
		else if (dataProp)
		{
			return data[i].identity;
		}
	}
}

/**
 * Search for the browser's version information
 * @return float (version number) 
 */
DetectBrowser.prototype.searchVersion = function (dataString) 
{
	var index = dataString.indexOf(this.versionSearchString);
	
	if (index == -1) 
	{
		return;
	}

	return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
}

/**
 * Data array of browsers.
 * Order is important as we need to detect some before others due to the 
 * order of navigator.userAgent string components.
 * FOR EXAMPLE Chrome must come before Safari as both strings appear in Chrome (but not in Safari)
 * so there's always a risk of mis-detection.
 * Not defining as JSON in a file to reduce loading.
 */
var browserData=
{
	data : [
		{
			string: navigator.userAgent,
			subString: USER_AGENTS.CHROME,
			identity: BROWSERS.CHROME
		},
		{
			string: navigator.userAgent,
			subString: USER_AGENTS.ANDROID,
			versionSearch: "Build/",
			identity: BROWSERS.ANDROID
		},
		{
			string: navigator.vendor,
			subString: VENDORS.APPLE,
			identity: BROWSERS.SAFARI,
			versionSearch: STRINGS.VERSION
		},
		{
			prop: window.opera,
			identity: BROWSERS.OPERA,
			versionSearch: STRINGS.VERSION
		},
		{
			string: navigator.userAgent,
			subString: USER_AGENTS.FIREFOX,
			identity: BROWSERS.FIREFOX
		},
		{
			string: navigator.userAgent,
			subString: BROWSERS.IE_ID,
			identity: BROWSERS.IE,
			versionSearch: BROWSERS.IE_ID
		},
		{ 	
			string: navigator.userAgent,
			subString: USER_AGENTS.OMNIWEB,
			versionSearch: USER_AGENTS.OMNIWEB + "/",
			identity: BROWSERS.OMNIWEB
		},
		{
			string: navigator.vendor,
			subString: VENDORS.ICAB,
			identity: VENDORS.ICAB
		},
		{
			string: navigator.vendor,
			subString: VENDORS.KDE,
			identity: "Konqueror"
		},
		{
			string: navigator.vendor,
			subString: VENDORS.CAMINO,
			identity: VENDORS.CAMINO
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: USER_AGENTS.NETSCAPE,
			identity: BROWSERS.NETSCAPE
		},
		{
			string: navigator.userAgent,
			subString: USER_AGENTS.GECKO,
			identity: BROWSERS.MOZILLA,
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: USER_AGENTS.MOZILLA,
			identity: BROWSERS.NETSCAPE,
			versionSearch: USER_AGENTS.MOZILLA
		}
	]
};


