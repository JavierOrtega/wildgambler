/**
 * VF Config
 * 
 * @param {Object} objVfGameConfig - original VF config input 
 * @param {array} optional, list of supported languages 
 */
var VfGameConfig = function(objVfGameConfig, arrSupportedLanguages)
{
	//bet 365 might use different language codes
	//key-value - bet365 language to vf language
	this.arrBet365Languages = {
		"zh-cht": "zh-tw", //Trad Chinese
		"nn": "no", //Norwegian
		"zh-chs": "zh-cn" //Simp Ch
	}

	GameConfigVfImpl.call(this, objVfGameConfig, arrSupportedLanguages);
}

VfGameConfig.prototype = Object.create(GameConfigVfImpl.prototype);

// assign this class as default to load with project
// use as var objConfig = new GameConfig.className();
GameConfig.className = VfGameConfig;

/**
 * Initialize config 
 */
VfGameConfig.prototype.init = function()
{
	//initialize Bet365 languages
	if (this.objGameConfig.language != undefined && this.objGameConfig.language != "" && this.arrBet365Languages[this.objGameConfig.language] != undefined)
	{
		this.objGameConfig.language = this.arrBet365Languages[this.objGameConfig.language];
	}
	//handle language
	if (this.objGameConfig.locale != undefined && this.objGameConfig.locale != "" && this.arrBet365Languages[this.objGameConfig.locale] != undefined)
	{
		this.objGameConfig.locale = this.arrBet365Languages[this.objGameConfig.locale];
	}
	
	//run VF initialization
	GameConfigVfImpl.prototype.init.call(this);
}
