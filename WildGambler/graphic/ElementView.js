/**
 * @author Javier.Ortega
 * 
 * @class This class will contain the basic functionality to draw an element in the Canvas
 */

function ElementView() 
{   
	this.newElement();
};

/**
 */ 
Class.extend( Class, ElementView );


ElementView.prototype.newElement =  function( objParent )
{
	/**
     * The context to draw ther visual object
     * @type {Object}
     */
    this.context;
    
    this.objParent = objParent;
    
    /**
     * The width for this graphic 
     * @type {int}
     */
    this.intWidth;
    
    /**
     * The height for this graphic 
     * @type {int}
     */
    this.intHeight;
    
    /**
     * The id for this element 
     * @type {String}
     */
    this.strId;
    
    /**
     * The name for the png/jpg related
     * @type {String}
     */
    this.strName;
    
    /**
     * The x coordinate 
     * @type {int}
     */
    this.intX = 0;
    
    /**
     * The y coordinate 
     * @type {int}
     */
    this.intY = 0;
    
    
    /**
     * The x coordinate for the offset
     * @type {int}
     */
    this.intOffsetX = 0;
    
    /**
     * The y coordinate for the offset 
     * @type {int}
     */
    this.intOffsetY = 0;
    
    /**
     * The x coordinate for the offset
     * @type {int}
     */
    this.intParentOffsetX = 0;
    
    /**
     * The y coordinate for the offset 
     * @type {int}
     */
    this.intParentOffsetY = 0;

    /**
     * The image for the current graphic 
     * @type {Image}
     */    
    this.imImage;

    /**
     * Different State for this element 
     * @type {Array}
     */    
	this.arrStates = [];
	
	/**
     * The current state for the element 
     * @type {String}
     */    
	this.strState = 'normal'; 
	
	
	/**
     * If this element is visible or not 
     * @type {Boolean}
     */    
	this.blVisible = true; 
	
	/**
     * A boolean to enable the drag in the vertical axe
     * @type {Boolean}
     */  
    this.blEnableOffsetY = true;

	/**
     * A boolean to enable the drag in the horizontal axe
     * @type {Boolean}
     */    
    this.blEnableOffsetX = true;
    
    
    /**
     * This defines if we should apply or not the swipe change tho this element
     * @type {Boolean}
     */
    this.blSwipe = false;
    
    /**
     * X swipe coordinate
     * @type { Integer}
     */
    this.intSwipeX = 0;
    
    /**
     * Y swipe coordinate
     * @type { Integer}
     */
    this.intSwipeY = 0;
    
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
	
	/**
     * Angle to rotate
     * @type { float }
     */
	this.flAngle = 0;
	
	/**
	 * Enable it to enable rotation
	 * 
	 * @type { Boolean }
	 */
	this.blRotate = false;
	
	this.rotate = this.rotate.bind(this);
}

/**
 * To initliaze the Element View 
 * @param {object} contextIn
 * @param {object} imImage
 * @param {int} intNumberFrames (Optional)
 * @param {int} intWidth (Optional)
 * @param {int} intHeight (Optional)
 */
ElementView.prototype.init =  function(contextIn, imImage, intNumberFrames, intWidth, intHeight, strName) 
{   
    this.context = contextIn;
        
    if (!(imImage.strType) || imImage.strType != "ImageSprite")
    {
        this.imImage  = new Sprite(contextIn);
        
        if ( intNumberFrames && intNumberFrames > 1 )
        {
            this.imImage.setImageWithFrames(imImage, intNumberFrames, intWidth, intHeight);
        }
        else
        {
            this.imImage.setImage(imImage);
        }
    }
    else
    {
        this.imImage = imImage;
        this.imImage.setContext(contextIn);
    }
        
    this.intWidth = imImage.width;
    this.intHeight = imImage.height;
        
    this.arrStates[strName] = this.imImage;
    
    this.imImage.setXY(this.intX + this.intOffsetX, this.intY + this.intOffsetY);
    this.imImage.setScaling(this.getScaleX(), this.getScaleY());
}; 

/**
 * Set the property blDirty of the parent to true, to force redraw the screen
 */
