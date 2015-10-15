/**
 * VF Config
 * 
 * @param {Object} objVfConfig - original VF config input 
 */
var VfConfig = function(objVfConfig)
{
	this.objVfConfig = objVfConfig;
	this.arrSiteConfigUrls = [];
	
	this.init();
}

/**
 * Retrieve currency symbol
 * - this is being used with Globalize, see comment of getGlobalizeCurrencySymbol method
 */
VfConfig.lookForCurrencySymbol = function(strCurrency)
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
		"INR" : "",//\u20B9",
		"PLN" : "z\u0142",
		"RON" : "L",
		
		"£" : "\u00A3",
		"€" : "\u20AC",
		"$" : "\u0024",
		"¥" : "\u00A5",
		"₪" : "\u20AA",
		"₱" : "\u20B1",
		"฿" : "\u0E3F",
		"" : ""
    };


	if (arrCurrencies[strCurrency] == undefined)
	{
	   return "";
	}
	else
	{
        return arrCurrencies[strCurrency];
	}
}


/**
 * Initialize 
 */
VfConfig.prototype.init = function()
{
	var objSiteConfig = this.getSiteConfig();
	if (objSiteConfig) {
		for (var strKey in objSiteConfig)
		{
			var strValue = objSiteConfig[strKey];
			
			//get site config urls
			if (strKey.match(/.url$/i))
			{
				//ends with .url
				this.arrSiteConfigUrls[strKey.split(".")[0]] = strValue;
			}
		}
	}
}

/**
 * Retrieve whether playser is playing for real
 * @return {boolean} 
 */
VfConfig.prototype.isPlayingForReal = function()
{
	return (this.objVfConfig.forMoney == true);
}

/**
 * Retrieve whether playser is playing for real
 * @return {boolean} 
 */
VfConfig.prototype.isPlayingForFun = function()
{
	return (this.objVfConfig.forMoney != true);
}

/**
 * Retrieve currency
 *  
 * @return {String} or null in case the currency is not defined in config 
 */
VfConfig.prototype.getCurrency = function()
{
	if (this.objVfConfig.currency == undefined)
	{
		return null;
	}
	else
	{
		return this.objVfConfig.currency;
	}
}

/**
 * Retrieve language
 * - always in lowercase
 * 
 * @return {String} or null in case it has not been specified in config
 */
VfConfig.prototype.getLanguage = function()
{
	var strLang = this.objVfConfig.language;
	if (strLang == undefined || strLang == "")
	{
		strLang = null;
	}
	else
	{
		strLang = strLang.toLowerCase();
	}
	return strLang;
}

/**
 * Retrieve locale
 * - always in lowercase
 *  
 * @return {String} or null in case it has not been specified in config
 */
VfConfig.prototype.getLocale = function()
{
	var strLang = this.objVfConfig.locale;
	if (strLang == undefined || strLang == "")
	{
		strLang = null;
	}
	else
	{
		strLang = strLang.toLowerCase();
	}
	return strLang;
}

/**
 * Use this method to get locale for globalize
 * - if no language is specified in URL, use english as default
 * 
 * @return {String} in lowercase
 */
VfConfig.prototype.getGlobalizeLocale = function()
{
	//get language we will use
	var strLocale = this.getLocale();
	if (strLocale == null)
	{
		strLocale = this.getLanguage();
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

/**
 * Retrieve currency symbol that is used with Globalize
 * 
 * example (this sets locale AND currency as well):
 * Globalize.culture(vfConfig.getGlobalizeLocale()).numberFormat.currency.symbol = vfConfig.getGlobalizeCurrencySymbol();
 *
 * @return {string} can be empty string if currency not found
 */
VfConfig.prototype.getGlobalizeCurrencySymbol = function()
{
	return VfConfig.lookForCurrencySymbol(this.getCurrency());
}

/**
 * Retrieve endpoint URL on VF platform
 * 
 * @return {String} 
 */
VfConfig.prototype.getGameEndpointUrl = function()
{
	return this.objVfConfig.gameEndpoint;
}

/**
 * Retrieve original site config as it is in VF config
 * @return {Object} - key-value 
 */
VfConfig.prototype.getSiteConfig = function()
{
	return this.objVfConfig.siteConfig;
}

/**
 * Retrieve site config as key-value array
 *
 * @return {Object} - key-value, key is name of the field, value is URL
 */
VfConfig.prototype.getSiteConfigUrls = function()
{
	return this.arrSiteConfigUrls;
}
