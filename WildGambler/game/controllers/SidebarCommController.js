/**
 * @author Petr Urban
 * 
 * This GAME class assigns implementations to the static functions 
 * of the FRAMEWORK's IFrameMessengerModel. 
 * In this way it receives messages POSTed from the SIDEBAR.
 * 
 * E.G. a Sidebar button is pressed. Sidebar POSTs a message to its IFrame
 * which is being listened for in the Framework's IFrameMessengerModel class.
 * IFrameMessengerModel calls one of its static functions which we have assigned a method to here.
 * From here we can handle the message with an appropriate GAME response.
 */

/**
 * Constructor 
 */
function SidebarCommController() 
{
	//bindings
    this.requestStartupParameters = this.requestStartupParameters.bind(this);
    this.processSidebarButtons = this.processSidebarButtons.bind(this);
    this.processPanelMessages = this.processPanelMessages.bind(this);
    
    //It seems that it is not needed
    //TO DELETE : after a cross platform test
	//this.processWindowResizeMessage = this.processWindowResizeMessage.bind(this);
	this.processResize =  this.processResize.bind (this);
	this.processStartUpConfiguration = this.processStartUpConfiguration.bind(this);
	this.updateBalanceDisplay = this.updateBalanceDisplay.bind(this);
	this.processOrientation = this.processOrientation.bind(this);
    this.onOrientationChanged = this.onOrientationChanged.bind(this);
	
    this.loadingScreenMessage = this.loadingScreenMessage.bind(this);
    this.loadingScreenInfoMessage = this.loadingScreenInfoMessage.bind(this);

    //register iframe listeners
    IFrameMessengerModel.processButtonMessages = this.processSidebarButtons;

    //It seems that it is not needed
    //TO DELETE : after a cross platform test    
    //IFrameMessengerModel.processWindowResizeMessage = this.processWindowResizeMessage;
    
    IFrameMessengerModel.processResize = this.processResize;
    IFrameMessengerModel.onOrientationChanged = this.onOrientationChanged;
    IFrameMessengerModel.processStartUpConfiguration = this.processStartUpConfiguration;
    
    IFrameMessengerModel.processPanelMessages  = this.processPanelMessages;
    
    IFrameMessengerModel.processOrientation = this.processOrientation; 
}

/**
 * 
 */
SidebarCommController.prototype.onOrientationChanged = function(blVisible)
{
  console.log("onOrientationChanged "+ blVisible)  
}

/**
 * Send a message to the sidebar's loading screen progress div
 */
SidebarCommController.prototype.loadingScreenMessage = function(strMessage)
{
    var msg = JSON.stringify( {type: "loadingScreen", message: strMessage} );
    IFrameMessengerModel.sendMessage( msg );
}

/**
 * Send a message to the sidebar's loading screen info div 
 */
SidebarCommController.prototype.loadingScreenInfoMessage = function(strMessage)
{
    var msg = JSON.stringify( {type: "loadingScreen", message: "echo", value: strMessage} );
    IFrameMessengerModel.sendMessage( msg );
}


SidebarCommController.prototype.processOrientation = function (strMessage)
{
    if(strMessage == "portrait")
    {
        MainLoop.getInstance().pause();
    }
    else if (strMessage == "landScape")
    {
        MainLoop.getInstance().resume();
    }

}

/**
 * This function will resize the contain of the IfRame 
 */
SidebarCommController.prototype.processResize = function (objInfo)
{
    StateFactory.WIDTH_CONTAINER = objInfo.width;
    StateFactory.HEIGHT_CONTAINER = objInfo.height;
}

/**
 * Receive the config data back form the Sidebar's StateFactory 
 * @param stringified JSON data from the startup (Sidebar.StateFactory.initParamsObj)
 */
SidebarCommController.prototype.processStartUpConfiguration = function( strConfigData )
{
    StateFactory.getInstance().processStartUpConfiguration(JSON.parse(strConfigData));
}

/**
 * Receive messages for the Panel from the Sidebar's StateFactory 
 * @param {String} message
 */
SidebarCommController.prototype.processPanelMessages = function( strConfigData )
{
    StateFactory.getInstance().objSpinController.cancelCurrentAnimations();
}

/**
 * Send a new balance to the sidebar to display.
 * This comes fromthe SpinController which must pick its moment to update this.
 * i.e. after win summary, having deducted freespins/bonus wins.
 * 
 * Typically this would be either the total current (new) balance as obtained from ServerData.getBalance
 * (shown after wins display animations, not as soon as result arrives) 
 * OR
 * Total current balance MINUS freespins win or wins as the freespins progress - to make it appear 
 * that the balance is going up a bit with each winning spin.
 */
SidebarCommController.prototype.updateBalanceDisplay = function(flBalance)
{
    IFrameMessengerModel.sendBalance(Localisation.formatNumber( flBalance ) ); 
}


/**
 * Determine whether sounds can be played. 
 */
SidebarCommController.soundEnabled = function()
{
    // If player muted sounds using sidebar, return false 
    if(SoundPlayer.BL_MUTE) return false;
    
    // If player has NOT muted sounds, return our overall setting specified in the build.
    else return StateFactory.BL_SOUND_ENABLED;
}

/**
 * On sidebar button click 
 *
 * @param {String} strMessage 
 */
