/**
 *  
 */
function DetectScaling()
{
	this.aspectRatio = 0;
	this.devicePixelRatio = 0;

	this.screenWidth = 0;
	this.screenHeight = 0;
	
	this.windowWidth = 0;
	this.windowHeight = 0;

	this.detectWidthAndHeight = this.detectWidthAndHeight.bind(this);
	this.detectAll = this.detectAll.bind(this);
	this.isAppleWidescreen = this.isAppleWidescreen.bind(this);
	
	this.pollOrientation = this.pollOrientation.bind(this);
	this.orientation;
	
	
	//
	//this.detectAll();
}
Class.extend(Class, DetectScaling);

/**
 *  
 */
DetectScaling.prototype.pollOrientation = function ( callbackFunc )
{
	var orientation = "";
	
	// Nothing has changed
	
	/*if( this.windowWidth == window.innerWidth && this.windowHeight == window.innerHeight )
	{
		return;
	}
	else
	{
		if( window.innerWidth > window.innerHeight )
		{
			orientation = "landscape";
		}
		else
		{
			orientation = "portrait";
		}
		//TO DO
		//To discuss with Mark this change
		this.detectAll();
		
		callbackFunc();
	}
	
	//
	if( this.orientation != orientation )
	{
		this.detectAll();
		
		callbackFunc();
	}*/

    if( this.windowWidth == window.innerWidth && this.windowHeight == window.innerHeight )
    {
        callbackFunc();
    }
        
    this.detectAll();
}


/**
 * 
 */
DetectScaling.prototype.detectWidthAndHeight = function()
{
	this.screenWidth = Number(screen.width);
	this.screenHeight = Number(screen.height);

	//	Do window.innerWidth && window.innerHeight always exist??
	if( window.innerWidth && window.innerHeight )
	{
		this.windowWidth = window.innerWidth;
		this.windowHeight = window.innerHeight;
	
		if( this.windowWidth > this.windowHeight )
		{
			this.orientation = "landscape";
		}
		else
		{
			this.orientation = "portrait";
		}
	}
}

/**
 *  
 */
DetectScaling.prototype.detectAll = function()
{
	this.detectWidthAndHeight();
	
	// devicePixelRatio
    this.devicePixelRatio = 1;
  
	if (window.devicePixelRatio)
	{
		this.devicePixelRatio = window.devicePixelRatio;
	}	
}

/**
 *  
 */
DetectScaling.prototype.isAppleWidescreen = function( device )
{
	if( device == DEVICES.IPHONE || device == DEVICES.IPOD )
	{
		if( this.screenWidth * this.devicePixelRatio > 1000 || this.screenHeight * this.devicePixelRatio > 1000 )
		{
			return true;
		}
	}
	
	return false;
}
