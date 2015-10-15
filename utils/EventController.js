/**
 * Event Controller
 * 
 * Handles touch and mouse events for items in Event Controller.
 *
 * Features:
 * 
 * - add / remove items to / from Event Controller
 * 
 * - enable / disable items in Event Controller (disabled items will be ignored)
 * 
 * - decide if the item is going to be accepting touchmove / mousemove events
 * (decide during adding into controller, default is false)
 *
 * - decide if the item is going to stop propagation
 * (decide during adding into controller, default is false)
 *   Use this only in case more items lie on top of each other
 *   This means that during iterating of items in touchStart method, when the item with stop propagation = true is touched, this iteration will stop
 *   and no further items will accept touch events
 *   !It dependads on the order in which items are added into Event Controller!
 *   Also this will not stop propagation of event when this item has not been touched
 *   For clear understanding see example
 *
 * Interface for items added into controller:
 *
 *   Positions:
 *   - getX()
 *   - getY()
 *   - getWidth()
 *   - getHeight()
 *
 *   Events:
 *   - onTouchStart(x, y, blIsFirstTouch)
 *   - onTouchEnd(x, y)
 *   - onTouchMove(x, y) - this is necessary only in case the item is going to accept move events
 *
 * Configuration:
 *
 * - Controller requires configuration setup
 * - default configuration setup is stored in global EventController.SETUP variable
 * - it would be smart to make clone of this object for Event Manager instantiation (in case there is more instances of Event Controller)
 *
 */

