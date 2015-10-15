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

    this.flPlayerBalance = 0;
    this.updateBalance = this.updateBalance.bind(this);
    this.deductCostOfSpin = this.deductCostOfSpin.bind(this);
}
Class.extend(Class,ServerData);


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
