/**
 * @author Javier.Ortega
 * 
 * This class will handle the an animation
 */

/**
 * Constructor
 * @param {Object} objAssetsFactory The objAssetsFactory where the sprites are ALREADY loaded 
 * @param { String } strNameAnimation The name of the animation
 * @param { int } intX The x coordinate where to draw the animation
 * @param { int } intY The y coordinate where to draw the animation 
 */
function Animation( objAssetsFactory, strNameAnimation, intX, intY )
{
    // --
    //Binding the necessary methods
    this.handleSpritesLoaded = this.handleSpritesLoaded.bind(this);
      
    /**
     * An instance to load resources
     * @type {Object} 
     */  
    this.objAssetsFactory = objAssetsFactory;  
    
    /**
     * The array of sprites
     * @type {Array} 
     */ 
    this.arrSprites;
    
    /**
     * The current frame
     * @type {int} 
     */ 
    this.intCurrentFrame = 0;
    
    /**
     * The 1st frame
     * @type {int} 
     */ 
    this.intStartFrame = 0;
    
    /**
     * The final frame
     * @type {int} 
     */ 
    this.intEndFrame = 0;

    /**
     * The current frame
     * @type { float } 
     */     
    this.flLastUpdate;
    
    /**
     * The period T  
     * @type { int } 
     */     
    this.intPeriod = 30;
    
    if ( DeviceModel.strAssets == "low" )
    {
        this.intPeriod = 60;    
    }
    
    /**
     * The x coordinate where to draw the animation  
     * @type { int } 
     */     
    this.intX = intX;
    
    /**
     * The y coordinate where to draw the animation
     * @type { int } 
     */     
    this.intY = intY;
    
    /**
     * Specify if we have a continuous
     * @type { Boolean } 
     */     
    this.blContinuous = false;
    
    this.intState = Animation.PLAY;
    
    
    this.offsetTime = 0;
    
    this.strAnimation = strNameAnimation;
    
    this.visible = this.visible.bind(this);
    this.blVisible = true;
    
    this.intOffsetX = 0;
    this.intOffsetY = 0;
}

/**
 * Derive Animation from our base type to provide inheritance
 */ 
Class.extend(ElementView, Animation);

Animation.STOP = 0;
Animation.PLAY = 1;

Animation.prototype.visible = function( blVisible )
{
	this.blVisible = blVisible;
	
	for(var s in this.arrSprites )
	{
		this.arrSprites[s].blVisible = blVisible;
	}	
}

/**
 * Clone this object.
 */
Animation.prototype.clone = function ()
{
    var objClone = new Animation (this.objAssetsFactory, this.strAnimation, this.intX, this.intY);
    
    objClone.arrSprites = this.arrSprites;
    if (objClone.arrSprites)
    {
        objClone.intEndFrame = objClone.arrSprites.length - 1;
    }
    else
    {
       // console.log("Sprites for this animation no loaded:" + objClone.strAnimation);
    }
    objClone.context = this.context;
    return objClone;
}

/**
 * This will load the animation 
 * @param {Object} strAnimationName
 */
Animation.prototype.initAnimation = function(  )
{
    var arrAnimationSprites = this.objAssetsFactory.objSpriteController.checkAnimationSprites ([this.strAnimation]);    
    var arrSpriteNames = [];
    var i;
    
    for ( i in arrAnimationSprites)
    {
        arrSpriteNames.push(i);
    }
    
    this.objAssetsFactory.getResources( this.handleSpritesLoaded, arrSpriteNames);
}

/**
 * This will load the animation 
 * @param { function } objCallback
 * @param { int } intStart Optional parameter, to specify the 1st frame
 * @param { int } intEnd Optional parameter, to specify the last frame
 */
Animation.prototype.startAnimation = function( objCallback, intStart, intEnd ) 
{
    
    if (intStart || intStart == 0) 
    {
        this.intStartFrame = intStart;
    }
    
    if (intEnd)
    {
        this.intEndFrame = intEnd;
    }
    
    
    this.flLastUpdate = ( new Date() ).getTime();
    this.intCurrentFrame  = this.intStartFrame ;
    this.objCallback = objCallback;
    
}

/**
 * This will load the animation 
 * @param {Array} arrImages
 */
Animation.prototype.handleSpritesLoaded = function( arrImages ) 
{
    var intFrame = 0;
    this.arrSprites = [];
    
    for (var i in arrImages)
    {
        this.arrSprites[intFrame] = new ElementView();
        
        this.arrSprites[intFrame].init( this.context, arrImages[i], 1, arrImages[i].width, arrImages[i].height );
        this.arrSprites[intFrame].intX = this.intX;
        this.arrSprites[intFrame].intY = this.intY;
        intFrame++;
    }
    
    this.intEndFrame = this.arrSprites.length - 1;
    
    if (this.loadedFinished)
    {
        this.loadedFinished();
    }
}

/**
 * This will load the animation 
 * @param {int} intX  The x coordinate to draw the animation
 * @param {int} intY  The y coordinate to draw the animation
 */
Animation.prototype.setXY = function( intX, intY ) 
{
    var intFrame = 0;
 	this.intX = intX;
 	this.intY = intY;
 	   
    for (var i in this.arrSprites)
    {
        this.arrSprites[i].intX = this.intX;
        this.arrSprites[i].intY = this.intY;
    }
}

/**
 * This function will draw the animation 
 */
Animation.prototype.draw = function( intOffsetX, intOffsetY )
{
	if(!this.blVisible)
	{
		return;
	}
	
	if (this.intState == Animation.STOP)
	{
		this.arrSprites[ this.intCurrentFrame ].intX = this.intX;
    	this.arrSprites[ this.intCurrentFrame ].intY = this.intY;
    	this.arrSprites[ this.intCurrentFrame ].draw( intOffsetX + this.intOffsetX , intOffsetY + this.intOffsetY  )
		return;
	}
    //To calculate the new frame, skipping frames if the performance in the current device
    //is not able to keep the frame rate
    var flNow = ( new Date() ).getTime();
    var intIterations = Math.floor ( (flNow - this.flLastUpdate ) / this.intPeriod );

    if ( intIterations > 3 )
    {
        intIterations = 3;
    }
    
    var intNewFrame = (this.intCurrentFrame + intIterations);
    
    
    if ( intNewFrame >= this.intEndFrame)
    {
        if ( this.blContinuous )
        {
            this.intCurrentFrame = 0;
        }
        else
        {
            if (this.objCallback)
            {
                this.objCallback();
            }
        }
        
        intNewFrame = this.intEndFrame - 1;
    }
    else
    {
        this.intCurrentFrame = intNewFrame < this.intEndFrame  ? intNewFrame : this.intEndFrame;
    }
   
    //To draw the current frame
    this.arrSprites[ this.intCurrentFrame ].intX = this.intX;
    this.arrSprites[ this.intCurrentFrame ].intY = this.intY;
    this.arrSprites[ this.intCurrentFrame ].draw( intOffsetX + this.intOffsetX , intOffsetY + this.intOffsetY);
    
    
    //Only it we are drawing a new frame we will update the last update, in other way we will keep the time
    //until we have at least one iteration 
    if (intIterations > 0 || !this.flLastUpdate )
    {
        this.flLastUpdate = flNow;
    }
}
