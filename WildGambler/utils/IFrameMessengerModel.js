/**
 * This FRAMEWORK class controls the communication between the application i.e. the GAME
 * which is embedded in the Sidebar's iFrame, and the SIDEBAR.
 * 
 * This class POSTS messages to the SIDEBAR, which is addressed 
 * in static variable IFrameMessengerModel.strUrlParent. The sidebar is listening for POST events
 * in its StateFactory, which is registered with window as an event listener of type "message", 
 * receiving messages in StateFactory.prototype.handleListenExternalMessages(strJSON).
 * From there, Sidebar's StateFactory can either deal with the message directly, e.g. by setting 
 * the balance display amount, or it can respond back to the game via this class using a POST event.
 *  
 * This class LISTENS for POST messages from the Sidebar using a window event listener for type "message".
 * Messages POSTed here from the Sidebar are handled in method processMessages. 
 * These messages are further handled using STATIC functions which are ABSTRACT. 
 * We should override these static implementations in any class that we want
 * to receive the results in.
 * 
 * EXAMPLE: If the player presses a sidebar button to kill the sound, we receive the message here
 *          and call static abstract function IFrameMessengerModel.toggleSound(JSON.message).
 *          We should have over-ridden this function in the Game's SidebarCommController with the line
 *          IFrameMessengerModel.toggleSound = this.toggleSound;
 *          From there we can call the relevant GAME module to perform the message's action.
 * 
 */

/**
 * STATIC class 
 */
function IFrameMessengerModel()
{
}

IFrameMessengerModel.strUrlParent;
IFrameMessengerModel.blInitialized = false;
IFrameMessengerModel.objCanvasQueue = null;

/**
 *  To initialize the Class
 */
IFrameMessengerModel.init = function()
{
    var a = document.createElement('a');
    a.href = "../sideBarWG/";    
    IFrameMessengerModel.strUrlParent = a.href;
    
    /**
     * Add an event listener to the window object, of type "message".
     * This is so we can receive POST messages back from the Sidebar.
     */
    window.addEventListener("message", IFrameMessengerModel.processMessages, false);

    //    
    IFrameMessengerModel.blInitialized = true;
}

/**
 * To send a message
 * @param {String} strJSON
 */
IFrameMessengerModel.sendMessage = function(strJSON)
{
    if ( IFrameMessengerModel.blInitialized )
    {
        window.parent.postMessage(strJSON, IFrameMessengerModel.strUrlParent);
    }
}

/**
 * To process the different messages
 * @param {object} vent
 */
IFrameMessengerModel.processMessages = function(event)
{
    var obJSON = JSON.parse(event.data);

    switch (obJSON.type)
    {
    	/*
    	case "paytable":
    		console.log("Received paytable url " + obJSON.message);
    		break;
    	*/
    	
    	/*
    	 * Replicates the Wrapper behaviour: When we send a loading complete message
    	 * the sidebar should take away its loading screen and reply that it is OK
    	 * to start the game.
    	 */
    	case "portraitWarning":
    	{
    	    IFrameMessengerModel.onOrientationChanged(obJSON.message);
    	}
    	break;
    	
    	case "panel":
    	{
    	    IFrameMessengerModel.processPanelMessages(obJSON.message);
    	}
    	
    	case "orientation":
        {
            IFrameMessengerModel.processOrientation(obJSON.message);
        }
        break;
    	
    	case "loadingScreen":
    	{
    	    //console.log("IFrameMessengerModel.processMessages " + obJSON.type + ": " + obJSON.message);
            //console.log("IFrameMessengerModel.processMessages " + obJSON.type + ": " + obJSON.percent);
            //console.log("IFrameMessengerModel.processMessages Loaded " + obJSON.loaded + " of " + LoadingScreenController.EXPECTED_ASSET_COUNT);
    	}
    	break;
    	
        case "autolock":
            //TO DO 
            //To replace this function in the game with the proper one to enable/disable the autolock in the correct dialog
            IFrameMessengerModel.processAutolock(event.data);
            break;
            
        case "resize":        
            IFrameMessengerModel.processResize(JSON.parse(obJSON.message));
        break;    
        //It seems that it is not needed
        //TO DELETE : after a cross platform test
        /*case "resizeWindow":
        	IFrameMessengerModel.processWindowResizeMessage(obJSON.message);
        */
        case "balance":
            IFrameMessengerModel.processBalanceMessages(obJSON.message);
            break;
        case "debug":
            IFrameMessengerModel.processDebugPanelMessages(obJSON);
            break;
        case "Button":
            IFrameMessengerModel.processButtonMessages(obJSON.message);
            break;
        case "StartUp":
            IFrameMessengerModel.processStartUpConfiguration(obJSON.message);
            break;
        case "Bonus":
            break;
        case "UrlParent":
            IFrameMessengerModel.strUrlParent = obJSON.message;
            break;
        case "Lang":
            IFrameMessengerModel.processLocalization(obJSON.message);
            break;
        default:
        	//console.log("IFrameMessengerModel.processMessages received unknown iframe message " + obJSON.type);
        	break;
    }
}

