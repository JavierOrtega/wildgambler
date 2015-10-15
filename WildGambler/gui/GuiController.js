/**
 * @author Javier.Ortega
 * 
 * This class will contain the model functionality for the controller for the Gui element
 */


/**
 * Constructor
 * @param {String} strName The general name of the control  
 */
function GuiController(strName)
{
    this.setData = this.setData.bind( this );
    this.processJSONLayout = this.processJSONLayout.bind( this );
    this.addListener = this.addListener.bind( this );
    this.removeListener = this.removeListener.bind( this );
    this.onClickCallback = this.onClickCallback.bind( this );

	/** Array of controllers for onscreen elements e.g. buttons, reels frame */
	this.elementControllers = []
	
	/**
     * Collection of place holders
     * @type { Array }
     */
	this.arrPlaceHolders = [];
    
     /**
     * The data model for this controller.
     * @type { GuiModel }
     */
    this.objGuiModel = new GuiModel();
    
    /**
     * The view for this controller.
     * @type { GuiView }
     */
    this.objGuiView = new GuiView( );
    
    /**
     * The data model for this controller.
     * @type { GuiModel }
     */
    this.strName = strName;
    
    /**
     * To enable/disable group behaviour
     * 
     * @type { Boolean } 
     */
    this.blEnableGroup = false;
    
    /**
     * External controller with the specific functionality for the the controllers ( Example reels )
     * @type { Object }
     */    
    this.objExternalController;
    
    this.blEnableEvents = true;
    
    this.intStartY = 0;
    
    this.intLastOffsetY = 0;
    
    this.intSwipeBottomY = -1500; 
    
    this.intSwipeTopY = 0;
    
    /**
     * A simple array of event listeners that will be called in turn
     * when a CLICK event is detected (NOTE: onClick only).
     */
    this.arrListeners = new Array();
}

/** 
 * Derive GuiController from our base type to provide inheritance
 */ 
Class.extend( Class, GuiController );

/**
 * This will add the necessary data for the current GuiElement. 
 * @param {Array} arrElements Array with the JSON files with the layout and the data for the Gui.
 */
GuiController.prototype.setData = function ( arrElements )
{
    this.objGuiModel.objLayout = arrElements[this.strName + "Data.json"];
    this.objGuiModel.objResources = arrElements[this.strName + "Res.json"];
}

/**
 * This function will return the asked element 
 * @param {String} strId The id for the element
 */
GuiController.prototype.getElementByID = function ( strId )
{
    for (var i in this.elementControllers)
    {      
        if (this.elementControllers[i][strId])
        {
            return (this.elementControllers[i][strId]);
        }   
    }   
}

/**
 * This function will return the asked element 
 * @param {String} strId The id for the element
 */
GuiController.prototype.getButtonByID = function ( strId )
{
    for (var i in this.elementControllers )
    {      
        if (this.elementControllers[i][strId] && this.elementControllers[i][strId].viewObject.strType == "btn")
        {
            return (this.elementControllers[i][strId]);
        }   
    }   
}



/**
 * CLICK event ONLY is handled.
 * Adds a listener to this GuiController so that the WHOLE OBJECT gets notified
 * on-click (as against a single item e.g. on of the buttons on the console)
 * Example: In a slot game the BigWinController adds a listener when it starts so that click-to-skip
 * can be implemented. The listener is subsequently detached until BigWin starts again.
 */
GuiController.prototype.addListener = function(objFunction)
{
	this.arrListeners.push(objFunction);
}

/**
 * Remove the listener from the array. 
 */
GuiController.prototype.removeListener = function(objFunction)
{
	var arrNew = [];
    for ( var index in this.arrListeners)
    {
    	if(this.arrListeners[index] != objFunction)
    	{
    		arrNew.push(this.arrListeners[index]);	
    	}
    }
    this.arrListeners  = arrNew;
}

/**
 * This is called in the onClick handler (see below). It is called ONCE only 
 * for the entire GuiController, whereas the rest of the code in the click handler
 * calls onClick for every item in the elementController array 
 * e.g. all the buttons in the console which have an onClick method registered.
 */
GuiController.prototype.onClickCallback = function (objEvent, intX, intY)
{
	for(var index in this.arrListeners)
	{
		this.arrListeners[index].call(objEvent, intX, intY);
	}
}


/**
 * This will add the necessary data for the current GuiElement. 
 * @param {Array} arrElements Array with the different resources necesaries for the Gui ( Images, sounds, etc... )
 */
GuiController.prototype.setResources = function ( arrElements )
{
    this.objGuiModel.objLayout = arrElements[this.strName + "Data.json"];
    this.objGuiModel.objResources = arrElements[this.strName + "Res.json"];
}

