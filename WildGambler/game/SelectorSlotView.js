/**
 * @author Javier.Ortega
 * 
 * This class handles the selector for the wilds
 * 
 */


/**
 * Constructor
 * @param { Image }  imSelector The collection of symbols
 * @param { Object }  objContext The context for this image
 * 
 */
function SelectorSlotView( imSelector, objContext)
{
    this.imSelector = imSelector;
}

/**
 * Derive GuiView from our base type to provide inheritance
 */ 
Class.extend( ElementView, SelectorSlotView );

/**
 * To draw the current symbol
 * 
 */
SelectorSlotView.prototype.setPosition = function ( intX, intY )
{
    this.intX = intX;
    this.intY = intY;
}

/**
 * To draw the current symbol
 * 
 */
SelectorSlotView.prototype.draw = function ( )
{
    this.imSelector.draw ( this.intX, this.intY ) ;
}
