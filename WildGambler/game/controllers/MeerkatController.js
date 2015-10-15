/**
 * 
 */
function MeerkatController(objGuiView)
{
	this.objGuiView = objGuiView;
	this.objSprite;
	this.arrObjMeerkatAnims;
	
	this.intState = MeerkatController.IDLE;
	this.arrStates = ["IDLE", "SHOW", "HIDE", "SPAWN_OF_SATAN"];
	this.intStartX=0;
	this.intStartY=0;
	this.intEndY=0;
	
	
	// Vars to control fall rate of bonus letters using easing
	this.intStartTime=0;
	this.intDuration = 1500;
	this.blContinuous = true;
	
	// external methods: bindings
	this.extractResources = this.extractResources.bind(this);
	this.handleSpritesLoaded = this.handleSpritesLoaded.bind(this);
	this.dataReceived = this.dataReceived.bind(this);
	this.run = this.run.bind(this);
	this.show = this.show.bind(this);
	this.hide = this.hide.bind(this);
	this.animationComplete = this.animationComplete.bind(this);
	
	this.fnAnimationCompleteCallback;

    // internal control
	this.introAnimationFinished = this.introAnimationFinished.bind(this);
	this.mainAnimationFinished = this.mainAnimationFinished.bind(this);
	this.outroAnimationFinished = this.outroAnimationFinished.bind(this);

	this.onFrameChanged = this.onFrameChanged.bind(this);

	this.intTimerId=null;

	// -- Assets	
	
	// Meerkat animation objects
	this.arrObjMeerkatAnims = [];
	// Meerkat draw buffer array
	this.arrMeerkatsAnimating = [];
	// Array of bonus letter sprites
	this.arrLetters = [];
	// Bonus letter draw buffer
	this.arrBonusLettersShowing = [];
	
	// Layouts from bonus_positions.json
	this.arrLayouts;
	
	// Load the resources for bonus letter signs and meerkat animation
	this.objAssetsFactory = new AssetsFactory(); 
	this.objAssetsFactory.getResources( this.extractResources, 
	 							    	["sign001.png","sign002.png","sign003.png","sign004.png","sign005.png"], 
	 							    	["meerkat"]);

}
Class.extend(Class,MeerkatController)

/*
 * States (under construction)
 */
MeerkatController.IDLE=0;
MeerkatController.SHOW=1;
MeerkatController.HIDE=2;
MeerkatController.SPAWN_OF_SATAN=666;

/**
 * 1. Extract the bonus letter sign PNGs into arrLetters 
 * 2. Organise the meerkat animation assets
 */
MeerkatController.prototype.extractResources = function (arrSprites)
{
	this.arrLetters = [];
	for( var i=1; i<6; ++i )
	{
		var objTempElementView = new ElementView();
		objTempElementView.init( this.objGuiView.context, 
								 arrSprites["sign00"+i+".png"], 
								 0, 
								 arrSprites["sign00"+i+".png"].width, 
								 arrSprites["sign00"+i+".png"].height );
		//						 
		this.arrLetters.push(objTempElementView);		
	}

	// Get the meerkat sprite resources
    var arrAnimationSprites = this.objAssetsFactory.objSpriteController.checkAnimationSprites(["meerkat"]);    
    var arrSpriteNames = [];
    var i;
    for ( i in arrAnimationSprites)
    {
        arrSpriteNames.push(i);
    }
    this.objAssetsFactory.getResources( this.handleSpritesLoaded, arrSpriteNames);
}

/**
 * Callback from getResources
 */
MeerkatController.prototype.handleSpritesLoaded = function( arrImages ) 
{
    var intFrame = 0;
    var arrSprites = [];
	
	// Turn each image in the frame animation into an ElementView object    
    for (var i in arrImages)
    {
        arrSprites[intFrame] = new ElementView();
        
        arrSprites[intFrame].init( this.objGuiView.context, 
        						   arrImages[i], 
        						   1, 
        						   arrImages[i].width, 
        						   arrImages[i].height );
        						   
        arrSprites[intFrame].intX = this.intX;
        arrSprites[intFrame].intY = this.intY;
        intFrame++;
    }

	// Pass the resources to new Animator objects which will animate the sprites  
	// basically this is a frame animator
    this.arrObjMeerkatAnims = [ new Animator(arrSprites),
    							new Animator(arrSprites),
    							new Animator(arrSprites),
    							new Animator(arrSprites),
    							new Animator(arrSprites) ];

	// Get the positioning data for our animations
	this.objAssetsFactory.getResources(this.dataReceived, ["bonus_positions.json"]);
}



