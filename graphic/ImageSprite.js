/**
 * @author Javier.Ortega
 *
 * This class extends Basic Image functionalities
 */

/**
 * Constructor
 */
function ImageSprite( objImag, intSrcX, intSrcY, intSrcW, intSrcH, intOffsetX, intOffsetY, intTotalWidth, intTotalHeight )
{
    ImageSprite.createOfflineCanvas();
    this.objImage = objImag;

    this.intSrcX = intSrcX;
    this.intSrcY = intSrcY;
    this.intSrcW = intSrcW;
    this.intSrcH = intSrcH;

    //Added to be compatible with the old Sprite Class
    this.width = intTotalWidth;
    this.height = intTotalHeight;
    this.intWidth = intTotalWidth;
    this.intHeight = intTotalHeight;
    ////////////////////////////////////////////////////

    this.intOffsetX = intOffsetX;
    this.intOffsetY = intOffsetY;

    this.intTotalWidth = intTotalWidth;
    this.intTotalHeight = intTotalHeight;

    this.intWidthOffset = (this.intWidth / 2) - (this.intTotalWidth / 2);
    this.intHeightOffset = (this.intHeight / 2) - (this.intTotalHeight / 2);

    this.strType = "ImageSprite";

    this.blLoaded = false;
    
    this.objImageSplitted;
    
	this.flScaleX = 1;
	this.flScaleY = 1;
}

/**
 * Derive ImageSprite from our base type to provide inheritance
 */
Class.extend(Class, ImageSprite);

/**
 * This function will try to draw the sprite, using an splitted image or region
 * from the original spritesheet if it is not splitted
 */
ImageSprite.prototype.draw = function()
{
    if (this.objContext)
    {
        try
        {
            if (this.blLoaded)
            {
            	if (this.flScaleX == 1 && this.flScaleY == 1)
            	{
	                this.objContext.drawImage( this.objImageSplitted, this.intDesX + this.intOffsetX , this.intDesY + this.intOffsetY);
            	}
            	else
            	{
            		//need to stretch the image
	                this.objContext.drawImage( this.objImageSplitted, this.intDesX + this.intOffsetX , this.intDesY + this.intOffsetY, this.objImageSplitted.width * this.flScaleX, this.objImageSplitted.height * this.flScaleY);
            	}
                //this.objContext.drawImage( this.objImage, this.intSrcX, this.intSrcY, this.intSrcW, this.intSrcH, this.intDesX + this.intOffsetX + this.intWidthOffset, this.intDesY + this.intOffsetY + this.intHeightOffset , this.intSrcW, this.intSrcH );
            }
            else
            {
                this.createSplittedImage ();

                //TO DO: Remove these lines, when we are sure that we will need them => These means we don't have any performance issue in any browser/device
                
                /*ImageSprite.objOfflineCanvas.width = this.intTotalWidth;
                ImageSprite.objOfflineCanvas.height = this.intTotalHeight;
                ImageSprite.objOfflineCanvas.getContext('2d').drawImage(this.objImage,this.intSrcX, this.intSrcY, this.intSrcW, this.intSrcH, this.intOffsetX, this.intOffsetY, this.intSrcW, this.intSrcH);
                this.objContext.drawImage( ImageSprite.objOfflineCanvas, this.intDesX , this.intDesY );
                this.objContext.drawImage( this.objImage, this.intSrcX, this.intSrcY, this.intSrcW, this.intSrcH, this.intDesX + this.intOffsetX + this.intWidthOffset, this.intDesY + this.intOffsetY + this.intHeightOffset , this.intSrcW, this.intSrcH );*/                
                /*ImageSprite.objOfflineCanvas.width = this.intSrcW;
                ImageSprite.objOfflineCanvas.geight = this.intSrcH;
                ImageSprite.objOfflineCanvas.getContext('2d').drawImage(this.objImage,this.intSrcX,this.intSrcY, this.intSrcW, this.intSrcH,0 , 0 , this.intSrcW, this.intSrcH);
                this.objContext.drawImage(  ImageSprite.objOfflineCanvas, this.intDesX + this.intOffsetX , this.intDesY + this.intOffsetY);
                */
                
                //this.objContext.putImageData(this.imgData,  this.intDesX + this.intOffsetX , this.intDesY + this.intOffsetY);
                
                this.objContext.drawImage( this.objImage, this.intSrcX, this.intSrcY, this.intSrcW, this.intSrcH, this.intDesX  + this.intOffsetX , this.intDesY + this.intOffsetY , (this.intSrcW * this.flScaleX), (this.intSrcH * this.flScaleY) );
            }
           
            //this.objContext.drawImage( this.objImage, this.intSrcX, this.intSrcY, this.intSrcW, this.intSrcH, this.intDesX + this.intOffsetX + this.intWidthOffset, this.intDesY + this.intOffsetY + this.intHeightOffset , this.intSrcW, this.intSrcH );
        }
        catch(e)
        {
            console.log("Error");
        }
    }
    else
    {
        console.log("Context undefined ");
    }
}
/**
 * This function will clone this Object
 *
 *  @return {ImageSprite} The cloned Object
 */
