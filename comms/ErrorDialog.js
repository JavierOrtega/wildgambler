/**
 * To provide a universal and consistant way to show error messages.
 * Modelled on GTS Wrapper error messaging. Pass in the error code returned
 * by the server, and we show predefined messages based on this input.
 *
 * NOTE: The messages are hard coded in this file: They need to be externally
 * configured in a localised langfile.
 * 
 * NOTE: This component, along with everything else, uses TextBoxView.js
 * to display text. This was modified on 7/6/13 (by me) to accept multi-line 
 * texts.
 * The maximum is 4 lines.
 * 
 * Modified 22/08/2013 to show up to 2 buttons for OK and redirect to cashier.
 */

/**
 * This object is constructed as a SINGLETON. It does not require
 * instantiation and can be accessed from anywhere in the system.
 */
ErrorDialog.objErrorDialog = null;
ErrorDialog.getInstance = function()
{
    if( ErrorDialog.objErrorDialog == null )
    {
        ErrorDialog.objErrorDialog = new ErrorDialog();
    }
    return ErrorDialog.objErrorDialog;
}


/**
 * 
 */
function ErrorDialog()
{
    this.objDeviceModel; 
    this.objConfig; 
    this.objGuiController; 
    this.objGuiView; 
    this.objReelsController;
    
    this.txtErrorHeader;
    this.txtErrorMessage;
    this.btnOk;
    this.btnCashier;
    this.txtOkBtnLabel;
    this.txtCashierBtnLabel;

    // The use of this seems to have changed completely!
    // SEE param blStopAnimations in show method
    this.fnCallback;
    
    // OK button moves around: 
    // sometimes there is a "go to cashier" button as well.
    this.arrXpositions;
    
    this.arrStrHeaders;
    this.arrStrMessages;
    
    this.initResources = this.initResources.bind(this);
    this.show = this.show.bind(this);
    this.onCashierButtonClick = this.onCashierButtonClick.bind(this);
    this.onOkClick = this.onOkClick.bind(this);
}
Class.extend(Class,ErrorDialog);

// OK Button positioning
ErrorDialog.ONE_BUTTON = 0;
ErrorDialog.TWO_BUTTONS = 1;

/**
 * Resources from StateFactory. Might not need all of these... 
 * @param {Object} objDeviceModel
 * @param {Object} objGuiController
 * @param {Object} objLocalisation
 */
ErrorDialog.prototype.initResources = function( objDeviceModel, 
                                                objGuiController, 
                                                objLocalisation)
{
    this.objDeviceModel = objDeviceModel; 
    this.objGuiView = objGuiController.objGuiView; 
    this.objLocalisation = objLocalisation;
    
    this.objGuiView.blVisible = false;
    
    this.txtErrorHeader = this.objGuiView.getTextView("errorHeader");
    this.txtErrorMessage = this.objGuiView.getTextView("errorMessage");
    
    // -- Get buttons with individual controllers!
    
    var objOKButtonView = this.objGuiView.arrLayers[2]["genericOK"];
    this.btnOk = new ButtonController(objOKButtonView);
    objGuiController.elementControllers[2]["genericOK"] = this.btnOk;
    
    var objCButtonView = this.objGuiView.arrLayers[4]["genericOK"];
    this.btnCashier = new ButtonController(objCButtonView);
    objGuiController.elementControllers[4]["genericOK"] = this.btnCashier;
    
    // Button labels
    this.txtOkBtnLabel = this.objGuiView.getTextView("okBtnLabel");
    this.txtCashierBtnLabel = this.objGuiView.getTextView("cashierBtnLabel");
    
    /*
     * When an error arrives, if it says "noFunds" and we have a url
     * for either "deposit" or "cashier" in the StateFactory.initParamsObj.siteConfig
     * then we should offer a redirect button as well as the usual OK button.
     */
    this.strRedirect = "";
    this.strCashierButtonLabel = "";
    
    /*
     *  Check settings. If there's a URI for either we show both buttons.
     */
    var settings = StateFactory.getInstance().initParamsObj.siteConfig;
    if(settings["deposit.url"])
    {
        this.strRedirect = settings["deposit.url"];    
        if(this.objLocalisation == null)
        {
            this.strCashierButtonLabel = "Deposit";
        }
        else
        {
            this.strCashierButtonLabel = this.objLocalisation.getText("Deposit");
        }
    }
    else if(settings["cashier.url"])
    {
        this.strRedirect = settings["cashier.url"];    
        if(this.objLocalisation == null)
        {
            this.strCashierButtonLabel = "Cashier";
        }
        else
        {
            this.strCashierButtonLabel = this.objLocalisation.getText("Cashier");
        }
    }
    
    // Xpos for OK button (1, button onscreen, 2 buttons onscreen)
    this.arrXpositions = [this.btnOk.viewObject.intX+100, this.btnOk.viewObject.intX];
    
    this.txtErrorHeader.setText(""); 
    this.txtErrorMessage.setText("");
    this.txtOkBtnLabel.setText("");
    this.txtCashierBtnLabel.setText("");
}


