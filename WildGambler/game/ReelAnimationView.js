/**
 * @author Javier.Ortega
 * 
 * This class will handle the specific functionalities for a reel slot
 * 
 */


/**
 * Constructor
 * @param { array }  arrSymbols The collection of symbols
 * @param { array }  objContext The collection of symbols
 * @param { array }  intX The collection of symbols
 * @param { array }  intY The collection of symbols
 * 
 */
function ReelAnimationView( arrSymbols, objContext, intX, intY )
{
    this.blAnimated = false;

    /**
     * The type of the symbol.
     * { String }
     */
    this.intIndex = 0;
   
    /**
     * Collection of symbols
     * { Array }
     */
    this.arrViews = arrSymbols;
    
    if (DeviceModel.strAssets == "low")
    {
        this.arrViews.intFrameRate = 70;
    }
    else
    {
        this.arrViews.intFrameRate = 20;
    }
    
    this.arrViews.blContinuous = true;
    
    this.arrViews.intX = intX;
    this.arrViews.intY = intY;
    
    this.intInitFrame = Math.floor (Math.random() * 6);
   
    /**
     * Integer for the x coordinate
     * { int }
     */
    this.intX = intX;

    /**
     * Integer for the y coordinate
     * { int }
     */
    this.intY = intY;

    /**
     * The current Frame for the animated symbols
     * { int }
     */
    this.intCurrentFrame;
}

/**
 * Derive GuiView from our base type to provide inheritance
 */ 
Class.extend( ElementView, ReelAnimationView );

ReelAnimationView.WIDTH = ReelsController.WIDTH;
ReelAnimationView.HEIGHT = ReelsController.HEIGHT;

/**
 * This function starts the animation if the sprite contains more than one frame
 * 
 */
ReelAnimationView.prototype.startAnimation = function ( )
{
    this.intCurrentFrame = 0;
    this.arrViews.startAnimation(null,0,5,this.arrViews.intX, true);
}

/**
 * This function starts the animation if the sprite contains more than one frame
 * @param { integer } intIndex The index of the reel
 */
ReelAnimationView.prototype.setSymbol = function ( intIndex )
{
    this.intIndex = intIndex;
}

/**
 * To draw the current symbol
 * 
 */
ReelAnimationView.prototype.draw = function ( )
{
    if (this.blVisible)
    {
        this.arrViews.intX = this.intX;
        this.arrViews.intY = this.intY;
        //this.arrViews.offsetTime = this.intInitFrame * 500;
        this.arrViews.draw ( 0, 0 ) ;
    }
}