/**
 * This returns an understandable array with the necessary resources files to display this screen.
 * @return {Array} List of resources to be loaded
 */
GuiController.prototype.getResourcesToLoad = function ( )
{
    return ( this.objGuiModel.getResourcesToLoad() );
}

/**
 * @param {object} objJSONData
 */    
GuiController.prototype.processJSONLayout = function (objJSONData)
{        
    if (!objJSONData)
    {
        return;    
    }
    
    var objElement;    
    for (var i = 0; i < objJSONData.layers.length ; i++)
    {
        for (var j = 0; j < objJSONData.layers[i].elements.length ; j++)
        {
            objElement = objJSONData.layers[i].elements[j];
                
            
            
             //To detect a place holder and put it in an special array to be not processed
            if ( objElement.name.search( "pixel" ) != -1 )
            {   
                if (!this.arrPlaceHolders[objElement.layer])
                {
                    this.arrPlaceHolders[objElement.layer] = new Array ();
                }
                
                this.arrPlaceHolders[objElement.layer][objElement.id] = new ElementController (null);               
            }
            
            //To detect a place holder and put it in an special array to be not processed
            else if ( objElement.name.search( "txt" ) != -1 )
            {   
                if (!this.elementControllers[objElement.layer])
                {
                    this.elementControllers[objElement.layer] = new Array ();
                }
                
                var strShortId = TextBoxView.getIDFromString(objElement.id);
                var objTextView = this.objGuiView.getTextView(strShortId);
                
                this.elementControllers[objElement.layer][TextBoxView.getIDFromString(objElement.id)] = new TextBoxController (objTextView);              
            }
            
            //Detect the locators
            else if( objElement.name.substr(0,3) == "btn" )
            {
                if (!this.elementControllers[objElement.layer])
                {
                    this.elementControllers[objElement.layer] = new Array ();
                }
                
           		// e.g. "spin"
           		var arrParts = objElement.name.split(".")[0].split("_");
                var strId = [];
           		for (var k = 1; k < arrParts.length - 1; k++) {
           			strId.push(arrParts[k]);
           		}
           		
           		if (arrParts.length == 2)
                {
                    strId = arrParts[1]; 
                }
                else
                {
                    strId = strId.join("_");     
                }
                

            	// Do once for button which may have several images    
                if (!this.elementControllers[objElement.layer][strId])
                {
					this.elementControllers[objElement.layer][strId] = new ButtonController(this.objGuiView.getButtonView(strId));
                }
            }
            //Detect the locators
            else if( objElement.name.substr(0,3) == "tgl" )
            {
                if (!this.elementControllers[objElement.layer])
                {
                    this.elementControllers[objElement.layer] = new Array ();
                }
                
           		// e.g. "spin"
           		var arrParts = objElement.name.split(".")[0].split("_");
                var strId = [];
           		for (var k = 1; k < arrParts.length - 1; k++) {
           			strId.push(arrParts[k]);
           		}
           		
           		if (arrParts.length == 2)
                {
                    strId = arrParts[1]; 
                }
                else
                {
                    strId = strId.join("_");     
                }
                

            	// Do once for button which may have several images    
                if (!this.elementControllers[objElement.layer][strId])
                {
					this.elementControllers[objElement.layer][strId] = new ToggleButtonController(this.objGuiView.getButtonView(strId), true);
                }
            }
            // Detect other (e.g. reels frame and components?)
            else
            {
                if (!this.elementControllers[objElement.layer])
                {
                    this.elementControllers[objElement.layer] = new Array ();
                }
                
	            this.elementControllers[objElement.layer][objElement.id] = new ElementController(this.objGuiView.getElement(0,objElement.id));
			}
        }
    }
}

/**
 * Add element
 * 
 * @param { integer } intLayer The number for the layer
 * @param { String } strId The id for the new element
 * @param { Object } objElementController Adds a new element controller
 */  
GuiController.prototype.addElement = function ( intLayer, strId,objElementController)
{
    if (!this.elementControllers[intLayer])
    {
        this.elementControllers[intLayer] = new Array ();
    }
    
    this.elementControllers[intLayer][strId] = objElementController;
    this.objGuiView.blDirty = true;
}

/**
 * Remove element
 * 
 * @param { Number } intLayer id for the layer
 * @param { String } strId The id if the element
 */  
