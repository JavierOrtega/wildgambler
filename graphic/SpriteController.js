/**
 * Constructor
 * 
 * @param {AssetFactory} objAssetFactory
 */
function SpriteController(objAssetFactory)
{
    //Bind these functions
    this.nextSprite = this.nextSprite.bind(this);    
    this.startGetSprites = this.startGetSprites.bind(this);
    
	this.objAssetFactory = objAssetFactory;
	
	this.arrAllSpritesheetFiles = null; //will contain JSON file with list of JSON files with pristesheet definitions
	
	if ( !SpriteController.arrAllSprites )
	{ 
	   SpriteController.arrAllSprites = []; //associative cumulative array with sprite data (data from all the files)
	}
	
	this.arrImagesLoaded = []; //loaded spritesheets - instancece of Image class; all Image objects will be deleted after sprites are created
	
	this.arrSpriteImages = []; //associative array, list of Image objects containing each sprite generated from spritesheet using OffscreenCanvas

	this.blLoaded = false; //true when all the sprite data loaded
	
	this.init();
	
	/**
	 * The current requested sprites	 
	 * 
	 * @type { Array }  
	 */
	this.arrSprites;
	

    
    /**
     * The current response for the current request     
     * 
     * @type { Array }  
     */
    this.arrReturnImages; 
    
    /**
     * The necessary images for the current Sprites     
     * 
     * @type { Array }  
     */
    if (!SpriteController.arrSpriteSheets)
    {
        SpriteController.arrSpriteSheets = [];
    }
    
    this.objLocalStorage;
    this.strGraphicsVersion;
}

Class.extend(Class, SpriteController);



//constants
SpriteController.STR_JSON_ALL_SPRITESHEETS = "all-textures.json";

/**
 * Initialise
 * Will Load JSON file with list of all JSON files with spritesheet definitions
 * Then it will start loading each JSON file 
 */
SpriteController.prototype.init = function()
{
    this.objLocalStorage = LocalStorage.getInstance();
    this.strGraphicsVersion = (window.VERSION_GRAPHICS != undefined) ? window.VERSION_GRAPHICS : null;
    
	var strKeyGraphicsVersion = "graphics_version";
	if (this.strGraphicsVersion != null && this.objLocalStorage.getItem(strKeyGraphicsVersion) != this.strGraphicsVersion)
	{
		//console.log("LocalStorage: Version of graphics has been changed. Clearing local storage.");
		this.objLocalStorage.clear();
		this.objLocalStorage.setItem(strKeyGraphicsVersion, this.strGraphicsVersion);
	}
	
	//To load different resources for different combination of mobiles/browsers
    SpriteController.STR_JSON_ALL_SPRITESHEETS = "all-textures.json";    
            
    if (DeviceModel.strAssets == "low")
    {
        SpriteController.STR_JSON_ALL_SPRITESHEETS = "low/all-textures.json";
                    
        LoadingScreenController.EXPECTED_ASSET_COUNT = 287;
    }
	
	var that = this;
	var objLataLoader = new LoaderData("res/" + SpriteController.STR_JSON_ALL_SPRITESHEETS);
	objLataLoader.callBack = function(arrSpritesheets)
		{
			that.loadAllSpritesheetFiles(arrSpritesheets);
		};
	objLataLoader.load();
}

/**
 * Start loading all spritesheets
 * JSON with list of all spritesheets has been loaded, start loading all JSON files with Sprite data (exported JSONs from TexturePacker) 
 */
SpriteController.prototype.loadAllSpritesheetFiles = function(arrSpritesheets)
{
	//console.log("all files", arrSpritesheets);
	this.arrAllSpritesheetFiles = arrSpritesheets.files;

	var that = this;
	var intLoadedSoFar = 0;

	//load each JSON file specified in allTextures.json
	for (var i in this.arrAllSpritesheetFiles)
	{
		//get file name
		var strFileName = this.arrAllSpritesheetFiles[i].nameFile;
		
		//setup loader
		var objLoader = new LoaderData("res/" + strFileName);
		
		objLoader.callBack = function(objSpritesheetData)
		{
			that.processSpritesheetData(objSpritesheetData);
			intLoadedSoFar++;
			
			//when all loaded
			if (intLoadedSoFar >= that.arrAllSpritesheetFiles.length)
			{
				that.onAllSpritesheetsLoaded();
			}
		}
		objLoader.load();
	}
}

/**
 * Process spritesheet data of the JSON file (export from TexturePacker)
 * This will assign all sprites from JSON definitions into cumulative associative array 
 * 
 * @param {Object} objData
 */
SpriteController.prototype.processSpritesheetData = function(objData)
{
	//this is source image
	var strImageUrl = objData.meta.image;
	
	for (var strSpriteName in objData.frames) {
		//get sprite data
		var spriteData = objData.frames[strSpriteName];
		
		//add URL for image into every sprite
		spriteData.imageUrl = strImageUrl;
		
		//add into cumulative associative array
		SpriteController.arrAllSprites[strSpriteName] = spriteData;
	}
}

