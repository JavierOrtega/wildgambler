/**
 * @author Mark Serlin
 * 
 * This is a clone of the Animation.js class with the difference
 * that its resources are obtained and put together outside of this class
 * and supplied in the constructor.
 * In this way we can construct many objects (animating wilds, meerkats or other characters etc)
 * using a single set of resources.
 */

/**
 * Constructor
 * An array of "sprites", each of which is an ElementView object.
 */
function Animator( arrSprites )
{
    /**
     * The array of sprites
     * @type {Array} 
     */ 
    this.arrSprites = arrSprites;
    
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
    this.intEndFrame = this.arrSprites.length-1;

    /**
     * The current frame
     * @type { float } 
     */     
    this.flLastUpdate;
    
    /**
     * The period T  
     * Adjust UPWARDS to run the animation slower
     * DOWNWARDS to run it faster.
     * This parameter adjusts the interval between frame changes over time in the main run loop
     * @type { int } 
     */     
    this.intFrameRate = 60;//100;
    
    
    /**
     * The x coordinate where to draw the Animator
     * This needs to be set in setXY, probably having loaded a JSON layout.   
     * @type { int } 
     */     
    this.intX=0;
    
    /**
     * The y coordinate where to draw the Animator
     * This needs to be set in setXY, probably having loaded a JSON layout.   
     * @type { int } 
     */     
    this.intY=0;
    
    /**
     * Specify if we have a continuous animation
     * @type { Boolean } 
     */     
    this.blContinuous = false;
 	
 	this.visible = this.visible.bind(this);   
    
    this.offsetTime = 0;
    this.intId=0;
    
    this.fnFrameCallback = null;
}

/**
 * Derive Animator from our base type to provide inheritance
 */ 
Class.extend(ElementView, Animator);



Animator.prototype.visible = function( blVisible )
{
	for(var s in this.arrSprites )
	{
		this.arrSprites[s].blVisible = true;
	}	
}

/**
 * This will load the Animator 
 * @param { function } objCallback
 * @param { int } intStart Optional parameter, to specify the 1st frame
 * @param { int } intEnd Optional parameter, to specify the last frame
 * @param { int } intId Optional parameter, to specify the last frame
 */
Animator.prototype.startAnimation = function( objCallback, intStart, intEnd, intId, blContinuous ) 
{
	// can be null
    this.intId = intId;
    
    if (intStart != null) 
    {
        this.intStartFrame = intStart;
    }
    
    if (intEnd != null)
    {
        this.intEndFrame = intEnd;
    }
    
    if(blContinuous != null)
    {
    	this.blContinuous = blContinuous;
    }
    
    this.flLastUpdate = ( new Date() ).getTime();
    this.intCurrentFrame  = this.intStartFrame ;
    this.objCallback = objCallback;
    
    //console.log("anim setup start " + this.intStartFrame + " end " + this.intEndFrame + " id " + this.intId)
}


/**
 * This will load the Animator 
 * @param {int} intX  The x coordinate to draw the Animator
 * @param {int} intY  The y coordinate to draw the Animator
 */
Animator.prototype.setXY = function( intX, intY ) 
{
	this.intX = intX;
	this.intY = intY;
	/*
    for (var i in this.arrSprites)
    {
        this.arrSprites[i].intX = this.intX;
        this.arrSprites[i].intY = this.intY;
    }
    */
}

Animator.prototype.clone = function ()
{
    var objCloneAnimator =  new Animator(this.arrSprites);
    return objCloneAnimator;
}

/**
 * This function will draw the Animator 
 */
Animator.prototype.draw = function( intOffsetX, intOffsetY )
{
    /*
     * There have been times when this.arrSprites[ this.intCurrentFrame ]
     * has come up undefined. Stop errors her in this way for now.
     * TODO investigate and fix see bug report http://ash/bugs/view.php?id=38744
     */
    if(this.arrSprites[ this.intCurrentFrame ])
    {
    	// Draw the current frame
        this.arrSprites[ this.intCurrentFrame ].intX = this.intX;
        this.arrSprites[ this.intCurrentFrame ].intY = this.intY;
        this.arrSprites[ this.intCurrentFrame ].draw( intOffsetX, intOffsetY );
    }
    
	// Temp callback after every draw
    if(this.fnFrameCallback!=null)
    {
    	this.fnFrameCallback(this.intId, this.intCurrentFrame);
    }

    //To calculate the new frame, skipping frames if the performance in the current device
    //is not able to keep the frame rate
    var flNow = ( new Date() ).getTime();

	// Set the next frame
    var intFrameAdvance = Math.floor ( (flNow - this.flLastUpdate + this.offsetTime) / this.intFrameRate );

    // Get next frame, skipping some if we are on a slow device.
    var intNewFrame = (this.intCurrentFrame + intFrameAdvance);
	
	// Drawn the last frame
    if ( intNewFrame > this.intEndFrame)
    {
		/*
		 * On reaching final frame, make callback always.
		 * We may want to complete at least one main animation
		 * before moving to an outro phase. It is up the manager code to decide this.
		 */    
        if(this.objCallback)
        {
        	this.objCallback(this.intId);
        }

    	// If continuous, loop to the first frame
        if ( this.blContinuous )
        {
            this.intCurrentFrame = this.intStartFrame;
        }
    }
    // Set next frame
    else
    {
        this.intCurrentFrame = intNewFrame < this.intEndFrame ? intNewFrame : this.intEndFrame;
    }
   
    
    /*
     * Only it we are drawing a new frame we will update the last update,
     * in other way we will keep the time until we have at least one iteration.
     * TODO Move this to AFTER the callback?
     */ 
    if (intFrameAdvance > 0 || !this.flLastUpdate )
    {
        this.flLastUpdate = flNow;
    }

}
