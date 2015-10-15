/**
 * @author Javier.Ortega
 * 
 * This class handles the selector logic
 */

/**
 * Constructor
 * @param {String} strSrc The string for the source 
 */
function WildsSelector( intWildId )
{
  // --
  //Binding the necessary methods
  
  this.intWildId = intWildId;
  
  
  this.checkSelectedWilds =  this.checkSelectedWilds.bind(this);
  
    /**
     * A collectio to handle the logic of the selected wilds
     * { Array } 
     */
    this.arrWilds = new Array ();
    
    
    this.arrOverlayWilds = new Array();

    /**
     * The Tile x for the selector
     * { int } 
     */
    this.intSelectorX ;
    
    /**
     * The Tile y for the selector
     * { int } 
     */
    this.intSelectorY;
    
    /**
     * This is used when going to freespins and back
     * we save state of wilds when we enter freespins
     * and then restore it after freespins finish
     */
    this.arrSavedWilds;
}

/**
 * Derive WildsSelector from our base type to provide inheritance
 */ 
Class.extend(Class, WildsSelector);

/**
 * Look for the symbol index
 * @param { Integer } intX The clicked x coordinate
 * @param { Integer } intY The clicked y coordinate
 */
WildsSelector.prototype.lookForSymbolIndex = function (intX, intY )
{
    this.intSelectorX  = Math.floor ( ( intX - ReelsController.INIT_X ) / ( ReelsController.GAP_X  + ReelSlotView.WIDTH ) );
    this.intSelectorY = Math.floor ( ( intY - ReelsController.INIT_Y ) / ( ReelsController.GAP_Y + ReelSlotView.HEIGHT ) );
    
    this.intSelectorX  = this.intSelectorX  > ReelsController.COLUMNS -1 ? ReelsController.COLUMNS -1 : this.intSelectorX;
    this.intSelectorY = this.intSelectorY > ReelsController.ROWS -1 ? ReelsController.ROWS -1 : this.intSelectorY;
}

/**
 * To clean the current selection
 */
WildsSelector.prototype.cleanSelection = function ( )
{
    for ( var intX in this.arrWilds )
    {
        for ( var intY in this.arrWilds[intX] )
        {
             this.arrWilds [intX][intY] = false;
        }
    }
    
    WildsSelector.blWildsSelected = false;
}

/**
 * this.arrWilds appears to be organised [reel][symbol] and is a set of booleans
 * @param { Object } objReels The reels to set the wilds. 
 * 					 This is a ReelsController object complete with all its reelsets
 * 					 No real clue what objReels.arrReelsController contains at any given point though :(
 */
WildsSelector.prototype.setWildsInTheReels = function ( objReels )
{
    this.objReels = objReels;
    for ( var intX in this.arrWilds )
    {
        for ( var intY in this.arrWilds[intX] )
        {
            if ( this.arrWilds [intX][intY] )
            {
                objReels.arrReelsController[intX].setReelSymbol(intY, this.intWildId );
            }
        }
    }
}

WildsSelector.prototype.checkCoordinates = function (intX, intY)
{
    var intTempX  = Math.floor ( ( intX - ReelsController.INIT_X ) / ( ReelsController.GAP_X  + ReelSlotView.WIDTH ) );
    var intTempY = Math.floor ( ( intY - ReelsController.INIT_Y ) / ( ReelsController.GAP_Y + ReelSlotView.HEIGHT ) );
    
    if (this.arrWilds [intTempX])
    {
        return (this.arrWilds [intTempX][intTempY]);    
    }
    else
    {
        return false;
    }
}

/**
 * To localize the tile x and tile y for the clicked coordinate
 * @param { Integer } intX The absolute clicked x coordinate
 * @param { Integer } intY The absolute clicked y coordinate
 * 
 * @return { Boolean } Return true if there is any wild selected in the reels 
 */
WildsSelector.prototype.select = function ( intX, intY )
{
    this.lookForSymbolIndex( intX, intY );
    
    if ( !this.arrWilds [this.intSelectorX] )
    {
        this.arrWilds [this.intSelectorX] = new Array();
    }
    
    this.arrWilds [this.intSelectorX][this.intSelectorY] = !this.arrWilds [this.intSelectorX][this.intSelectorY];
    
    WildsSelector.blWildsSelected = this.checkSelectedWilds();
    
    return (WildsSelector.blWildsSelected);
}

/**
 * Check if there is wilds selected in the reels
 */
WildsSelector.prototype.checkSelectedWilds = function ( )
{
    for (var intX in this.arrWilds)
    {
        for (var intY in this.arrWilds[intX])
        {
            if (this.arrWilds[intX][intY])
            {
                return true;    
            }
        }    
    }
    
    return false;
}

/**
 * Save wilds that are currently selected
 * - call restoreWildsSelected when you want these back 
 */
WildsSelector.prototype.saveWildsSelected = function()
{
	var arrSavedWilds = [];
	for (var x in this.arrWilds)
	{
		arrSavedWilds[x] = [];
		for (var y in this.arrWilds[x])
		{
			arrSavedWilds[x][y] = this.arrWilds[x][y];
		}
	}
	this.arrSavedWilds = arrSavedWilds;
}

/**
 * Restore state of the wilds that has been saved 
 */
WildsSelector.prototype.restoreWildsSelected = function()
{
    
    if (this.objReels.objGameSettings.getItem(GameSettings.DISABLE_AUTOLOCK_WILDS) == false)
    {
	   this.arrWilds = this.arrSavedWilds;
    }
}
