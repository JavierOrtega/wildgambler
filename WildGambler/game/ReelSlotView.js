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
function ReelSlotView( arrSymbols, objContext, intX, intY, symbolToDisplay, imgSlotOverlay )
{
    this.blAnimated = false;

    this.blStoppingAnimation = true;
   
    /**
     * Collection of symbols
     * { Array }
     */
    this.arrViews = new Array();
    
    this.objContext = objContext;
    
    
    this.objSlotOverlay = new ElementView( );
    this.objSlotOverlay.init( objContext, imgSlotOverlay , 1, imgSlotOverlay.width, imgSlotOverlay.height );
    this.objSlotOverlay.intX = intX;
    this.objSlotOverlay.intY = intY;
    this.objSlotOverlay.blVisible = false;
    
    
    //Initialze the element view collections
    for ( var i in arrSymbols )
    {
        this.arrViews[i] = new ElementView( );
        //TO DO
        // To add the correct number of frames for the final graphics
        this.arrViews[i].init( objContext, arrSymbols[i] , 1, arrSymbols[i].width, arrSymbols[i].height );
        this.arrViews[i].intX = intX;
        this.arrViews[i].intY = intY;
        
            
        //To set the default dimensions for thos view element
        this.intWidth = this.arrViews[i].intWidth;
        this.intHeight = this.arrViews[i].intHeight;
    }
   
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
    
    
    this.intAxeY = (intY -  ReelsController.INIT_Y) / (ReelSlotView.HEIGHT + ReelsController.GAP_Y );


    /**
     * The current Frame for the animated symbols
     * { int }
     */
    this.intCurrentFrame;

    /**
     * The necessary x offset to centre the symbol in the slot.
     * { int }
     */    
    this.intOffsetX = 0;
   
    /**
     * The necessary y offset to centre the symbol in the slot.
     * { int }
     */    
    this.intOffsetY = 0;
    
    /**
     * This is the value for the bouncing animation
     * { int }
     */
     this.intBouncingY = 0;
     
     this.setSymbol (ReelsController.SYMBOLS_ARRRAY[symbolToDisplay]);
     
    this.blVisible = true;
    
    /**
     * Scale Width
     * @type {number}
     */
	this.flScaleX = 1;
    /**
     * Scale Height
     * @type {number}
     */
	this.flScaleY = 1;
}

/**
 * Derive GuiView from our base type to provide inheritance
 */ 
Class.extend( ElementView, ReelSlotView );

ReelSlotView.WIDTH = 138;
ReelSlotView.HEIGHT = 138;

ReelSlotView.TEN = ReelsController.SYMBOLS_ARRRAY[0];
ReelSlotView.JOKER = ReelsController.SYMBOLS_ARRRAY[1];
ReelSlotView.QUEEN = ReelsController.SYMBOLS_ARRRAY[2];
ReelSlotView.KING = ReelsController.SYMBOLS_ARRRAY[3];
ReelSlotView.ACE = ReelsController.SYMBOLS_ARRRAY[4];
ReelSlotView.FLAMINGO = ReelsController.SYMBOLS_ARRRAY[5];
ReelSlotView.ZEBRA = ReelsController.SYMBOLS_ARRRAY[6];
ReelSlotView.TIGER = ReelsController.SYMBOLS_ARRRAY[7];
ReelSlotView.RINO = ReelsController.SYMBOLS_ARRRAY[8];
ReelSlotView.WILD = ReelsController.SYMBOLS_ARRRAY[10];


/**
 * This will set the lock image for this slot
 * 
 * @param {Object} objImage
 */
ReelSlotView.prototype.setLockImage = function ( objImage)
{
    this.objSlotImage = objImage;
}

/**
 * This function starts the animation if the sprite contains more than one frame
 * 
 */
ReelSlotView.prototype.startAnimation = function ( )
{
    this.intCurrentFrame = 0;
    this.imSymbols.setFrame( 0 );
}

ReelSlotView.prototype.setVisible = function ( blVisible )
{
    this.blVisible = blVisible;
}

/**
 * A function to set the animation object for this symbol
 * @param { Object } objAnimations The object containing the animations
 */ 
