/**
 * @author Petr.Urban
 * 
 * Screen Cover Controller
 * Shows / hides the dark screen
 * Calls list of callbacks on click (on hide)
 */

/**
 * Constructor
 */
function ScreenCoverController()
{
    /**
     * This is the div container for the canvas
     * @type {Object}
     */
    this.objDivContainer = document.getElementById('sideBarArea');
    this.nodeScreenCover = null; //dom node for screen darkening
    
    this.blVisible = null;
    
    this.arrOnHideCallback = [];
    this.initScreenCover();
    
    this.onClickDoNothing = this.onClickDoNothing.bind(this);
    this.onClick = this.onClick.bind(this);
}

Class.extend(Class, ScreenCoverController);


/**
 * Set Screen Cover Visibility
 * @param {boolean} blVisible
 */
ScreenCoverController.prototype.setVisible = function(blVisible)
{
	if (this.blVisible != blVisible)
	{
		this.blVisible = blVisible;
		if (this.blVisible)
		{
			//show screen cover
			this.nodeScreenCover.style.height = window.innerHeight + "px";
			this.nodeScreenCover.style.width = window.innerWidth + "px";
			this.nodeScreenCover.className = "screen-cover-visible"; //could be "" empty string but that could make issues on IE browsers
		}
		else
		{
			//hide screen cover
			this.nodeScreenCover.className = "screen-cover-hidden";
			
			//run callbacks on hide
			this.runOnHideCallbacks();
		}
	}
}

/**
 * Is visible at the moment? 
 */
ScreenCoverController.prototype.isVisible = function()
{
	return this.blVisible;
}

/**
 * runs on hide callbacks 
 */
ScreenCoverController.prototype.runOnHideCallbacks = function()
{
	for (var i in this.arrOnHideCallback) {
		this.arrOnHideCallback[i]();	
	}
}

/**
 * Add callback to be run on hide event 
 * @param {Function} callback
 */
ScreenCoverController.prototype.addOnHideCallback = function(callback)
{
	this.arrOnHideCallback.push(callback);
}

ScreenCoverController.prototype.initScreenCover = function()
{
	//create node
	if (!this.nodeScreenCover) {
		this.nodeScreenCover = document.createElement("div");
		this.nodeScreenCover.id = "screen-cover";
		
		var that = this;
		var onClick = function(e) {
			that.onClick(e);
		}
		var onClickDoNothing = function(e) {
			that.onClickDoNothing(e);
		}
	    this.nodeScreenCover.ontouchstart = onClick;
	    this.nodeScreenCover.onmousedown = onClick;
	
	    this.nodeScreenCover.onmouseup = onClickDoNothing;
	    this.nodeScreenCover.onmouseclick = onClickDoNothing;
	    this.nodeScreenCover.ontouchend = onClickDoNothing;
	
		document.body.appendChild(this.nodeScreenCover);
	}
}

ScreenCoverController.prototype.onClick = function(e)
{
	EventBase.preventDefault(e);
	e.stopPropagation();
	
	this.setVisible(false);
	
	return false;
}

ScreenCoverController.prototype.onClickDoNothing = function(e)
{
	EventBase.preventDefault(e);
	e.stopPropagation();
	
	return false;
}

ScreenCoverController.prototype.resize = function()
{
	if (this.nodeScreenCover)
	{
		this.nodeScreenCover.style.height = window.innerHeight + "px";
		this.nodeScreenCover.style.width = window.innerWidth + "px";
	}
}
