/**
 * Game Config - VF implementation
 * - used for VF, use VfGameConfig that extends this function
 * - used for Standalone, use StandaloneGameConfig that extends this function
 * 
 * @param {Object} objGameConfigVfImpl - config input in VF format
 * @param {array} optional, list of supported languages 
 */
var GameConfigVfImpl = function(objGameConfig, arrSupportedLanguages)
{
	this.objGameConfig = objGameConfig; //original VF config object
	this.arrSiteConfigUrls = []; //VF config URLs
	this.strUrlGameEndpoint; //URL for VF backend communication

	this.strDefaultLanguage = "en";
	this.arrSupportedLanguages = ["en", "zh-tw", "es", "de", "it", "da", "sv", "no", "zh-cn", "bg", "el", "pl", "pt", "ro", "cs", "hu", "sk", "ja", "ru", "nl", "fi", "cn"]; //"cn" has been added just in case
	if (arrSupportedLanguages)
	{
		//override with languages supported for specific project / game
		this.arrSupportedLanguages = arrSupportedLanguages;
	}

	GameConfig.call(this);
}

GameConfigVfImpl.prototype = Object.create(GameConfig.prototype);

/**
 * Initialize 
 */
GameConfigVfImpl.prototype.init = function()
{
	//playing for fun
	this.blPlayingForReal = true; //default TRUE
	if (this.objGameConfig.forMoney !== true && (this.objGameConfig.forMoney === false || this.objGameConfig.forMoney.toLowerCase() == "false"))
	{
		//in case the value is false in boolean OR "false" in string
		this.blPlayingForReal = false;
	}

	//handle currency
	if (this.objGameConfig.currency != undefined && this.objGameConfig.currency != "")
	{
		this.strCurrencyCode = this.objGameConfig.currency.toUpperCase();
	}

	//handle language
	if (this.objGameConfig.language != undefined && this.objGameConfig.language != "")
	{
		this.strLanguage = this.objGameConfig.language.toLowerCase();
	}

	//make sure we support this language
	//if not, set current language to default
	var blLanguageFound = false;
	if (this.strLanguage)
	{
		for (var i in this.arrSupportedLanguages)
		{
			if (this.arrSupportedLanguages[i] == this.strLanguage)
			{
				blLanguageFound = true;
				break;
			}
		}
	}
	
	if (!blLanguageFound)
	{
		//set to default language
		this.strLanguage = this.strDefaultLanguage.toLowerCase();
	}

	//handle locale
	if (this.objGameConfig.locale != undefined && this.objGameConfig.locale != "")
	{
		this.strLocale = this.objGameConfig.locale.toLowerCase();
	}
	else
	{
		// locale might not be set on VF platform, use language instead in that case
		this.strLocale = this.strLanguage;
	}

	//VF game endpoint url
	this.strUrlGameEndpoint = this.objGameConfig.gameEndpoint

	//set config URLs
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

	//handle URLs for lobby and cachier
	if (this.arrSiteConfigUrls["home"] != undefined)
	{
		this.strUrlHome = this.arrSiteConfigUrls["home"]; //URL to lobby
	}
	if (this.arrSiteConfigUrls["cachier"] != undefined)
	{
		this.strUrlCachier = this.arrSiteConfigUrls["cachier"]; //URL to cachier
	}
}

/**
 * Retrieve endpoint URL on VF platform
 * 
 * @return {String} 
 */
GameConfigVfImpl.prototype.getGameEndpointUrl = function()
{
	return this.strUrlGameEndpoint;
}

/**
 * Retrieve original site config as it is in VF config
 * 
 * @return {Object} - key-value 
 */
GameConfigVfImpl.prototype.getSiteConfig = function()
{
	return this.objGameConfig.siteConfig;
}

/**
 * Retrieve site config URLs as key-value array
 *
 * @return {Object} - key-value, key is name of the field, value is URL
 */
GameConfigVfImpl.prototype.getSiteConfigUrls = function()
{
	return this.arrSiteConfigUrls;
}
