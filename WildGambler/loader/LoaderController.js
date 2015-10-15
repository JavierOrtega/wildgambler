/**
 * @author Javier.Ortega
 * 
 * This class will handle a queue for all the current loads process
 */

/**
 * Constructor
 * @param {Function} fncCallBack A reference to
 * @param {String} strUrl The base url where the resources are located  
 */

function LoaderController( fncCallBack, strUrl )
{	
	/**
     * The collection of loaders
     * @type {Array}
     */
	this.arrLoaders = new Array();
	
	/**
     * The collection of loaded resources
     * @type {Array}
     */
	this.arrResources = new Array();
	
	/**
     * The number of the loaded resources
     * @type {integer}
     */
	this.intLoadedResources = 0;

	/**
     * This function will be called when all the resources all loaded
     * @type {Function}
     */	
	this.callBack = fncCallBack;
	
	/**
     * This is the current queue of the resources to be loaded
     * @type {Array}
     */		
	this.arrQueue = new Array();

	/**
     * The base url where the resources are located without "/" in the end 
     * @type {String}
     */			
	this.strUrl = strUrl;
	
	//Bind the functions	
	this.load = this.load.bind( this );
	this.addList = this.addList.bind( this );
	this.start = this.start.bind( this );
	this.progress = this.progress.bind( this );		
}

/**
 * Derive Loader from our base type to provide inheritance
 */ 
Class.extend(Class, LoaderController);


LoaderController.cachedImages = [];

/**
 * To load a resource
 * @param {String} strResource The resource to be loaded 
 */
LoaderController.prototype.load = function ( strResource )
{
	var strParts = strResource.split (".") ;
	
	if (LoaderController.cachedImages[strResource])
	{
	    console.log("Cached:" + strResource);
        this.progress (LoaderController.cachedImages[strResource], this.strUrl+ "/" + strResource);
	}
	
	
	if ( strParts.length < 2 )
	{
		throw ("The resource " + strResource + " can not be processed, because if it is not possible to find the extension");
		return;
	}
	
	strExtension = strParts[1];
	
	var objLoader;
	//Check the extension to know what loader is needed
	switch( strExtension )
	{
		case "png": case "jpg":
			objLoader = new LoaderImage( this.strUrl+ "/" + strResource );
			objLoader.callBack = this.progress;
			objLoader.load ();
		break;
		case "json":
			objLoader = new LoaderData( this.strUrl+ "/" + strResource );
			objLoader.setCallback(this.progress);
			objLoader.load ();
		break;
		
		case "fonts":
		    objLoader = new FontLoader( this.strUrl + "/" + Settings.langCode +"/" + strResource );
            objLoader.callBack = this.progress
            objLoader.load ()
		break;
	}
}

/**
 * To Add a list of resources to be loaded
 * 
 * @param {Array} arrQueue The list of resources to be loaded.
 */
LoaderController.prototype.addList = function ( arrQueue )
{
	this.arrQueue = arrQueue;
}

/**
 * To start the load process
 */
LoaderController.prototype.start = function ( )
{
    this.intLoadedResources = 0;
	if ( this.arrQueue.length >= 1 )
	{
		this.load (this.arrQueue[0]);
	}
}

/**
 * To Add a list of resources to be loaded
 * @param {String} objResource The list of resources to be loaded
 * @param {String} strResource The list of resources to be loaded
 */
LoaderController.prototype.progress = function  ( objResource , strResource )
{
    var arrPath = strResource.split (".");
    
    var strPathToCompare;
    
    var strStoreId = strResource.split (this.strUrl+ "/" ) ;
    
    //LoaderController.cachedImages[strStoreId[1]] = objResource;
    
    
    if (arrPath[arrPath.length-1] == "fonts" )
    {
        strPathToCompare = this.strUrl + "/" + Settings.langCode +"/" +this.arrQueue [this.intLoadedResources] 
    }
    else
    {
        strPathToCompare = this.strUrl +"/" +this.arrQueue [this.intLoadedResources]; 
    }
    
    if ( strPathToCompare == strResource )
    {
    	this.arrResources[ strResource ]  = objResource;	
    	this.intLoadedResources ++;
    	
    	if ( this.intLoadedResources >= this.arrQueue.length )
    	{
    		this.callBack ( this.arrResources );
    		return;
    	}
    	
    	this.load (this.arrQueue [ this.intLoadedResources ] );
    }
}
