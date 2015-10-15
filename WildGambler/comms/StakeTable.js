/**
 * Table structure to hold stakes array, min and max etc.
 * Available to the game via Configuration object.
 * 
 * Note: to increase accuracy and gain better interpolation results
 * we should convert everything to ints i.e. multiply everything by 100
 * and deal only with values in pence/cents.
 * This can be done at a later date if it becomes necessary.
 */
function StakeTable(stakesXml)
{
	/** 
	 * These values arrive as part of the stakes configuration xml
	 * Set up some defaults based on prior game implementations. 
	 */
	this.flMinStake=0.1;
	this.flMaxStake=1000;
	this.flDefaultStake=1.00;
	this.intDefaultStakeIndex=13;
	this.flRoundLimit=1000.00;
	this.flMaxWin=10000.00;
	this.intNumGameWinLines=20; // maybe better to pick this up dynamically from somewhere
	
	/** This holds the valid stakes in a linear array for use by the Client via Config */
    this.arrDefaultStakes=[0.01, 0.02, 0.03, 0.04, 0.05, 0.1, 0.2, 0.5, 1, 2, 3, 4, 5, 10, 20, 30, 40, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
	//this.arrDefaultStakes=[0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,0.10,0.11,0.12,0.15,0.20,0.25,0.30,0.40,0.50,0.75,1,2];
	this.arrValidStakes=[];

	/** Methods */
	this.parseStakeXml = this.parseStakeXml.bind(this);
	this.serialize = this.serialize.bind(this);
	this.setDefaultStakeIndex = this.setDefaultStakeIndex.bind(this);
	    
	this.parseStakeXml(stakesXml);
	this.setDefaultStakeIndex();
	
	//console.log("StakeTable.arrValidStakes= " + this.arrValidStakes + " StakeTable.defaultStake = " + this.flDefaultStake + " StakeTable.flMinStake = " + this.flMinStake + " StakeTable.flMaxStake = " + this.flMaxStake);
}
Class.extend(Class,StakeTable);

/**
 * We should have an array of valid stakes. Try to find the default stake
 * and set our defaultStakeIndex to reflect this. It will indicate the stake
 * shown by the client on startup.
 * Latest info is to returnthe next HIGHEST if we can't find it.
 */
StakeTable.prototype.setDefaultStakeIndex = function()
{
	this.intDefaultStakeIndex = 0;
	for(var s=0; s<this.arrValidStakes.length; ++s)
	{
		if(this.arrValidStakes[s] >= this.flDefaultStake)
		{
			this.intDefaultStakeIndex = s;
			this.flDefaultStake = this.arrValidStakes[s];
			break;
		}
	}
}

/**
 * Prepare stake data by making a simple array of objects
 * sorted into ascending stake order. 
 */
StakeTable.prototype.parseStakeXml = function(stakeXml)
{
	// Convert default xml string
	var jsonData = x2js.xml_str2json(stakeXml);
	
	// Convert server DOM xml object
	if(!jsonData.TitleConfig)
	{
		jsonData = {};
		jsonData.TitleConfig = x2js.xml2json(stakeXml); 
	}
	
	// Basic check for validity
	if(!jsonData.TitleConfig)
	{
		// Error!
		alert("Error: parsing xml");
		return;
	}

	// Basic settings from stake XML
	this.flMinStake = parseFloat(jsonData.TitleConfig._minStake);
	this.flMaxStake = parseFloat(jsonData.TitleConfig._maxStake);
	this.flDefaultStake = parseFloat(jsonData.TitleConfig._defaultStake);
	this.flMaxWin = parseFloat(jsonData.TitleConfig._maxWin);
	this.flRoundLimit = parseFloat(jsonData.TitleConfig._roundLimit);

	// Array of stake objects parsed out from the json
	var arrObjStakes = new Array();
	
	// Populate
	for(var i=0; i<jsonData.TitleConfig.Option.length; ++i)
	{
		arrObjStakes.push(jsonData.TitleConfig.Option[i]);
		arrObjStakes[i]._incStake = parseFloat(arrObjStakes[i]._incStake);
		arrObjStakes[i]._incPeriod = parseFloat(arrObjStakes[i]._incPeriod);
	}
	
	// Sort ascending
	arrObjStakes.sort(sortFunc);

	// Temp log out
	/*
	for( i=0; i<arrObjStakes.length; ++i)
	{
		console.log("stake: "+ arrObjStakes[i]._incStake +" per: " +arrObjStakes[i]._incPeriod);
	}*/
	
	this.serialize(arrObjStakes);
}

/**
 * Serialize the stakes 
 */
StakeTable.prototype.serialize = function(arrObjStakes)
{
	this.arrValidStakes = [];
	
	var minLineStake = this.flMinStake / this.intNumGameWinLines;
	var maxLineStake = this.flMaxStake / this.intNumGameWinLines;
	
	for ( var i = 0 ; i < arrObjStakes.length ; i++ )
	{
	    if (Number(arrObjStakes[i]._incStake) >= minLineStake && Number(arrObjStakes[i]._incStake) <= maxLineStake)
	    {
	       this.arrValidStakes[ this.arrValidStakes.length ] = Number(arrObjStakes[i]._incStake);
	   }
	   var nextStake;
	   if (i < arrObjStakes.length -1 )
	   {
	       nextStake = Number(arrObjStakes[i+1]._incStake); 
	       nextStake = (nextStake*100 )/100;   
	   }	   
	   if ( nextStake == undefined ){
	       // end of stakes
	       break;
	   }
	   // don't use incPeriod if it's set to 0
	   if ( Number(arrObjStakes[i]._incPeriod) > 0 ) 
	   {
	       // add increments of ._incPeriod up to the next ._incStake
	       var nextInc = arrObjStakes[i]._incStake;
	       
	       do{
				nextInc += arrObjStakes[i]._incPeriod;
					
				nextInc = Number(nextInc.toFixed(2));
				//console.log("nextInc = " + nextInc )
				   
				if (nextInc > nextStake)
				{
				    break;
				}
			
			   // added a clause to compare strings due to floating point numbers not being compared as expected
		       else if ( Localisation.formatNumber(nextInc) == Localisation.formatNumber(nextStake))
		       {
		           break;
		       }
		       else if (nextInc < minLineStake)
		       {
		           continue;
		       }
		       else if (nextInc > maxLineStake)
		       {
		           continue;
		       }
		       else
		       {
		           this.arrValidStakes[this.arrValidStakes.length] = nextInc;
		       }
		   } while (true)
	   }
	}	
	//console.log("Serialized stakes set to " + this.arrValidStakes);       
}
	


/**
 * Sort stakes array from lowest to highest 
 * @param {Object} a
 * @param {Object} b
 */
function sortFunc (a,b)
{
	return a._incStake - b._incStake;
}
