/**
 * @author Javier.Ortega, Mark Serlin
 * 
 * This class will contain the common functionality to all the Communications
 * between the StateFactory and the Gateway/server
 */


/**
 * Constructor
 */
function CommsController()
{
	this.objGateway = new Gateway();
    
    this.fnResponseCallback;
    
    this.receiveResponse = this.receiveResponse.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
}

/**
 * Derive CommsController from our base type to provide inheritance
 */ 
Class.extend(Class, CommsController);


/**
 * Response received and parsed.
 * Send parsed response back to wherever it came from. 
 */
CommsController.prototype.receiveResponse = function( objRequestData )
{
	
	//console.log("-----------------------")
	//console.log(objRequestData)
	//console.log("-----------------------")
	
	/**
	 * TODO check response for errors here? 
	 */
	this.fnResponseCallback(objRequestData);
}  

/**
 * TODO proper error handling
 * @param {Object} objData MUST contain at least code:STRINGS.[...]
 * @param callbackFunction MUST exist
 */
CommsController.prototype.sendRequest = function(objRequestData, fnResponseCallback )
{
	if(!fnResponseCallback)
	{
		alert("Error CommsController.sendRequest has no callback function.");
		return;
	}
	
	this.fnResponseCallback = fnResponseCallback;
	
	switch(objRequestData.code)
	{
		case STRINGS.INIT:
			this.objGateway.initRequest(objRequestData.code, this.receiveResponse);
			break;
		case STRINGS.BET:
			this.objGateway.placeBet(objRequestData, this.receiveResponse);
			break;
	}
}  
  
