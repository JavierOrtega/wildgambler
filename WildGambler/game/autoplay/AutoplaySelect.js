/**
 * @author Petr Urban
 * This class represents Autoplay Select
 */

/**
 * Constructor for AutoplaySelect
 * 
 * @param {GuiController} objGuiController
 * @param {ButtonController} objAutoplayButtonController
 * @param {Autoplay} objAutoplay
 * @param {ButtonView} objButtonViewAutoplayStop
 * @param {ButtonView} objButtonViewAutoplay
 * @param {number} intButtonCenterX
 */
function AutoplaySelect( objGuiController, 
						 objAutoplayWarningController,
						 objAutoplayButtonController, 
						 objAutoplayController, 
						 objButtonViewAutoplayStop, 
						 objButtonViewAutoplay, 
						 intButtonCenterX, 
						 objReelsController,
						 objMainConsoleController,
						 objLocalisation)
{
	this.blVisible = false; //visible at the moment or not

	this.objAutoplayController = objAutoplayController; //instance of Autoplay
	this.objGuiController = objGuiController; //instance of GuiController (to draw selection buttons)
	this.objAutoplayWarningController = objAutoplayWarningController;
	
	this.objAutoplayButtonController = objAutoplayButtonController; //instance of ButtonController (Button "Autoplay")
	this.objOriginalButtonStates = this.objAutoplayButtonController.getViewObject().arrStates; //original autoplay button states
	this.objButtonViewAutoplayStop = objButtonViewAutoplayStop; //autoplay stop button

	this.objButtonViewAutoplay = objButtonViewAutoplay; //states for selection buttons
	this.intButtonCenterX = intButtonCenterX; //center X position of select buttons
	this.objReelsController = objReelsController;
	this.objMainConsoleController = objMainConsoleController;

	this.objContext = null; //canvas context
	this.intButtonSpacing = 0; //pixels
	this.intButtonOffsetBottom = 0; //pixels
	this.intButtonOffsetLeft = 0; //pixels
	
	this.onResizeCallback;

	this.onClick = this.onClick.bind(this);
	this.onAutoplayDecision = this.onAutoplayDecision.bind(this);
	this.onSelect = this.onSelect.bind(this);
	
	this.objLocalisation = objLocalisation;
	this.objSpinController;
	
	this.intAutoplaysSelected = 0;

	//buttons
	this.arrButtons = [];

	//init	
	this.initButtons();
}

Class.extend(Class, AutoplaySelect);

/**
 * Initialize autoplay selection buttons 
 */
AutoplaySelect.prototype.initButtons = function()
{
	if (!this.objAutoplayController.isAvailable())
	{
		//ignore if autoplay functionality is disabled
		return;
	}

	//get available values
	var arrOptions = this.objAutoplayController.getAvailableOptions();
	
	var intHeight = this.objGuiController.getCanvasHeight() - this.intButtonOffsetBottom;

	for (var i = 0; i < arrOptions.length; i++)
	{
		strButtonPosition = "bottom";
		if (i > 0)
		{
			if (i >= arrOptions.length - 1)
			{
				strButtonPosition = "top";
			}
			else
			{
				strButtonPosition = "middle";
			}
		}
		var intValue = arrOptions[i];
		var objButtonView = this.createButtonView(strButtonPosition, "autoplay_"+intValue, intValue);

		var intX = this.intButtonCenterX - (objButtonView.getWidth() / 2);
		objButtonView.setXY(intX + this.intButtonOffsetLeft, intHeight - objButtonView.getHeight());
		intHeight -= objButtonView.getHeight() + this.intButtonSpacing;
		
		var objButtonController = new ButtonController(objButtonView);
		objButtonController.addListener(ButtonController.STATE_CLICK,this.onClick);
		objButtonController.setGroupID("Autoplay");
		this.arrButtons.push(objButtonController);
	}
}

/**
 * Here we run the dialog cancelling wilds IF THERE ARE ANY. 
 */