SidebarCommController.prototype.processSidebarButtons = function(strMessage)
{
   	console.log("SidebarCommController.processSidebarButtons received " + strMessage + " buttonclick from sidebar");

    switch (strMessage)
    {
        case "sound_off":
            SoundPlayer.setMuteSound(true);
                //StateFactory.BL_SOUND_ENABLED = false;
            break;
        case "sound_on":
            SoundPlayer.setMuteSound(false);
                //StateFactory.BL_SOUND_ENABLED = true;
            break;
        case "settings":
            //show settings
            this.showSettingsPanel();
            break;
        case STRINGS.PAYTABLE:
        {
            console.log("paytable clicked");
            try
            {
                //show loading
                LoadingScreenController.startUnexpectedLoadingValues();

                var jsonMsg = this.getMessageForPageOpen(STRINGS.PAYTABLE);
                IFrameMessengerModel.sendMessage( jsonMsg );
                IFrameMessengerModel.objCanvasQueue.hideAll();
                //change the background
                StateFactory.getInstance().objBackgroundController.setBackgroundFreespins();
            }
            catch(e)
            {
                IFrameMessengerModel.objCanvasQueue.restoreAll();
            }
        }           
        break;
            
        case "help":
        {
            console.log("help clicked");
            try
            {
                //show loading
                LoadingScreenController.startUnexpectedLoadingValues();

                var jsonMsg = this.getMessageForPageOpen(STRINGS.HELP);
                IFrameMessengerModel.sendMessage( jsonMsg );
                IFrameMessengerModel.objCanvasQueue.hideAll();

                //change the background
                StateFactory.getInstance().objBackgroundController.setBackgroundFreespins();
            }
            catch(e)
            {
                IFrameMessengerModel.objCanvasQueue.restoreAll();
            }
        }           
        break;
        
        case "helpClose":
            IFrameMessengerModel.objCanvasQueue.restoreAll();
            //change the background
            StateFactory.getInstance().objBackgroundController.setBackgroundMain();
        break;

        case "externalPageLoaded":
            //when loading of external page (help / paytable) is finished, hide loading
            console.log("external page has been loaded");
            LoadingScreenController.endUnexpectedLoadingValues();
        break;
        
        default:
            console.log("unknown button clicked: " + strMessage);
            break;
    }
}

/**
 * Construct a fully qualified URI of the page we want to display 
 * to send to the sidebar - help page or paytable pages only so far.
 */
SidebarCommController.prototype.getMessageForPageOpen = function( strPageName )
{
    var a = document.createElement('a');
    switch(strPageName)
    {
        case STRINGS.PAYTABLE:
            a.href = StateFactory.getInstance().objInitResponseData.getStrPaytableUrl();
            break;
        case STRINGS.HELP:
            a.href = StateFactory.getInstance().objInitResponseData.getStrHelpUrl();
            a.href += this.generateRulesConfig();
            break;
    }

    //
    return JSON.stringify( {type: strPageName, actionType: a.href} );
}


/**
 * Show settings panel 
 */
SidebarCommController.prototype.showSettingsPanel = function()
{
    if (this.isOkToShowSettingsPanel())
    {
        StateFactory.getInstance().objGameSettingsController.show();
    }
    else
    {
        alert("Error, settings dialog is available in idle state only");
    }
}

/**
 * @return {boolean} 
 */
SidebarCommController.prototype.isOkToShowSettingsPanel = function()
{
    if (StateFactory.getInstance().intState == StateFactory.INT_SHOW_REELS || StateFactory.getInstance().intState == StateFactory.INT_ALL_LOADED)
    {
        if (StateFactory.getInstance().objSpinController.intSpinButtonState == SpinController.IDLE
            || StateFactory.getInstance().objSpinController.intSpinButtonState == SpinController.WIN_ANIMATION)
        {
            return true
        }
    }
    return false;
}


//It seems that it is not needed
//TO DELETE : after a cross platform test
/**
 * On Window Resize called from sidebar 
 */
/*SidebarCommController.prototype.processWindowResizeMessage = function()
{
    //call resolutionChanged in state factory
    
    //StateFactory.getInstance().forceResize();
}
*/

/*
 * Construct a message to send to the sidebar requesting the 
 * startup parameters from the sidebar's state factory.
 */
SidebarCommController.prototype.requestStartupParameters = function()
{
    if(IFrameMessengerModel.blInitialized)
    {
        var msg = JSON.stringify( {type: "StartUp", message: "configRequest"} );
        IFrameMessengerModel.sendMessage( msg );
    }
}        
        
        

/**
 * Notify sidebar that spin response has been received
 */
SidebarCommController.prototype.notifySpinResponseReceived = function()
{
    var msg = JSON.stringify( {type: "debug", actionType: "spinResponseReceived"} )
    IFrameMessengerModel.sendMessage( msg );
}

/**
 * Notify sidebar if it is enabled or not 
 */
SidebarCommController.prototype.setSidebarEnabled = function(blEnabled)
{
    var msg = JSON.stringify( {type: "setEnabled", actionType: blEnabled} );
    IFrameMessengerModel.sendMessage( msg );
}

SidebarCommController.prototype.generateRulesConfig = function ()
{
    var config = "?";
    
    var urlVars = new Object();

    //urlVars["minBet"]= "1p";
    var minStakeForAllLines = Number(Number(StateFactory.getInstance().objInitResponseData.Stakes.flMinStake)
        * Number(StateFactory.getInstance().objInitResponseData.Stakes.intNumGameWinLines)).toFixed(2);
    urlVars["minBet"] = Localisation.formatNumber(minStakeForAllLines);
	
    //urlVars["maxBet"]= "£1";
    urlVars["maxBet"] = Localisation.formatNumber(StateFactory.getInstance().objInitResponseData.Stakes.flMaxStake);

    //urlVars["maxWin"]= "£100";
    urlVars["maxWin"] = Localisation.formatNumber(StateFactory.getInstance().objInitResponseData.flMaxWin);

    for(var i in urlVars)
    {
        if(i!= "shuffle" || i!="average")
        {
            config += "&" + i + "=" + urlVars[i];
        }
    }
    return config;
}