/**
 * My original intention is that this should work like GTS Wrapper: 
 * send a standard (server) errorMessage and you will get
 * a localised error heading and error message. use the strHeader as error ID
 *
 * When the dialog opens it calls StateFactory.getInstance().modalDialogOpen();
 * The intention is that the game can be signalled to stop all animations etc gracefully.
 * 
 * When the dialog closes it calls StateFactory.getInstance().modalDialogClosed();
 * The intention being to allow the game to restart gracefully.
 * 
 * 
 * NOTE:    FIRST PARAM ONLY finds the translated strings.
 * NOTE:    2ND PARAM OVERRIDES the message body - do not use yourself!
 *          The server MAY provide this in its error XML in which case use it. 
 * 
 *  @param {string}  strHeader - error ID code, used to get the items from the JSON file - so "maxWin" 
 *                              error ID code sent through will use "maxWinTitle" and "maxWinBody" from 
 *                              the JSON file
 * 
 * @param {string}  strMessage - any text sent by the server as a message, which should be used to override
 *                               the default text from the JSON file (assuming it works the same as Flash)
 * 
 * @param {string}  strOKBtnLabel - override default button text - not sure if this will ever be used, but left
 *                                in for the time being (BGB 26.06.2013 - Wild Gambler)
 * 
 * -------------------------------------------
 * IMPORTANT NOTE THIS HAS CHANGED - WHY DO WE STILL HAVE THIS NOW TOTALLY MISLEADING COMMENT?
 * @param {fnCallback} function - the function to call when you click the error acceptance button
 * -------------------------------------------
 *  
 * @param {Array} arrDataBody - This array has a collection of Strings 
 *                              to replace tokens in the string (1%, 2%, 3%, ... ) for the body 
 * 
 * @param {Array} arrDataTitle - This array has a collection of Strings 
 *                              to replace tokens in the string (1%, 2%, 3%, ... ) for the title
 * 
 * -------------------------------------------
 * @param {boolean} blStopAnimations - used to halt game animations, 
 * e.g. bring reels to a stop after connection or no-funds error. 
 * IMPORTANT NOTE This now fires off the callback immediately
 * and sets it to null so that it cannot be used when dialog is dismissed.
 * -------------------------------------------
 * 
 */
ErrorDialog.prototype.show = function ( strHeader, 
                                        strMessage, 
                                        strOKBtnLabel, 
                                        fnCallback, // NOTE no longer called if blStopAnimations is true
                                        arrDataBody, 
                                        arrDataTitle, 
                                        blStopAnimations )
{
    //  callback to the game to stop animations (if required by: blStopAnimations=true)
    if (blStopAnimations)
    {
        // the callback function to stop game animations should be called before the dialog box appears.
        if (fnCallback != null) fnCallback();

        // reset the callback reference so it doesn't get called again at the end of this method.
        fnCallback = null;
        
        /*
         * WHAT HAPPENS IF WE ARE WAITING FOR THE CALLBACK TO TELL US THE DIALOG IS CLOSED,
         * WHICH IS HOW IT WAS ORIGINALLY IMPLEMENTED? HAVE YOU REFACTORED APPROPRIATELY FOR THIS CHANGE?
         * I will bet a million pounds - no.
         * Also - why use the callback to stop animations when we have jsut specified that we want to stop them?
         * WHY NOT JUST STOP ANIMATIONS, *THEN* CALL THE ERROR DIALOG, AND USE THE CALLBACK WHEN CLOSED as expected?
         */
    }

    /*
     * This should stop all user interaction apart from our OK button.
     * Also - what then is the callback for?
     */
    StateFactory.getInstance().modalDialogOpen();
    
    /*
     * Due to a massive cockup in the loading process, we can get errors before ever
     * having a way to handle them. The game initialisation call can fail before we
     * are able to initialise this object.
     * First if case gets around this by using an alert, which is what the original comms class
     * used to do when it wa lifted from Alice.
     */
    if( this.txtErrorHeader == null || this.txtErrorMessage == null )
    {
        alert("An error has occurred. Please reload your browser.");
    }
    /*
     * This case covers us for initialisation having occurred but localisation
     * not having arrived in time.
     */
    else if(this.objLocalisation == null)
    {
        this.txtErrorHeader.setText(strHeader);    
        this.txtErrorMessage.setText(strHeader);
    }
    /*
     * In all other cases we show a dialog with localised text header, message etc.
     * NOTE that the multi-line capacity of the text objects has been removed ot broken
     * by somebody and never put back. Probably this is because it's much quicker in the short term
     * to shove in a quick dirty hack than it is to spend time doing things properly. The fact that this
     * has a massive negative impact on the deadline and results in tons of redundant, broken, inefficient,
     * anti-pattern unmaintainable mess is apparently not as important as adhering to a plan.
     * I've now fixed this </rant>
     */
    else
    {
        // BGB Note - this needs further work to put the relative values in the relative popups depending on 
        // the error code. Will need to see what error codes are generated and how they differ from Flash first

        var err = this.objLocalisation.getText(strHeader + "Body", arrDataTitle);

        this.txtErrorHeader.setText(this.objLocalisation.getText(strHeader + "Title", arrDataTitle));    
        this.txtErrorMessage.setText(this.objLocalisation.getText(strHeader + "Body", arrDataBody));
    }

    /*
     *  check if the server has sent any error text to override the default XML text
     */
    if ( strMessage != null && strMessage != "" )
    {
        this.txtErrorMessage.setText(strMessage);
    }

    // Set everything visible, then deal with alt buttons    
    this.objGuiView.blVisible = true;
    
    // 
    this.setOKButtonText(strOKBtnLabel);
    
    // Send true/false for 2 or 1 button
    var blTwoButtonsRequired = this.twoButtonsAreRequired(strHeader);
    this.displayButtons(blTwoButtonsRequired);
        
    // If we said "stop animations" this will now NEVER have a value
    if(fnCallback != null)
    {
        this.fnCallback = fnCallback;
    }
    
    //
    this.objGuiView.setDirty(true);
}

