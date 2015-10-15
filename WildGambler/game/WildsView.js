/**
 *
 * This class will contain the common functionality to all the Wilds
 */

/**
 * Constructor
 * @param {Object} objContext The context to draw the wilds.
 * @param {Object} objWildsSelector The Wilds Selector.
 */
function WildsView(objContext, objWildsSelector, objSoundController, objSpinController)
{
    // --
    //Binding the necessary methods
    this.animationFinished = this.animationFinished.bind(this);

    this.newElement();
    this.objContext = objContext;

    this.objWildsSelector = objWildsSelector;
    this.mainRun = this.mainRun.bind(this);

    /**
     * Object to handle all the animations
     * @type { Object }
     */
    this.objAnimationsWild;

    /**
     * Particle images
     * @type { Object }
     */
    this.objExplosionParticles;

    // sound
    this.objSoundController = objSoundController;

	/**
	 * @type {SpinController} 
	 */    
    this.objSpinController = objSpinController;

    /**
     * The different states to be drawn
     *
     *@type {int}
     */
    this.intState = WildsView.NORMAL;
    
    if ( DeviceModel.strAssets == "low" )
    {
        WildsView.BREAKING_ANIMATIONS = [[4, 18], [4, 18], [4, 18]];
        WildsView.CLOSING_ANIMATIONS = [0, 4];
    }

	/*
    var that = this;
    this.mainRunLoop = setInterval(function ()
    {
        that.mainRun();
    }, 30);
    */
	this.mainRun = this.mainRun.bind(this);
	MainLoop.getInstance().addItem(this.mainRun);

    /**
     * The callback to be calles when all the animation are finished
     *
     *@type{ function }  
     */
    this.objCallBack;
    
    /**
     * this lock icon to be drawn 
     */
    this.objLockImage;
    
    /**
     * @type {GameSettings} 
     */
    this.objGameSettings = GameSettings.getInstance();
    
    /**
     * Image used to darken the wild symbol when not highlighting win.
     */
    this.objWildOverlay;
    
    this.arrCages = [];
}

/**
 * Derive WildsView from our base type to provide inheritance
 */
Class.extend(ElementView, WildsView);

WildsView.NORMAL = 0;
WildsView.STARTING_LOCKING = 1;
WildsView.LOCKING = 2;
WildsView.STARTING_BREAKING = 3;
WildsView.BREAKING = 4;

WildsView.BREAKING_ANIMATIONS = [[7, 34], [36, 65], [67, 100]];
WildsView.CLOSING_ANIMATIONS = [0, 8];

/**
 * To check id all the animation are finished or not
 */
WildsView.prototype.animationFinished = function ()
{
    this.intNumberOfAnimations--;
    if (this.intNumberOfAnimations <= 0)
    {
        if (this.objCallBack)
        {
            this.objCallBack();
            this.intState = WildsView.NORMAL;
            this.objCallBack = null;
        }
    }
}

/**
 * Loop for the animations
 * 
 * @param {int} intTimeDiff [miliseconds] time change from last call
 * @param {int} intTime [miliseconds] currentTime
 */
