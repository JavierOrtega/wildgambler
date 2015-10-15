/**
 * @author Michael.Sorhaindo
 * @date 12/03/2013
 * 
 * This class will provide the storage for the localised text
 *  
 */

var Localisation = function(arrFileContents) 
{
	// TODO add once in the framework - if even needed
	//this.getText = this.getText.bind(this);
	
	this.arrOriginalText = [];  //key/value; for strings
	
	this.arrTexts = []; //key/value for objects that don't have text to replace'
	this.arrTextReplaceable = []; //array of objects that DO have some text to replace 
	
	this.blShowKeys = false;  // default to false;
	/*
	var arrFileContents = {
	"text1": "This is the text1",
	"text3": "This is the text2",
	"text4": { "ref": "text3" }
	};
	*/
	
	try {
		this.loadJSONData(arrFileContents);
	} catch (e) {
		console.log("could not load dynamic text", arrFileContents);
	}
} 

//TODO add once in the framework
//Class.extend(Class, Localisation);

/**
 * Retrieve localised text
 * @param {String} strKey
 * @param {Array} arrData 
 */
Localisation.prototype.getText = function(strKey, arrData) {

	if (this.arrOriginalText[strKey] == undefined) {
		//could not find this
		console.log("Failed to find String in Localisation Object: " + strKey);
		return new LocalisationText(strKey, "Error!");
	}
	else
	{
		if (this.arrOriginalText[strKey].indexOf("%1") < 0)
		{
			//there is nothing to replace in this text, we can cache it
			
			//check the cache
			if (this.arrTexts[strKey] == undefined)
			{
			 	this.arrTexts[strKey] = new LocalisationText(strKey, this.arrOriginalText[strKey]);
	
				//in case we are showing debug keys
				if (this.blShowKeys)
				{
				 	this.arrTexts[strKey].setText(strKey);		
				}
			}
			//return from cache
			return this.arrTexts[strKey];
		}
		else
		{
			//there is something to replace, we cannot cache it in case it is used more that once
			var objLocalisationText = new LocalisationText(strKey, this.arrOriginalText[strKey])
			
			if (arrData != undefined)
			{
				//set the data if necessary
				objLocalisationText.setTextData(arrData);
			}

			//add to cache so that we can show key
			this.arrTextReplaceable.push(objLocalisationText);

			return objLocalisationText;
		}
	}
}


Localisation.prototype.loadJSONData = function(objData) {
	
	for (var strKey in objData)	{
		
		var strText = objData[strKey];
		// check to see if ref exists.
		if (strText instanceof Object) {
			if (objData[strText.ref] == undefined)
			{
				throw new Error("Incorrect reference "+ strText.ref)
			}
			this.arrOriginalText[strKey] = objData[strText.ref];
		}
		else {
			this.arrOriginalText[strKey] = strText;
		}
		
	}
	
}
	
/**
 *Returns the state of the showKeys member variable. 
 */
Localisation.prototype.isKeysVisible = function(){
	return this.blShowKeys;
}

/**
 * 
 * @param {Object} val
 */
Localisation.prototype.setKeysVisible = function(blVal) {

	this.blShowKeys = blVal;
	
	//not replacable texts
	for (var strKey in this.arrTexts)
	{
		this.arrTexts[strKey].setKeyVisible(this.blShowKeys);
	}
	
	//replacable texts
	for (var i in this.arrTextReplaceable)
	{
		this.arrTextReplaceable[i].setKeyVisible(this.blShowKeys);;
	}
}
/**
 * Formats the number parameter into currency for display
 * @param {int}  intNumber: the number to be converted
 */
Localisation.formatNumber = function(intNumber)
{
    intNumber = parseFloat (intNumber);
    // also need to put something in here if we're still using Playtech sidebar approach of sending events off and listening for them?
    
    // set the culture according to the Configuration class
    //Globalize.culture( Configuration.strLangCode );    
    //Localisation.overrideCurrencyCode();
    var strFormattedNumber = Globalize.format(intNumber, "c2");
    //console.log("Localisation.formatNumber(" + intNumber + ") formatted to: " + strFormattedNumber)
        
    return strFormattedNumber;
}

    /**
 * Override the currency code. this is because there are errors with using the globalize defaults on some devices.
 * Done in this format because we may find later down the line that £ needs to be GBP etc 
 */
Localisation.overrideCurrencyCode = function()
{
    Localisation.strCurrencyCode = StateFactory.getInstance().initParamsObj.currency; //
    Localisation.strLangCode =  StateFactory.getInstance().initParamsObj.language; // "fr"; //

    var strReplacement = "";
    
    switch (Localisation.strCurrencyCode) //strCurrencyCode
    {
        case "GBP":
            var strReplacement = "\u00A3";
        break;
        case "USD":
            var strReplacement = "\u0024";
        break;
        case "EUR":
            var strReplacement = "\u20AC";
        break;
       
    default:
        console.log("No currency override needed.")
    } 
    
    if ( strReplacement != "" )
    {
        Globalize.culture(Localisation.strLangCode).numberFormat.currency.symbol = strReplacement;
    }  
}

Localisation.cultureDictionary = new Array();
Localisation.cultureDictionary["en"] = "en-GB";
Localisation.cultureDictionary["da"] = "da"; //
Localisation.cultureDictionary["nl"] = "nl"; //
Localisation.cultureDictionary["fi"] = "fi"; //
Localisation.cultureDictionary["no"] = "nn";
Localisation.cultureDictionary["pt"] = "pt";
Localisation.cultureDictionary["es"] = "es";
Localisation.cultureDictionary["sv"] = "sv";
Localisation.cultureDictionary["de"] = "de";
Localisation.cultureDictionary["el"] = "el";
Localisation.cultureDictionary["it"] = "it";
Localisation.cultureDictionary["ja"] = "ja";//
Localisation.cultureDictionary["ru"] = "ru";

Localisation.cultureCodeFromLangCode = function(strLangCode)
{
    if(Localisation.cultureDictionary[strLangCode])
    {
        return Localisation.cultureDictionary[strLangCode];
    }
    else
    {
        return "en-GB";
    }
};
