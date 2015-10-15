/**
 * @author Javier.Ortega
 * 
 * This class contains all the necessary functionality to load a binary file
 */

/**
 * Constructor
 * @param {String} strSrc The string for the source 
 */

function LoaderData(strSrc)
{
    /**
     * DO NOT CHANGE THE NAME OF THIS
     * without searching the entire codebase for all the dirty hacks that
     * refer to it directly - mostly in the earlier classes thrown together
     * early on in the life of Wild Gambler.
     */
	this.callBack = null;
	
	this.strSrc = strSrc;
	
	//Bind the different functions
	this.load = this.load.bind(this);
	this.setCallback = this.setCallback.bind(this);
	this.handleDataLoaded  = this.handleDataLoaded.bind(this);
	this.serverErrorHandler  = this.load.bind(this);
}

Class.extend(Loader, LoaderData); 

/**
 * To load a data file
 */
LoaderData.prototype.load = function ()
{
	this.objRequest = new Comm();
	this.objRequest.setHandlerErr(this.serverErrorHandler);
	this.objRequest.setHandlerTime( this.commsTimeoutHandler, 35000);
	this.objRequest.doGet(this.strSrc, this.handleDataLoaded, 'text');    
}


/**
 * To load a data file
 * @param {String} strError The error
 */
LoaderData.prototype.serverErrorHandler = function ( strError )
{
	//this.objRequest.abort();
	alert("Communication timeout....\n\nPlease check your connectivity\nor try later.");
}

/**
 * To load a data file
 * @param {String} strUrl URl that failed to load
 */
LoaderData.prototype.commsTimeoutHandler = function ( strUrl )
{
	alert("Communication error...\n\nPlease check your connectivity\nor try later.\n\n" + strUrl);
}

/**
 * To load a data file
 * @param {String} strData The binary data
 */
LoaderData.prototype.handleDataLoaded = function ( strData )
{
    var objReturned;
    
    // trying to support empty json files and empty json strings by providing an empty object instead of JSON.parse'ing it.
    if(strData == "")
    {
        objReturned = {};
    }
    else
    {
        objReturned = JSON.parse (strData);
    }
    
	this.callBack( objReturned, this.strSrc );
}

LoaderData.prototype.setCallback = function (fnFunc)
{
    this.callBack = fnFunc;
}

