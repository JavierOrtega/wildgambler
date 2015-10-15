(function(window)
{
	/**
	 * @var {SpriteController} sprite controller singleton instance 
	 */
	var objSpriteControllerInstance = null; 
	
	/**
	 * Constructor
	 * 
	 * @param {AssetFactory} objAssetFactory
	 */
	function SpriteController(objAssetFactory)
	{
		this.objAssetFactory = objAssetFactory;
		this.objOffscreenCanvas = new OffscreenCanvasController();
	
		this.arrAllSpritesheetFiles = null; //will contain JSON file with list of JSON files with pristesheet definitions 
		this.arrAllSprites = []; //associative cumulative array with sprite data (data from all the files)
		
		this.intImagesLoadedSoFar = 0; //number of images that were loaded
		
		this.arrImagesToLoad = []; //filled with URLs of images to load (JPG, PNG ...)
		this.arrImagesLoaded = []; //loaded spritesheets - instancece of Image class; all Image objects will be deleted after sprites are created
		
		this.arrSpriteImages = []; //associative array, list of Image objects containing each sprite generated from spritesheet using OffscreenCanvas

		this.blLoaded = false; //true when all the sprite data loaded
		
		this.init();
	};
	
	Class.extend(Class, SpriteController);
	
	//constants
	SpriteController.STR_JSON_ALL_SPRITESHEETS_PATH = "../res/test/texture-test/";
	SpriteController.STR_JSON_ALL_SPRITESHEETS = SpriteController.STR_JSON_ALL_SPRITESHEETS_PATH + "all-textures.json";
	
	/**
	 * Retrieve singleton instance of SpriteController
	 * 
	 * @param {AssetFactory} objAssetFactory
	 */
	SpriteController.getInstance = function(objAssetFactory)
	{
		if (objSpriteControllerInstance == null)
		{
			//create it
			objSpriteControllerInstance = new SpriteController(objAssetFactory);
		}
		else
		{
			//set asset factory
			objSpriteControllerInstance.objAssetFactory = objAssetFactory;
		}
		return objSpriteControllerInstance;
		
	}
	
	/**
	 * Initialise
	 * Will Load JSON file with list of all JSON files with spritesheet definitions
	 * Then it will start loading each JSON file 
	 */
	SpriteController.prototype.init = function()
	{
		var that = this;
		var objLataLoader = new LoaderData(SpriteController.STR_JSON_ALL_SPRITESHEETS);
		objLataLoader.callBack = function(arrSpritesheets)
			{
				that.loadAllSpritesheetFiles(arrSpritesheets);
			};
		objLataLoader.load();
		
		/*
		var that = this;
		this.objAssetManager.getResources(function(arrLoadedResources) {
			console.log(SpriteController.STR_JSON_ALL_SPRITESHEETS + " were loaded", arrLoadedResources);
		}, [ SpriteController.STR_JSON_ALL_SPRITESHEETS ]);
		*/
	}
	
	/**
	 * Start loading all spritesheets
	 * JSON with list of all spritesheets has been loaded, start loading all JSON files with Sprite data (exported JSONs from TexturePacker) 
	 */
	SpriteController.prototype.loadAllSpritesheetFiles = function(arrSpritesheets)
	{
		//console.log("all files", arrSpritesheets);
		this.arrAllSpritesheetFiles = arrSpritesheets;

		var that = this;
		var intLoadedSoFar = 0;

		//load each JSON file specified in allTextures.json
		for (var i in this.arrAllSpritesheetFiles)
		{
			//get file name
			var strFileName = this.arrAllSpritesheetFiles[i];
			
			//setup loader
			var objLoader = new LoaderData(SpriteController.STR_JSON_ALL_SPRITESHEETS_PATH + strFileName);
			
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
		
		this.arrImagesToLoad.push(strImageUrl);
		
		for (var strSpriteName in objData.frames) {
			//get sprite data
			var spriteData = objData.frames[strSpriteName];
			
			//add URL for image into every sprite
			spriteData.imageUrl = strImageUrl;
			
			//add into cumulative associative array
			this.arrAllSprites[strSpriteName] = spriteData;
		}
	}
	
	/**
	 * All Spritesheet JSON files are loaded
	 * - time to load all images 
	 */
	SpriteController.prototype.onAllSpritesheetsLoaded = function()
	{
		//load images
		this.loadAllImages();
	}

	/**
	 * Load all images with sprites 
	 */
	SpriteController.prototype.loadAllImages = function()
	{
		this.intImagesLoadedSoFar = 0;
		var that = this;
		
		for (var i in this.arrImagesToLoad)
		{
			var strImageName = this.arrImagesToLoad[i];
			
			var onLoadCallback = function() {
				that.intImagesLoadedSoFar++;
				if (that.intImagesLoadedSoFar >= that.arrImagesToLoad.length)
				{
					return true;
				}
				return false;
			};
			this.loadImage(strImageName, onLoadCallback);
		}
	}
	
	/**
	 * Load image
	 * 
 	 * @param {String} strImageName
 	 * @param {Function} onLoadCallback - expected to return boolean - true when ALL images are loaded 
	 */
	SpriteController.prototype.loadImage = function(strImageName, onLoadCallback)
	{
		var that = this;

		var loaderImage = new LoaderImage(SpriteController.STR_JSON_ALL_SPRITESHEETS_PATH + strImageName);
		loaderImage.callBack = function(objImage){
			that.arrImagesLoaded[strImageName] = objImage;
			
			if (onLoadCallback() == true)
			{
				//all loaded
				that.onAllImagesLoaded();
			}
		};
		loaderImage.load();
	}

	/**
	 * Prepare sprite images from spritesheets
	 * 
	 * Everything is loaded at the moment, it's time to process sprites and create instances of Image class
	 * for each of them using OffscreenCanvas
	 *  
	 */	
	SpriteController.prototype.onAllImagesLoaded = function ()
	{
		//console.log(this.arrImagesLoaded);
		
		//generate sprite images for all sprites
//		document.body.innerHTML = "";
		for (var strSpriteName in this.arrAllSprites)
		{
			var objSpriteData = this.arrAllSprites[strSpriteName];
			
			var objOriginalImage = this.arrImagesLoaded[objSpriteData.imageUrl];
			var objNewImage = this.objOffscreenCanvas.generateImage(
								objOriginalImage,
								//data to cut from spritesheet
								objSpriteData.frame.x, objSpriteData.frame.y, objSpriteData.frame.w, objSpriteData.frame.h,
								//data to draw the sprite
								objSpriteData.spriteSourceSize.x, objSpriteData.spriteSourceSize.y, objSpriteData.sourceSize.w, objSpriteData.sourceSize.h
							);
			/*
			objNewImage.style.border = "1px dashed red";
			document.body.appendChild(objNewImage);
			alert("click to continue: from (" + objSpriteData.frame.w + ", " + objSpriteData.frame.h + ") to (" + objSpriteData.sourceSize.w + ", " + objSpriteData.sourceSize.h + ")");
			*/
			
//			console.log(objNewImage);
		}
		
		//set images in AssetFactory
		
		//free memory (delete original Image)
		
		this.blLoaded = true;
	}
	
	SpriteController.prototype.isSpritesheetsLoaded = function()
	{
		return this.blLoaded;
	}
	
	SpriteController.prototype.isInSpritesheet = function(strName)
	{
		if (this.arrAllSprites[strName] != undefined)
		{
			return true;
		}
		return false;
	}
	
	SpriteController.prototype.getSprite = function(strName)
	{
		return this.arrAllSprites[strName];
	}
	
	SpriteController.prototype.addTexture = function(objJsonSpritesheetData)
	{
		var objSpritesheetData = new Object();
		objSpritesheetData.imageUrl = objJsonTextureData.meta.image;
		
		var objImageSpritesheet = new Image();
		objImageSpritesheet.src = objSpritesheetData.imageUrl;
		
		for (var strFileName in objJsonSpritesheetData.frames)
		{
			var objFrameInfo = objJsonSpritesheetData.frames[strFileName];
			var objImage = this.objOffscreenCanvas.generateImage(objImageSpritesheet, objFrameInfo.frame.x, objFrameInfo.frame.y, objFrameInfo.frame.w, objFrameInfo.frame.h, objFrameInfo.spriteSourceSize.x, objFrameInfo.spriteSourceSize.y, objFrameInfo.sourceSize.w, objFrameInfo.sourceSize.h);
			//todo: create sprite for image, finish this method
		}
		
	};
	
	window.SpriteController = SpriteController;
}(window));
//todo getSprite(urlName)
