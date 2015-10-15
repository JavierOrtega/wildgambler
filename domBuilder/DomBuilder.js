/**
 * @author Javier Ortega 
 *
 * Overall control of creation of DOM elements for our game page.
 * Different devices need divs etc created in a slightly different way so here
 * we try to detect our device and add DOM elements appropriately.
 * 
 * @param {Object} objHead Dom Head
 * @param {Object} objBody Dom Body
 *
 */
function DomBuilder()
{
    DomBuilder.blLoadingScreenLoaded = false;
}

DomBuilder.intPcLoaded = 0;

/**
 * @param {Object} objHead Dom Head
 */
DomBuilder.setDomElelements = function(objHead, objBody)
{
    DomBuilder.objHead = document.getElementsByTagName('head')[0];
    
    //To create the body
    DomBuilder.objBody = document.getElementsByTagName('body')[0];    
}

/**
 * This function will initialize the detection after of a delay
 * NOTE there is no delay wtf?
 */
DomBuilder.init = function()
{
    /*
     * Create the page elements necessary to load/display 
     * sidebars, bottom bar, game etc
     */
    DomBuilder.build();
}

/**
 * Create an iFrame which covers everything from view
 * while the loading process is taking place.
 * This takes the role of a GTS Wrapper, essentially.
 * Load a simpe page which we can address somehow to write the loading progress to.
 * When the loading hits 100% we can take the frame away or hide it and reveal the game
 * in a ready-to-play state.
 * 
 * NOTE: this method is called from IFrameController.prototype.resize (on startup)
 * and MenuController.prototype.resourcesLoaded (maybe, though not on desktop):
 * It may be called form either of these on other devices perhaps, but there is no 
 * indication in the code (no comments) so not sure.
 */
DomBuilder.createLoaderScreen = function()
{
    DomBuilder.objIframeLoadingScreen = document.createElement ('iframe');

    //Create the different elements
    DomBuilder.objIframeLoadingScreen.id = "loadingScreen";
    var objLoadingScreen = document.createElement ('a');
    objLoadingScreen.href = "res/loadingScreen.html";
    
    DomBuilder.objIframeLoadingScreen.onload = DomBuilder.setCoordinatesLoadingScreeen;
    DomBuilder.objIframeLoadingScreen.src = objLoadingScreen.href;

    DomBuilder.objIframeLoadingScreen.scrolling = "no";
    DomBuilder.objIframeLoadingScreen.frameBorder = "0";
    DomBuilder.objIframeLoadingScreen.style.width = "100%";
    DomBuilder.objIframeLoadingScreen.style.height = window.innerHeight + "px";
    DomBuilder.objIframeLoadingScreen.style.top = "0px";
    DomBuilder.objIframeLoadingScreen.style.left = "0px";
    DomBuilder.objIframeLoadingScreen.style.marginTop = "0px";
    DomBuilder.objIframeLoadingScreen.style.marginLeft = "0px";
    DomBuilder.objIframeLoadingScreen.style.display = "block";
    
    // Attach
    DomBuilder.objBody.appendChild(DomBuilder.objIframeLoadingScreen);    
}


/*
 * Set the coordinates for some elements in the Loading Screen 
 */
DomBuilder.setCoordinatesLoadingScreeen = function ()
{
    if ( !DomBuilder.objIframeLoadingScreen || (!DomBuilder.objIframeLoadingScreen.contentWindow && !DomBuilder.objIframeLoadingScreen.contentDocument))
    {
        return;
    }
    var innerDoc = DomBuilder.objIframeLoadingScreen.contentDocument || DomBuilder.objIframeLoadingScreen.contentWindow.document;
    var objImg = innerDoc.getElementById("logoImg");
    
    if (objImg)
    {
        objImg.style.left = ((window.innerWidth/2) - (objImg.width /2)) + "px";
        
        
        var objProgress = innerDoc.getElementById("progress");
        objProgress.style.left = ((window.innerWidth/2) - (objProgress.offsetWidth /2)) + "px";
    }
}

/*
 * Callback from page loadingScreen.html body onload
 * Tells us that the page has loaded and is ready to rock.
 */
DomBuilder.onLoaderScreenLoaded = function(objDocument)
{
    objDocument.ontouchmove = function(e) {EventBase.preventDefault(e)};
    objDocument.ontouchstart = function(e) {EventBase.preventDefault(e)};
    objDocument.ontouchend = function(e) {EventBase.preventDefault(e)};
    
    objDocument.onmousemove = function(e) {EventBase.preventDefault(e)};
    objDocument.onmousedown = function(e) {EventBase.preventDefault(e)};
    objDocument.onmouseup = function(e) {EventBase.preventDefault(e)};
    
    DomBuilder.blLoadingScreenLoaded = true;
}

/**
 * If page is loaded intialise anything necessary.
 */
DomBuilder.initLoadingProgress = function( strMessage )
{
    if( DomBuilder.blLoadingScreenLoaded )
    {
        /*
         * getElementById("heading") removed to keep "Loading n%" all on one line. 
         * MAY reinstate sometime?
         */ 
        //DomBuilder.objIframeLoadingScreen.contentDocument.getElementById("heading").innerHTML = "Loading";
    }
}

/**
 * Ensure page either loaded or has not been taken away.
 * The framework LoadingScreenController class seems to have a flexible idea about when 
 * everything is loaded, and also is governed by a MAGIC NUMBER. Sometimes, and I can't figure out
 * the exact circumstances, it reports that everthing is loaded when progress is still climbing
 * to 100% - sometimes, then, we get a loading progress update here AFTER removeLoadingScreen 
 * has been called as a result of the LoadingScreenController's "complete" callback. 
 */
