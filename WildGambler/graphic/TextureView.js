/**
 * @param { String } strName
 */
function TextureView( strName )
{
    this.strIdButton = strName;
	this.newElement();
	
	this.strState = ''; //we don't know yet'
	
}

Class.extend(ElementView,TextureView);

/**
 * This will draw a texture
 * 
 * @param {integer} intX Coordinate where to draw the texture
 * @param {integer} intY Coordinate where to draw the texture
 * 
 */
TextureView.prototype.setScaleHeight = function (intX, intY, intWidth, intHeight, objtImage)
{
    this.objtImage = objtImage;
    this.intX = intX;
    this.intY = intY;
    this.intWidth = intWidth;
    this.intHeight = intHeight;
}

/**
 * This will draw a texture
 * 
 * @param {integer} intX Coordinate where to draw the texture
 * @param {integer} intY Coordinate where to draw the texture
 * 
 */
TextureView.prototype.setTexture = function (intX, intY, intWidth, intHeight, objtImage)
{
    this.objtImage = objtImage;
    this.intX = intX;
    this.intY = intY;
    this.intWidth = intWidth;
    this.intHeight = intHeight;    
}

/**
 * Draw  the texture 
 */
TextureView.prototype.draw = function ()
{
    var intCurrentX = this.intX;;
   
    // TO DO, just now it is only a horizontal texture to change this in the future 
    while (intCurrentX <= this.intWidth )
    {
        this.objtImage.intX = intCurrentX;
        this.objtImage.draw(0,0);        
        intCurrentX += this.objtImage.intWidth;
    }
}