/**
 * Process the resize of the window
 *  
 */
IFrameMessengerModel.processResize = function (objInfo)
{
    
}

/**
 * Overridden in the game's SidebarCommCOntroller: on portrait:
 * We need to stop all game timers, freespins, bonuns, winlines, animations, everything
 * and re-start when orientation goes back to landscape. 
 */
IFrameMessengerModel.onOrientationChanged = function(blVisible)
{
    alert("IFrameMessengerModel.onOrientationChanged " + blVisible);
}

/**
 *Process the messages for the panel
 * @param {String} Message 
 */
IFrameMessengerModel.processPanelMessages = function (strMessage)
{
    
}

IFrameMessengerModel.processOrientation =  function ( strOrientation )
{
    console.log("New orientation: " + strOrientation);
}

/**
 * This function will need to be ovewritted to add the specific functionality per game
 * @param { String } strEnabled Thi string will define with Off / On values if the Autolock is enabled or not 
 */
IFrameMessengerModel.processAutolock = function (strEnabled)
{
    //console.log("game: processAutolock", objJSON);
}

/**
 * ABSTRACT function. We MUST assign an actual function to this. 
 *  
 */
IFrameMessengerModel.processStartUpConfiguration = function(objJSON)
{
    //console.log("game: processStartUpMessages", objJSON);
}


/**
 * Process the messages the debug panel
 * 
 * @param { Object } Object Data
 */
IFrameMessengerModel.processDebugPanelMessages = function (objJSON)
{
    /*console.log(" ----------------- ");
    console.log("game: processDebugPanelMessages", objJSON);
    console.log("NO ACTION TAKEN: DEAD END!");
    console.log(" ----------------- ");*/
}

IFrameMessengerModel.processWindowResizeMessage = function(objJSON)
{
    /*console.log(" ----------------- ");
	console.log("game: process windowResize message", objJSON);
    console.log("NO ACTION TAKEN: DEAD END!");
    console.log(" ----------------- ");*/
}

/**
 * This will send the current balance to the contain in the Iframe
 * @param {Number} intBalance The balance to be sent
 */
IFrameMessengerModel.sendBalance = function( intBalance )
{
    if ( IFrameMessengerModel.blInitialized )
    {
        var obj = new Object();
        obj.type = "amount";
        obj.strCurrency = "en-GB";
        obj.amount = String(intBalance);
        
        var strJSON = JSON.stringify(obj);
        
        window.parent.postMessage(strJSON, IFrameMessengerModel.strUrlParent);
    }
}

/**
 * To process the different messages for the balance
 * @param {String} strMessage
 */
IFrameMessengerModel.processBalanceMessages = function(strMessage)
{
    //console.log("Processing buttons");
    switch (strMessage)
    {
        case "get":

            break;
    }
}

/**
 * To process the different messages for the buttons
 * @param {String} strMessage
 */
IFrameMessengerModel.processButtonMessages = function(strMessage)
{
    switch (strMessage)
    {
        case "sound_off":
            SoundPlayer.setMuteSound(true);
            break;
        case "sound_on":
            SoundPlayer.setMuteSound(false);
            break;
        case "settings":

            break;
        case "paytable":

            break;
        case "help":
              /*console("help button pressed");
              var objRules = new RulesView();
              objRules.init();
              IFrameMessengerModel.objCanvasQueue.hideAll();
              objRules.display()*/
            break;
    }
}

IFrameMessengerModel.setCanvasQueue = function( objCanvasQueue)
{
    IFrameMessengerModel.objCanvasQueue = objCanvasQueue;
}


/**
 * To process the different messages for the localization
 * @param {String} strMessage
 */
IFrameMessengerModel.processLocalization = function(strMessage)
{
    switch (strMessage)
    {
        case "EN":
            //TO DO : To add here the necesary functionality
            //console.log("TO DO: Add the functionality for: " + strMessage);
            break;
        case "DE":
            //console.log("TO DO: Add the functionality for: " + strMessage);
            break;
        case "FR":
            //console.log("TO DO: Add the functionality for: " + strMessage);
            break;
    }
}
