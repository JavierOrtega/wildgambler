/**
 * Constructor 
 */
function LocalisedFileDictionary()
{
    
    this.processJSONList = this.processJSONList.bind(this);
    this.initDefaultValues = this.initDefaultValues.bind(this);
    this.localise = this.localise.bind(this);
    
    this.arrFileNames = new Array();
    this.blInitialised = false;
    this.initDefaultValues();
    
}
Class.extend(Class, LocalisedFileDictionary); 
/**
 * @param {LocalStorage} used for getInstance Singleton
 */
LocalisedFileDictionary.objInstance = null;

/**
 * Retrieve LocalStorage singleton instance
 *
 * @return {LocalStorage} 
 */
LocalisedFileDictionary.getInstance = function()
{
    if (LocalisedFileDictionary.objInstance == null)
    {
        LocalisedFileDictionary.objInstance = new LocalisedFileDictionary();
    }
    return LocalisedFileDictionary.objInstance;
}

/**
 * Initialise default values 
 */
LocalisedFileDictionary.prototype.initDefaultValues = function()
{
    if (!this.blInitialised)
    {
        this.loadFiles = new LoaderData("res/localisedFileList.json");
        this.loadFiles.setCallBack(this.processJSONList);
        this.loadFiles.load();
    }
}

LocalisedFileDictionary.prototype.processJSONList = function(objJSONData)
{
    for (var i = 0; i<objJSONData.files.length; i++)
    {
        this.arrFileNames[i] = objJSONData.files[i];
    }
    
    this.blInitialised = true;
}

/**
 * Orients the file path to pick up the localized version of the image when necessary
 */
LocalisedFileDictionary.prototype.localise = function (strOrigSrc)
{
    var strSrc = strOrigSrc;
    var filename = strOrigSrc.substring((strOrigSrc.indexOf("/")+1));
    
    //console.log("array of localized files! " + this.objLocalizedFileDict.arrFileNames)
    
    if(this.arrFileNames.indexOf(filename) > -1) // if filename is in list of files to be localized
    {
        strSrc = strOrigSrc.substring(0,strOrigSrc.indexOf("/"));
        strSrc += "/" + AppConfiguration.getInstance().getLangCode() + "/" //TODO grab langCode
        strSrc += filename;
    }
    //console.log("localizeImage",strOrigSrc,strSrc)
    return strSrc;
}


/**
 * Orients the file path to pick up the localized version of the image when necessary
 */
LocalisedFileDictionary.prototype.unLocalizeUrl = function (strOrigSrc)
{
	var result = strOrigSrc;
	var strLangCode = AppConfiguration.getInstance().getLangCode();
	
	var arrParts = strOrigSrc.split("/");
	if (arrParts.length > 2)
	{
		result = [];
		for (var i = 0; i < arrParts.length; i++)
		{
			var strPart = arrParts[i];
			if (strPart != strLangCode)
			{
                result.push(strPart);
			}
		}
		result = result.join("/");
	}
	/*
	else
	{
		console.log("unexpected", strOrigSrc);
	}
	*/
	return result;
	
    //return (strOrigSrc.replace(/^\/.+\//,"/")); //TODO 
}
