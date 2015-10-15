/**
 * @author Javier.Ortega, Petr Urban
 * 
 * This class will contain the common functionality to all the loaders
 */

/**
 * Constructor
 * @param {String} strSrc The string for the source 
 */
function Loader()
{
  // --
  //Binding the necessary methods
  
  this.handleError = this.handleError.bind(this);	
  this.showAlert = this.showAlert.bind(this);
  this.load = this.load.bind(this);
}

/**
 * Derive Loader from our base type to provide inheritance
 */ 
Class.extend(Class, Loader);

Loader.prototype.load = function()
{
	// I.E. 9 throws errors with this console call (alert works fine) 
	//console.log("Loader.load is called");
}  

/**
 * To handle an error
 * @param {String} strMessage The string for the error message
 */
Loader.prototype.handleError = function  ( strMessage )
{
	// Do some stuff.
	// ...
	// If required, show an alert
	this.showAlert(strMessage);
}

Loader.prototype.showAlert = function ( strMessage )
{
	alert(strMessage);
}

/**
 * To make a callback when the resource is loaded
 * @param {Object} objResource The object loaded
 * @param {String} objResource name
 */
Loader.prototype.callBack = function ( objResource, strName )
{
	//TO DO
	// To overwrite in the implementation	
	throw ("callBack function for the class Loader not implemented");
}  
