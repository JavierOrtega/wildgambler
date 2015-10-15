/**
 * A table to hold the Symbol details, simialr to the Flash implementation.
 * Available via the Configuration object 
 */
function SymbolTable(symbolsXml)
{
	this.arrSymbolData = new Array();
	this.createSymbolTable(symbolsXml);

	this.find = this.find.bind(this);	
	this.getSymbolPaytable = this.getSymbolPaytable.bind(this);	
	this.getSymbolMultiplier = this.getSymbolMultiplier.bind(this);	
}
Class.extend(Class,SymbolTable);




/**
 * @param symbolsXml xml data 
 */
SymbolTable.prototype.createSymbolTable = function(symbolsXml)
{
	// Convert default xml string to json
	var basicSymbolsJson = this.getValidJson(symbolsXml);
	
	// Basic check for validity
	if(basicSymbolsJson)
	{
		for(var record=0; record<basicSymbolsJson.Symbols.Symbol_asArray.length; ++record)
		{
			this.arrSymbolData.push( new SymbolDescription(basicSymbolsJson.Symbols.Symbol_asArray[record]));
		}
	}
	else
	{
		// error
		alert("Error: parsing xml");
	}
}
 
/**
 * @param symbolDescriptor can be intId, strName or strChar
 * @param intNumOfSymbols the number of symbols in the win (i.e. on the winline in question)
 * @param blUseMultiplier default=false because multiplier is most often 1 AND
 * 		  its use is often due to a special case not normally present ("multiplier wild" in winline maybe)	
 */
	
SymbolTable.prototype.getSymbolPayout = function(symbolDescriptor, intNumOfSymbols, blUseMultiplier)
{
	// Detect optional param, set to false if not present, or stays false if false, true if true.
	var boolUseMx = blUseMultiplier || false;
	
	var symbolDescription = this.find(symbolDescriptor);
	var payout = symbolDescription.arrPaytable[intNumOfSymbols-1];
	
	if(boolUseMx)
	{
		payout *= symbolDescription.flMultiplier;
	}
	
	//
	return payout;
}
	

/**
 * Get the full description of this symbol object. 
 * @param symbolDescriptor can be an int (symbolId)
 * or a string, either a single char ("T") or the full name ("Ten")
 */
SymbolTable.prototype.find = function(symbolDescriptor)
{
	var symbolDesc = null;
	
	if(typeof(symbolDescriptor)=="number")
	{
		if( symbolDescriptor >= this.arrSymbolData.length ||
			symbolDescriptor < 0 )
		{
			return null;
		}
		symbolDesc = this.arrSymbolData[symbolDescriptor];
	}
	else if(typeof(symbolDescriptor) == "string")
	{
		if(symbolDescriptor.length == 1)
		{
			symbolDesc = this.findByChar(symbolDescriptor);
		}
		else
		{
			symbolDesc = this.findByName(symbolDescriptor);
		}
		
		//
		if(!symbolDesc)
		{
			symbolDesc = this.findByType(symbolDescriptor);
		}
		
	}
	
	return symbolDesc;
} 

/**
 * Find a symbol description by its TYPE identifier 
 * WARNING: There may be more than one type of symbol
 * DO not look for "Normal" sybmols this way.
 * Restrict use for "Wild", "Bonus" etc!
 * Case-insensitive
 */
SymbolTable.prototype.findByType = function(type)
{
	for(record in this.arrSymbolData)
	{
		if(this.arrSymbolData[record].strType.toLowerCase() == type.toLowerCase())
		{
			return this.arrSymbolData[record];
		}
	}
	return null;
}

/**
 * FInd a symbol description by its char identifier 
 * Case-insensitive
 */
SymbolTable.prototype.findByChar = function(charId)
{
	for(record in this.arrSymbolData)
	{
		if(this.arrSymbolData[record].strChar.toLowerCase() == charId.toLowerCase())
		{
			return this.arrSymbolData[record];
		}
	}
	return null;
}

/**
 * FInd a symbol description by its name identifier 
 * Case-insensitive
 */
SymbolTable.prototype.findByName = function(name)
{
	for(record in this.arrSymbolData)
	{
		if(this.arrSymbolData[record].strName.toLowerCase() == name.toLowerCase())
		{
			return this.arrSymbolData[record];
		}
	}
	return null;
}

/**
 * Get the payouts for this symbol 
 */
SymbolTable.prototype.getSymbolPaytable = function(symbolId)
{
	var data = this.getSymbolDescription(symbolId);
	if(data)
	{
		return data.arrPaytable;
	}
	
	return null;
}

/**
 * Get the multiplier for this symbol 
 */
SymbolTable.prototype.getSymbolMultiplier = function(symbolId)
{
	var data = this.getSymbolDescription(symbolId);
	if(data)
	{
		return data.flMultiplier;
	}
	
	return null;
}
 
 
 
/**
 * Description of a single symbol's attributes. 
 * Each has : Example
 * intId : 0
 * strName : "Ten"
 * strChar : "T"
 * strType : "Normal" (Others might be "Wild", "Bonus")
 * flMultiplier : 1
 * intConsecutive : 3 (how many at least constitute a win)
 * arrPaytable : [0,0,10,15,25] (List of values per number in winline)
 */
function SymbolDescription( jsonData )
{
//	console.log(jsonData);
	this.intId = parseInt(jsonData._id);
	this.strName = jsonData._name;
	this.strChar = jsonData._char;
	this.strType = jsonData._type;
	this.flMultiplier = parseFloat(jsonData._multiplier);
	this.intConsecutive = parseInt(jsonData._consecutive);
	this.arrPaytable = jsonData._paytable.split(",");
	for(var v=0; v<this.arrPaytable.length; ++v)
	{
		this.arrPaytable[v] = parseInt(this.arrPaytable[v]);
	}
}


/**
 * 
 * @param {Object} xmlData
 */
SymbolTable.prototype.getValidJson = function (xmlData)
{
	// Startup XML
	var basicJsonData = x2js.xml_str2json(xmlData);
	
	// DOM xml from server
	if(!basicJsonData.Symbols)
	{
		basicJsonData = {};
		basicJsonData.Symbols = x2js.xml2json(xmlData);
	}
	
	// Still no winlines...
	if(!basicJsonData.Symbols)
	{
		return null;
	}
	
	//
	return basicJsonData;
}
