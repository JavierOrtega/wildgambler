/**
 * 
 * @author Javier Ortega 
 *
 * This class handles 
 * 
 * @class
 */
function EventBase()
{

}

Class.extend(Class, EventBase);

EventBase.BL_ENABLE_PREVENT_DEFAULT = true;

/**
 * This function overrides the default prevent default event 
 * @param {Object} objEvent
 */
EventBase.preventDefault =  function (objEvent)
{
    if (EventBase.BL_ENABLE_PREVENT_DEFAULT )
    {   
        objEvent.preventDefault();
    }
}

/**
 * This function enable/disable the prevent default 
 * @param {Boolean} blSelected
 */
EventBase.enablePreventDefault =  function (blSelected)
{
    EventBase.BL_ENABLE_PREVENT_DEFAULT = blSelected;
}