ElementView.prototype.update = function ()
{
    //if ( this.objParent && this.objParent.blVisible )
    if ( this.objParent )
    {
        this.objParent.setDirty( true );
    }
}

/**
 *  Set a frame number
 * @param intFrame The new context
 */  
ElementView.prototype.setFrame = function( intFrame )
{
    this.imImage.setFrame(intFrame);
}

/**
 *  Set a context
 * @param objContext The new context
 */  
ElementView.prototype.setContext = function( objContext ) 
{
     this.context = objContext;
     if ( this.imImage )
     {   
        this.imImage.objContext  = this.context;
     }
     else
     {
        console.log("Error");
     }
}       

/**
 * Add a new image  to the states collection
 * @type {Image}  imState
 * @type {String} strName
 */
ElementView.prototype.addState = function ( imState, strName )
{
    if (!(imState.strType) || imState.strType != "ImageSprite")
    {
        var imImage  = new Sprite(this.context);
        imImage.setImage(imState);
    }
    else
    {
        imImage = imState;
    }      
    
    this.arrStates[strName] = imImage;
}

/**
 * Change the state of the image
 * @param { String } strName
 */
ElementView.prototype.setState = function ( strName )
{
    if (this.objParent && !this.objParent.blVisible)
    {
        return;
    }
	//set the state
	this.strState = strName;
	
	//handle state change
	if (this.arrStates[strName] != undefined)
	{
		this.arrStates[strName].setXY(this.imImage.x, this.imImage.y);
		this.imImage = this.arrStates[strName];   
		this.imImage.objContext  = this.context;
		this.imImage.setScaling(this.getScaleX(), this.getScaleY());
	}
	else
	{
		//cannot change to new state
		//console.log("Unknown state: " + strName, this);
	}
	
	//mark to redraw
	this.update();
}

/**
 * Retrieve current element state
 * @return {String}
 */
ElementView.prototype.getCurrentState = function()
{
	return this.strState;
}

/**
 * Change all states
 * 
 * @param {Array} arrStates (array of Sprites)
 * @param {String} optional - strNewState
 * @throws {Error}
 */
ElementView.prototype.changeAllStates = function(arrNewStates, strNewState)
{
	if (strNewState == undefined)
	{
		strNewState = this.strState;
	}
	if (arrNewStates[strNewState] == undefined)
	{
		throw new Error("could not change state, state '" + strNewState + "' is not available in new states");
	}
	this.arrStates = arrNewStates;

	this.imImage = this.arrStates[strNewState];
	this.imImage.objContext = this.context;
	this.imImage.setScaling(this.getScaleX(), this.getScaleY());
	this.update();
}


/**
 * Process the Json data to obtain the layout for the screen
 * @param { Object } objJSONData 
 */
ElementView.prototype.processJSONLayout = function (objJSONData)
{
    this.intX = parseFloat(objJSONData.x);
    this.intY = parseFloat(objJSONData.y);
    this.intWidth = parseFloat(objJSONData.width);
    this.intHeight = parseFloat(objJSONData.height);
    this.strId = objJSONData.id;
    this.strName = objJSONData.name;
    if ( this.imImage )
    {
        this.imImage.setXY(this.intX, this.intY);
    }
}

/**
 * Set element position X, Y
 * 
 * @param {number} intX
 * @param {number} intY
 */
ElementView.prototype.setXY = function (intX, intY)
{
	this.intX = intX;
	this.intY = intY;

    if ( this.imImage )
    {
        this.imImage.setXY(this.intX, this.intY);
    }
}

/**
 * Retrieve X position
 * 
 * @return {number}
 */
ElementView.prototype.getX = function ()
{
	if (this.blSwipe)
    {
        return this.intX + this.intSwipeX;        
    }
    else
    {
        return this.intX;    
    }
}

/**
 * Retrieve Y position
 * 
 * @return {number}
 */
ElementView.prototype.getY = function ()
{
    if (this.blSwipe)
    {
        return this.intY + this.intSwipeY;
    }
    else
    {
        return this.intY;    
    }
}

/**
 * Set X position
 * 
 * @param {number} intX
 */
ElementView.prototype.setX = function(intX)
{
	this.intX = intX;
	this.update();
}

/**
 * Set Y position
 * 
 * @param {number} intY
 */
