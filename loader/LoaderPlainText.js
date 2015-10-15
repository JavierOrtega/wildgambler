/**
 * @author Javier.Ortega
 * 
 * This class contains all the necessary functionality to load a binary file
 */

/**
 * Constructor
 * @param {String} strSrc The string for the source 
 */

function LoaderPlainText(strSrc)
{   

    this.strSrc = strSrc;
    
    this.callBack = null;
    
    //Bind the different functions
    this.load = this.load.bind(this);
    this.setCallback = this.setCallback.bind(this);
    this.handleDataLoaded  = this.handleDataLoaded.bind(this);
    this.serverErrorHandler  = this.load.bind(this);
}

Class.extend(LoaderData, LoaderPlainText); 

/**
 * To load a data file
 * @param {String} strData The binary data
 */
LoaderPlainText.prototype.handleDataLoaded = function ( strData )
{
    this.callBack( strData, this.strSrc );
}

