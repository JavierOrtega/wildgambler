/**
 * CommsController.js
 * @author mark.serlin
 * This object manages communication with a "server", sending messages in the 
 * required format and interpreting the results using its serverData interpreter. 
 * CommsController is owned by the StateFactory and signals it when a result has been received and 
 * correctly interpreted by the ServerData object.
 * It also can handle server error states and will signal accordingly.
 * NOTE for standalone, the comms module has been removed and we are communicating
 * with the virtual host directly. 
 */
function CommsController()
{
    this.parent.initialise();

    /**
     * Standalone server provides game init data and game results 
     */
    this.objVirtualServer = new VirtualServer();

    /*
     * Bind to this so that it does not become scoped into objComms 
     */
    this.receiveResponse = this.receiveResponse.bind(this);
    this.onErrorDialogDismissed = this.onErrorDialogDismissed.bind(this);
}
Class.extend(CommsControllerBase,CommsController);

/**
 * Game has made a request for data. 
 * Note that this.xmlRequest may not change for some scopeing reason due to 
 * our faulty inheritance model/impementation, so always refer to it as 
 * this.parent.xmlRequest!
 */
CommsController.prototype.sendRequest = function(objRequestData, fnResponseCallback)
{
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
       
    var objComm = {};
    objComm.dataPayload = this.parent.xmlRequest;
    objComm.receiveResult = this.receiveResponse;
    this.objVirtualServer.processComm(objComm);
}


/**
 * If parent returns false we have an error to handle.
 * 1) Callback to game stops reels
 * 2) Show ErrorDialog
 */
CommsController.prototype.receiveResponse = function(responseData)
{   
    if(this.parent.receiveResponse(responseData) == false)
    {
        this.fnCallbackToGame( this.parent.objErrorObject );
        this.dispatchErrorMessage(this.parent.objErrorObject);
    }
}

/**
 * 
 */
CommsController.prototype.onErrorDialogDismissed = function()
{
    // --
}

/**
 * Each platform will have an individual way to dispatch error messages in order
 * to raise a dialog informing the player that things have gone pear-shaped.
 */
CommsController.prototype.dispatchErrorMessage = function(ErrorObject)
{
    ErrorDialog.getInstance().show(ErrorObject.ERROR.errorCode,"","",this.onErrorDialogDismissed);
}
