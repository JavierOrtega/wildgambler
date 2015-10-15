/**
 * 
 */
function DetectPlatform () 
{

	this.platform="";
	
	//
	this.init = this.init.bind(this);
	this.searchString = this.searchString.bind(this);
	
	//
	this.init();
}
Class.extend(Class,DetectPlatform);

/**
 * Run the searches 
 */
DetectPlatform.prototype.init = function () 
{
	this.platform = this.searchString(OSdata.data) || "an unknown OS";
	
	//Os version
	this.strOSVersion = this.searchOSVersionString();	
	//Browser version
	this.strVersion = this.searchVersionString();
	
	
	if (this.platform == OS.IOS )
	{
	    if ( navigator.userAgent.search("iPhone") != -1 )
	    {
	        if (window.devicePixelRatio < 2)
	        {
	           this.strDeviceType = "iPhoneLow";
	        }
	        else
	        {
	            this.strDeviceType = "iPhone";
	        }	        
	    }
	    else
	    {
	        this.strDeviceType = "iPad";
	    }
	}
	
	if (this.platform == OS.ANDROID )
    {
        if ( navigator.userAgent.search("Mobile") !=-1 || navigator.userAgent.search("mobile") !=-1)
        {
            this.strDeviceType = "Mobile";
        }
        else
        {
            this.strDeviceType = "Tablet";
        }
    }
}

/**
 * 
 * 
 * @return The version of the OS
 */
DetectPlatform.prototype.searchOSVersionString = function ( ) 
{
    
    if (this.platform == OS.ANDROID)
    {
        var strTemp = navigator.userAgent.split ("Android")[1];
        strTemp = strTemp.split (";")[0];
        strTemp = strTemp.replace (" ","");
        strTemp = strTemp.split(".")[0];
        return strTemp;
    }
    else 
    {
        return (this.searchVersionString())
    }
}

/**
 * 
 * 
 * @return The version of the OS
 */
DetectPlatform.prototype.searchVersionString = function ( ) 
{
    //TO DO
    //This is only for iOS
    //To talk with Mark about the others
    var intI = 10;
    for (intI ; intI > 0 ; intI--)
    {
        if (navigator.userAgent.indexOf("n/" + intI + ".") != -1)
        {
            return  "" +intI;
        }    
    }
}

/**
 * Search for the occurence of a string either as a string or property
 * using either the supplied data structure or the userAgent string.
 */
DetectPlatform.prototype.searchString = function (data) 
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
 * Data array of the 4 major platforms  
 * Not defining as JSON in a file to reduce loading.
 */
var OSdata = 
{
		data : [
		{
			string: navigator.platform,
			subString: OS.WIN_ID,
			identity: OS.WINDOWS
		},
		{
			string: navigator.platform,
			subString: OS.MAC_ID,
			identity: OS.MAC
		},
		{
		   string: navigator.userAgent,
		   subString: DEVICES.IOS_DEVICE,
		   identity: OS.IOS
        },
		{
			string: navigator.userAgent,
			subString: OS.ANDROID,
			identity: OS.ANDROID
		}
	]
};

