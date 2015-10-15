
/**
 * 
 * @author Javier Ortega 
 *
 * This class will add the specific functionality to handle the new behaviour of the ios& for Iphones
 * 
 * @class
 */
function IphoneSafari7ScreenLogic()
{
    this.blEnabled = false;
    
    this.showGame = this.showGame.bind(this);
    this.isExpanded = this.isExpanded.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.showMessage = this.showMessage.bind(this);
    this.hideMessage = this.hideMessage.bind(this);
    
    this.objOverlay = document.createElement("div");    
    this.objOverlay.setAttribute("id","overlayiOs7");    
    this.objOverlay.setAttribute("class", "overlayiOs7");
    this.objOverlay.innerText  = "SWIPE UP TO PLAY IN FULL SCREEN";
    
    
    this.objBody = document.getElementsByTagName('body')[0];
}

Class.extend( Class, IphoneSafari7ScreenLogic );

//The expanded height for the Screen
IphoneSafari7ScreenLogic.IPHONE_IOS7_FULL_SCREEN_HEIGHT = 320;


/**
 * This function checks if the application is running in iOS7
 */
IphoneSafari7ScreenLogic.prototype.check = function ()
{
    if (navigator.userAgent.match(/Safari/i) //safari browser
        && !navigator.userAgent.match(/CriOS/i) //not chrome browser
        && navigator.userAgent.match(/OS 7/i) //iOS7
        && (navigator.userAgent.match(/Iphone/i) || navigator.userAgent.match(/Ipod/i)))    
    {
        EventBase.enablePreventDefault(false);
        //MainLoop.getInstance().addItem(this.showGame);
        
        window.setInterval(this.showGame,50);
        this.blEnabled = true;
    }
}

/**
 * This function checks of the screen is expanded or not
 * 
 * @return true if the screen is expanded 
 */
IphoneSafari7ScreenLogic.prototype.isExpanded = function()
{
    return window.innerHeight >= IphoneSafari7ScreenLogic.IPHONE_IOS7_FULL_SCREEN_HEIGHT;
} 

/**
 * Hide the message in the screen and show the game
 * 
 */
IphoneSafari7ScreenLogic.prototype.showGame = function()
{
    if (this.isExpanded())
    { 
        this.hideMessage();
    }
    else
    {
        this.showMessage();
    }
}


/**
 * Listener for the scrolling action
 * 
 * @param {Object} event  
 */

IphoneSafari7ScreenLogic.prototype.handleScroll = function (event)
{
    document.getElementsByTagName('body')[0].scrollTop = 0;
}

/**
 * Show the Swippe message
 * 
 */
IphoneSafari7ScreenLogic.prototype.showMessage = function()
{
    window.onScroll = this.handleScroll;
    document.getElementsByTagName('body')[0].appendChild(this.objOverlay);        
    EventBase.enablePreventDefault(false);
}

/**
 * Hide the Swippe message
 * 
 */
IphoneSafari7ScreenLogic.prototype.hideMessage = function()
{
    if (document.getElementById("overlayiOs7") )
    {
        document.getElementsByTagName('body')[0].removeChild(this.objOverlay);
    }
    window.scrollTo(0, 1);
    EventBase.enablePreventDefault(true);
}