AutoplaySelect.prototype.onClick = function(objEvent, objButton, intX, intY) 
{
	// Stop event propagation
	objEvent.stopPropagation();

	// Record which button was pressed.
	this.intAutoplaysSelected = objButton.intValue;

	// Hide the selection buttons
	this.setVisible(false);

	this.objAutoplayController.setAutoplaysRemaining(objButton.intValue);
	
	// Show warning
	if(this.objReelsController.hasLockedWilds())
	{
		this.objAutoplayWarningController.show(this.onAutoplayDecision);
	}
	
	// TODO Otherwise just start the autoplays
	else
	{
		this.onSelect(this.intAutoplaysSelected);
	}
}

/**
 * Lockspin decision made after pressing lockspin with autoplays selected 
 */
AutoplaySelect.prototype.onAutoplayDecision = function(blContinueAccepted)
{
	if(blContinueAccepted)
	{
		this.objReelsController.clearAllLockedWilds();
		this.onSelect(this.intAutoplaysSelected);
	}
	else
	{
		this.objAutoplayController.startAutoplays(false);
	}
}

/**
 * Handle autoplay selection
 * 
 * @param {Object} intAutoplaysToGo
 */
AutoplaySelect.prototype.onSelect = function(intAutoplaysToGo)
{
	// Check inputs
	if (intAutoplaysToGo <= 0)
	{
		throw new Error("Selected 0 autoplays form autoplay.select mechanism")
	}

	// Close chooser
	if (this.isVisible())
	{
		this.setVisible(false);
	}
	
	// Set num of spins
	// AutoplayController will trigger onChange callback which changes the visible AUTOPLAY button to STOP button
	this.objAutoplayController.setAutoplaysRemaining(intAutoplaysToGo);
	
	// Tell autoplayController to call back to SpinController (!)
	// to call its run method with a fnOnAutoplaysComplete method.
	// This is what comes of designing systems bit-by-bit :(
	this.objAutoplayController.startAutoplays(true);
}

/**
 * Create the button
 * 
 * @param {String} strButtonPosition values "top" / "middle" / "bottom"
 * @param {String} strButtonId
 * @param {number} intValue 
 */
AutoplaySelect.prototype.createButtonView = function(strButtonPosition, strButtonId, intValue)
{
	var objGuiView = this.objGuiController.getGuiView();
	var objImage = this.objButtonViewAutoplay[strButtonPosition].arrStates[ButtonController.STATE_NORMAL];

	//create view objects
	var imgWidth = (objImage.intSrcW) ? objImage.intSrcW : objImage.intWidth;
	var imgHeight = (objImage.intSrcH) ? objImage.intSrcH : objImage.intHeight;
	
	var arrTextReplace = [intValue.toString()]; //replace %1 with this
	var objLocalisationTextAutoplays = this.objLocalisation.getText("autoplays", arrTextReplace);
	
	var objButtonTextView = new TextBoxView(objLocalisationTextAutoplays, "black", 0, 0, imgWidth, imgHeight);
	objButtonTextView.setColour("#00c9fc");
	objButtonTextView.setFont("YikesZkAsh");
	
	//set stroking
	objButtonTextView.setStrokeEnabled(true);
	objButtonTextView.setStrokeColour("#000000");
	objButtonTextView.setStrokeWidth(3);
	
	//set shadow
	objButtonTextView.setShadowEnabled(true);
	objButtonTextView.setShadowOffsetY(3);
	objButtonTextView.setShadowOffsetX(0);
	objButtonTextView.setShadowBlur(0);
	objButtonTextView.setShadowColour("#999999");

	var objButtonView = new AutoplayButtonView(strButtonId, intValue, objButtonTextView);
	objButtonView.setContext(objGuiView.context);
	
	//init view object
	if (DeviceModel.strPlatform == OS.IOS)
	{
	    objButtonView.init(objGuiView.context, objImage.objImage, 1, objImage.intWidth, objImage.intHeight, strButtonId);
	}
	else
	{
	    objButtonView.init(objGuiView.context, objImage);
	}

    objButtonView.arrStates = this.objButtonViewAutoplay[strButtonPosition].arrStates;
    //objButtonView.setScaling(2, 2);
    
    //set parent of this view object
    objButtonView.setParent(objGuiView);
    
    //set text value
//	objButtonView.setText(intValue);

	return objButtonView;
}

