/**
 * CommsControllerBase.js
 * @author mark.serlin
 * 
 * This object manages communication with a server, sending messages in the 
 * required format and returning the results using its DataParser to put the server response 
 * into a common data format. 
 * CommsControllerBase is owned by the StateFactory and signals it via a function callback
 * when a result has been received and correctly parsed by the ServerData object.
 * 
 * Error Handling
 * On error a return object will be contructed using default settings to be passed to the reels
 * to allow them to reset.
 * This object will also have an ERROR attr with the errorCode returned by the server. This should 
 * be used HERE to signal an appropriate module (e.g. sidebar) to show an error dialog to the player.
 *
 * NOTE RE this.strRequestCode: 
 * There is ONLY ONE of these and this may not work
 * in an asynchronous environment!
 */
function CommsControllerBase()
{
    this.initialise = this.initialise.bind(this);
}
Class.extend(Class,CommsControllerBase);

/**
 * 
 */
CommsControllerBase.prototype.initialise = function()
{
    /**
     * Translates engine responses into common data format 
     */
    this.objDataParser = new DataParser();

    /**
     * Holds the return path for encoded responses. 
     */
    this.fnCallbackToGame;
    
    /*
     * Request to forward to server, constructed by DataParser 
     * Init to initRequest - why not?
     */
    this.xmlRequest = this.objDataParser.buildInitRequest();
    
    /*
     * Receives the results of objDataParser's output 
     * for return to the game. 
     */
    this.objResponseJsonData;
    
    /*
     * 
     */
    this.objErrorObject;
    
    /**
     * Bound methods 
     */
    this.sendRequest = this.sendRequest.bind(this);
    this.responseIsValid = this.responseIsValid.bind(this);
    this.receiveResponse = this.receiveResponse.bind(this);
    this.dispatchErrorMessage = this.dispatchErrorMessage.bind(this);
}

/**
 * Game has made a request for data. Perform a check for callback function
 * then build the necessary data structures.
 * Allow the child class to make the appropriate server call.
 */
CommsControllerBase.prototype.sendRequest = function(objRequestData, fnResponseCallback )
{
    if(!fnResponseCallback)
    {
        alert("Error CommsControllerBase.sendRequest has no callback function.");
        return;
    }
    
    //
    this.fnCallbackToGame = fnResponseCallback;
    this.strRequestCode = objRequestData.code;
    
    //
    switch(this.strRequestCode)
    {
        case STRINGS.INIT:
            this.xmlRequest = this.objDataParser.buildInitRequest();
            break;
        case STRINGS.BET:
            this.xmlRequest = this.objDataParser.buildSpinRequest(objRequestData);
            break;
        case STRINGS.BALANCE:
            this.xmlRequest = this.objDataParser.buildCustomerBalanceRequest();
            break;
    }
    /*
    console.log("\n------------\nREQUEST:")
    console.log(this.xmlRequest);
    */
}


/**
 * Handle game errors here (as distinct from comm errors which are handled by comm obj).
 * On Init error, return Error info only
 * On Bet, also return a fake "lose" position to stop the reels.
 * 
 * Otherwise use DataParser to populate game-friendly data structures.
 */
CommsControllerBase.prototype.receiveResponse = function(responseData)
{   
    /*
    console.log("\n------------\nRESPONSE:")
    console.log(responseData + "\n------------\n");
    */
    /*
     * Check XML for error code. If one exists build relevant data structures
     * but then allow child class to deal with the error in a platfrom-specific way
     * by merely returning false.
     */
    if( this.responseIsValid(responseData) == false )
    {
        var xmlDoc = UTILS.createDoc(responseData);
        var xmlNodes = xmlDoc.childNodes;
        console.log(xmlNodes[0].nodeName);
        
        // Make a plain object if we haven't started the game yet
        if(xmlNodes[0].nodeName == "InitResponse")
        {
            this.objErrorObject = {};
        }
        // Otherwise provide fake lose results to stop the reels
        else
        {
            this.objErrorObject = this.objDataParser.createErrorResultsResponse();
        }
        
        // -- Add the error code
        
        this.objErrorObject.ERROR = {};
        this.objErrorObject.ERROR.errorResponse = xmlNodes[0].nodeName;

        var json = x2js.xml_str2json(responseData)
        for( var obj in json)
        {
            this.objErrorObject.ERROR.errorCode = json[obj]._error;
            break;
        }

        //
        return false;
    }
    
    /*
     * All OK : parse the response and send to game.
     * return true: child class need not do anything further.
     */
        
    /*
     * this.strRequestCode: there is ONLY ONE of these and this may not work
     * in an asynchronous environment!
     */
    this.objResponseJsonData = this.objDataParser.parseResponse(this.strRequestCode, responseData);
    this.fnCallbackToGame(this.objResponseJsonData);
    return true;
}

/**
 * Override this in child class to send message to sidebar, or wrapper, or nowhere. 
 */
CommsControllerBase.prototype.dispatchErrorMessage = function(ErrorObject)
{
    alert("TODO replace alert with dialog.\nError code \"" + ErrorObject.ERROR.errorCode + "\"");
}

/**
 * Check for a valid response ie no error codes etc 
 */
CommsControllerBase.prototype.responseIsValid = function( responseData )
{
    var json = x2js.xml_str2json(responseData)
    
    for( var obj in json)
    {
        if(json[obj]._error != null)
        {
            return false;
        }
    }

    //
    return true;
}
