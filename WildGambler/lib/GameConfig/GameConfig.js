/**
 * Game Config
 */
var GameConfig = function()
{
	//set / override values in init function
	this.blPlayingForReal = true; //default TRUE

	this.strCurrencyCode = null;
	this.strLanguage = null;
	this.strLocale = null;

	this.strUrlCachier = null; //URL to cachier
	this.strUrlHome = null; //URL to lobby

	this.init();
}

// assign this class as default to load with project
// this value will be overriden by specific GameConfig, ie VfGameConfig
// use as var objConfig = new GameConfig.className();
GameConfig.className = GameConfig;

/**
 * Initialize
 * Override this function and populate config values 
 */
GameConfig.prototype.init = function()
{
}

/**
 * Retrieve whether player is playing for real
 * 
 * @return {boolean} 
 */
GameConfig.prototype.isPlayingForReal = function()
{
	return this.blPlayingForReal;
}

/**
 * Retrieve whether player is playing for real
 * 
 * @return {boolean} 
 */
GameConfig.prototype.isPlayingForFun = function()
{
	return !this.isPlayingForReal();
}

/**
 * Retrieve currency
 *  
 * @return {String} or null in case the currency is not defined in config
 */
GameConfig.prototype.getCurrency = function()
{
	return this.strCurrencyCode;
}

/**
 * Retrieve language
 * - always in lowercase
 * 
 * @return {String} or null in case it has not been specified in config
 */
GameConfig.prototype.getLanguage = function()
{
	return this.strLanguage;
}

/**
 * Retrieve locale
 * - always in lowercase
 *  
 * @return {String} or null in case it has not been specified in config
 */
GameConfig.prototype.getLocale = function()
{
	return this.strLocale;
}

/**
 * Retrieve cachier URL
 * 
 * @return {String} or NULL
 */
GameConfig.prototype.getCachierUrl = function()
{
	return this.strUrlCachier;
}

/**
 * Retrieve home / lobby URL
 * 
 * @return {String} or NULL
 */
GameConfig.prototype.getHomeUrl = function()
{
	return this.strUrlHome;
}
