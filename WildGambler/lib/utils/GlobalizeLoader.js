/**
 * Globalize loader
 * - expects that main Globalize file AND GameConfig have been loaded before running this script
 * - this script will load appripriate globalize culture according to config settings AND set this culture and currency in Globalize library
 * - call "load" method with callback that will be called once everything has been loaded
 * 
 * @param {Object} Globalize
 * @param {objGameConfig} Game config to determine culture and currency
 * @param {String} url path to globalize library (should contain "/" as last character)
 */
var GlobalizeLoader = function(objGlobalize, objGameConfig, strUrlPathGlobalize)
{
	this.objGlobalize = objGlobalize;
	this.objGameConfig = objGameConfig;
	this.strUrlPathGlobalize = strUrlPathGlobalize;
	
	this.onLoadedCallback; //callback to be called when globalize culture has been loaded
}

/**
 * Retrieve currency symbol
 * - static function
 * 
 * @return {String}
 */
GlobalizeLoader.lookForCurrencySymbol = function(strCurrency)
{
	if (strCurrency)
	{
		//just in case null or undefined has been passed in
		strCurrency = strCurrency.toUpperCase();
	}

	var arrCurrencies = {
		"GBP" : "\u00A3",
		"EUR" : "\u20AC",
		"USD" : "\u0024",
		"AUD" : "\u0024",
		"CAD" : "\u0024",
		"CHF" : "Fr",
		"CNY" : "\u00A5",
		"DKK" : "kr",
		"DOP" : "\u0024",
		"HKD" : "\u0024",
		"ILS" : "\u20AA",
		"ISK" : "kr",
		"JPY" : "\u00A5",
		"MYR" : "RM",
		"NOK" : "kr",
		"NZD" : "\u0024",
		"PHP" : "\u20B1",
		"RUB" : "Rb",
		"SEK" : "kr",
		"SGD" : "\u0024",
		"THB" : "\u0E3F",
		"ZAR" : "R",
		"ARS" : "\u0024",
		"MXN" : "\u0024",
		"TWD" : "\u0024",
		"BGN" : "\u043B\u0432",
		"BRL" : "R\u0024",
		"RMB" : "\u00A5",
		"CZK" : "K\u010D",
		"HUF" : "Ft",
		//"INR" : "",//\u20B9",
		"PLN" : "z\u0142",
		"RON" : "L"
    };


	if (arrCurrencies[strCurrency] == undefined)
	{
		if (typeof strCurrency == "string" && strCurrency.length)
		{
			//return currency code in case we haven't found it
			return strCurrency;
		}
	   	else
	   	{
	   		//if no currency code has been specified, return empty string
	   		return "";
	   	}
	}
	else
	{
        return arrCurrencies[strCurrency];
	}
}
/**
 * load globalize 
 */
GlobalizeLoader.prototype.load = function (onLoadedCallback)
{
	this.onLoadedCallback = onLoadedCallback;
	
	var that = this;
	var nodeHead = document.getElementsByTagName("head")[0];

	var nodeGlobalizeCulture = document.createElement("script");
	nodeGlobalizeCulture.setAttribute("type","text/javascript");
	//add onload listener
	nodeGlobalizeCulture.addEventListener("load", function() {
		that.onCultureLoaded();
	});

	//Globalize culture url to load
	var strUrlCulture = this.strUrlPathGlobalize + "cultures/globalize.culture." + this.getGlobalizeLocale() + ".js";
	
	//start loading
	nodeGlobalizeCulture.setAttribute("src", strUrlCulture);
	nodeHead.appendChild(nodeGlobalizeCulture);
}

/**
 * Called when culture has been loaded
 */
GlobalizeLoader.prototype.onCultureLoaded = function ()
{
	//set globalize values
	this.objGlobalize.culture(this.getGlobalizeLocale()).numberFormat.currency.symbol = GlobalizeLoader.lookForCurrencySymbol(this.objGameConfig.getCurrency());
	
	//everything finished and loaded, call the callback now
	this.onLoadedCallback();
}

/**
  * Get locale for globalize
 * - if no language is specified in config, use English as default
 */
GlobalizeLoader.prototype.getGlobalizeLocale = function()
{
	//get language we will use
	var strLocale = this.objGameConfig.getLocale();
	if (strLocale == null)
	{
		strLocale = this.objGameConfig.getLanguage();
	}
	if (strLocale == null)
	{
		//just in case, default to English
		strLocale = "en";
	}
	
	//there's exception for English
    if (strLocale == "en")
    {
    	strLocale = "en-GB";
    }
    
    //make sure the case of thing is OK
    if (strLocale.search("-") >= 0)
  	{
  		var arrLocale = strLocale.split("-");

		//first part is lowercase  		
  		arrLocale[0] = arrLocale[0].toLowerCase();
  		
  		//next part - optional - is forst letter in uppercase
  		if (arrLocale.length > 2)
  		{
  			//case of "az-Latn-AZ"
  			arrLocale[1] = arrLocale[1].substring(0,1).toUpperCase() + arrLocale[1].substring(1, arrLocale[1].length).toLowerCase();
  		}
  		
  		//last bit is uppercase
  		arrLocale[arrLocale.length-1] = arrLocale[arrLocale.length-1].toUpperCase();
  		
  		strLocale = arrLocale.join("-");
  	}
  	else
  	{
  		//only first part of locale, this is in lowercase
  		strLocale = strLocale.toLowerCase();
  	}

	//return the value
	return strLocale;
}
