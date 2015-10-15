/**
 * @author Javier.Ortega
 * 
 * This class will provide resources to the Gui layer
 */


/**
 * Constructor 
 */
function AssetsFactory()
{
    this.getResources = this.getResources.bind( this );
    this.update = this.update.bind( this );
    this.sendResources = this.sendResources.bind(this);
    this.finishUpdate = this.finishUpdate.bind (this);
    
	/**
     * The collection of loaded resources
     * @type {Array}
     */
	//this.arrLoadedResources = new Array();
		
    /**
     * This a reference to a callback
     * @type {Object}
     */	
	this.objCallBack;
	
	/**
     * Folder path
     * @type {String}
     */ 
	this.STR_RES_FOLDER =  "res";
	
    /**
     * Normal State
     * @type {String}
     */ 
    this.STR_STATE_NORMAL =  "strStateNormal";
    
    /**
     * Loading State
     * @type {String}
     */ 
    this.STR_STATE_LOADING =  "strStateNormal";
	
	/**
     * Reference to a loader controller to ask for the not loaded resources
     * @type {Object}
     */
    this.objLoaderController = new LoaderController(this.update, this.STR_RES_FOLDER);
	
    /**
     * This array contains the list of resources asked
     * @type {Array}
     */
	this.arrResources;
	
    /**
     * This array contains the list of resources asked
     * @type { String }
     */	
	this.strState = this.STR_STATE_NORMAL;
	
    /**
     * This is a flag to 
     * @type { Boolean }
     */
	this.blDataSpriteSheetLoaded = false;

    /**
     * Collection of sprites to be loaded from spriteSheets
     * 
     * @type { Array } 
     */	
	this.arrSpritesFromSpriteSheet;
	
    /**
     * This object controls the requests for the Sprite Controller 
     * @type { Object }
     */	
	this.objSpriteController;
	
	/**
     * It will be used to know if the fonts are initialized.
     * @type {Boolean}
     */
    this.blFontinitiazed = false;

    /**
     * Call back for loading screen resource updates
     */
}

/**
 * Derive AssetsFactory from our base type to provide inheritance
 */
Class.extend(Class, AssetsFactory);

AssetsFactory.arrAssetsFactoryQuee = [];

AssetsFactory.blInProcess = false;

/**
 * This method will check if the resources are already loaded
 * If part of them are not already loaded, it will ask to the Loader layer for new resources.
 * @param { Object } objCallBack
 * @param { Array } arrResources
 * @param { Array } arrAnimations Optional parameter to load animations
 */