ReelSlotView.prototype.setAnimations =  function ( objAnimations )
{
    this.objSymbolAnimations = objAnimations;
    
    this.arrSymbolAnimations = []
    
    for ( var i in this.objSymbolAnimations.arrSymbolAnimations)
    {
        this.arrSymbolAnimations[i] =   this.objSymbolAnimations.arrSymbolAnimations[i  ].clone();  
    }
    
    var strNameAnimation = this.strType.split(".")[0];
    strNameAnimation  = strNameAnimation .substring(0, strNameAnimation .length - 4);
    this.objCurrentAnimation = this.arrSymbolAnimations[strNameAnimation];
}

/**
 * Enable the animation for the current symbol
 * @param { Function } endCallBack This callback will be called when the animation is finished
 */ 
ReelSlotView.prototype.enableAnimation =  function ( endCallBack)
{
    if (this.objSymbolAnimations)
    {
        var strNameAnimation = this.strType.split(".")[0];
        //strNameAnimation  = strNameAnimation .substring(0, strNameAnimation .length - 4);
        
        this.strSortType = strNameAnimation;
        
        this.objCurrentAnimation = this.arrSymbolAnimations[strNameAnimation  ] ;
        
        this.intOffsetAnimationX = ( ReelSlotView.WIDTH / 2 ) - ( this.objCurrentAnimation .arrSprites[0].intWidth / 2 );
    
        this.intOffsetAnimationY = ( ReelSlotView.HEIGHT / 2 ) - ( this.objCurrentAnimation .arrSprites[0].intHeight / 2 );
    
        
        this.blAnimated = true;
        this.blStoppingAnimation = false;    
        //this.objSlotOverlay.blVisible = true;
        //
        this.objCurrentAnimation.startAnimation(endCallBack);
    }
}

/**
 * To enable the overlay
 * 
 * @param { Boolean } blVisible If it is true, it will make visible the overlay
 */
ReelSlotView.prototype.enableOverLay =  function ( blVisible )
{
    this.objSlotOverlay.blVisible = blVisible;
}

/**
 * Disable the animation for the current symbol 
 */ 
ReelSlotView.prototype.disableAnimation = function ()
{
    this.blStoppingAnimation = true;    
}

/**
 * This function starts the animation if the sprite contains more than one frame
 * @param { String } strName The string of the name of the symbol
 */
ReelSlotView.prototype.setSymbol = function ( strName )
{
    this.strType = strName;
    
    
    if (this.arrViews[strName].imImage)
    {
        this.intOffsetX = ( ReelSlotView.WIDTH / 2 ) - ( this.arrViews[strName].imImage.intWidth / 2 );
    
        this.intOffsetY = ( ReelSlotView.HEIGHT / 2 ) - ( this.arrViews[strName].imImage.intHeight / 2 );
    }
}

/**
 * To draw the current symbol
 * 
 */
ReelSlotView.prototype.draw = function ( )
{
    if (this.blVisible)
    {
        if (!this.blAnimated || this.blStoppingAnimation)
        {
            this.arrViews[this.strType].draw ( this.intOffsetX, this.intOffsetY + this.intBouncingY ) ;
            
            this.objSlotOverlay.draw ( 0,this.intBouncingY ) ;
            
            
            if (this.objSlotOverlay.blVisible && this.intAxeY >= 2)
            {
                this.objContext.fillStyle = "rgba(0,0,0,.31)";
                this.objContext.fillRect(this.objSlotOverlay.intX,this.objSlotOverlay.intY + this.objSlotOverlay.intHeight ,this.objSlotOverlay.intWidth, 10);
            }
            
            
            this.blAnimated = false;
            
            if (this.strType == "Icon10.png" && this.objSlotImage.checkCoordinates(this.intX, this.intY))
            {
                this.objSlotImage.objLockImage.setContext(this.arrViews[this.strType].context);
                this.objSlotImage.drawLock(this.arrViews[this.strType].intX, this.arrViews[this.strType].intY);
            }            
        }
    }
}

/**
 * To animate the current symbol
 * 
 */
ReelSlotView.prototype.animate = function ( )
{
    if (this.blVisible)
    {
        if (this.blAnimated )
        {
            
            this.objCurrentAnimation.intX = this.intX;
            this.objCurrentAnimation.intY = this.intY;
            this.objCurrentAnimation.draw(this.intOffsetAnimationX, this.intOffsetAnimationY + this.intBouncingY );
            
            if (this.strSortType == "Icon10" && this.objSlotImage.checkCoordinates(this.intX, this.intY))
            {
                this.objSlotImage.objLockImage.setContext(this.objCurrentAnimation.context);
                this.objSlotImage.drawLock(this.objCurrentAnimation.intX, this.objCurrentAnimation.intY);
            }
        }
    }
}