WildsView.prototype.mainRun = function (intTimeDiff, intTime)
{
    switch (this.intState)
    {
        case WildsView.STARTING_LOCKING:
            
            // When we start locking, renew the tracker array
            this.arrCages = [];
            
        case WildsView.STARTING_BREAKING:
        
            this.intNumberOfAnimations = 0;

            for (var intX in this.objWildsSelector.arrWilds)
            {
                for (var intY in this.objWildsSelector.arrWilds[intX])
                {
                    if (this.objWildsSelector.arrWilds[intX][intY])
                    {
                        this.intOffsetX = (ReelSlotView.WIDTH / 2) - (this.objAnimationsWild.arrSprites[0].intWidth / 2);
                        this.intOffsetY = (ReelSlotView.HEIGHT / 2) - (this.objAnimationsWild.arrSprites[0].intHeight / 2);

                        this.objAnimationsWild.intX = ReelsController.INIT_X + intX * (ReelSlotView.WIDTH + ReelsController.GAP_X);
                        this.objAnimationsWild.intY = ReelsController.INIT_Y + intY * (ReelSlotView.HEIGHT + ReelsController.GAP_Y);

                        if (this.intState == WildsView.STARTING_LOCKING)
                        {
                            // Track the cages that have locked.
                            if(this.arrCages[intX] == null)
                            {
                                this.arrCages[intX] = [];
                            }
                            this.arrCages[intX][intY] = true;
                            
                            //
                            this.objAnimationsWild.startAnimation(this.animationFinished, WildsView.CLOSING_ANIMATIONS[0], WildsView.CLOSING_ANIMATIONS[1]);
                            
                            //
                            this.intNumberOfAnimations++;
                        }
                        else 
                        {
                            // Only start those which were previously locked.
                            if(this.arrCages[intX] && this.arrCages[intX][intY])
                            {
                                this.objAnimationsWild.startAnimation(this.animationFinished, WildsView.BREAKING_ANIMATIONS[0][0], WildsView.BREAKING_ANIMATIONS[0][1]);
                                this.addParticles(this.objAnimationsWild.intX, this.objAnimationsWild.intY);
                              
                                //
                                this.intNumberOfAnimations++;
                           }
                        }
                    }
                }
            }

            if (this.intNumberOfAnimations == 0)
            {
                if (this.objCallBack)
                {
                    this.objCallBack();
                    this.intState = WildsView.NORMAL;
                    this.objCallBack = null;
                }
            }

            if (this.intState == WildsView.STARTING_LOCKING)
            {
                this.intState = WildsView.LOCKING;
            }
            else if (this.intState == WildsView.STARTING_BREAKING)
            {
                this.intState = WildsView.BREAKING;

                // play cage break sound
                if (this.objSoundController.playingLionRoarCageBreakSound == false)
                {
                    this.objSoundController.playLionRoarCageBreakSound();
                }
            }

            break;

        case WildsView.LOCKING:

        case WildsView.BREAKING:

            this.objAnimationsWild.context.clearRect(0, 0,
                                                       this.objAnimationsWild.context.canvas.width,
                                                       this.objAnimationsWild.context.canvas.height);

            this.objLockImage.setContext(this.objAnimationsWild.context);
            
            if (this.intState ==  WildsView.LOCKING )
            {
                this.updateWildsLocking();
            }

            if (this.intState == WildsView.BREAKING)
            {
                this.updateWildsBreaking();
            }

            if (this.intState == WildsView.BREAKING)
            {

                for (var i in this.arrParticleSystem)
                {
                    this.arrParticleSystem[i].update();
                }
            }
            break;

        case WildsView.NORMAL:

            break;
    }
}

/***
 * To update all the locks in the view
 * 
 *  
 */
WildsView.prototype.updateWildsBreaking = function ()
{
	this.updateLockImage();
    for (var intX in this.objWildsSelector.arrWilds)
    {
        for (var intY in this.objWildsSelector.arrWilds[intX])
        {
            if (this.objWildsSelector.arrWilds[intX][intY])
            {
                // Only update those that had a cage
                if(this.arrCages[intX] && this.arrCages[intX][intY])
                {
                    this.intOffsetX = (ReelSlotView.WIDTH / 2) - (this.objAnimationsWild.arrSprites[0].intWidth / 2);
                    this.intOffsetY = (ReelSlotView.HEIGHT / 2) - (this.objAnimationsWild.arrSprites[0].intHeight / 2);
        
                    this.objAnimationsWild.intX = ReelsController.INIT_X + intX * (ReelSlotView.WIDTH + ReelsController.GAP_X);
                    this.objAnimationsWild.intY = ReelsController.INIT_Y + intY * (ReelSlotView.HEIGHT + ReelsController.GAP_Y);
        
                    this.objAnimationsWild.draw(this.intOffsetX, this.intOffsetY);
                                    
                    if (this.objSpinController.objFreeSpinController.freeSpinsEnabled())
                    {
                        this.drawLock(this.objAnimationsWild.intX, this.objAnimationsWild.intY);
                    }
                }
            }
        }
    }
}

/***
 * To update all the locks in the view
 * 
 *  
 */