/**
 * All Spritesheet JSON files are loaded
 * - time to load all images 
 */
SpriteController.prototype.onAllSpritesheetsLoaded = function()
{
	this.objAssetFactory.dataSpritesLoaded();
}

/**
 *
 * This function will look for the necessary spritesheets to be loaded 
 * 
 * @param { Array } arrSprites The sprites to be loaded 
 * @return {Array} a collection of spritesheets to be loaded 
 */
SpriteController.prototype.checkSprites = function (arrSprites)
{
    var arrImages = [];
    
    for ( var i = 0 ; i < arrSprites.length ; i++ )
    {
        if ( !this.arrSpriteImages[arrSprites[i]] )
        {
            //If the sprite is not loaded, look for the spritesheet to be loaded
            if ( SpriteController.arrAllSprites[arrSprites[i]] )
            {
                arrImages[arrSprites[i]] = SpriteController.arrAllSprites[arrSprites[i]].imageUrl ;
            }
        }
    }
    return arrImages;
}

/**
 * Look for all the possible sprites related with the animation
 * @param { Array } arrAnimation Array of posible animations 
 * @return { Array } The collection of sprites for the animation
 */
SpriteController.prototype.checkAnimationSprites = function ( arrAnimation )
{
    var blMoreSprites = true;
    var arrSprites = [];
    var strCurrentSpriteName = "";
    var intCount = 1;
    var strIndex = "";
    
    for ( var i in arrAnimation )
    {    
        strAnimation = arrAnimation[i];
        blMoreSprites = true;        
        intCount = 1;
        
        while ( blMoreSprites )
        {
            //Get the string index      
            strIndex = "" + intCount;
            while ( strIndex.length < 4 )
            {
                strIndex = "0" + strIndex;    
            }            
            
            //Get the string name
            strCurrentSpriteName = strAnimation + strIndex + ".png";
            
            if ( !SpriteController.arrAllSprites[strCurrentSpriteName] )
            {
                blMoreSprites = false;
            }
            else
            {
                arrSprites.push(strCurrentSpriteName);
            }
            intCount++;
        }
    }
    return (this.checkSprites(arrSprites));
}

/**
 *
 * This function will look the sprites and will return them to the main game 
 * 
 * @param { Array } arrSprites The sprites to be splitted
 * @param { Array } arrImages The image spritesheets
 *  
 */


SpriteController.prototype.getSprites = function(arrSprites, arrImages, callBack)
{
    for (var i in arrImages)
    {
        if (arrImages[i])
        {
            SpriteController.arrSpriteSheets[i] = arrImages[i];
        }
    }
    
    this.arrSprites = arrSprites;

    //if (DeviceModel.strPlatform == OS.ANDROID && DeviceModel.intVersion <= 2)
    if (DeviceModel.strPlatform == OS.IOS)
    {
        this.arrSprites = arrSprites;

        var arrReturnImages = [];
        for (var i in arrSprites )
        {
            var objSprite = SpriteController.arrAllSprites[arrSprites[i]];

            if (objSprite)
            {
                if (SpriteController.arrSplittedImages[arrSprites[i]])
                {

                    arrReturnImages[arrSprites[i]] = SpriteController.arrSplittedImages[arrSprites[i]];
                    LoadingScreenController.updateLoadingValues (LoadingScreenController.LOADED, 1);
                }
                else
                {
                    var spriteSheetImage = SpriteController.arrSpriteSheets[objSprite.imageUrl];
                    var objImage = this.createOfflineCanvas1(objSprite.frame.w, objSprite.frame.h, i);
                    var objContext = objImage.getContext('2d');

                    objContext.drawImage(spriteSheetImage, -objSprite.frame.x, -objSprite.frame.y)

                    var objImage2 = this.createOfflineCanvas2(objSprite.sourceSize.w, objSprite.sourceSize.h, i + "2");
                    var objContext2 = objImage2.getContext('2d');
                    objContext2.drawImage(objImage, objSprite.spriteSourceSize.x, objSprite.spriteSourceSize.y);

                    arrReturnImages[arrSprites[i]] = (objImage2);
                    SpriteController.arrSplittedImages[arrSprites[i]] = objImage2;
                    LoadingScreenController.updateLoadingValues (LoadingScreenController.LOADED, 1);
                }
            }
            else
            {
                console.log("Sprite not in the spritesheet" + arrSprites[i]);
            }
        }
        callBack(arrReturnImages);
    }
    else
    {
        this.startGetSprites(callBack);
    }
}


/**
 *
 *  
 */
SpriteController.prototype.startGetSprites = function(callBack)
{
    this.callBack = callBack;
    this.arrReturnImages = [];
    this.intCurrentSprite = 0;
    
    this.nextSprite();
}

/**
 * To start to load the next sprite
 * 
 * @param { integer } The current sprite index
 */