/**
 * Callback from AssetsManager loading 
 */
MeerkatController.prototype.dataReceived = function(arrResources)
{
	this.arrLayouts = arrResources["bonus_positions.json"].layers[0].elements;
	
	// Check offsets for Y
	var canvasHeight=this.objGuiView.context.canvas.height;
	var animHeight=this.arrObjMeerkatAnims[0].arrSprites[0].intHeight;
	
	// Set Y of each animation and corresponding letter
	for(var l in this.arrLayouts)
	{
		this.intStartX = parseInt(this.arrLayouts[l].x);
		this.intStartY = parseInt(this.arrLayouts[l].y) + (canvasHeight-animHeight);
		this.intEndY = this.intStartY+240;
		this.arrObjMeerkatAnims[l].setXY(this.intStartX, this.intStartY);
		this.arrLetters[l].intX = this.intStartX;
		this.arrLetters[l].intY = this.intStartY;
	}
}


/**
 * Luckily, these ALWAYS show in the order 0,1,2,3,4
 */
MeerkatController.prototype.show = function( intReelId )
{
	//console.log("MeerkatController should show meerkat for reel " + intReelId)

	var anim = this.arrObjMeerkatAnims[intReelId];

	// Slow the frame rate a bit for the main animiation.
	// Higher is slower.
	anim.intFrameRate = 20;
	
	// Start and end frames are inclusive
	anim.startAnimation(this.introAnimationFinished, 0, 1, intReelId, !this.blContinuous);

	//
	this.arrMeerkatsAnimating.push(anim);
	
	//this.objGuiView.blDirty = true;
	this.intState = MeerkatController.SHOW;
	
	/*
	 * Debug only: get a callback on EVERY frame change 
	if(intReelId == 0)
	{
		this.arrMeerkatsAnimating[0].fnFrameCallback = this.onFrameChanged;
	}
    */

	/*
	 * TODO maybe: run our own animation loop. May help with timings.
	if(this.intTimerId == null)
	{
		this.intTimerId = setInterval(this.run, 30);
	}
	*/
}

/**
 * Debugging only : do not attach to an animation
 */
MeerkatController.prototype.onFrameChanged = function(intAnimId, intFrameNumber)
{	
	
}


/**
 * Set state to hide. As each main animation completes, the relevant meerkat
 * will move to the outro animation.
 * We are not delaying the hide by checking whether sounds are fininshed any more as they 
 * have been removed (apart from the cheer if we got the bonus) so in those cases we
 * introduce a delay: also when there are NO sounds (and so, no cheer).
 */
MeerkatController.prototype.hide = function( intDelayInMs )
{
	//console.log("MeerkatController should hide all");
	if(intDelayInMs != null)
	{
    	TimerManager.getInstance().start(this.hide, intDelayInMs);
	}
	else
	{
	    this.intState = MeerkatController.HIDE;
	}
}


/**
 * Final letter has fallen out of sight; 
 * Set state to IDLE (ntohing in anim loop) and make callback.
 */
MeerkatController.prototype.animationComplete = function()
{
	this.arrBonusLettersShowing = [];
	
	this.intState = MeerkatController.IDLE;
	
	if(this.fnAnimationCompleteCallback)
	{
		this.fnAnimationCompleteCallback();
	}
	
}

/**
 * When the intro animation (2 frames) completes we move into the continuous loop 
 * of the main animation. We also need to show the letter that the 'kat is holding.
 * NOTE: we are slowing the frame rate down a bit here.
 */
MeerkatController.prototype.introAnimationFinished = function( intId )
{
	//console.log("Meerkat intro finished id " + intId + " " + this.arrObjMeerkatAnims[intId].intCurrentFrame)

	var anim = this.arrMeerkatsAnimating[intId];

	// Slow the frame rate a bit for the main animiation.
	// Higher is slower.
	anim.intFrameRate = 80;
	
	//
	anim.startAnimation(this.mainAnimationFinished, 2, 16, anim.intId, this.blContinuous);
	
	// Start the letter that the meerkat is holding
	this.arrLetters[anim.intId].intY = this.intStartY;
	this.arrLetters[anim.intId].blFalling = false;
	this.arrLetters[anim.intId].intOffsetY = 0;
	this.arrLetters[anim.intId].intYOff = 0;
	this.arrBonusLettersShowing.push(this.arrLetters[anim.intId]);
}

