/**
 * @author Javier.Ortega, Petr Urban
 * 
 * This class contains all the necesary functionality to load an Image
 */


/**
 * Constructor
 * @param {String} strSrc The string for the source 
 */

function LoaderImage(strSrc)
{
	this.strSrc = strSrc;
	this.callBack = null;
}

Class.extend(Loader, LoaderImage); 


/**
 * To load an image.
 */
LoaderImage.prototype.load = function ()
{
	var that = this;
	this.objImage = new Image();
		
		
	this.objImage.onload = function() 
	{
		that.callBack(this, that.strSrc );
	};
	
	this.objImage.onerror = function() 
	{
		//that.handleError ( "error loading image: " + that.strSrc );
		alert ("Error:" + that.strSrc);
		that.callBack( this, that.strSrc );
		
	};
	
	
	this.objImage.src = this.strSrc;
}
//We are not binding this function, since we need the reference to this == Image Instance in the listeners