WildsView.prototype.updateWildsLocking = function ()
{
    for (var intX in this.objWildsSelector.arrWilds)
    {
        for (var intY in this.objWildsSelector.arrWilds[intX])
        {
            if (this.objWildsSelector.arrWilds[intX][intY])
            {
    
                this.intOffsetX = (ReelSlotView.WIDTH / 2) - (this.objAnimationsWild.arrSprites[0].intWidth / 2);
                this.intOffsetY = (ReelSlotView.HEIGHT / 2) - (this.objAnimationsWild.arrSprites[0].intHeight / 2);
    
                this.objAnimationsWild.intX = ReelsController.INIT_X + intX * (ReelSlotView.WIDTH + ReelsController.GAP_X);
                this.objAnimationsWild.intY = ReelsController.INIT_Y + intY * (ReelSlotView.HEIGHT + ReelsController.GAP_Y);
    
                this.objAnimationsWild.draw(this.intOffsetX, this.intOffsetY);
    
            }
        }
    }
}

/**
 * To add a particles System for a cage explosion
 * @param { int } intX the x centre for the particles system
 * @param { int } intY the y centre for the particles system
 */
WildsView.prototype.addParticles = function (intX, intY)
{

    if (!this.arrParticleSystem)
    {
        this.arrParticleSystem = [];
    }

    var objPosition = new Object();

    objPosition.x = intX;
    objPosition.y = intY;

    this.arrParticleSystem.push(new ParticleSystem(this.objAnimationsWild.context, objPosition, 7, 100, 100, this.objExplosionParticles));
}

/**
 * 
 * @param { Object } objParticles Sprites with all the images for the particles for the Cage
 */
WildsView.prototype.setParticles = function(objParticles)
{
    if (!this.arrParticleSystem)
    {
        return;
    }
    this.objExplosionParticles = objParticles;
    
    for ( var i in this.arrParticleSystem )
    {
        this.arrParticleSystem[i].imImage = this.objExplosionParticles;
    }
} 

WildsView.PAD_LOCK_0FFSET_X = 5;
WildsView.PAD_LOCK_0FFSET_Y = 7;

/**
 * Draw a lock in a position.
 *
 * @param {int} intX The x coordinate.
 * @param {int} intY The y coordinate.
 */
WildsView.prototype.drawLock = function (intX, intY)
{
    if (!this.objSpinController.objAutoplayController.blIsActive || this.objLockImage != this.objAutoLockDisableImage || this.objSpinController.objFreeSpinController.freeSpinsEnabled())
    {
        this.objLockImage.intX = intX - WildsView.PAD_LOCK_0FFSET_X;    
        this.objLockImage.intY = intY - WildsView.PAD_LOCK_0FFSET_Y;    
        this.objLockImage.draw(0,0);
    }
}

/**
 * To draw the enabled wilds
 *
 * @param { Number } intX
 * @param { Number }intY
 */
WildsView.prototype.checkCoordinates = function (intX, intY)
{
    return this.objWildsSelector.checkCoordinates(intX, intY);
}

/**
 * To draw the enabled wilds
 *
 */
WildsView.prototype.draw = function ()
{
    switch (this.intState)
    {
        case WildsView.NORMAL:
        	this.updateLockImage();
            this.objLockImage.setContext(this.context);
            
            for (var intX in this.objWildsSelector.arrWilds)
            {
                for (var intY in this.objWildsSelector.arrWilds[intX])
                {
                    if (this.objWildsSelector.arrWilds[intX][intY])
                    {
                        this.intOffsetX = (ReelSlotView.WIDTH / 2) - (this.objSelectorView.intWidth / 2);
                        this.intOffsetY = (ReelSlotView.HEIGHT / 2) - (this.objSelectorView.intHeight / 2);

                        this.objSelectorView.intX = ReelsController.INIT_X + intX * (ReelSlotView.WIDTH + ReelsController.GAP_X);
                        this.objSelectorView.intY = ReelsController.INIT_Y + intY * (ReelSlotView.HEIGHT + ReelsController.GAP_Y);
                        this.objSelectorView.draw(this.intOffsetX, this.intOffsetY);
                        
                        this.drawLock(this.objSelectorView.intX, this.objSelectorView.intY);
                        
                        //If an overlay object created.
                        
                        if(!this.objWildsSelector.arrOverlayWilds[intX])
                        {
                            this.objWildsSelector.arrOverlayWilds[intX] = new Array();
                        }
                        //console.log("does wild overlay exist?",this.objWildOverlay,"\nis it going to be drawn?",this.objWildsSelector.arrOverlayWilds[intX][intY]);
                        if(this.objWildOverlay && this.objWildsSelector.arrOverlayWilds[intX][intY])
                        {
                            this.objWildOverlay.intX = ReelsController.INIT_X + intX * (ReelSlotView.WIDTH + ReelsController.GAP_X);
                            this.objWildOverlay.intY = ReelsController.INIT_Y + intY * (ReelSlotView.HEIGHT + ReelsController.GAP_Y);
                            this.objWildOverlay.blVisible = true;
                            this.objWildOverlay.draw (0, 0) ;
                            
                        }
                        else
                        {
                            this.objWildOverlay.blVisible = false;
                            this.objWildOverlay.draw (0,0) ;
                            this.objWildOverlay.update();
                            //console.log("drawing symbol at x:",intX," y:",intY,"and its visibility is ",this.objWildOverlay.blVisible);
                        }
                    }
                }
            }
            break;
    }
}