ImageSprite.prototype.clone = function()
{
    var objClone = new ImageSprite(this.objImage, this.intSrcX, this.intSrcY, this.intSrcW, this.intSrcH, this.intOffsetX, this.intOffsetY, this.intTotalWidth, this.intTotalHeight);
    objClone.setScaling(this.flScaleX, this.flScaleY);

    return objClone;
}
/**
 * This will split this image from the original spritesheet
 *
 */
ImageSprite.prototype.createSplittedImage = function()
{
    if (!this.objImageSplitted)
    {
        var objImage2 = this.createOfflineCanvas2(this.intTotalWidth, this.intTotalHeight, this.intCurrentSprite + "2");
        var objContext2 = objImage2.getContext('2d');
        //objContext2.drawImage(objImage, objSprite.spriteSourceSize.x, objSprite.spriteSourceSize.y);
        
        objContext2.drawImage(this.objImage,this.intSrcX,this.intSrcY, this.intSrcW, this.intSrcH,0 , 0 , this.intSrcW, this.intSrcH);
        
        
        
        this.objImageSplitted = new Image();
        this.objImageSplitted.width = objImage2.width;
        this.objImageSplitted.height = objImage2.height;

        var that = this;

        this.objImageSplitted.onload = function()
        {
            that.blLoaded = true;
        };

        this.objImageSplitted.src = objImage2.toDataURL("image/png")
    }
}
/**
 * To create an offline canvas, in this case we will use it as a virtual image
 *
 * @param { Integer } intWidth The width canvas
 * @param { Integer } intHeight The height canvas
 * @param { String } strId The id for this canvas
 */
ImageSprite.prototype.createOfflineCanvas2 = function(intWidth, intHeight, strId)
{
    if (!objCanvas2 || (DeviceModel.strPlatform == OS.ANDROID && DeviceModel.intVersion <= 2))
    {
        objCanvas2 = document.createElement('canvas');
    }

    objCanvas2.getContext('2d').clearRect(0, 0, objCanvas2.width, objCanvas2.height);
    objCanvas2.width = intWidth;
    objCanvas2.height = intHeight;

    return objCanvas2;
}
/**
 * To create an offline canvas, in this case we will use it as a virtual image
 *
 * @param { Integer } intWidth The width canvas
 * @param { Integer } intHeight The height canvas
 * @param { String } strId The id for this canvas
 */
ImageSprite.createOfflineCanvas = function()
{
    if (!ImageSprite.objOfflineCanvas)
    {
        ImageSprite.objOfflineCanvas = document.createElement('canvas');
        ImageSprite.objOfflineCanvas.getContext('2d').clearRect(0, 0, ImageSprite.objOfflineCanvas.width, ImageSprite.objOfflineCanvas.height);
    }
}
/**
 * This function will clean the region
 */
ImageSprite.prototype.cleanRegion = function()
{
    this.objContext.beginPath();
    this.objContext.fillStyle = 'black'
    this.objContext.rect(0, 0, this.objContext.canvas.width, this.objContext.canvas.height);
    this.objContext.fill();
}
/**
 * This will sent the context
 *
 * @param { Object }  objContext The context for this Image
 */
ImageSprite.prototype.setContext = function(objContext)
{
    this.objContext = objContext;
}
/**
 *
 * Set X and Y coordinates for this Image
 *
 * @param {int} intDesX The X coordinate
 * @param {int} intDesY The Y coordinate
 *
 */
ImageSprite.prototype.setXY = function(intDesX, intDesY)
{
    this.intDesX = intDesX;
    this.intDesY = intDesY;

    this.x = intDesX;
    this.y = intDesY;
}
/**
 * Set scaling
 *
 * @param {number} flScaleX
 * @param {number} flScaleY
 */
ImageSprite.prototype.setScaling = function(flScaleX, flScaleY)
{
    this.flScaleX = flScaleX;
    this.flScaleY = flScaleY;
}
