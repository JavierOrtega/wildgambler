/**
 * A table structure to hold all the game reels
 * These can be returned to the game in a number of ways. 
 * Available via the Configuration object
*/
function ReelsTable(reelsXml)
{
	this.arrReelbands = new Array();
	this.createReelbands(reelsXml);
	
	this.getReelband = this.getReelband.bind(this);
	this.getReel = this.getReel.bind(this);
}
Class.extend(Class,ReelsTable);

/**
 * Get a reelband (set of reels)
 */
ReelsTable.prototype.getReelband = function (reelbandId)
{
	// Check inputs
	if( reelbandId >= this.arrReelbands.length ||
		reelbandId < 0 )
	{
		return null;		
	}
		
	//	
	return this.arrReelbands[reelbandId];
}

/**
 * Get a reel form a specific reelband (set of reels)
 */
ReelsTable.prototype.getReel = function(reelbandId, reelId)
{
	// Check inputs
	if( reelbandId >= this.arrReelbands.length ||
		reelbandId < 0 )
	{
		return null;		
	}
	
	//
	if( reelId >= this.arrReelbands[reelbandId].length ||
		reelId < 0 )
	{
		return null;		
	}
		
	//	
	return this.arrReelbands[reelbandId][reelId];
}

/**
 * 
 * @param {Object} reelsXml
 */
ReelsTable.prototype.createReelbands = function(reelsXml)
{
	// Convert default xml to json
	var basicReelsJson = x2js.xml_str2json(reelsXml);
	
	// Convert DOM xml from server
	if(!basicReelsJson.Reels)
	{
		basicReelsJson = {};
		basicReelsJson.Reels = x2js.xml2json(reelsXml);
	}
	
	
	// Basic check for validity
	if(basicReelsJson.Reels)
	{
		// Parse json to extract reel info for each reelset
		for(var rb=0; rb<basicReelsJson.Reels.ReelLayout_asArray.length; ++rb)
		{
			var reelband = basicReelsJson.Reels.ReelLayout_asArray[rb];
			
			// Create a new reelband 
			this.arrReelbands.push(new Array());
			
			// for each reel in the reelset
			for(var r=0; r<reelband.Reel_asArray.length; ++r)
			{
				var reel = reelband.Reel_asArray[r];
				
				this.arrReelbands[rb].push(new Reel(reel));
			}
		}
	}
	else
	{
		// Error!
		alert("Error: parsing xml");
	}
	
}

/**
 * Reel object - a single reel of symbol numbers 
 * intSymbolsInView : How many show on the reels when static
 * arrSymbols : list of symbolId's constituting the reel.
 */
function Reel(reelData)
{
	// Each reel specifies how many of its symbols are in view when at rest.
	this.intSymbolsInView=0;
	
	// The number of symbols on the reel
	this.intLength;
	
	// A simple array of symbol numbers 
	this.arrSymbols=[];
	
	// Parse our data
	this.parseReelData(reelData);
	
	// bind to this
	this.parseReelData = this.parseReelData.bind(this);
	
	this.getSymbolAt = this.getSymbolAt.bind(this);
	this.getSymbolsInView = this.getSymbolsInView.bind(this);
	this.getSymbols = this.getSymbols.bind(this);
	
	this.getWrappedIndex = this.getWrappedIndex.bind(this);
}
Class.extend(Class,Reel);


/**
 * Gets all the symbolIds on the reel 
 * as a simple array.
 */
Reel.prototype.getSymbols = function()
{
	return this.arrSymbols;
}

/**
 * Gets a single symbolId from the reel
 * at position symbolIndex
 * @param index is wrapped to avoid out-of-bounds errors.
 */
Reel.prototype.getSymbolAt = function(intSymbolIndex)
{
	intSymbolIndex = parseInt(intSymbolIndex);
	
	intSymbolIndex = this.getWrappedIndex(intSymbolIndex);
	
	return this.arrSymbols[intSymbolIndex];
}

/**
 * Get a symbols in view from the reel.
 * @param symbolIndex is the top symbol in the list to return (ie not the middle of the three)
 * symbolIndex is wrapped to avoid out-of-bounds errors.
 */
Reel.prototype.getSymbolsInView = function(intSymbolIndex)
{
	intSymbolIndex = parseInt(intSymbolIndex);

	var arrInView = [];
	
	// Get symbols in view from top of reelband on down
	// input: 0 result should return from 0,51,50
	for(var s=0; s<this.intSymbolsInView; ++s)
	{
		var intWrappedIndex = this.getWrappedIndex(intSymbolIndex+s); 
		arrInView.push(this.arrSymbols[intWrappedIndex]);
	}
	
	// 
	return arrInView;
}

/**
 * Wraps reel to account for out-of-bounds indices 
 */
Reel.prototype.getWrappedIndex = function(intSymbolIndex)
{
	intSymbolIndex = parseInt(intSymbolIndex);

	while(intSymbolIndex < 0)
	{
		intSymbolIndex += this.arrSymbols.length;
	}

	while(intSymbolIndex >= this.arrSymbols.length)
	{
		intSymbolIndex -= this.arrSymbols.length;
	}

	return intSymbolIndex;
}

/**
 * 
 * @param {Object} reelData json
 */
Reel.prototype.parseReelData = function(reelData)
{
	// Store as integer
	this.intSymbolsInView = parseInt(reelData._view);
	
	// Create array of symbols
	this.arrSymbols = reelData._value.split(",");

	// Convert strings to ints (failsafe method)	
	for( var v=0; v<this.arrSymbols.length; ++v )
	{
		this.arrSymbols[v] = parseInt(this.arrSymbols[v]);
	}
	
	//
	this.intLength = this.arrSymbols.length;
}
