/**
 * Does nothing UNTIL we have decided to hide. Hiding starts for ALL meerkats
 * when ONE has reached the end of its main animation. Doesn't matter which one.
 * We could force to id 0 if we want.
 */
MeerkatController.prototype.mainAnimationFinished = function( intId )
{
	//console.log("Meerkat main finished id " + intId + " " + this.arrObjMeerkatAnims[intId].intCurrentFrame)
	/*
	 * Now in HIDE phase: as soon as ONE main meerkat animation finishes
	 * move ALL to the outro animation so they all fall roughly together.
	 */
	if(this.intState == MeerkatController.HIDE)
	{
		for(var i=0; i<this.arrMeerkatsAnimating.length; ++i)
		{
			var anim = this.arrMeerkatsAnimating[i];
			//console.log("Start hiding anim for meerkat id " + intId)
			anim.intFrameRate = 20;
			anim.startAnimation(this.outroAnimationFinished, 17, 18, anim.intId, !this.blContinuous);
		}
	}
}

/**
 * The 2-frame outro animation has completed:
 * Remove it from the animating buffer array.
 * Make the meerkat's letter fall gracefully now that there is no-one holding it up.
 */
MeerkatController.prototype.outroAnimationFinished = function( intId )
{
	//console.log("Meerkat outro finished id " + intId + " " + this.arrObjMeerkatAnims[intId].intCurrentFrame)
	var arrTempKats = [];
	
	// Iterate through all remaining meerkat animations
	for(var m=0; m<this.arrMeerkatsAnimating.length; ++m)
	{
		// If the id matches the one just finished...
		// Set the corresponding letter to start falling
		if(this.arrMeerkatsAnimating[m].intId == intId)
		{
			//console.log("Letter " + intId + " set to fall.")
			this.arrBonusLettersShowing[intId].intStartTime = new Date().getTime();
			this.arrBonusLettersShowing[intId].intOffsetY = 0; 
			this.arrBonusLettersShowing[intId].intYOff = 0;
			this.arrBonusLettersShowing[intId].blFalling = true;
		}
		else
		{
			arrTempKats.push(this.arrMeerkatsAnimating[m]);
		}
	}
	
	this.arrMeerkatsAnimating = arrTempKats;
}



/**
 * Animate : called continually by PanelController 
 * state IDLE will draw nothing.
 * Others will draw and set blDirty = true
 * 
 * @param {int} intTimeDiff [miliseconds] time change from last call
 * @param {int} intTime [miliseconds] currentTime
 */
MeerkatController.prototype.run = function(intTimeDiff, intTime)
{
	switch(this.intState)
	{
		case MeerkatController.SHOW:
		case MeerkatController.HIDE:
		{
			// This cleans the canvas for the next frame to show, not drawn on top of the previous.
			this.objGuiView.context.clearRect(0, 0, this.objGuiView.context.canvas.width, this.objGuiView.context.canvas.height);
			
			/*
			 * Animate bonus letters
			 */
			var intLettersDone = 0;
			for(var bl=0; bl<this.arrBonusLettersShowing.length; ++bl)
			{
				/*
				 * Increment Y offset if they are supposed to be falling off-screen
				 */
				if(this.arrBonusLettersShowing[bl].blFalling)
				{
					var intCurTime = (new Date()).getTime() - this.arrBonusLettersShowing[bl].intStartTime;
					var offY = this.arrBonusLettersShowing[bl].intYOff;
                    var intY  = Bounce.easeIn( intCurTime, this.intStartY, this.intEndY, this.intDuration );    
					this.arrBonusLettersShowing[bl].intYOff += intY-this.intStartY;
				}
				
				/* 
				 * Calling draw with a Y offset will set the internal intOffsetY  
				 */
				this.arrBonusLettersShowing[bl].draw( 0, this.arrBonusLettersShowing[bl].intYOff );
				
				/* 
				 * Animate off-screen. 
				 * TODO Magic numbers! Detect off-screen properly.
				 */
				if(this.arrBonusLettersShowing[bl].intYOff > 240)
				{
					this.arrBonusLettersShowing[bl].blFalling = false;
					++intLettersDone;
					
					/*
					 * If this is the final letter that has finished falling,
					 * stop all animations. 
					 */
					if( intLettersDone == this.arrBonusLettersShowing.length )
					{
						this.animationComplete();
					}
				}
			}

			/*
			 * Animate meerkats
			 */
			for(var m=0; m<this.arrMeerkatsAnimating.length; ++m)
			{
				this.arrMeerkatsAnimating[m].draw(0,0);
			}
		}
		break;
	}
}