SpriteController.prototype.nextSprite = function()
{
    var objSprite = SpriteController.arrAllSprites[this.arrSprites[this.intCurrentSprite]] ;
    
    if (this.intCurrentSprite >= this.arrSprites.length)
    {
        this.callBack(this.arrReturnImages);
        return;
    }
    
    if (objSprite)
    {   
        if (SpriteController.arrSplittedImages[this.arrSprites[this.intCurrentSprite]])
        {
            this.arrReturnImages[this.arrSprites[this.intCurrentSprite]] = SpriteController.arrSplittedImages[this.arrSprites[this.intCurrentSprite]];
            
            LoadingScreenController.updateLoadingValues (LoadingScreenController.LOADED, 1);
            this.intCurrentSprite++;
            //console.log (this.intCurrentSprite);
            
            //this.nextSprite(); //this will result into very long call stack and because call stack is limited in Javascript to cca 300 calls, this can result into game not loading at all
            setTimeout(this.nextSprite, 0);
        }
        else
        {
        	/*var strLocalStorageImagePrefix = "img_";
        	
    		//create that image and add it to the local storage
            var spriteSheetImage = SpriteController.arrSpriteSheets[objSprite.imageUrl];

            var objImage2 = this.createOfflineCanvas2(objSprite.sourceSize.w, objSprite.sourceSize.h, this.intCurrentSprite + "2");
            var objContext2 = objImage2.getContext('2d');
            //objContext2.drawImage(objImage, objSprite.spriteSourceSize.x, objSprite.spriteSourceSize.y);
            objContext2.drawImage(spriteSheetImage,objSprite.frame.x, objSprite.frame.y, objSprite.frame.w, objSprite.frame.h,objSprite.spriteSourceSize.x, objSprite.spriteSourceSize.y, objSprite.frame.w, objSprite.frame.h);
            
            var objImage3 = new Image();
            objImage3.width = objImage2.width;
            objImage3.height = objImage2.height;
            
            var that = this;
            
            //var finish = function()
            objImage3.onload = function()
            {
                that.nextSprite();
            };

            objImage3.src = objImage2.toDataURL("image/png")           
           
            //setTimeout(finish, 8);

            this.arrReturnImages[this.arrSprites[this.intCurrentSprite]] = (objImage3);
            SpriteController.arrSplittedImages[this.arrSprites[this.intCurrentSprite]] = objImage3;*/
           
           
            var strLocalStorageImagePrefix = "img_";
            
            //create that image and add it to the local storage
            var spriteSheetImage = SpriteController.arrSpriteSheets[objSprite.imageUrl];

            //objImag, intSrcX, intSrcY, intSrcW, intSrcH
            var objSpriteImage = new ImageSprite(spriteSheetImage,objSprite.frame.x, objSprite.frame.y, objSprite.frame.w, objSprite.frame.h, objSprite.spriteSourceSize.x, objSprite.spriteSourceSize.y,objSprite.sourceSize.w, objSprite.sourceSize.h);
            
            this.arrReturnImages[this.arrSprites[this.intCurrentSprite]] = (objSpriteImage);
            SpriteController.arrSplittedImages[this.arrSprites[this.intCurrentSprite]] = objSpriteImage;
            
            this.nextSprite();
        }
    }
    else
    {
        this.intCurrentSprite++;
    }
    
}; 



SpriteController.arrSplittedImages = new Array();

var objCanvas1; 
    
/**
 * To create an offline canvas, in this case we will use it as a virtual image
 *
 * @param { Integer } intWidth The width canvas
 * @param { Integer } intHeight The height canvas
 * @param { String } strId The id for this canvas
 */
SpriteController.prototype.createOfflineCanvas1 = function( intWidth, intHeight, strId)
{
    if (!objCanvas1)
    {
        objCanvas1 = document.createElement('canvas');
    }
    
    objCanvas1.getContext('2d').clearRect(0,0,objCanvas1.width, objCanvas1.height);
    objCanvas1.width = intWidth;
    objCanvas1.height = intHeight;
    
    return objCanvas1;
}

var objCanvas2; 
    
/**
 * To create an offline canvas, in this case we will use it as a virtual image
 *
 * @param { Integer } intWidth The width canvas
 * @param { Integer } intHeight The height canvas
 * @param { String } strId The id for this canvas
 */
SpriteController.prototype.createOfflineCanvas2 = function( intWidth, intHeight, strId)
{
    //if (!objCanvas2 || (DeviceModel.strPlatform == OS.ANDROID && DeviceModel.intVersion <= 2) )
    if (!objCanvas2 || DeviceModel.strPlatform == OS.IOS)
    {
        objCanvas2 = document.createElement('canvas');
    }
    
    objCanvas2.getContext('2d').clearRect(0,0,objCanvas2.width, objCanvas2.height);
    objCanvas2.width = intWidth;
    objCanvas2.height = intHeight;
    
    return objCanvas2;
}
