/**
 * @author Javier.Ortega
 * 
 * @class This class will contain the basic functionality to draw an sprite in the Canvas
 */


/**
 * Constructor
 * @param   objContextIn context where tod raw
 */
function Sprite( objContextIn ) 
{
    /**
     * The x coordinate where to draw the image 
     * @type {int}
     */
	this.intX;
	
	/**
     * The y coordinate where to draw the image 
     * @type {int}
     */
	this.intY;
    
    /**
     * The image to be drawn 
     * @type {Object}
     */  
	this.objImage;
    
    /**
     * The graphical contex where to draw 
     * @type {Object}
     */
	this.objContext = objContextIn;
	
	/**
     * The current frame if we are working with an animation 
     * @type {int}
     */
    this.intCurrentFrame = 0;
    
    /**
     * The number of frame for our animation
     * @type {int}
     */
    this.intNumberFrames;
   
   /**
     * The height of the image
     * @type {int}
     */
    this.intHeight;
    
    /**
     * The width of the image 
     * @type {int}
     */
	this.intWidth;
	
	/**
     * The number of states
     * @type {int}
     */
    this.intNumberStates;
    
    /**
     * The current state
     * @type {int}
     */
    this.intCurrentState = 0;
    
    /**
     * The scale Factor for the x axis 
     * @type {int}
     */
    this.intScaleX = 1;
    
    /**
     * The scale Factor for the y axis 
     * @type {int}
     */
    this.intScaleY = 1;    
}


/**
 * Derive GuiView from our base type to provide inheritance
 */
Class.extend( Class, Sprite );

/**
 * Set the x coordinate for this image
 * @param { Integer } xIn X coordinate. 
 */
Sprite.prototype.setX = function(xIn) 
{
    this.intX = xIn ;
};

/**
 * Set the y coordinate for this image
 * @param { Integer } yIn Y coordinate. 
 */
Sprite.prototype.setY = function(yIn) 
{
    this.intY = yIn ;
};

/**
 * Set the coordinates for this image
 * @param { Integer } xIn X coordinate'
 * @param { Integer } yIn Y coordinate. 
 */
Sprite.prototype.setXY = function(xIn, yIn) 
{
    this.intX = xIn;
    this.intY = yIn;
}; 

/**
 *  This function scales the image
 * @param { Integer } intScale Scale Factor. 
 */
Sprite.prototype.scale = function (intScale)
{
    //Checking the correct transformation for the different browsers
    if(this.objImage.style.webkitTransform != undefined)
    {
        this.objImage.style.webkitTransformOriginX = "left";
        this.objImage.style.webkitTransformOriginY= "top";        
        this.objImage.style.webkitTransform = "scale(" + intScale +  "," + intScale + ")";
    }
    else if(this.objImage.style.MozTransform != undefined)
    {       
        this.objImage.style.MozTransform =  "scale(" + intScale +  "," + intScale + ")";
        this.objImage.style.MozTransformOrigin = "left top";
        
    }
    else if(this.objImage.style.OTransform != undefined)
    {
        this.objImage.style.OTransform  =  "scale(" + intScale +  "," + intScale + ")";
        this.objImage.style.OTransformOrigin = "left top";
    }
}

/**
 *  This function draws the a specific frame of the image
 * @param { Integer } xIn Scale Factor for the x axis
 * @param { Integer } yIn Scale Factor for the y axis
 */
Sprite.prototype.setScaling = function(xIn, yIn) 
{
    this.intScaleX = xIn;
    this.intScaleY = yIn;
};

/**
 * Retrieve current scaling factor for width
 * @return { number }
 */
Sprite.prototype.getScaleX = function() 
{
    return this.intScaleX;
};

/**
 * Retrieve current scaling factor for height
 * @return { number }
 */
Sprite.prototype.getScaleY = function() 
{
    return this.intScaleY;
};


/**
 *  This function draws the a specific frame of the image
 * @param { Object } imageIn the image with the sprites. 
 * @param { Integer } wIn Width of one frame
 * @param { Integer } hIn Height of one state
 */