GuiController.prototype.removeElement = function ( intLayer, strId )
{
	if (this.elementControllers[intLayer] != undefined && this.elementControllers[intLayer][strId] != undefined)
	{
		//remove element with this ID
	    delete this.elementControllers[intLayer][strId];
	    
	    //remove the whole layer if empty
	    var blEmpty = true;
	    for (var i in this.elementControllers[intLayer])
	    {
	    	blEmpty = false;
	    	break;
	    }
	    if (blEmpty)
	    {
	    	delete this.elementControllers[intLayer]
	    }
	}
	else
	{
		console.log("could not remove element from GuiController", intLayer, strId, this.elementControllers);
		throw new Error("could not remove element from GuiController, layer: " + intLayer + " id: " + strId);
	}
	this.objGuiView.blDirty = true;
}

/**
 * Remove element by object given
 * 
 * @param { Object } objectToRemove
 * @param { String } strId The id for the new element
 * @param { Object } objElementController Adds a new element controller
 */  
GuiController.prototype.removeElementByObject = function ( objectToRemove )
{
	for (var intLayer in this.elementControllers)
	{
		for (var strId in this.elementControllers[intLayer])
		{
			if (this.elementControllers[intLayer][strId] == objectToRemove)
			{
				this.removeElement(intLayer, strId);
			} 
		}
	}
	this.objGuiView.blDirty = true;
}

/**
 * Replace element
 * Keep in mind that it might be important to call replaceElement in GuiView as well
 * 
 * @param { Object } objCurrentElement to be removed
 * @param { Object } objNewElement to be repaced with
 */  
GuiController.prototype.replaceElement = function ( objCurrentElement, objNewElement )
{
	for (var intLayer in this.elementControllers)
	{
		var arrElements = this.elementControllers[intLayer];
		for (var strId in arrElements)
		{
			if (arrElements[strId] === objCurrentElement)
			{
				arrElements[strId] = objNewElement;
			}
		}
	}

	this.objGuiView.blDirty = true;
}

/**
 * Returns a resource by the name
 * @return {String} strName The name of the resource to be returned
 */
GuiController.prototype.getResourceByName = function ( strName )
{
    return ( this.objGuiModel.getResourceByName( strName ) );
}


/**
 * Notify view, that will make buttons enabled/disabled
 * @param blEnabled sets this.blEnableEvents
 */
GuiController.prototype.setEnableEvents = function(blEnabled)
{
	this.objGuiView.setEnableEvents(blEnabled);
	this.blEnableEvents = blEnabled;
}


/**
 * Enable /disable events
 * This will enable / disable all the buttons
 * 
 * @param {boolean} blEnabled
 */
/*
GuiController.prototype.setEnableEvents = function(blEnabled)
{
    this.blEnableEvents = blEnabled;
    for (var i  in this.arrLayers)
    {
        for (var strElement in this.arrLayers[i])
        {
            this.arrLayers[i][strElement].setEnabled(blEnabled);
        }
    }
}*/

/**
 * Handles touch coordinates when touch starts
 * 
 * @param {EventControllerEvent} objEvent
 * @param {number} intX
 * @param {number} intY
 * @param {boolean} blFirstTouch - true if this is the first touch
 */
GuiController.prototype.onTouchStart = function(objEvent, intX, intY, blFirstTouch)
{
    this.intStartY = (intY /  this.objExternalController.intrelation) -  this.intLastOffsetY;

	if( this.blEnableEvents )
	{
		intX = intX / this.objExternalController.intrelation;
		intY = intY / this.objExternalController.intrelation;
		
		for (var i = 0; i < this.elementControllers.length; i++)
		{
			for (var j in this.elementControllers[i] )
			{
				this.elementControllers[i][j].onTouchStart(objEvent, intX, intY, blFirstTouch);
	
		        if (objEvent.isPropagationStopped())
		        {
		        	break;
		        }
			}
	
	        if (objEvent.isPropagationStopped())
	        {
	        	break;
	        }
		}
	}
}

/**
 * Handles touch coordinates on each touch move event
 * 
 * @param {EventControllerEvent} objEvent
 * @param {number} intX
 * @param {number} intY
 */
GuiController.prototype.onTouchMove = function(objEvent, intX, intY)
{
	if( this.blEnableEvents )
	{
		intX = intX / this.objExternalController.intrelation;
	    intY = intY / this.objExternalController.intrelation;
	    
	    var intSwipeY = intY - this.intStartY;
	    
	    
	    if(intSwipeY >= this.intSwipeTopY)
	    {
	       intSwipeY = this.intSwipeTopY; 
	    }
	    
	    if(intSwipeY < this.intSwipeBottomY)
	    {
	       intSwipeY = this.intSwipeBottomY; 
	    }
	
	    for (var i = 0; i < this.elementControllers.length; i++)
	    {
	        for (var j in this.elementControllers[i] )
	        {
	            this.elementControllers[i][j].onTouchMove(objEvent, intX,intY, intSwipeY);
	            this.intLastOffsetY = intY - this.intStartY;
	            
		        if (objEvent.isPropagationStopped())
		        {
		        	break;
		        }
	        }
	
	        if (objEvent.isPropagationStopped())
	        {
	        	break;
	        }
	    }
	}
}