/**
 * Set Visible
 * 
 * @param {boolean} blVisible
 */
AutoplaySelect.prototype.setVisible = function(blVisible)
{
	if (blVisible == this.blVisible) 
	{
		return;
	}

	var blChanged = (this.blVisible != blVisible)
	
	this.blVisible = blVisible;
	
	if (blChanged)
	{
		//add / remove buttons for autplay selection
		var intLayer = 20;
		for (var i in this.arrButtons)
		{
			var strButtonId = "autoplayButton"+i;
			if (this.blVisible)
			{
				//add buttons to controller
				this.objGuiController.addElement(intLayer, strButtonId, this.arrButtons[i]);
				this.objGuiController.getGuiView().addElement(intLayer, strButtonId, this.arrButtons[i].getViewObject());
				
				this.objReelsController.setWildSelectionEnabled(false);
				
				//this.arrButtons[i].getViewObject().update();
			}
			else
			{
				//remove buttons from controller
				this.objGuiController.removeElement(intLayer, strButtonId);
				this.objGuiController.getGuiView().removeElement(intLayer, strButtonId);

				this.objReelsController.setWildSelectionEnabled(true);
			}
		}
		
		this.objGuiController.getGuiView().blVisible = this.blVisible;
	}

    /**
     * 
     */
	if (this.blVisible)
	{
	    
		// this is already set in the SpinController onConsoleButtonPressed - do we need it twice??
		// BGB commenting out setting button states for testing
		//console.log("AutoplaySelect setting AUTOPLAY_SELECT");
		//this.objSpinController.setButtonState(SpinController.AUTOPLAY_SELECT);
		this.objReelsController.hideOverlays();
	}
	else
	{
		// BGB commenting out setting IDLE state for testing
		// this appears to be here to re-enable buttons after cancelling the autoplay menu, but 
		// has the knock-on effect of allowing buttons when it shouldn't! this is therefore now moved to be 
		// SpinController onConsoleButtonPressed instead, so we only activate it when we want to
		//console.log("AutoplaySelect setting IDLE");
		//this.objSpinController.setButtonState(SpinController.IDLE);			
	}

	this.setDarkLayerVisible(blVisible);
}


AutoplaySelect.prototype.setDarkLayerVisible = function(blVisible)
{
	//create DOM node if it does not exist
	if (!this.objNodeDakrScreen)
	{
		this.objNodeDakrScreen = document.createElement("div");
		this.objNodeDakrScreen.setAttribute("id", "autoplay-bg");
	}
	
	if (blVisible)
	{
		this.resizeDarkScreen();
		//add to page
		document.body.appendChild(this.objNodeDakrScreen);
	}
	else
	{
		//remove from page
		if (this.objNodeDakrScreen.parentNode)
		{
			this.objNodeDakrScreen.parentNode.removeChild(this.objNodeDakrScreen);
		}
	}
}

/**
 * Is visible?
 * 
 * @return {boolean} 
 */
AutoplaySelect.prototype.isVisible = function()
{
	return this.blVisible;
}


/**
 * Called on change of resolution
 * needs to calculate correct positions and size ratios of buttons 
 */