AssetsFactory.prototype.getResources = function ( objCallBack, arrResources, arrAnimations )
{

    if (!AssetsFactory.blInProcess)
    {
        AssetsFactory.blInProcess = true;        
    }
    else
    {
        
        if (!this.blFontinitiazed)
        {
            arrResources.push("mapping.fonts");
            this.blFontinitiazed = true;
        }
        
        var objAssetsQueed = new Object();
        
        objAssetsQueed.objCallBack = objCallBack;
        objAssetsQueed.arrResources = arrResources;
        objAssetsQueed.arrAnimations = arrAnimations;
        objAssetsQueed.objAssets = this;
        
        AssetsFactory.arrAssetsFactoryQuee.push (objAssetsQueed);
        
        return;
    }

    var numberOfResources=0;
    if (arrResources)
    {
        numberOfResources += Number(arrResources.length);
    }
    if (arrAnimations)
    {
        numberOfResources += Number(arrAnimations.length);
    }

    var arrNewResources = [];
    //To remove the place holder from the arrResources
    for ( var i in arrResources )
    {
         if ( arrResources[i].search( "pixel" ) == -1 &&  arrResources[i].search( "txt" ) == -1)
         {
             arrNewResources.push(arrResources[i]);
         }
    }
    arrResources = arrNewResources;
    
    this.objCallBack = objCallBack;
    this.arrResources = arrResources;
    this.arrOriginalResources = arrResources;
    this.arrAnimations = arrAnimations;
    this.arrSpritesFromSpriteSheet = [];
    this.arrSpriteSheetImages = [];
    
    /*
     * We check if we have loaded the json files for the spritesheets 
     */
    if ( this.blDataSpriteSheetLoaded )
    {
        /*
         * Array of sprites to be loaded from spritesheets.
         * checkSprites appears to be turning a list of image url's
         * into an array of objects names by image name with the string property 
         * which is the name of the sprite sheet it is on.
         * Results go into arrList.
         * TODO rename methods and vars to be accurate as to function or purpose.
         * 
         * arrList appears to be a dictionary: 
         * KEY: image name VALUE: spritesheet contianer
         */
        var arrList = this.objSpriteController.checkSprites(arrResources);
        
        if (arrAnimations)
        {
           var arrList2 = this.objSpriteController.checkAnimationSprites(arrAnimations);
            
           for ( var j in arrList2)
           {
               arrList[j] = arrList2[j];
               arrResources.push(j);
           }
        }
        
        var newArray = [];
        
        
        var arrCheckAddedImages = [];
        
        /*
         * "To remove the sprites into spritesheets"
         * I thought the images were already IN the spritesheet and that 
         * we are supposed to be getting them out.
         */
        for ( var i = 0; i < arrResources.length ; i++ )
        {
            /*
             * "Adds the spritesheet image if it is needed"
             */
            // For each image that exists in the arrList dictionary
            if (arrList[arrResources[i]])
            {
            	// This appears to make a list of spritesheets that we will need,
            	// to get the images from later.
            	// Not sure why we have "arrCheckAddedImages" AND "newArray" 
                if (!arrCheckAddedImages[arrList[arrResources[i]]])
                {
                    arrCheckAddedImages[arrList[arrResources[i]]] = true;
                    newArray.push(arrList[arrResources[i]]);                                         
                }
                
                this.arrSpritesFromSpriteSheet.push(arrResources[i]);
                this.arrSpriteSheetImages.push (arrList[arrResources[i]]);
            }
            else
            {
                newArray.push(arrResources[i]);
            }
        }
        
        this.arrResources = newArray;
        
        //Check if all the images are loaded
        var arrListNotLoaded = new Array();        
        var blAllLoaded = true;        
        for ( var i in  this.arrResources )
    	{
    		if ( !( AssetsFactory.arrLoadedResources[ this.arrResources[i]] ) )
    		{
    			arrListNotLoaded.push(  this.arrResources[i] );
    			blAllLoaded = false;
    			
    			this.strState = this.STR_STATE_LOADING;
    		}
    	}
    	
    	
    	//Check if all the sprites from spritesheets are loaded
    	if (blAllLoaded)
    	{        
            for ( var i in  this.arrOriginalResources )
            {
                if ( !( AssetsFactory.arrLoadedResources[ this.arrOriginalResources[i]] ) )
                {
                    arrListNotLoaded.push(  arrList[this.arrOriginalResources[i]] );
                    blAllLoaded = false;
                    
                    this.strState = this.STR_STATE_LOADING;
                }
            }
        }
    	
    	if ( blAllLoaded )
    	{
    	    this.sendResources();
    	}
    	else
    	{
            this.objLoaderController.addList(arrListNotLoaded);
            this.objLoaderController.start();
    	}
    }
    else
    {
        AssetsFactory.blInProcess = false;     
        this.objCallBack = objCallBack;
        this.arrResources = arrResources;
        this.objSpriteController = new SpriteController(this);
    }
}

AssetsFactory.arrLoadedResources = new Array();

/**
 * This function will be called when all the json data for the spritesheets are loaded 
 */
AssetsFactory.prototype.dataSpritesLoaded = function ()
{
    this.blDataSpriteSheetLoaded = true;
    
    this.getResources (this.objCallBack, this.arrResources, this.arrAnimations);
}

/**
 * This function will update the current dictionary of the graphics with the last loaded graphics
 * @param {Array} arrList
 */
