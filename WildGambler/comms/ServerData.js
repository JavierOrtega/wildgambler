/**
 * ServerData.js
 * @author mark.serlin
 * This class holds any data from the server that may be required to run the game
 * on a PER-PLATFORM basis. 
 * E.G. sessionID, playerID
 * 
 * This class also holds a local copy of the Player Balance which should be updated
 * by DataParser when intialisation or results arrive.
 * 
 * For this reason this class is a SINGLETON as we may need acces to the balance
 * from anywhere in the game at any time. Ditto the server responses.
 * 
 * NOTE sending this class a new balance via storeBalance also has the effect of
 * updating the balance display due to updateBalance(...) being called.
 * THIS MAY NOT BE DESIRABLE - if all results (spin & bonus) arrive together we 
 * may not want to show the total new balance immediately.
 * 
 *  
 */

ServerData.objInstance = null;

ServerData.getInstance = function()
{
	if(ServerData.objInstance == null)
	{
		ServerData.objInstance = new ServerData();
	}
	return ServerData.objInstance;
}

function ServerData()
{
	if(ServerData.objInstance != null)
	{
		return;
	}

	/*
	 * Maintain local balance for display, also useful for
	 * resetting displayed balance after a failed spin transaction.
	 */
	this.flPlayerBalance = 0;
	
	/*
	 * Not necessarily needed, but comes from server on init.
	 */
	this.intRound;
	this.strGameVersion;
	this.strCurrency;
	this.flMaxWin;
	
	/*
	 * From server on game round
	 */
	this.intGameId;
	this.intDrawId;
	this.strDrawState;
	this.objBetPick;
	this.intBetSequence;
	this.flBetStake;
	this.strBetType;
	this.strBetWon;

	
	this.updateBalance = this.updateBalance.bind(this);
	this.deductCostOfSpin = this.deductCostOfSpin.bind(this);
	this.storeServerData = this.storeServerData.bind(this);
}
Class.extend(Class,ServerData);

/**
 * From this data we extract anything relevant (ie not game results)
 * @param xmlDoc: the entire XML response from the server
 */
ServerData.prototype.storeServerData = function( responseXml )
{
	//console.log(responseXml);
	
	var xmlDoc = UTILS.createDoc(responseXml);
	var xmlNodes = xmlDoc.childNodes;
	
	for(var i=0; i<xmlNodes.length; ++i)
	{
		if(xmlNodes[i].nodeName == "InitResponse")
		{
			this.intRound = parseInt(xmlDoc.getElementsByTagName("GameConfig")[0].getAttribute("round"), 10);
			this.strGameVersion = xmlDoc.getElementsByTagName("WildGambler")[0].getAttribute("version");
			this.strCurrency = xmlDoc.getElementsByTagName("Balance")[0].getAttribute("currency");
			this.flMaxWin = xmlDoc.getElementsByTagName("TitleConfig")[0].getAttribute("maxWin");
		}
		else if(xmlNodes[i].nodeName == "PlaceBetResponse")
		{
			this.intGameId = parseInt(xmlDoc.getElementsByTagName("PlaceBetResponse")[0].getAttribute("gameId"), 10);
			this.intDrawId = parseInt(xmlDoc.getElementsByTagName("DrawState")[0].getAttribute("drawId"), 10);
			this.strDrawState = xmlDoc.getElementsByTagName("DrawState")[0].getAttribute("state");
			this.objBetPick = xmlDoc.getElementsByTagName("Bet")[0].getAttribute("gameId");
			this.intBetSequence = parseInt(xmlDoc.getElementsByTagName("Bet")[0].getAttribute("seq"), 10);
			this.flBetStake = Number(xmlDoc.getElementsByTagName("Bet")[0].getAttribute("stake"));
			this.strBetType = xmlDoc.getElementsByTagName("Bet")[0].getAttribute("type");
			this.strBetWon = xmlDoc.getElementsByTagName("Bet")[0].getAttribute("won");
		}
	}
}



/**
 * Ensure float amount
 * reduce balance
 */
ServerData.prototype.deductCostOfSpin = function( cost )
{
	var flCost = parseFloat(cost);
	this.updateBalance(this.flPlayerBalance - flCost);
	
    IFrameMessengerModel.sendBalance(Localisation.formatNumber( this.flPlayerBalance));
}

/**
 * Balance update from server result 
 * @param {Object} flBalance
 * If the new balance is < 0, update the player balance TO 0 
 * NOTE: Not updating balance display here: We want to WAIT
 * until the wins have been displayed!
 */
ServerData.prototype.updateBalance = function( flBalance )
{
    var balance = parseFloat(flBalance) < 0.0 ? 0.00 : parseFloat(flBalance).toFixed(2);
    this.flPlayerBalance = parseFloat(balance);
}