/**
 * Handles touch coordinates on touch end
 * 
 * @param {EventControllerEvent} objEvent
 * @param {number} intX
 * @param {number} intY
 */
GuiController.prototype.onTouchEnd = function(objEvent, intX, intY)
{
	if( this.blEnableEvents )
	{
		intX = intX / this.objExternalController.intrelation;
	    intY = intY / this.objExternalController.intrelation;
		
		var blStopProcessing = false;
	    for (var i = 0; i < this.elementControllers.length; i++)
	    {
	        for (var j in this.elementControllers[i] )
	        {
				//
	            this.elementControllers[i][j].onTouchEnd(objEvent, intX, intY);
	
		        if (objEvent.isPropagationStopped())
		        {
		        	break;
		        }
	        }
	
	        if (objEvent.isPropagationStopped())
	        {
	        	break;
	        }
	    }
	}
}

/**
 * Handles touch coordinates on click event
	 *  If events are not enabled for this controller, do nothing.
 * @param {EventControllerEvent} objEvent
 * @param {number} intX
 * @param {number} intY
 */
GuiController.prototype.onClick = function(objEvent, intX, intY)
{
	if( this.blEnableEvents )
	{
		/*
		 * Adjust X and Y according to scaling
		 */
		intX = intX / this.objExternalController.intrelation;
	    intY = intY / this.objExternalController.intrelation;
		
		/*
		 * NOTE: This is the *one callback for the entire guiController*
		 * E.G. The Big Win controller 
		 */
		this.onClickCallback(objEvent, intX, intY);
	
		//
		for (var i = 0; i < this.elementControllers.length; i++)
	    {
	        for (var j in this.elementControllers[i] )
	        {
	        	/*
	        	 * NOTE: onClick method for *each individual gui element* called HERE!
	        	 * E.G. A button on the console
	        	 */
	            if (this.elementControllers[i][j].onClick(objEvent, intX, intY) && this.blEnableGroup)
	            {
	                //this.blIgnoreMoreClicks = true;
	            }
	
		        if (objEvent.isPropagationStopped())
		        {
		        	break;
		        }
	        }
	
	        if (objEvent.isPropagationStopped())
	        {
	        	break;
	        }
	    }
	}
}

/**
 * Retrieve canvas object
 * @return { Object } 
 */
GuiController.prototype.getCanvas = function()
{
	return this.objGuiView.getCanvas();
}

/**
 * Current position for Event Controller 
 */
GuiController.prototype.getX = function()
{
	
	var left = 0;
	if (this.objExternalController && this.objExternalController.objDivContainer) {
		left = this.objExternalController.objDivContainer.offsetLeft;
	}
	return this.objGuiView.context.canvas.offsetLeft + left;
}

/**
 * Current position for Event Controller 
 */
GuiController.prototype.getY = function()
{
	var top = 0;
	if (this.objExternalController && this.objExternalController.objDivContainer) {
		top = this.objExternalController.objDivContainer.offsetTop;
	}
	return this.objGuiView.context.canvas.offsetTop + top;
}

/**
 * Current position for Event Controller 
 */
GuiController.prototype.getGuiView = function()
{
	return this.objGuiView;
}

/**
 * Current position for Event Controller 
 */
GuiController.prototype.getWidth = function()
{
	if(this.objExternalController == undefined)
	{
		throw new Error("StateFactory.arrGuiControllers[...].objExternalController not defined for [something]!");
	}
	return parseInt(this.getCanvasWidth() * this.objExternalController.intrelation);
}

/**
 * Current position for Event Controller 
 */
GuiController.prototype.getHeight = function()
{
	if(this.objExternalController == undefined)
	{
		throw new Error("StateFactory.arrGuiControllers[...].objExternalController not defined for [something]!");
	}
	return parseInt(this.getCanvasHeight() * this.objExternalController.intrelation);
}

/**
 * Current position for Event Controller 
 *
 * @return {number}
 */
GuiController.prototype.getCanvasWidth = function()
{
	return parseInt(this.objGuiView.context.canvas.width);
}

/**
 * Current position for Event Controller 
 *
 * @return {number}
 */
GuiController.prototype.getCanvasHeight = function()
{
	return parseInt(this.objGuiView.context.canvas.height);
}