AssetsFactory.prototype.update = function ( arrList )
{
    
    this.arrList = arrList;
    
    //It Checks if we need to split sprites from the spritesheet
     
    if ( this.arrSpritesFromSpriteSheet && this.arrSpritesFromSpriteSheet.length > 0 )
    {
        //We wil build 1st an array with the images for the spritesheets
        var arrImages = [];
        //this.arrSpritesFromSpriteSheet
        for ( var i in this.arrSpriteSheetImages)
        {
            if ( this.arrSpriteSheetImages )
            {
                arrImages[ this.arrSpriteSheetImages[i] ] = (this.arrList [this.STR_RES_FOLDER + "/" +this.arrSpriteSheetImages[i]]);    
            }
        }
        
        //Ask to the SpriteController for the splitted sprites
        //var arrSprites = this.objSpriteController.getSprites (this.arrSpritesFromSpriteSheet , arrImages, this.finishUpdate);
        
        this.objSpriteController.getSprites (this.arrSpritesFromSpriteSheet , arrImages, this.finishUpdate);
       
        /*for (var i in arrSprites)
        {
            this.arrList [i] = arrSprites[i];
        }*/
        
    }
    else
    {
        this.objSpriteController.callBack = null;
        this.finishUpdate();
    }
}

/**
 * This will finish the update, adding the sprite from the spritesheets if this is neededs
 *  
 * @param { Array } arrSprites The collection of sprites
 */
AssetsFactory.prototype.finishUpdate = function ( arrSprites )
{
    if (arrSprites)
    {
        for (var i in arrSprites)
        {
            this.arrList [i] = arrSprites[i];
        }
    }   
    
    var strId;    
    
    //To update the current loaded assets list
    for ( var i in this.arrList )
    {
        strId = i.replace(this.STR_RES_FOLDER + "/", "");
        if ( !( AssetsFactory.arrLoadedResources[ strId ] ) )
        {
            AssetsFactory.arrLoadedResources[strId] = this.arrList[i];
        }
    }

    this.sendResources();
} 

/**
 * This callback will process the elements when all the list is loaded
 * @param {Array} arrList
 */
AssetsFactory.prototype.sendResources = function ( )
{
    this.strState = this.STR_STATE_NORMAL;
    
    //To prepare the full list = the resource have just been loaded + the ones already we have it.    
    var arrLoadedResources = new Array ();
    
    for ( var i in  this.arrOriginalResources )
    {
        if ( ( AssetsFactory.arrLoadedResources[this.arrOriginalResources[i]] ) )
        {
            if (AssetsFactory.arrLoadedResources[this.arrOriginalResources[i]].strType == "ImageSprite")
            {
                arrLoadedResources[this.arrOriginalResources[i]] = AssetsFactory.arrLoadedResources[this.arrOriginalResources[i]].clone();
                arrLoadedResources[this.arrOriginalResources[i]].strId = this.arrOriginalResources[i];
            }
            else
            {
                arrLoadedResources[this.arrOriginalResources[i]] = AssetsFactory.arrLoadedResources[this.arrOriginalResources[i]];
            }
        }
        else
        {
            if ( this.arrOriginalResources[i].split(".")[1] == "png" ||  this.arrOriginalResources[i].split(".")[1] == "jpg")
            {
                throw  ("Unexpected unloaded Image:  " + this.arrOriginalResources[i] );
            }
        }
    }
    
    AssetsFactory.blInProcess = false;

    if (this.objCallBack)
    {
	    LoadingScreenController.updateLoadingValues (LoadingScreenController.LOADED, 1);

        this.objCallBack(arrLoadedResources);
    }
    
    if (AssetsFactory.arrAssetsFactoryQuee && AssetsFactory.arrAssetsFactoryQuee.length > 0)
    {    
        var objCurrentAssetsFactory = AssetsFactory.arrAssetsFactoryQuee.pop();
        objCurrentAssetsFactory.objAssets.getResources(objCurrentAssetsFactory.objCallBack, objCurrentAssetsFactory.arrResources, objCurrentAssetsFactory.arrAnimations);
    }


}

