/**
 * Table structure to hold the winline details 
 * Available via the Configuration object
 */
function WinlineTable(winlineXml, arrColours, intLineWidth, strFont, strFontColour, strBoxBgColour)
{
	this.intMaxWinlines=20;
	this.intMinWinlines=20;
	
	this.strFont = strFont;
	this.strFontColour = strFontColour;
	this.strBoxBgColour = strBoxBgColour;
	
	this.arrWinlines = new Array();
	
	// 
	this.createWinlineTable(winlineXml, arrColours, intLineWidth);
	
	/** No real need to bind this as "this" is calling it */
	this.createWinlineTable = this.createWinlineTable.bind(this);
	
	/** Special method to parse mobile style winline config */
	this.parseMobileData = this.parseMobileData.bind(this);
	this.convertJsonData = this.convertJsonData.bind(this);
}
Class.extend(Class,WinlineTable);


/**
 * Parse data in mobile format 
 * (as provided to Alice for example)
 * TODO May need to change slightly when we get the real thing
 * BUT may never happen: should only be getting ash engine data from Mark Ash
 * from now on. Will leave this here just in case though.
 */
WinlineTable.prototype.parseMobileData = function(winlineXml)
{
	// Init
	this.arrWinlines = new Array();
	
	// 
	var basicJsonData = this.getValidJson(winlineXml);
	
	// Basic check for validity
	if(basicJsonData)
	{
		this.intMaxWinlines = basicJsonData.Winlines.Line.length;
		
		for(var wl=0; wl<basicJsonData.Winlines.Line.length; ++wl)
		{
			// Convert to expected format line by line
			winlineData = this.convertJsonData( basicJsonData.Winlines.Line[wl] );
			
			// Add to array
			this.arrWinlines.push( new Winline( winlineData ) );
		}
	}
	else
	{
		// Error!
		alert("Error: parsing xml");
	}
}


/**
 *  Parse data in GTS formt
 * @param {Object} winlineXml
 */
WinlineTable.prototype.createWinlineTable = function(winlineXml, arrColours, intLineWidth)
{
	this.arrWinlines = new Array();

	// 
	var basicJsonData = this.getValidJson(winlineXml);
	
	// Basic check for validity
	if(basicJsonData)
	{
		this.intMaxWinlines = basicJsonData.Winlines.Winline_asArray.length;

		//
		for(var wl in basicJsonData.Winlines.Winline_asArray)
		{
			this.arrWinlines.push( new Winline(basicJsonData.Winlines.Winline_asArray[wl], arrColours[wl], intLineWidth ) );
		}
	}
	else
	{
		// Error!
		alert("Error: parsing xml");
	}
	
}

WinlineTable.prototype.getValidJson = function (xmlData)
{
	// Startup XML
	var basicJsonData = x2js.xml_str2json(xmlData);
	
	// DOM xml from server
	if(!basicJsonData.Winlines)
	{
		basicJsonData = {};
		basicJsonData.Winlines = x2js.xml2json(xmlData);
	}
	
	// Still no winlines...
	if(!basicJsonData.Winlines)
	{
		return null;
	}
	
	//
	return basicJsonData;
}


/**
 * A single winline having a unique ID and 
 * a mapping to which reel symbols it includes.
 * Mapping runs T->B & L->R
 * 0	3	6	9	12
 * 1	4	7	10	13
 * 2	5	8	11	14 
 * @param {Object} jsonData
 */
WinlineTable.prototype.convertJsonData = function (jsonData)
{
	var newFormat = {};

	newFormat._id = parseInt(jsonData._num)-1;
	
	var arrItems = jsonData._offsets.split(",");
	
	for(var i=0; i<arrItems.length; ++i)
	{
		// convert -1,0,1 to 0,1,2
		var mapping = parseInt(arrItems[i]) + 1;
		
		// convert 0,0,0,0,0 to 0,3,6,9,12
		arrItems[i] = mapping + (i*3);
	}
	newFormat._value = arrItems.join(",");	
	
	return newFormat;
}


/**
 * A single winline having a unique ID and 
 * a mapping to which reel symbols it includes.
 * Mapping runs T->B & L->R
 * 0	3	6	9	12
 * 1	4	7	10	13
 * 2	5	8	11	14 
 * @param {Object} jsonData
 */
function Winline(jsonData, strColour, intLineWidth)
{
	// Start at winline 0
	this.intId = parseInt(jsonData._id);

	this.strColour = strColour;
	this.intLineWidth = intLineWidth;

	this.arrMapping = jsonData._value.split(",");

	for(var i=0; i<this.arrMapping.length; ++i)
	{
		this.arrMapping[i] = parseInt(this.arrMapping[i]);
	}
}
