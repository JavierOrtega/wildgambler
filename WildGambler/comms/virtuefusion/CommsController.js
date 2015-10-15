/**
 * VirtueFusion CommsController.js
 * @author mark.serlin
 * 
 * Most of the work is done in the base class, leaving us to make platform-specific
 * changes in this file:
 * The location and params required for comms with a server (see above document.write)
 * The way the server is contacted - in this case, a POST, handled by our comms component
 * The way errors are communicated back to the game (sidebar, wrapper, etc)
 */
function CommsController()
{
	this.parent.initialise();
	
	/**
	 * Communicates with server 
	 */
	this.objComms = new Comm();
	
	/*
	 * These params delay the test harness' response by up to 1 second
	 * as it responds so quickly that the reels don't spin properly.
	 * Response times > 1 second will proceed immediately.
	 */
	this.intTimestamp;
	this.responseData;
	
	/*
	 * Bind to "this" so that they do not become scoped into objComms 
	 */
    this.receiveResponse = this.receiveResponse.bind(this);
    this.continueResponse = this.continueResponse.bind(this);
    this.onErrorDialogDismissedRestart = this.onErrorDialogDismissedRestart.bind(this);
    this.onErrorDialogDismissedNoRestart = this.onErrorDialogDismissedNoRestart.bind(this);
    this.receiveBalanceResponse = this.receiveBalanceResponse.bind(this);
}
Class.extend(CommsControllerBase,CommsController);

/**
 * Game has made a request for data. 
 * Note that this.xmlRequest may not change for some scopeing reason due to 
 * our faulty inheritance model/impementation, so always refer to it as 
 * this.parent.xmlRequest!
 */
CommsController.prototype.sendRequest = function(objRequestData, fnResponseCallback )
{
    this.intTimestamp = new Date().getTime();
	this.parent.sendRequest( objRequestData, fnResponseCallback );	
	
	/*
	 * Fake an error for testing etc
	if(this.parent.xmlRequest.indexOf("Bet") != -1)
	{	
		var req = this.parent.xmlRequest.replace("2.00", "0.00");
		req = req.replace("2.00", "0.00");
		this.parent.xmlRequest = req;
	}
    */
	
	// gameEndpoint provided by decoded query string arriving via sidebar at startup.
	// Or by some other crazy "#ifdef" system, so watch out if this doesn't work, suddenly!
    this.objComms.doPost(StateFactory.getInstance().initParamsObj.gameEndpoint, this.parent.xmlRequest, this.receiveResponse);
}

/**
 * If parent returns false we have an error to handle.
 * 1) Callback to game stops reels
 * 2) Show ErrorDialog
 * 
 * We delay the response by up to 1 second to introduce "latency" into
 * the test harness' response time. This gives the reels time to spin.
 */
CommsController.prototype.receiveResponse = function(responseData)
{
    this.responseData = responseData;

    /*
     * Delay the response for a total of one second to give the reels 
     * some spin time. The test harness responds with no latency!
     */
    var time = new Date().getTime();
    if( time < this.intTimestamp + 1000 )
    {
        TimerManager.getInstance().start(this.continueResponse, (this.intTimestamp + 1000)-time );
    }
    else
    {
        this.continueResponse();
    }
}

/**
 * 
 */
CommsController.prototype.receiveBalanceResponse = function( jsonResponseObj )
{
    console.log("balance recieved and parsed");
}

/**
 * Complete the response after waiting a minimum of one second. 
 */
CommsController.prototype.continueResponse = function()
{    
	if(this.parent.receiveResponse(this.responseData) == false)
	{
		this.fnCallbackToGame( this.objErrorObject );
		this.dispatchErrorMessage(this.objErrorObject);
	}
}

/**
 * 
 */
CommsController.prototype.onErrorDialogDismissedRestart = function()
{
    window.parent.location.href = window.parent.location.href;
}

/**
 * 
 */
CommsController.prototype.onErrorDialogDismissedNoRestart = function (restartClient)
{
	
	WildsView.blServerError = false;
}


/**
 * Each platform will have an individual way to disaptch error messages in order
 * to raise a dialog informing the player that things have gone pear-shaped.
 */
CommsController.prototype.dispatchErrorMessage = function(ErrorObject)
{
    Comm.CONNECTION_ERROR_CALLBACK();

    // by default: do NOT restart the client after error dialog dismisal
    /*
     * NOTE IF stopAnimations is TRUE we WILL NOT GET THE CALLBACK when the dialog is closed!!!!
     */
    var errorDismissedCallback = this.onErrorDialogDismissedNoRestart;

    // check for server error not included in default server error list (assign to unknown if applicable)
    if( (ErrorObject.ERROR.errorCode != "invalid") &&
        (ErrorObject.ERROR.errorCode != "accountFailure") &&
        (ErrorObject.ERROR.errorCode != "serverError") &&
        (ErrorObject.ERROR.errorCode != "noFunds")
        )
    {
        ErrorObject.ERROR.errorCode ="unknown";
    }

    // VF server error codes which require the client to be restarted
    if( (ErrorObject.ERROR.errorCode == "invalid") || 
        (ErrorObject.ERROR.errorCode == "accountFailure") ||
        (ErrorObject.ERROR.errorCode == "serverError") || 
        (ErrorObject.ERROR.errorCode == "unknown")
    )
    {
        errorDismissedCallback = this.onErrorDialogDismissedRestart;
    }

    // for a "noFunds" error:
    // stop game animations (e.g. stop reels)
    // and submit a customer balance request
    var stopAnimations = false;
    if(ErrorObject.ERROR.errorCode == "noFunds")
        stopAnimations = true;
    {
        var objRequest = { code: STRINGS.BALANCE };
        this.sendRequest(objRequest, this.receiveBalanceResponse );
    }
    
    /*
     * NOTE IF stopAnimations is TRUE we WILL NOT GET THE CALLBACK when the dialog is closed!!!!
     * We will get it immediately.
     */
    ErrorDialog.getInstance().show(ErrorObject.ERROR.errorCode, "", "", errorDismissedCallback, null, null, stopAnimations);
}
