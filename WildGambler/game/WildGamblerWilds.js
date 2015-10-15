/**
 * This Class has a lookup table of values taken from the original WillHill server
 * It uses this to determine the cost of each line played in WildGambler (always 20)
 * based on the position within each winline of any held wilds.
 * It returns the total cost of the spin rounded UP to 2 dec places (as a float) 
 */
function WildGamblerWilds()
{
	// Associative array of costs per winline/wilds held.
	this.arrLookupTable;
	
	// Bind externally-called method
	this.getCostOfWilds = this.getCostOfWilds.bind(this);
	
	// Create lookup table
	this.createLookup();
}
Class.extend(Class, WildGamblerWilds);


/**
 * This method returns the total cost of the spin for any given wild pattern.
 *  
 * @param flTotLineStake: the total that the player is betting BEFORE the cost
 * 						  of held wilds is added (20 lines always in WG)
 * @param arrIndices: array of the indices of any held wilds using a linear reel mapping
 * 					  i.e. symbol positions 0-14 reading top->bottom & left->right
 * 0	3	6	9	12
 * 1	4	7	10	13
 * 2	5	8	11	14
 * @param arrWinlines: winline mapping from the game configuration.
 * 
 * @return float which is the total cost of the spin rounded UP to 2 dec places.
 * as we are assigning a value to lines with no wilds 
 * based on a £1.00 spin
 */
WildGamblerWilds.prototype.getCostOfWilds = function(flTotLineStake, arrIndices, arrWinlines)
{
	// Init a return value
	var flTotalCost = 0;
	
	// No wilds: no extra cost
	if( arrIndices.length == 0 )
	{
		flTotalCost = flTotLineStake;
	}
	else
	{
		// Init to 0 wilds
		var arrWildsMap = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
		var arrMapIndices = [];
	
		// Linear map of wilds across the reels
		for(var i in arrIndices)
		{
			arrWildsMap[arrIndices[i]] = 1;
		}
	
		// --
	
		var arrPattern = ["-","W"];
	
		// Check each winine pattern in turn
		for(var aw in arrWinlines)
		{
			// Get the symbol pattern and a map for this winline
			var arrLine = arrWinlines[aw].arrMapping;
			
			var lineMap = "";
			
			// Find where on each winline a wild falls
			for(var lm in arrLine)
			{
				lineMap += arrPattern[ arrWildsMap[ arrLine[ lm ] ] ];
			}
			
			var flLineCost = parseFloat(this.arrLookupTable[lineMap]); 
			flTotalCost += flLineCost;
		}
		
		// Table result is for 1.00 a spin (line stake of 0.05)
		// Multiply this by the actual stake
		flTotalCost *= flTotLineStake;
		
		// Round UP (in cents)
		flTotalCost = Math.ceil(flTotalCost * 100);
	
		// Return to 00.00 format
		flTotalCost = parseFloat(flTotalCost) / 100;
	}

	//	
	return flTotalCost;
}


/**
 * Rather long-winded way of creating the associative lookup table. 
 * Numbers taken directly from the original WillHill game spec.
 */
WildGamblerWilds.prototype.createLookup = function()
{

	/**
	 * This is included for reference only, it is the original
	 * list of values from the WillHill server coding (Dan Triggs). 
	 */ 
	var arrCostTable = [ 0.05,
					  0.398816983120275,
					  0.398816983120275,
					  0.404074197555507,
					  0.0982867726020449,
					  0.0603727701090803,
					  3.0861127832995,
					  3.14567382280711,
					  0.790564744361501,
					  0.175964879153725,
					  3.14567382280711,
					  0.781005757071006,
					  0.473590113744537,
					  0.781005757071006,
					  0.473590113744537,
					  0.479457622203337,
					  5.83284480090642,
					  6.1241349594981,
					  1.42338884575891,
					  6.1241349594981,
					  1.40555317435103,
					  3.75785017637858,
					  3.75785017637858,
					  1.40555317435103,
					  3.69086732153567,
					  6.0151391897833,
					  10.7818229789019,
					  11.0906881821195,
					  11.350752755428,
					  11.5528903647173,
					  11.5528903647173,
					  52.7846516601961];
					  
	/**
	 * Associative lookup table based on pattern of wilds held
	 * on each of the 20 winlines in WG. 
	 */
	this.arrLookupTable = [];
	this.arrLookupTable["-----"] = 0.05;
	this.arrLookupTable["W----"] = 0.398816983120275;
	this.arrLookupTable["-W---"] = 0.398816983120275;
	this.arrLookupTable["--W--"] = 0.404074197555507;
	this.arrLookupTable["---W-"] = 0.0982867726020449;
	this.arrLookupTable["----W"] = 0.0603727701090803;
	this.arrLookupTable["WW---"] = 3.0861127832995;
	this.arrLookupTable["-WW--"] = 3.14567382280711;
	this.arrLookupTable["--WW-"] = 0.790564744361501;
	this.arrLookupTable["---WW"] = 0.175964879153725;
	this.arrLookupTable["W-W--"] = 3.14567382280711;
	this.arrLookupTable["W--W-"] = 0.781005757071006;
	this.arrLookupTable["W---W"] = 0.473590113744537;
	this.arrLookupTable["-W-W-"] = 0.781005757071006;
	this.arrLookupTable["-W--W"] = 0.473590113744537;
	this.arrLookupTable["--W-W"] = 0.479457622203337;
	this.arrLookupTable["WWW--"] = 5.83284480090642;
	this.arrLookupTable["-WWW-"] = 6.1241349594981;
	this.arrLookupTable["--WWW"] = 1.42338884575891;
	this.arrLookupTable["W-WW-"] = 6.1241349594981;
	this.arrLookupTable["W--WW"] = 1.40555317435103;
	this.arrLookupTable["W-W-W"] = 3.75785017637858;
	this.arrLookupTable["-WW-W"] = 3.75785017637858;
	this.arrLookupTable["-W-WW"] = 1.40555317435103;
	this.arrLookupTable["WW--W"] = 3.69086732153567;
	this.arrLookupTable["WW-W-"] = 6.0151391897833;
	this.arrLookupTable["WWWW-"] = 10.7818229789019;
	this.arrLookupTable["WWW-W"] = 11.0906881821195;
	this.arrLookupTable["WW-WW"] = 11.350752755428;
	this.arrLookupTable["W-WWW"] = 11.5528903647173;
	this.arrLookupTable["-WWWW"] = 11.5528903647173;
	this.arrLookupTable["WWWWW"] = 52.7846516601961;
}
