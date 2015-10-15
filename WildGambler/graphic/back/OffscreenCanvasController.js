/**
 * @author Petr Urban
 * 
 * Off-screen canvas controller
 * 
 * This class will let you generate instance of Image object from sprite sheet
 *  - To save resources, generated images are stored in cache, so that there can be more requests for the same image
 *  - Also enables use of customised draw function during generating of image (customised results are not stored in cache)
 * 		i.e. callback function that will draw the image distorted, rotated, blurred etc.
 */


/**
 * Constructor  
 *
 * @param { String } strNameCanvas This is the name of the canvas
 * @param { DeviceModel } deviceModel containing all environment information
 * @param { int } intWidth Optional parameter to specify the width
 * @param { int } intHeight Optional parameter to specify the height
 */
function OffscreenCanvasController()
{
	this.objCanvas = null;
	this.objContext = null;
	
	this.arrImageCache = [];
	
	// initialize
    this.init();
};

/**
 * Derive CanvasController from our base type to provide inheritance
 */ 
Class.extend(Class, OffscreenCanvasController);

/**
 * Draw sprite image into canvas
 * 
 * @param {Image} objImage the sprite image
 * @param {integer} intX - X position in the sprite image
 * @param {integer} intY - Y position in the sprite image
 * @param {integer} intWidth - width of sprite
 * @param {integer} intHeight - height of sprite
 * 
 * @return {Image} objImage 
 */
OffscreenCanvasController.prototype.init = function()
{
	this.objCanvas = document.createElement("canvas");
	this.objContext = this.objCanvas.getContext("2d");
};

/**
 * Draw sprite image into canvas
 * 
 * @param {Image} objImage the sprite image
 * 
 * - to cut the sprite out of spritesheet
 * @param {integer} intX - X position in the sprite image
 * @param {integer} intY - Y position in the sprite image
 * @param {integer} intWidth - width of sprite
 * @param {integer} intHeight - height of sprite
 * 
 * - to draw the sprite
 * @param {integer} intOffsetX 
 * @param {integer} intOffsetY
 * @param {function} intTargetWidth 
 * @param {function} intTargetHeight 
 * 
 * @return {Image} objImage 
 */
OffscreenCanvasController.prototype.generateImage = function(objImage, intX, intY, intWidth, intHeight, intOffsetX, intOffsetY, intTargetWidth, intTargetHeight, callbackDrawFunction)
{
	this.clearCanvas(intTargetWidth, intTargetHeight);
	var objResultImage = null;
	
	if (callbackDrawFunction == undefined || callbackDrawFunction == null)
	{
		//spcialized callbackDrawFunction has not been used, we can remember this image
		objResultImage = this.getCachedImage(objImage, intX, intY, intWidth, intHeight, intOffsetX, intOffsetY, intTargetWidth, intTargetHeight);
		if (objResultImage == null)
		{
			//draw image simply
			this.drawImage(objImage, intX, intY, intWidth, intHeight, intOffsetX, intOffsetY);
			
			objResultImage = this.getCanvasContentAsImage();
			this.setCachedImage(objResultImage, objImage, intX, intY, intWidth, intHeight, intOffsetX, intOffsetY, intTargetWidth, intTargetHeight);
		}
		
	}
	else
	{
		// let the drawing function handle drawing into canvas
		// if the dimensions of canvas need to be changed, that can be done in the callbackDrawFunction
		callbackDrawFunction(this.objCanvas, this.objContext, objImage, intX, intY, intWidth, intHeight, intOffsetX, intOffsetY, intTargetWidth, intTargetHeight);
		objResultImage = this.getCanvasContentAsImage();
	}
	
	return objResultImage;
};

/**
 * Draw sprite image into canvas
 * 
 * @param {Image} objImage the sprite image
 * 
 * - to cut the sprite out of spritesheet
 * @param {integer} intX - X position in the sprite image
 * @param {integer} intY - Y position in the sprite image
 * @param {integer} intWidth - width of sprite
 * @param {integer} intHeight - height of sprite
 * 
 * - to draw the sprite
 * @param {integer} intOffsetX 
 * @param {integer} intOffsetY
 * @param {function} intTargetWidth 
 * @param {function} intTargetHeight 
 * 
 * @return {Image} objImage 
 */