AutoplaySelect.prototype.resize = function()
{
	if (this.onResizeCallback)
	{
		//on resize callback will return current X position
		this.intButtonCenterX = this.onResizeCallback(this);

		if (this.arrButtons.length > 0) {
			//find canvas top offset (can be in minus values)
			var canvasOffsetTop = parseInt(this.objGuiController.getCanvas().parentNode.style.marginTop) / this.objGuiController.objExternalController.intrelation;
			if (canvasOffsetTop > 0) {
				canvasOffsetTop = 0;
			} else {
				canvasOffsetTop *= -1;
			}
			//calculate available size in canvas pixels
			var canvasHeight = this.objGuiController.getCanvasHeight() - this.intButtonOffsetBottom - canvasOffsetTop;
			var canvasWidth = this.objGuiController.getCanvasWidth() - this.intButtonOffsetLeft;
			
			var buttonsHeightCumulative = 0;
			var buttonWidthMax = 0;

			//get height of all the buttons and their width
			for (var i in this.arrButtons)
			{
				var objButtonView = this.arrButtons[i].getViewObject();
				
				//collect height
				buttonsHeightCumulative += objButtonView.getHeight() / objButtonView.getScaleY();
				
				//collect width
				var buttonWidthImage = objButtonView.getWidth() / objButtonView.getScaleX();
				if (buttonWidthImage > buttonWidthMax)
				{
					buttonWidthMax = buttonWidthImage;
				}
			}
			
			//find resize ratio of the button
			var maxRatio = 1.5;
			var ratio = canvasHeight / buttonsHeightCumulative;
			if (buttonWidthMax * ratio > canvasWidth)
			{
				//make sure the button is not wider than the canvas
				ratio = canvasWidth / buttonWidthMax;
			}
			if (ratio > maxRatio)
			{
				ratio = maxRatio;
			}
			
			//start setting ratios and positions of buttons
			var currentButtonY = canvasHeight + canvasOffsetTop;
			for (var i in this.arrButtons)
			{
				var objButton = this.arrButtons[i];
				var objButtonView = objButton.getViewObject();
				// set scaling first (getWidth and getHeight are giving numbers including the ratio)
				objButtonView.setScaling(ratio, ratio);
				
				// calculate button Y position
				currentButtonY -= Math.floor(objButtonView.getHeight());

				// set button position
				objButtonView.setXY(this.intButtonCenterX - (objButtonView.getWidth() / 2), currentButtonY);
			}
		}
	}

	this.resizeDarkScreen();
}

/**
 * resize the layer that makes screen dark 
 */
AutoplaySelect.prototype.resizeDarkScreen = function()
{
	if (this.objNodeDakrScreen)
	{
		this.objNodeDakrScreen.style.height = (window.innerHeight - this.objMainConsoleController.objCanvas.offsetHeight) + "px";
	}
}

/**
 * Called on change of resolution
 * Callback is expected to return this.intButtonCenterX value
 */
AutoplaySelect.prototype.setOnResizeCallback = function(callback)
{
	this.onResizeCallback = callback;
}

/**
 * 
 */
AutoplaySelect.prototype.setVisibleButtonStop = function()
{
	this.objAutoplayButtonController.getViewObject().changeAllStates(this.objButtonViewAutoplayStop.arrStates);
}

/**
 * 
 */
AutoplaySelect.prototype.setVisibleButtonNormal = function()
{
	this.objAutoplayButtonController.getViewObject().changeAllStates(this.objOriginalButtonStates);
}

AutoplaySelect.prototype.setSpinController = function(objSpinController)
{
	this.objSpinController = objSpinController;
}


/**
 * Set Canvas Context
 * 
 * @param {Object} intAutoplaysToGo
 *
AutoplaySelect.prototype.setContext = function(objContext)
{
	this.objContext = objContext;
	for (var i in this.arrButtons)
	{
		//set this context for all buttons
		this.arrButtons.getViewObject().setContext(objContext);
	}
}

/**
 * Set parent 
 * 
 * @param {Object} objParent
 *
AutoplaySelect.prototype.setParent = function(objParent)
{
	for (var i in this.arrButtons)
	{
		//set the parent
		this.arrButtons[i].getViewObject().setParent(objParent);
	}
}
*/