ElementView.prototype.setY = function(intY)
{
	this.intY = intY;
	this.update();
}

/**
 * Retrieve width
 * 
 * @return {number}
 */
ElementView.prototype.getWidth = function ()
{
	return this.intWidth * this.flScaleX;
}

/**
 * Retrieve height
 * 
 * @return {number}
 */
ElementView.prototype.getHeight = function ()
{
	return this.intHeight * this.flScaleY;
}

/**
 * Set element position X, Y
 * 
 * @param {number} intX
 * @param {number} intY
 */
ElementView.prototype.setParent = function (objParent)
{
	this.objParent = objParent;
	this.update();
}

/**
 * This handles the layout 
 */
ElementView.prototype.layout = function ()
{
    
}

/**
 * To draw the element for an offset it is needed
 * @param {int} intOffsetX
 * @param {int} intOffsetY
 */
ElementView.prototype.draw = function(intOffsetX, intOffsetY) 
{
	/*
	 * This is code Mark has changed it to, but it does not work with sidebar
	 */
    if ( this.blVisible )
    {   
    	var intFinalX,intFinalY;
    	
        intFinalX = this.intX + this.intOffsetX;
        intFinalY = this.intY + this.intOffsetY;
        
        if (this.blEnableOffsetX)
        { 
        	this.intParentOffsetX = intOffsetX;
            intFinalX += intOffsetX;
        }
        
        if (this.blEnableOffsetY)
        {
        	this.intParentOffsetY = intOffsetY;
            intFinalY += intOffsetY;
        }
        
        if (this.blSwipe)
        {
            intFinalX += this.intSwipeX;
            intFinalY += this.intSwipeY;
        }
        
        var intRotationPointX, intRotationPointY;
            
        // The rotation is not finished
        //TO DO : To review later and to finish
        if (this.blRotate)
        {
            this.context.save ();
            
            /*this.context.save();           
            this.context.translate (this.intWidth/2,this.intHeight/2);
            this.flAngle = (this.flAngle + 1) % 360;            
            this.context.rotate(this.flAngle * (Math.PI/360));            
            this.context.translate (-this.intWidth/2,-this.intHeight/2);
            this.imImage.draw();
            this.context.restore();*/
            
            this.context.save();
            this.context.translate( intFinalX, intFinalY );
            this.context.translate( this.intWidth/2, this.intHeight/2 );
            this.flAngle = (this.flAngle + 1) % 360;     
            this.context.rotate( this.flAngle * (Math.PI/360));
            this.context.drawImage( image, -this.intWidth/2, -this.intHeight/2 );
            this.context.restore();            
            
            console.log (this.flAngle);
        }
        else
        {
            this.imImage.setXY(intFinalX, intFinalY);
            this.imImage.draw();    
        }
    }
};

/**
 * 
 * This function rotates an element
 * 
 * @param { Float } flAngle The angle to rotate
 * 
 */
ElementView.prototype.rotate = function (flAngle)
{
    this.flAngle = flAngle;
    this.blRotate = true;
    this.update();
}

/**
 * 
 * 
 * @return { Float } the current rotation angle
 */
ElementView.prototype.getRotation = function ()
{
    return this.flAngle;
}

/**
 *  This function draws the a specific frame of the image
 * @param { Number } xIn Scale Factor for the x axis
 * @param { Number } yIn Scale Factor for the y axis
 */
ElementView.prototype.setScaling = function(xIn, yIn) 
{
    this.flScaleX = xIn;
    this.flScaleY = yIn;
    
    //set the same for sprite
    if (this.imImage)
    {
	    this.imImage.setScaling(xIn, yIn);
    }
    
    //set the same for all the states
    for (var strState in this.arrStates) {
    	this.arrStates[strState].setScaling(xIn, yIn);
    }
};

/**
 * Retrieve current scaling factor for width
 * @return { number }
 */
ElementView.prototype.getScaleX = function() 
{
    return this.flScaleX;
};

/**
 * Retrieve current scaling factor for height
 * @return { number }
 */
ElementView.prototype.getScaleY = function() 
{
    return this.flScaleY;
};

ElementView.prototype.setVisible = function(blVisible)
{
	this.blVisible = blVisible;
	this.update();
}