/**
 * See whether to display 2 buttons.
 * True if this was a noFunds error 
 * AND there is a redirect URL (set by Startup params)
 */
ErrorDialog.prototype.twoButtonsAreRequired = function(strHeader)
{
    if(strHeader == "noFunds")
    {
        if(this.strRedirect != "")
        {
            return true;
        }
    }
    return false;
}

/**
 * Set up to display either one or both buttons
 */
ErrorDialog.prototype.displayButtons = function( blDisplayBoth )
{
    var xpos = ErrorDialog.ONE_BUTTON;
    var blBtnVisibility = [false,true];
    var strCashierText = "";

    if(blDisplayBoth)
    {
        xpos = ErrorDialog.TWO_BUTTONS;
        strCashierText = this.objLocalisation.getText(this.strCashierButtonLabel);
        this.btnCashier.addListener(ButtonController.STATE_CLICK, this.onCashierButtonClick);
    }
    
    //
    this.btnOk.viewObject.setX(this.arrXpositions[xpos]);
    this.txtOkBtnLabel.setX(this.arrXpositions[xpos]); 
    this.btnOk.addListener(ButtonController.STATE_CLICK, this.onOkClick);
    
    //
    this.btnCashier.viewObject.blVisible = blBtnVisibility[xpos];
    this.txtCashierBtnLabel.blVisible = blBtnVisibility[xpos];
    this.txtCashierBtnLabel.setText(strCashierText);
}

/**
 * If an override has been provided, use it,
 * else use localised default text
 */
ErrorDialog.prototype.setOKButtonText = function(strOKButtonLabel)
{
    if(strOKButtonLabel != null && strOKButtonLabel != "")
    {
        this.txtOkBtnLabel.setText(strOKButtonLabel);
    }
    else 
    {
        this.txtOkBtnLabel.setText(this.objLocalisation.getText("btnOk"));
    }
}

/**
 * On click Cashier/Deposit button: perform OK action then redirect page 
 * to the URL provided. If no url exists we will not even show the button.
 */
ErrorDialog.prototype.onCashierButtonClick = function(objEvent, objButton, intX, intY)
{
    this.btnCashier.removeListener(ButtonController.STATE_CLICK, this.onCashierButtonClick);
    this.onOkClick(objEvent, objButton, intX, intY);
    
    top.window.location.href = this.strRedirect;
}

/**
 * OK button always shows: dismisses dialog and calls StateFactory.getInstance().modalDialogClosed()
 * Also uses the callback provided IF IT STILL EXISTS (see method .show above for details).
 */
ErrorDialog.prototype.onOkClick = function(objEvent, objButton, intX, intY)
{
    /*
     * This should reset the interface to accept interaction.
     * DO this before the callback provided by the caller as the caller
     * will be expecting their instructions to be absolute i.e.
     * not overridden unexpectedly by anything. 
     */
    StateFactory.getInstance().modalDialogClosed();

    objEvent.stopPropagation();
    this.btnOk.removeListener(ButtonController.STATE_CLICK, this.onOkClick);
    this.objGuiView.blVisible = false;

    // If we said "stop animations" this will now NEVER have a value
    if(this.fnCallback != null)
    {
        this.fnCallback();
        this.fnCallback = null;
    }
    else
    {
        console.log("WARNING!!! ErrorDialog onClick callback will NEVER BE CALLED if we set blStopAnimations=true in SHOW params!");
    }
}
