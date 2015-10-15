/**
 * @author Petr.Urban
 */

var AppConfiguration = function()
{
    //default english - or en-GB ? 
    this.strLangCode = "en";
    // default £
    this.strCurrencyCode = "\u00A3";
    
    this.setLangCode = this.setLangCode.bind(this);
    this.getLangCode = this.getLangCode.bind(this);
    this.setCurrencyCode = this.setCurrencyCode.bind(this);
    this.getCurrencyCode = this.getCurrencyCode.bind(this);
}

//singleton
AppConfiguration.objInstance = null;

/**
 * @return {AppConfiguration}
 */
AppConfiguration.getInstance = function()
{
    if (AppConfiguration.objInstance == null)
    {
        AppConfiguration.objInstance = new AppConfiguration();
    }
    return AppConfiguration.objInstance;
}

/**
 * @param {String}
 */
AppConfiguration.prototype.setLangCode = function(strLangCode)
{
    this.strLangCode = strLangCode;
}

/**
 * @return {String}
 */
AppConfiguration.prototype.getLangCode = function()
{
    return this.strLangCode;
}

/**
 * @param {String}
 */
AppConfiguration.prototype.setCurrencyCode = function(strCurrencyCode)
{
    this.strCurrencyCode = strCurrencyCode;
}

/**
 * @return {String}
 */
AppConfiguration.prototype.getCurrencyCode = function()
{
    return this.strCurrencyCode;
}