/**
 * To set the image selector
 *
 * @param { Image } imSelector The image selector
 */
WildsView.prototype.setImage = function (imSelector)
{
    this.intOffsetX = (imSelector.width / 2) - (ReelSlotView.WIDTH / 2);
    this.intOffsetY = (imSelector.height / 2) - (ReelSlotView.HEIGHT / 2);

    this.objSelectorView = new ElementView();

    this.objSelectorView.init(this.objContext, imSelector, 0, imSelector.width, imSelector.height);
    this.objSelectorView.intX = 0;
    this.objSelectorView.intY = 0;
}


/**
 *This function will set the proper image for the autolock icon
 *  
 * 
 * 
 * @param { Object  } imSelector This imnage will be used to show that the mode Autolock is enabled
 */
WildsView.prototype.setAutoLockEnableImage = function (imSelector)
{
    this.objAutoLockEnableImage = new ElementView();

    this.objAutoLockEnableImage.init(this.objContext, imSelector, 0, imSelector.width, imSelector.height);
    this.objAutoLockEnableImage.intX = 0;
    this.objAutoLockEnableImage.intY = 0;
}

/**
 * To enable/disable the AutoLock
 *  
 * @param { Boolean } blEnabled This will enable/disable the red/black lock icon
 * 
 *
WildsView.prototype.enableAutoLock = function (blEnabled)
{
    if (blEnabled)
    {
        this.objLockImage = this.objAutoLockEnableImage;
    }
    else
    {
        this.objLockImage = this.objAutoLockDisableImage;
    }
    
    this.updateLocks();
}
*/

/**
 * To set the image for the auto lock disabled
 *
 * @param { Image } imSelector The image selector
 */
WildsView.prototype.setAutoLockDisableImage = function (imSelector)
{
    this.objAutoLockDisableImage = new ElementView();

    this.objAutoLockDisableImage.init(this.objContext, imSelector, 0, imSelector.width, imSelector.height);
    this.objAutoLockDisableImage.intX = 0;
    this.objAutoLockDisableImage.intY = 0;
    
    this.objLockImage = this.objAutoLockDisableImage;
}

/**
 * determine what image is going to be used for locks 
 */
WildsView.prototype.updateLockImage = function()
{
	var blWildsAutolockDisabled = this.objGameSettings.getItem(GameSettings.DISABLE_AUTOLOCK_WILDS);
	if (blWildsAutolockDisabled || this.objSpinController.isBlackLockIconInFreespins())
	{
		this.objLockImage = this.objAutoLockEnableImage;
	}
	else
	{
		//enabled and not in freespins
		this.objLockImage = this.objAutoLockDisableImage;
	}
}

/**
 * To enable the overlay
 * 
 * @param { Boolean } blVisible If it is true, it will make visible the overlay
 */
WildsView.prototype.enableOverLay =  function (intReel, intRow, blVisible )
{
    if(!this.objWildsSelector.arrOverlayWilds[intReel])

    {
        this.objWildsSelector.arrOverlayWilds[intReel] = new Array();
    }
     this.objWildsSelector.arrOverlayWilds[intReel][intRow]= blVisible;
     //console.log("setting symbol at pos reel: "+intReel+" row: "+intRow+" to "+blVisible)
}

WildsView.prototype.setOverlay = function ( imgSlotOverlay )
{
    
    this.objWildOverlay = new ElementView( );
    this.objWildOverlay.init( this.objContext, imgSlotOverlay , 1, imgSlotOverlay.width, imgSlotOverlay.height );
    this.objWildOverlay.intX = 0;
    this.objWildOverlay.intY = 0;
    this.objWildOverlay.blVisible = false;
    //console.log("WildOverlay instantiated and assigned!");
}
