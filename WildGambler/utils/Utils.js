function UTILS()
{
	
}

UTILS.format2dp = function(inputValue)
{
    return (Number(Number(inputValue).toFixed(2)));
}

/**
 *  @return a valid DOM document 
 */
UTILS.createDoc = function(xmlData)
{
	var xmlDoc; 
	// Parse server XML
	if (window.DOMParser)
	{
		parser=new DOMParser();
		xmlDoc=parser.parseFromString(xmlData, STRINGS.TEXT_XML);
	}
	else // Internet Explorer
	{
		xmlDoc=new ActiveXObject(STRINGS.MS_DOM);
		xmlDoc.async=false;
		xmlDoc.loadXML(xmlData);
	} 
	return xmlDoc;
}
