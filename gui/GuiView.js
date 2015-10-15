/**
 * @author Javier.Ortega
 * 
 * This class will contain the common functionality to all the loaders
 */

/**
 * Constructor
 */
function GuiView(  )
{
    /**
     * The context to draw the visual object.
     * @type {Object}
     */
    this.context = null;
    
    /**
     * Collection for the different layers.
     * These are Views
     * @type {Array}
     */
    this.arrLayers = []
    
    /**
     * These are place holders. images what we don't want to load because we are using to get the coordinates for other elements
     * @type {Array}
     */
    this.arrPlaceHolders = []
    
    /**
     * x or offset for the x coordinate.
     * @type {int}
     */
    this.intX = 0;
    
    /**
     * y or offset for the y coordinate.
     * @type {int}
     */
    this.intY = 0;

    /**
     * An object reference for the controller for the assets.
     * @type {Object}
     */        
    this.objController;
    
    /**
     * A boolean to enable the component to receive events
     * @type {Boolean}
     */
    this.blEnableEvents = true;
    
    /**
     * To indicate if it is necessary to redraw the screen
     * @type {Boolean}
     */      
    this.blDirty = true;
    
    /**
     * To indicate if the screen is visible
     * @type {Boolean}
     */      
    this.blVisible = true;
    
    /**
     * To current state
     * @type { String }
     */      
    this.STR_NORMAL = "strNormal";
    
    /**
     * To current state
     * @type { String }
     */      
    this.STR_JSON_DATA_PARSED = "strJsonDataParsed";
    
    /**
     * To current state
     * @type { String }
     */      
    this.strState = this.STR_NORMAL;
    
    this.intBackGroundWidth = 0;
    this.intBackGroundHeigth = 0;
    
    this.blAnimated = false;
    
    this.blContinuos = false; 
}

/**
 * Derive GuiView from our base type to provide inheritance
 */
Class.extend( Class, GuiView );

/**
 *  Set the data for the view. This function expects to have acces to the json files ( already loaded) throught controller
 * @param {object} objController
 */
GuiView.prototype.setData = function (objController)
{   
    this.objController = objController;
    
    if ( this.objController.objGuiModel.objLayout )
    {
        this.processJSONLayout( objController.objGuiModel.objLayout );
    }
};


/**
 * Replace element
 * Keep in mind that it might be important to call replaceElement in GuiView as well
 * 
 * @param { Object } objCurrentElement to be removed
 * @param { Object } objNewElement to be repaced with
 */  
GuiView.prototype.replaceElement = function ( objCurrentElement, objNewElement )
{
    for (var intLayer in this.arrLayers)
    {
        var arrElements = this.arrLayers[intLayer];
        for (var strId in arrElements)
        {
            if (arrLayers[strId] === objCurrentElement)
            {
                arrLayers[strId] = objNewElement;
            }
        }
    }
    this.blDirty = true;
}

/**
 *  Process ther json data to obtain the layout for the screen
 * @param {object} objJSONData
 */    