//isolation
(function(window)
{
	/**
	 * Event Controller class
	 * constructor
	 * 
	 * @param {object} objEventControllerSetup configuration
	 */
	function EventController(objEventControllerSetup)
	{
		this.objSetup = objEventControllerSetup;
		this.intOffsetX = 0; //main element offsetX
		this.intOffsetY = 0; //main element offsetY
		
		this.blInTouch = false; //true between touchstart and touchend
	
		//current touch pos relative to this.objSetup.mainElement
		this.intCurrentX = 0;
		this.intCurrentY = 0;
		
		//items
		this.arrItems = [];
		this.intItemsLength = 0;
		this.intItemsIterator = 0;
		
		this.arrOnClickButtons = [];
		this.intOnClickButtonsLength = 0;
		
		//current item
		this.objCurrentItem = null;
		//current item coords
		this.intCurrentItemX = 0;
		this.intCurrentItemY = 0;
		this.intCurrentItemW = 0;
		this.intCurrentItemH = 0;
		
		//active items
		this.arrCurrentActiveItems = [];
		this.intCurrentActiveItemsLength = 0;
		
		//event
		this.currentEvent = null;
		
		this.init();
	};
	
	/**
	 * Derive EventController from our base type to provide inheritance
	 */ 
	Class.extend(Class, EventController);
	
	/**
	 * Event Controller default setup, use for instantiation of EventController
	 */
	EventController.SETUP = {
		//disable / enable event propagation for window scrolling
		disableWindowScrolling: true,
	
		//decide where to start catching events
		//for performance reasons, Event CAPTURING can be used instead of usual Event BUBBLING
		mainElement: window.document
	};
	
	/**
	 * Event Controller initialisation
	 * - is called automatically from constructor
	 */
	EventController.prototype.init =  function()
	{
		var that = this;
	
		//callbacks
		function onTouchStart(event)
		{
			that.touchStart(event);
		};
		function onTouchMove(event)
		{
			that.touchMove(event);
		};
		function onTouchEnd(event)
		{
			that.touchEnd(event);
		};
		
		//event listeners
		var capturing = false;
		if (this.isTouchDeviceDetected())
		{
			this.addEventListener(this.objSetup.mainElement, 'touchstart', onTouchStart, capturing);
			this.addEventListener(window.document, 'touchmove', onTouchMove, capturing);
			this.addEventListener(window.document, 'touchend', onTouchEnd, capturing);
		}
		else
		{
			this.addEventListener(this.objSetup.mainElement, 'mousedown', onTouchStart, capturing);
			this.addEventListener(window.document, 'mousemove', onTouchMove, capturing);
			this.addEventListener(window.document, 'mouseup', onTouchEnd, capturing);
		}
		
		//offset handling
		this.intOffsetX = this.objSetup.mainElement.offsetLeft;
		this.intOffsetY = this.objSetup.mainElement.offsetTop;
	};
	
	/**
	 * Add item into Event Controller
	 * - see interface requirements for item in documentation on top of this file
	 * - see the same place for more info about stopping event propagation (stopping propagation is usually not necessary)
	 *
	 * @param {object} objItem
	 * @param {boolean} blReceiveMoveEvents - not mandatory, default false
	 * @param {boolean} blStopEventPropagation - not mandatory, default false
	 */
	EventController.prototype.addItem = function(objItem, blReceiveMoveEvents, blStopEventPropagation)
	{
		if (!this.hasItem(objItem))
		{
			//create wrapper object
			var objItemWrapper = new Object();
			objItemWrapper.item = objItem;
			objItemWrapper.blnIsHovered = false; //true when currently hovered
			objItemWrapper.blReceiveMoveEvents = (blReceiveMoveEvents == undefined) ? false : blReceiveMoveEvents; //true when this item wants to capture move events
			objItemWrapper.blStopEventPropagation = (blStopEventPropagation == undefined) ? false : blStopEventPropagation; //when true, the iteration stops with this element during iterating through items
			objItemWrapper.blDisabled = false; //true when this element is ignored
	
			//add to array of items
			this.arrItems.push(objItemWrapper);
			this.intItemsLength++;
		}
	};
	
	/**
	 * Remove item from Controller
	 *
	 * @param {object} objItem
	 */
	EventController.prototype.removeItem = function(objItem)
	{
		for (var i = 0; i < this.arrItems.length; i++)
		{
			if (this.arrItems[i].item == objItem)
			{
				if (this.arrItems[i].blnIsHovered)
				{
					//make sure it gets released
					//currentX / Y should be OK
					this.arrItems[i].blnIsHovered = false; //not really important, it's going to be removed and destroyed in next step anyway
					this.arrItems[i].item.onTouchEnd(this.intCurrentX - this.arrItems[i].item.getX(), this.intCurrentY - this.arrItems[i].item.getY());
				}
				
				this.arrItems.splice(i, 1); //remove from array
				this.intItemsLength--;
				break;
			}
		}
	};
		
	/**
	 * Find out whether item is in controller
	 *
	 * @param {object} objItem
	 *
	 * @return {boolean}
	 */
	EventController.prototype.hasItem = function(objItem)
	{
		for (var i = 0; i < this.arrItems.length; i++)
		{
			if (this.arrItems[i].item == objItem)
			{
				return true;
			}
		}
		return false;
	};
	
	/**
	 * Enable item
	 *
	 * @param {object} objItem
	 */
	EventController.prototype.enableItem = function(objItem)
	{
		for (var i = 0; i < this.arrItems.length; i++)
		{
			if (this.arrItems[i].item == objItem)
			{
				this.arrItems[i].blDisabled = false;
				break;
			}
		}
		return false;
	};
	
	/**
	 * Disable item (will be ignored until enabled again)
	 *
	 * @param {object} objItem
	 */
	EventController.prototype.disableItem = function(objItem)
	{
		for (var i = 0; i < this.arrItems.length; i++)
		{
			if (this.arrItems[i].item == objItem)
			{
				if (this.arrItems[i].blnIsHovered)
				{
					//make sure it gets released
					//currentX / Y should be OK
					this.arrItems[i].blnIsHovered = false;
					this.arrItems[i].item.onTouchEnd(this.intCurrentX - this.arrItems[i].item.getX(), this.intCurrentY - this.arrItems[i].item.getY());
				}
				this.arrItems[i].blDisabled = true;
				break;
			}
		}
	
		//remove from current active buttons
		for (var i = 0; i < this.arrCurrentActiveItems.length; i++)
		{
			if (this.arrCurrentActiveItems[i].item == objItem)
			{
				this.arrCurrentActiveItems.splice(i, 1);
				this.intCurrentActiveItemsLength--;
			}
		}
		
	};
		
	/**
	 * This will return if the this.currentButton intersects with the current position (this.currentX / Y) 
	 */
	EventController.prototype.isCurrentButtonIntersect = function()
	{
		//get item coords
		this.intCurrentItemX = this.objCurrentItem.item.getX();
		this.intCurrentItemY = this.objCurrentItem.item.getY();
		this.intCurrentItemW = this.objCurrentItem.item.getWidth();
		this.intCurrentItemH = this.objCurrentItem.item.getHeight();
	
		//intersect with item
		if (this.intCurrentX >= this.intCurrentItemX
			&& this.intCurrentX <= this.intCurrentItemX + this.intCurrentItemW
			&& this.intCurrentY >= this.intCurrentItemY
			&& this.intCurrentY <= this.intCurrentItemY + this.intCurrentItemH)
		{
			//call event on item with position relative to the item
			return true;
		}
		else
		{
			return false;
		}
	};
		
	/**
	 * Handling onTouchStart / onMouseDown event
	 *
	 * @param {object} event
	 */
	EventController.prototype.touchStart = function(event)
	{
		//old IE
		if (!event)
		{
			event = window.event;
		}
		
		
		EventBase.preventDefault(event);
		
		event.stopPropagation();
		
		if (this.objSetup.onTouchStart)
		{
			this.objSetup.onTouchStart(event);
		}

		//handle our own event		
		this.currentEvent = this.createNewEvent();
		
		this.calculateCurrentPosition(event, "touches");
		
		//empty current active items
		this.arrCurrentActiveItems = [];
		this.intCurrentActiveItemsLength = 0;
	
		//go through items
		for (this.intItemsIterator = 0; this.intItemsIterator < this.intItemsLength; this.intItemsIterator++)
		{
			this.objCurrentItem = this.arrItems[this.intItemsIterator];
			//skip this item if disabled
			if (this.objCurrentItem.blDisabled)
			{
				continue;
			}
			
			//intersect with item
			// TO DO : To explain to Peter
			// The Gui controler doesn't have really physics coordinates 
			if (this.isCurrentButtonIntersect())
			{
				//call event on item with position relative to the item
				this.objCurrentItem.item.onTouchStart(this.currentEvent, this.intCurrentX - this.intCurrentItemX, this.intCurrentY - this.intCurrentItemY, true);
				this.objCurrentItem.blnIsHovered = true;
				
				//add item to active items
				this.arrCurrentActiveItems.push(this.objCurrentItem);
				this.intCurrentActiveItemsLength++;
				
				//stop event propagation / going through items
				if (this.objCurrentItem.blStopEventPropagation || this.currentEvent.isPropagationStopped())
				{
					break;
				}
			}
		}
		
		//mark in touch
		this.blInTouch = true;
		
		this.handleEventOnInteractionEnd(event);
	};
	
	/**
	 * Handling onTouchMove / onMouseMove event
	 *
	 * @param {object} event
	 */
	EventController.prototype.touchMove = function(event)
	{
	    //old IE
        if (!event)
        {
            event = window.event;
        }
        
        EventBase.preventDefault(event)
	    
	    event.stopPropagation();
	
		if (!this.blInTouch)
		{
			return;
		}
		
		//handle our own event
		this.currentEvent = this.createNewEvent();
		
		this.calculateCurrentPosition(event, "touches");
	
		for (this.intItemsIterator = 0; this.intItemsIterator < this.intCurrentActiveItemsLength; this.intItemsIterator++)
		{
			this.objCurrentItem = this.arrCurrentActiveItems[this.intItemsIterator];
	
			//skip this item if disabled
			if (this.objCurrentItem.blDisabled)
			{
				continue;
			}
			
			//intersect with item
			if (this.isCurrentButtonIntersect())
			{
				if (!this.objCurrentItem.blnIsHovered)
				{
					//call onTouchStart on this item
					this.objCurrentItem.blnIsHovered = true;
					this.objCurrentItem.item.onTouchStart(this.currentEvent, this.intCurrentX - this.intCurrentItemX, this.intCurrentY - this.intCurrentItemY, false);
				}
				if (this.objCurrentItem.blReceiveMoveEvents)
				{
					//send onTouchMove events to this item
					this.objCurrentItem.item.onTouchMove(this.currentEvent, this.intCurrentX - this.intCurrentItemX, this.intCurrentY - this.intCurrentItemY);
				}
			}
			else
			{
				//position is outside this item
				if (this.objCurrentItem.blnIsHovered)
				{
					//release this item
					this.objCurrentItem.blnIsHovered = false;
					this.objCurrentItem.item.onTouchEnd(this.currentEvent, this.intCurrentX - this.intCurrentItemX, this.intCurrentY - this.intCurrentItemY);
				}
			}

			//stop event propagation / going through items
			if (this.objCurrentItem.blStopEventPropagation || this.currentEvent.isPropagationStopped())
			{
				break;
			}
		}
		
		this.handleEventOnInteractionEnd(event);
	};
	
	
		
	/**
	 * Handling onTouchEnd / onMouseUp event
	 *
	 * @param {object} event
	 */
	EventController.prototype.touchEnd = function(event)
	{
	    
	    //old IE
        if (!event)
        {
            event = window.event;
        }
        
        EventBase.preventDefault(event);
        
		if (!this.blInTouch)
		{
			return;
		}
		
		//handle our own event
		//create separate event for onTouchEnd
		this.currentEvent = this.createNewEvent();
		
		this.calculateCurrentPosition(event, "changedTouches");
	
		// we are going to be adding buttons that were clicked to this array
		// we do that because first we call onTouchEnd on all of them
		// and AFTER that we call on click on all of them so have a nice sequence
		this.arrOnClickButtons = [];
		this.intOnClickButtonsLength = 0;
	
		//process onClick / onCancelDown
		for (this.intItemsIterator = 0; this.intItemsIterator < this.intCurrentActiveItemsLength; this.intItemsIterator++)
		{
			this.objCurrentItem = this.arrCurrentActiveItems[this.intItemsIterator];
			
			//skip this item if disabled
			if (this.objCurrentItem.blDisabled)
			{
				continue;
			}
			
			//intersect with item
			if (this.isCurrentButtonIntersect())
			{
				//notify the position on the item wrapper
				this.objCurrentItem.currentX = this.intCurrentX - this.intCurrentItemX;
				this.objCurrentItem.currentY = this.intCurrentY - this.intCurrentItemY;
				
				//add to queue
				this.arrOnClickButtons.push(this.objCurrentItem);
				this.intOnClickButtonsLength++;
				
			}
	
			if (this.objCurrentItem.blnIsHovered && !this.currentEvent.isPropagationStopped())
			{
				//release this item
				this.objCurrentItem.blnIsHovered = false;
				this.objCurrentItem.item.onTouchEnd(this.currentEvent, this.intCurrentX - this.intCurrentItemX, this.intCurrentY - this.intCurrentItemY);
				if (this.currentEvent.isPropagationStopped())
				{
					break;
				}
			}
	
		}
	
		//create separate event for onclick
		this.currentEvent = this.createNewEvent();
		//call onclick events in batch
		for (this.intItemsIterator = 0; this.intItemsIterator < this.intOnClickButtonsLength; this.intItemsIterator++)
		{
			this.objCurrentItem = this.arrOnClickButtons[this.intItemsIterator];
			this.objCurrentItem.item.onClick(this.currentEvent, this.objCurrentItem.currentX, this.objCurrentItem.currentY);
			if (this.currentEvent.isPropagationStopped())
			{
				break;
			}
		}
			
	
		
		//mark not in touch anymore
		this.blInTouch = false;
	
		this.handleEventOnInteractionEnd(event);
	};
		
	EventController.prototype.calculateCurrentPosition = function(event, strTouchKey)
	{
		//get coord
		if (event[strTouchKey] !== undefined)
		{
			this.intCurrentX = event[strTouchKey][0].pageX;
			this.intCurrentY = event[strTouchKey][0].pageY;
		}
		else if (event.pageX != undefined)
		{
			this.intCurrentX = event.pageX;
			this.intCurrentY = event.pageY;
		}
		else
		{
			this.intCurrentX = event.clientX + document.body.scrollLeft;
			this.intCurrentY = event.clientY + document.body.scrollTop;
		}
	
		//get the relative value
		this.intCurrentX -= this.intOffsetX;
		this.intCurrentY -= this.intOffsetY;
	};
		
	/**
	 * unified function for handling event on end of mouse/touch events
	 * 
	 * @param {object} event original event from browser  
	 */
	EventController.prototype.handleEventOnInteractionEnd = function(event)
	{
		this.stopEventPropagation(event);
		if (this.objSetup.disableWindowScrolling)
		{
			this.preventEventDefault(event);
		}
	};
	
	/* --------======= Helpers and polyfils =======--------- */
	
	/**
	 * Used for touch detection
	 * TODO: Replace with Framework detection tools
	 * 
	 * @return {bool}
	 */
	EventController.prototype.isTouchDeviceDetected = function()
	{
		return (!!('ontouchstart' in window) && !navigator.userAgent.match(/windows phone/i)); //windows phone behaves like 
	};
	
	/**
	 * Add Event Listener to DomNode
	 * Cross-Browser polyfil
	 *
	 * @param {DomNode} objDomNode
	 * @param {string} strTouchEvent
	 * @param {function} callback
	 * @param {boolean} capturing (not supported for IE < 9)
	 */
	EventController.prototype.addEventListener = function(objDomNode, strTouchEvent, callback, capturing)
	{
		if (objDomNode.addEventListener)
		{
			objDomNode.addEventListener(strTouchEvent, callback, capturing);
		}
		else
		{
			//old IE, capturing not supported
			objDomNode.attachEvent("on" + strTouchEvent, callback);
		}
	};
	
	/**
	 * Stop event propagation
	 * Cross-Browser polyfil
	 *
	 * @param {object} event
	 */
	EventController.prototype.stopEventPropagation = function(event)
	{
		if (event.stopPropagation) {
			event.stopPropagation();
		}
	};
	
	/**
	 * Prevent event default action
	 * Cross-Browser polyfil
	 *
	 * @param {object} event
	 */
	EventController.prototype.preventEventDefault = function(event)
	{
		if (event.preventDefault) {
			EventBase.preventDefault(event);
		}
	};
	
	/**
	 * Run this to create new event
	 * Override this method this to use another class for events 
	 */
	EventController.prototype.createNewEvent = function()
	{
		return new EventControllerEvent();
	}

	
	/** EVENT class for EventController */
	
	/**
	 * EventControllerEvent constructor 
	 */
	var EventControllerEvent = function()
	{
		this.blStopPropagation = false;
	};
	
	/**
	 * Stop event propagation 
	 */
	EventControllerEvent.prototype.stopPropagation = function()
	{
		this.blStopPropagation = true;
	}

	/**
	 * Is this event propagation stopped?  
	 */
	EventControllerEvent.prototype.isPropagationStopped = function()
	{
		return this.blStopPropagation;
	}

	window.EventController = EventController;
	window.EventControllerEvent = EventControllerEvent;
}(window));
