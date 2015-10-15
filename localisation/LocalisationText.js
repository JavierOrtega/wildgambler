/**
 *
 * @author Michael.Sorhaindo
 * @date 12/03/2013 
 * 
 * This class will store the localised text its
 * 
 */

/**
 * @param {String} key of the localised text
 * @param {String} the text
 */
var LocalisationText = function(strKey, strText) {
	this.strKey = strKey;
	this.blShowKey = false;

	this.strText = null; //original text string, contains \n delimiter 
	this.arrText = []; //multiline text, array of lines
	this.strOriginalText = null; //we will have the original string so that we can replace it with something else if necessary
	this.strCurrentText = null; //the text to show at the moment

	this.arrTextData; //data for text with parts to replace

	//set the text
	this.setText(strText);
}

/**
 * Retrieve the text (after replacing) 
 *
 * @return {String} 
 */
LocalisationText.prototype.getText = function() {
	return this.strCurrentText;
}

/**
 * Retrieve the text (after replacing) 
 *
 * @return {Array} 
 */
LocalisationText.prototype.getTextMultiline = function() {
	return this.arrText;
}

/**
 * Retrieve the text (original that were before replacing) 
 *
 * @return {String} 
 */
LocalisationText.prototype.getOriginalTextString = function() {
	return this.strText;
}

/** 
 * @param {String} strText
 */
LocalisationText.prototype.setText = function(strText) {
	this.strOriginalText = strText;
	this.strText = strText;
	
	//placeholder replacement
	if (this.arrTextData)
	{
		//replace if necessary
		this.setTextData(this.arrTextData);
	}
	
	this.updateCurrentText();
}

/** 
 * @param {Array} arrData
 */
LocalisationText.prototype.setTextData = function(arrData) {

	//remember that in case setText is called with a different original string
	this.arrTextData = arrData; 

	//replace the text
	for (var i = 0; i < arrData.length; i++)
	{
		if (this.strText.indexOf("%" + (i + 1)) < 0)
		{
			console.log("Error setting text data for localised text " + this.strKey + "; could not replace %" + (i + 1) + " with " + arrData[i]);
		}
		else
		{
			//do the replace
			this.strText = this.strText.replace("%" + (i + 1), arrData[i]);
		}
	}
	
	this.updateCurrentText();
}

/**
 * Set to true in case you want to see the key specifying this localised text
 * @param {boolean} blShowKey
 */
LocalisationText.prototype.setKeyVisible = function(blShowKey)
{
	this.blShowKey = blShowKey;
	
	this.updateCurrentText();
}

/**
 * Call this to decide if we are currently showing the key or the value   
 */
LocalisationText.prototype.updateCurrentText = function()
{
	if (this.blShowKey)
	{
		this.strCurrentText = this.strKey;
		//multiline text
		this.arrText = [this.strKey];
	}
	else
	{
		this.strCurrentText = this.strText;
		//multiline text
		this.arrText = this.strCurrentText.split("\n");
	}

};

/**
 * @return {String} 
 */
LocalisationText.prototype.toString = function()
{
	return this.strCurrentText;
}