OffscreenCanvasController.prototype.generateImage = function(objImage, intX, intY, intWidth, intHeight, intOffsetX, intOffsetY, intTargetWidth, intTargetHeight, callbackDrawFunction)
{
	var objCanvas = document.createElement("canvas");
	var objContext = objCanvas.getContext("2d");
	
	objCanvas.width = intTargetWidth;
	objCanvas.height = intTargetHeight;
	objContext
	
	//this.clearCanvas(intTargetWidth, intTargetHeight);
	
	var objResultImage = null;
	
	if (callbackDrawFunction == undefined || callbackDrawFunction == null)
	{
		//spcialized callbackDrawFunction has not been used, we can remember this image
		objResultImage = this.getCachedImage(objImage, intX, intY, intWidth, intHeight, intOffsetX, intOffsetY, intTargetWidth, intTargetHeight);
		if (objResultImage == null)
		{
			//draw image simply
			this.drawImage(objImage, intX, intY, intWidth, intHeight, intOffsetX, intOffsetY);
			
			objResultImage = this.getCanvasContentAsImage();
			this.setCachedImage(objResultImage, objImage, intX, intY, intWidth, intHeight, intOffsetX, intOffsetY, intTargetWidth, intTargetHeight);
		}
		
	}
	else
	{
		// let the drawing function handle drawing into canvas
		// if the dimensions of canvas need to be changed, that can be done in the callbackDrawFunction
		callbackDrawFunction(this.objCanvas, this.objContext, objImage, intX, intY, intWidth, intHeight, intOffsetX, intOffsetY, intTargetWidth, intTargetHeight);
		objResultImage = this.getCanvasContentAsImage();
	}
	
	return objCanvas;
};


/**
 * Clear current canvas
 * 
 * @param {integer} intWidth
 * @param {integer} intHeight
 * 
 * @return {Image} objImage 
 */
OffscreenCanvasController.prototype.clearCanvas = function(intWidth, intHeight)
{
	this.objCanvas.width = intWidth;
	this.objCanvas.height = intHeight;
	this.objContext.clearRect(0, 0, intWidth, intHeight);
};

/**
 * Draw sprite image into canvas
 * 
 * @param {Image} objImage the sprite image
 * @param {integer} intX - X position in the sprite image
 * @param {integer} intY - Y position in the sprite image
 * @param {integer} intWidth - width of sprite
 * @param {integer} intHeight - height of sprite
 * 
 * @return {Image} objImage 
 */
OffscreenCanvasController.prototype.drawImage = function(objImage, intX, intY, intWidth, intHeight, intOffsetX, intOffsetY)
{
	this.objContext.drawImage(objImage, intX, intY, intWidth, intHeight, intOffsetX, intOffsetY, intWidth, intHeight);
};

/**
 * Retrieve current canvas content as PNG Image object
 * 
 * @return {Image} objImage 
 */
OffscreenCanvasController.prototype.getCanvasContentAsImage = function()
{
	//create image from canvas
	var objImage = new Image();
	
	objImage.width = this.objCanvas.width;
	objImage.height = this.objCanvas.height;
	objContext.clearRect(0, 0, intWidth, intHeight);
	
	objImage.src = this.objCanvas.toDataURL(); //"image/png" should be default
	
	return objImage; 	
};


/**
 * Retrieve current canvas content as PNG Image object
 * 
 * @return {Image} objImage 
 */
OffscreenCanvasController.prototype.getCanvasContentAsImage = function()
{
	//create image from canvas
	var objImage = new Image();
	
	objImage.width = this.objCanvas.width;
	objImage.height = this.objCanvas.height;
	
	objImage.src = this.objCanvas.toDataURL(); //"image/png" should be default
	
	return objImage; 	
};

/**
 * store result image in cache
 *  
 * @param {Object} objResultImage
 * @param {Object} objImage
 * @param {number} intX
 * @param {number} intY
 * @param {number} intWidth
 * @param {number} intHeight
 */
OffscreenCanvasController.prototype.setCachedImage = function(objResultImage, objImage, intX, intY, intWidth, intHeight, intOffsetX, intOffsetY, intTargetWidth, intTargetHeight)
{
	var cacheItem = new Object();
	cacheItem.resultImage = objResultImage;
	cacheItem.sourceImage = objImage;
	cacheItem.x = intX;
	cacheItem.y = intY;
	cacheItem.w = intWidth;
	cacheItem.h = intHeight;
	cacheItem.ox = intOffsetX;
	cacheItem.oy = intOffsetY;
	cacheItem.tw = intTargetWidth;
	cacheItem.th = intTargetHeight;
	
	this.arrImageCache.push(cacheItem);
};

/**
 * Retrieve image from cache (Image or null)
 *  
 * @param {Object} objImage
 * @param {number} intX
 * @param {number} intY
 * @param {number} intWidth
 * @param {number} intHeight
 * 
 * @return {Image} or null 
 */
OffscreenCanvasController.prototype.getCachedImage = function(objImage, intX, intY, intWidth, intHeight, intOffsetX, intOffsetY, intTargetWidth, intTargetHeight)
{
	var objCachedItem = null;
	for (var i in this.arrImageCache) {
		objCachedItem = this.arrImageCache[i];
		if (objCachedItem.sourceImage.src == objCachedItem.src 
			&& objCachedItem.x == intX 
			&& objCachedItem.y == intY 
			&& objCachedItem.w == intWidth 
			&& objCachedItem.h == intHeight
			&& objCachedItem.ox == intOffsetX
			&& objCachedItem.oy == intOffsetY
			&& objCachedItem.tw == intTargetWidth
			&& objCachedItem.th == intTargetHeight
			)
		{
			return objCachedItem.resultImage;
		}
	}
	return null;
};