GuiView.prototype.processJSONLayout = function ( objJSONData )
{        
    var objElement;
    
    //We will use these variables to calculate the dimensions of the GuiView
    var objMostLeft = null;
    var objMostRight = null;
    var objMostTop = null;
    var objMostBottom = null;
    
    var elementToCheck;
    
    for ( var i = 0; i < objJSONData.layers.length ; i++ )
    {
        for ( var j = 0; j < objJSONData.layers[i].elements.length ; j++ )
        {   
            objElement = objJSONData.layers[i].elements[j];
                           

            //To detect a place holder and put it in an special array to be not processed
            if ( objElement.name.search( "pixel" ) != -1 )
            {   
                            
                if ( !this.arrPlaceHolders[objElement.layer] )
                {
                    this.arrPlaceHolders[objElement.layer] = new Array ();
                }
            
                this.arrPlaceHolders[objElement.layer][objElement.id] = new ElementView ();
                this.arrPlaceHolders[objElement.layer][objElement.id].processJSONLayout(objElement);
                this.arrPlaceHolders[objElement.layer][objElement.id].intWidth = 1;
                this.arrPlaceHolders[objElement.layer][objElement.id].intHeight = 1;
                this.arrPlaceHolders[objElement.layer][objElement.id].blVisible = false;
                
                elementToCheck = this.arrPlaceHolders[objElement.layer][objElement.id];
            }
            
            // TODO: we should either use ".name" or ".id" not both.
            else if ( objElement.name.substr(0,3) == "txt" )
            {   
                
                if ( !this.arrLayers[objElement.layer] )
                {
                    this.arrLayers[objElement.layer] = new Array ();
                }
                
                var strID = TextBoxView.getIDFromString(objElement.id);             
                
                this.arrLayers[objElement.layer][strID] = new TextBoxView ();
                this.arrLayers[objElement.layer][strID].processJSONLayout(objElement);
                this.arrLayers[objElement.layer][strID].intWidth = objElement.width - objElement.x;
                this.arrLayers[objElement.layer][strID].intHeight = objElement.height - objElement.y;
                this.arrLayers[objElement.layer][strID].setParent(this);

				/* 
				 * Line win text box displays win amount then line number underneath in a smaller font.
				 * Removed for now as we are using that screen space to show total wager.
				
				this.arrLayers[objElement.layer][strID] = new LineWinTextBoxView ( "", 
																			arrTxtDetails.slice(2,5), 
																			objElement.x, 
																			objElement.y, 
								         // Reset width & height with values adjusted for photoshop wierdness
																			objElement.width - objElement.x, 
																			objElement.height - objElement.y);
				*/
                
                this.arrLayers[objElement.layer][strID].blVisible = true;
                elementToCheck = this.arrLayers[objElement.layer][strID];
            }
            
            // Create button objects
            else if( objElement.name.substr(0,3) == "btn" ||
            		 objElement.name.substr(0,3) == "tgl" )
            {
                if ( !this.arrLayers[objElement.layer] )
                {
                    this.arrLayers[objElement.layer] = new Array ();
                }

           		// e.g. "spin"
           		var arrParts = objElement.name.split(".")[0].split("_");
                var strId = [];

				for (var k = 1; k < arrParts.length - 1; k++)
				{
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
				

                // e.g. "normal", "pressed", "inactive"
                //var arrSplits = objElement.name.split("_");
                var strState =  arrParts[arrParts.length - 1];
                
                if (arrParts.length == 2)
                {
                    strState = "normal";
                }
                
                // If button does not already exist create it
                // Also assign context and image, set layout etc (goes to parent ElementView object)
                if ( !this.arrLayers[objElement.layer][strId] )
                {
                    //this.arrLayers[objElement.layer][strId] = new ButtonView ( strId );
            		this.arrLayers[objElement.layer][strId] = new ButtonView ( strId );
                    //init view object
                    var imState = this.objController.getResourceByName(objElement.name);
                    if (!strState)
                    {
                        strState = "normal";
                    }
                    this.arrLayers[objElement.layer][strId].init(this.context,  imState, null, null, null, strState );
                    
                    //set parent of this view object
                    this.arrLayers[objElement.layer][strId].setParent(this);

					//set values                    
                    this.arrLayers[objElement.layer][strId].processJSONLayout(objElement);
                    this.arrLayers[objElement.layer][strId].intWidth = imState.width;
                    this.arrLayers[objElement.layer][strId].intHeight = imState.height;
                }
                // If it already exists just add further states
                else
                {
                	this.arrLayers[objElement.layer][strId].addState ( this.objController.getResourceByName(objElement.name), strState);
                }
                elementToCheck = this.arrLayers[objElement.layer][strId];
            }
            // Create other onscreen view object.
            else
            {
                
                if ( !this.arrLayers[objElement.layer] )
                {
                    this.arrLayers[objElement.layer] = new Array ();
                }

	            this.arrLayers[objElement.layer][objElement.id] = new ElementView (this);
	            var imState = this.objController.getResourceByName(objElement.name);
	            this.arrLayers[objElement.layer][objElement.id].init(this.context,  this.objController.getResourceByName(objElement.name),1,1,1,objElement.name );
	            this.arrLayers[objElement.layer][objElement.id].processJSONLayout(objElement);
	            this.arrLayers[objElement.layer][objElement.id].intWidth = imState.width;
                this.arrLayers[objElement.layer][objElement.id].intHeight = imState.height;
                
                elementToCheck = this.arrLayers[objElement.layer][objElement.id];
	         }
	         
	        //Check bounds for this Guiview	         
	        if (objMostLeft == null || elementToCheck.intX < objMostLeft.intX)
	        {
	            objMostLeft = elementToCheck;
	        }
	        
	        if (objMostRight == null || elementToCheck.intX  + elementToCheck.intWidth>  objMostRight.intX + objMostRight.intWidth)
            {
                objMostRight = elementToCheck;
            } 
            
            if ( objMostTop == null || elementToCheck.intY < objMostTop.intY )
            {
                objMostTop = elementToCheck;
            }
            
            if ( objMostBottom == null || elementToCheck.intY > objMostBottom.intY + objMostBottom.intHeight)
            {
                objMostBottom = elementToCheck;
            }
            
        }

    }

    this.intInitX = objMostLeft.intX;
    this.intInitY = objMostTop.intY;
    this.intInitWidth = objMostRight.intX + objMostRight.intWidth;
    this.intInitHeight = objMostBottom.intY + objMostBottom.intHeight;
    
    //and now set normal state to all of them
    for (var idLayer in this.arrLayers)
    {
    	for (var idElement in this.arrLayers[idLayer])
    	{
    		if (this.arrLayers[idLayer][idElement] instanceof ButtonView)
    		{
    			this.arrLayers[idLayer][idElement].setState("normal");
    		}
	    }
	}

    //
    this.strState = this.STR_JSON_DATA_PARSED;
};

/**
 *  Look for an element in a layer and to return this element 
 * @param {int} intLayer
 * @param {string} strName
 * @return {object}
 */
GuiView.prototype.getElement = function (intLayer, strName)
{

    for (var i in this.arrLayers)
    {      
        if (this.arrLayers[i][strName])
        {
            return (this.arrLayers[i][strName]);
        }   
    }   
}

/**
 *  Look for an element in a layer and to return this element 
 * @param {int} intLayer
 * @param {string} strName
 * @return {object}
 */
GuiView.prototype.getTextView = function (strName)
{
    for (var i in this.arrLayers)
    {      
        if (this.arrLayers[i][strName] && this.arrLayers[i][strName].strType == "txt")
        {
            return (this.arrLayers[i][strName]);
        }   
    }   
}


/**
 *  Look for an element in a layer and to return this element 
 * @param {int} intLayer
 * @param {string} strName
 * @return {object}
 */
GuiView.prototype.getButtonView = function (strName)
{
    for (var i in this.arrLayers)
    {      
        if (this.arrLayers[i][strName] && this.arrLayers[i][strName].strType == "btn")
        {
            return (this.arrLayers[i][strName]);
        }   
    }   
}

/**
   Look for a place holder in and to return this element
 * @param {string} strName
 * @return {object}
 */
GuiView.prototype.getPlaceHolder = function ( strName )
{     
    for ( var i in this.arrPlaceHolders )
    {      
        if ( this.arrPlaceHolders[i][strName] )
        {
            return ( this.arrPlaceHolders[i][strName] );
        }   
    }
}

/**
 *  Add a new element to the view
 * @param {int} intLayer
 * @param { String } strName
 * @param { ElementView } objElement
 * @return {object}
 */
GuiView.prototype.addElement = function (intLayer, strName, objElement)
{
    if (!this.arrLayers[intLayer])
    {
        this.arrLayers[intLayer] = new Array();
    }
    this.arrLayers[intLayer][strName] = objElement;
    this.blDirty = true;
}

/**
 *  Add a new element to the view
 * @param { String } strName 
 * @param {int} intNewLayer The new layer for this element 
 */
GuiView.prototype.changeLayer = function (strName, intNewLayer)
{   
   var newArray = new Array();
   
   for (var i  in this.arrLayers)
   {
        if (!newArray[i])
        {
            newArray[i] = new Array(); 
        }           
        
        for (var strElement in this.arrLayers[i])
        {
            if (strName !=  strElement)
            {
                newArray[i][strElement] = (this.arrLayers[i][strElement]);
            }
            else
            {
                if (!newArray[intNewLayer])
                {
                    newArray[intNewLayer] = new Array();
                }
                newArray[intNewLayer][strElement] = this.arrLayers[i][strElement];
            }
        }
    }
    this.arrLayers = newArray;
}

/**
 *  Remove an element from the Screen 
 * @param {int} intLayer
 * @param {string} strName
 */
GuiView.prototype.removeElement = function (intLayer, strName){
    
    var newArray = new Array();
    
    //for (var i = 0; i < this.arrLayers.length ; i++){
    for (var i  in this.arrLayers){
        if (!newArray[i]){
            newArray[i] = new Array(); 
        }           
        for (var strElement in this.arrLayers[i]){
            if (strName != strElement){
                newArray[i][strElement] = (this.arrLayers[i][strElement]);
            }
        }
    }   
    this.arrLayers = newArray;
	this.blDirty = true;
}

/**
 *  Remove an element from the View 
 * @param {object} objectToRemove
 */
GuiView.prototype.removeElementByObject = function (objectToRemove){
	for (var intLayer in this.arrLayers)
	{
		for (var strId in this.arrLayers[intLayer])
		{
			if (this.arrLayers[intLayer][strId] == objectToRemove)
			{
				this.removeElement(intLayer, strId);
			} 
		}
	}
	this.blDirty = true;
}

/**
 *  Set a context
 * @param objContext The new context
 */  
GuiView.prototype.setContext = function( objContext , intWidth, intHeight) 
{
    this.context = objContext;
   
    for (var i  in this.arrLayers)
    {
        for (strElement in this.arrLayers[i])
        {
            this.arrLayers[i][strElement].setContext ( this.context );
        }
    }
}

/**
 * Retreive canvas object
 * @return { Object } 
 */
GuiView.prototype.getCanvas = function()
{
	return this.context.canvas;
}

/**
 * To create an offline canvas, in this case we will use it as a virtual image
 * 
 * @param { Integer } intWidth The width canvas
 * @param { Integer } intHeight The height canvas
 * @param { String } strId The id for this canvas
 */
GuiView.prototype.createOfflineCanvas = function( intWidth, intHeight, strId)
{
    var objCanvas = document.createElement('canvas');
    objCanvas.width = intWidth;
    objCanvas.height = intHeight;
    return objCanvas;
}


/**
 * Set the property blDirty to true, to force redraw the screen
 */
GuiView.prototype.setDirty = function (blDirty)
{
    this.blDirty = blDirty;    
}

/**
 * Set the property blDirty to true, to force redraw the screen
 */
GuiView.prototype.update = function ()
{
    this.blDirty = true;    
}

/**
 *  Draw the full screen
 */  
GuiView.prototype.draw = function() 
{
    if((this.blDirty || this.blContinuos) && (LoadingScreenController.blHide || this.objController.strName=="loadingScreen") )
    {
        var intCount = 0;
        
        if (this.blVisible )
        {
            for (var i  in this.arrLayers)
            {
                for (strElement in this.arrLayers[i])
                {
                    this.arrLayers[i][strElement].draw (this.intX, this.intY);
                    intCount++;
                }
            }
        }
        
        this.blDirty = false;
    }
}

/*
 * Double buffering code
 * Notused right now
 */
GuiView.prototype.changeContext = function(newContext)
{
    for (var i  in this.arrLayers)
    {
        for (strElement in this.arrLayers[i])
        {
            this.arrLayers[i][strElement].context = newContext;
        }
    }
}

/**
 * Is ready to redraw?
 * @return {boolean} 
 */
GuiView.prototype.isDirty = function()
{
	return (this.blDirty || this.blContinuos);
}

GuiView.prototype.clean = function ()
{
    this.context.clearRect (0, 0, this.context.canvas.width, this.context.canvas.height );
    //console.log ("Clean Screen width");
    //this.context.canvas.width = this.context.canvas.width; //clean the canvas on Samsung Android 4.1.1 / 4.1.2 (https://code.google.com/p/android/issues/detail?id=39247)
}


/**
 *  Process something related with the layout of the different elements, here.
 *  
 */    
GuiView.prototype.layout = function() 
{

};

GuiView.prototype.setVisible = function(blVisible)
{
	this.blVisible = blVisible;
	this.update();
}

GuiView.prototype.isVisible = function()
{
	return this.blVisible;
}