Sprite.prototype.setImage = function(imageIn, wIn, hIn) 
{
    try 
    {   
        this.objImage = imageIn;
        this.intNumberFrames = 1;
        this.intWidth = imageIn.width;
        this.intHeight = imageIn.height;            
    } catch (err) 
    {
        console.log(err + " =>problems setting objImage: ");
    }
};

/**
 *  This function draws the a specific frame of the image
 * @param { Object } imageIn the image with the sprites
 * @param { Integer } maxFrames Number of frames
 * @param { Integer } wIn Width of one frame
 * @param { Integer } hIn Height of one state
 */
Sprite.prototype.setImageWithFrames = function(imageIn, maxFrames, wIn, hIn) 
{
    var imageData, data;
    try 
    {
        this.objImage = imageIn;
        this.intNumberFrames = maxFrames;
        this.intWidth = imageIn.width / maxFrames; //w;
        this.intHeight = imageIn.height; //h;            
    } 
    catch (err) 
    {
        console.log(" =>problems setting objImage with intNumberFrames "+err);
    }
};

/**
 *  This function draws the a specific frame of the image
 * @param { Object } imageIn the image with the sprites
 * @param { Integer } statesIn Number of states
 * @param { Integer } maxFrames Number of frames
 * @param { Integer } wIn Width of one frame
 * @param { Integer } hIn Height of one state
 */
Sprite.prototype.setImageWithStates = function(imageIn, statesIn, maxFrames, wIn, hIn) 
{
    try 
    {
        this.objImage = imageIn; 
        this.intNumberStates = statesIn;
        this.intNumberFrames = maxFrames;
        this.intWidth = imageIn.width / maxFrames;
        this.intHeight = imageIn.height / statesIn.length;
    }
    catch ( err ) 
    {
        console.log(" =>problems setting objImage with intNumberStates:" +err);
    }
};

/**
 *  This function draws the a specific frame of the image
 * @param { Integer } frameIn Select an specified frame
 */
Sprite.prototype.setFrame = function( frameIn )
{
    this.intCurrentFrame = frameIn;
};

/**
 *  This function draws the image in the specified context
 * @param { Integer } stateIn To chose the stare ( Animation )
 */
Sprite.prototype.setState = function( stateIn )
{
    this.currentState = stateIn;
    this.intCurrentFrame = 0;
};

/**
 *  This function draws the image in the specified context
 * @param { Object } contextIn It changes the context for this image
 */
Sprite.prototype.setContext = function( contextIn ) 
{
    this.objContext = contextIn;
};

/**
 *  This function draws the image in the specified context 
 */
Sprite.prototype.draw = function ()
{
    var srcX = 0;
    var srcY = 0;   
    var tempX = this.intX;
    var tempY = this.intY;
    var intWidth = this.intWidth;
    var intHeight = this.intHeight;
    var objImage = this.objImage;
    
    if (intWidth < 1 || intHeight < 1  || objImage == null ) 
    {
    	if (objImage != null)
    	{
        	console.log("problem painting objImage" + this.objImage.src);
        }
        else
        {
        	console.log("problem painting objImage,the image is null");
        	return;
        }
    }

    //It checks if we are drawing only one frame   
    if (this.intNumberFrames == 1 && this.intNumberStates == null)
    {
        if (this.intScaleX == 1 && this.intScaleY == 1)
        {
            this.objContext.drawImage(objImage, tempX, tempY, intWidth, intHeight);
        } 
        else
        {   
            var h = parseInt(intHeight * this.intScaleY);
            var w = parseInt(intWidth * this.intScaleX);
            this.objContext.drawImage(objImage, srcX, srcY, intWidth, intHeight, tempX, tempY, w, h);
        }
    }
    //It draw an animation/states image
    else
    {
        srcX = this.intCurrentFrame * intWidth;
        srcY = this.intCurrentState * intHeight;
        
        if ( this.intScaleX == 1 && this.intScaleY == 1 )
        {
            this.objContext.drawImage(objImage, srcX, srcY, intWidth, intHeight, tempX, tempY, intWidth, intHeight);            
        }
        else 
        {
            var h = parseInt(intHeight * this.intScaleY);
            var w = parseInt(intWidth * this.intScaleX);
                
            this.objContext.drawImage(objImage, srcX, srcY, intWidth, intHeight, tempX, tempY, w, h);
        }
    }
}