DomBuilder.setLoadingProgress = function( strPercent )
{
    var pc = parseInt(strPercent,10);
    
    if(pc >= DomBuilder.intPcLoaded)
    {
        DomBuilder.intPcLoaded = pc <= 100 ? pc : 100;
    }
    
    if( DomBuilder.blLoadingScreenLoaded )
    {
        DomBuilder.objIframeLoadingScreen.contentDocument.getElementById("progress").innerHTML = ""+ DomBuilder.intPcLoaded + "%";
    }
}

/**
 * Update an onscreen message durng the loading process.
 * Use for debug purposes only: Shouldn't need this in release. 
 */
DomBuilder.setLoadingInfo = function( strMsg )
{
    if( DomBuilder.blLoadingScreenLoaded )
    {
        DomBuilder.objIframeLoadingScreen.contentDocument.getElementById("info").innerHTML = strMsg;
    }
}
/**
 * Remove the loading screen 
 */
DomBuilder.removeLoadingScreen = function()
{
    DomBuilder.blLoadingScreenLoaded = false;
    DomBuilder.objBody.removeChild(DomBuilder.objIframeLoadingScreen);
    
    this.objBlockScreenController = new BlockScreenController();
    this.objBlockScreenController.init();
}

/**
 * This function will detect the device/environment and invoke an object which will
 * add all the necessary tags to the Dom Tree of the html file.
 * 
 * TODO I'm pretty sure some of this code duplicates DeviceModel?
 */
DomBuilder.build = function()
{
    var userAgent = navigator.userAgent;

    var blnIPad = !!(userAgent.match(/iPad/i));
    var blnIPhone = !!(userAgent.match(/iPhone/i));
    var blnIPod = !!(userAgent.match(/iPod/i));
    var blnAndroid = !!(userAgent.match(/Android/i));
    var blnTouch = !!("ontouchstart" in window);
    var blnDesktop = !blnTouch;

    var screenWidth = Number(screen.width);
    var screenHeight = Number(screen.height);

    var devicePixelRatio = 1;

    if (window.devicePixelRatio)
        devicePixelRatio = window.devicePixelRatio;

    var blnIPhoneWideScreen = blnIPhone && (((screenWidth * devicePixelRatio) > 1000) || ((screenHeight * devicePixelRatio) > 1000))
    var blnIPodTouchWideScreen = blnIPod && (((screenWidth * devicePixelRatio) > 1000) || ((screenHeight * devicePixelRatio) > 1000))

    var blnChromeMobile = !!(userAgent.match(/Chrome/i));

    var blnOperaMobile = !!(userAgent.match(/Opera/i)) && !!(userAgent.match(/Mobi/i));

    // -- Determine and redirect to most appropriate launch page.

    var aspectRatio;
    var blnIOS;
    var version;
    var lauchPageURL;

    //
    if (screenWidth == 0 || screenHeight == 0)
    {
        aspectRatio == 1.3;
    }
    else if (screenWidth > screenHeight)
    {
        aspectRatio = screenWidth / screenHeight;
    }
    else
    {
        aspectRatio = screenHeight / screenWidth;
    }
    
    //
    blnIOS = (blnIPad || blnIPhone || blnIPod);
    
    //
    if (blnDesktop)
    {
        DomBuilderDesktop.build(DomBuilder.objHead, DomBuilder.objBody);
    }
    else if (blnIOS)
    {   
        /*
         * This fixes bug 0039255 for Wild Gambler:
			Basicly reload the content, and this way the application gains the focus again, 
			and the controls are selectable again
            Press on the floating tab and press the Lobby in the menu.
            Once the lobby loads hit the back button to return to the game. 
            Again press the floating tab and press INFO.
            Result: All options/buttons are disabled in the menu. 

            Steps To Reproduce To reproduce on iPad 2:
            1. clear cache
            2. load game
            3. while intro panel is displayed, open sidebar
            4. tap on withdrawal icon
            5. tap on browser back button
            6. close sidebar and tap on OK control
             - observe it is not active 
         */
        window.onpageshow = function(event)
        {
            if (event.persisted)
            {
                window.location.reload();
            }
        }
        
        if (blnIPad)
        {
            DomBuilderIpad.build(DomBuilder.objHead, DomBuilder.objBody);
        }
        else
        {
            if (blnIPhoneWideScreen || blnIPodTouchWideScreen)
            {
                DomBuilderIphone5.build(DomBuilder.objHead, DomBuilder.objBody);
            }
            else
            {
                DomBuilderIphone.build(DomBuilder.objHead, DomBuilder.objBody);
            }
        }
    }
    else if (blnAndroid)
    {
        if (blnOperaMobile)
        {
            DomBuilderAndroid.build(DomBuilder.objHead, DomBuilder.objBody);
        }
        else if (blnChromeMobile)
        {
            DomBuilderAndroidChrome.build(DomBuilder.objHead, DomBuilder.objBody);
        }
        else
        {
            DomBuilderAndroid.build(DomBuilder.objHead, DomBuilder.objBody);
        }
    }
    else
    {
        DomBuilderWP.build(DomBuilder.objHead, DomBuilder.objBody);
    }
    
    // Common to all: doesn't do much on iOS though.
    setTimeout(function(){ BrowserWindow.getInstance().hideUrlBar(); }, 100);
}
