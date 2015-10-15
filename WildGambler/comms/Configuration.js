/**  
 * Configuration.js
 * @author mark.serlin
 * Encapsulate all the setup data needed to start and run a game.
 * Data initialised with default values to account for servers that 
 * do not set any of the data. 
 * This data can be overwritten by server data on startup and during gameplay
 * should a new stakes array be sent to us (for example).
 * This data is returned to the game parsed into JSON in a common format for all games.
 * This data is distinct from game results data which is similarly parsed into JSON.
 */
function Configuration()
{
	this.strGameTitle = "AG-WildGambler"
	this.blRealPlay = false;
	this.strServerUrl = "";
	
	//
	this.arrInitialReelPos="0,0,0,0,0";	
	
	// Server data to be overwritten if it exists on init
	this.objReelsTable = new ReelsTable(reelsXml);
	this.objSymbolTable = new SymbolTable(symbolsXml);
	this.objStakeTable = new StakeTable(stakesXml);
	
	// Extra setup for winlines
	this.arrWinlineColours = [];
	this.intWinlineWidth = 6;
	//
	this.createWinlineTable(winlineXml);
	
	//
	this.strCurrencyCode="GBP";
	this.strCurrencySymbol="&#163;"; // £ sign in html
	
	//language defaults
    this.strLangCode = StateFactory.GAME_CONFIG.getLanguage();
    this.strLanguageCode = StateFactory.GAME_CONFIG.getLanguage();
	
	this.strAccountId="ashgaming24";
	this.strCustomerId="1350600";
	this.strDomain="ashgaming";
	this.strAnonymous="false";
	this.strHelpUrl="res/lang/rules.html";
	this.strPaytableUrl="res/lang/paytable.html";

	//
	this.strBetType="line";
	
	/** Sound Configuration **/
	
    // Setup sound configuration path
    this.strSoundConfigPath = './res/sound/';

    // File name (with extension) for JSON sound configuration
    this.strSoundConfigFileName = "sounds.json";

    // Setup (sound-sprite or compatibility-test) sound file name
    this.strSoundFileName = "WILD_GAMBLER_SOUND";
    
    //
    this.arrAutoplays = [5, 10, 15, 20, 25];
    
    /**--------------------**/	

	//	
	this.storeCustomerDetails = this.storeCustomerDetails.bind(this);
	this.createWinlineTable = this.createWinlineTable.bind(this);
	this.getStrPaytableUrl = this.getStrPaytableUrl.bind(this);
	this.getStrHelpUrl = this.getStrHelpUrl.bind(this);
    this.loadCulture();
    
    /*langCode = StateFactory.GAME_CONFIG.getLanguage();
	locale = StateFactory.GAME_CONFIG.getLocale();
	currency = StateFactory.GAME_CONFIG.getCurrency();
	_gameServerURL = StateFactory.GAME_CONFIG.getGameEndpointUrl();*/

	Configuration.strCurrencyCode = StateFactory.GAME_CONFIG.getCurrency(); //StateFactory.getInstance().initParamsObj.currency; //
	Configuration.strCurrencySymbol = StateFactory.GAME_CONFIG.getCurrency();
	// BGB - setting this to just "en" defaults to US, not UK. May need a look up table for converting what comes from the server if we hook it up to the back end
	Configuration.strLangCode = StateFactory.GAME_CONFIG.getLanguage();
}
Class.extend(Class,Configuration);



/*
 * load the correct globalize culture javascript file for the selected language.
 */
Configuration.prototype.loadCulture = function()
{
}

Configuration.prototype.getStrPaytableUrl = function()
{
	return this.strPaytableUrl.replace("lang", StateFactory.GAME_CONFIG.getLanguage());	
}

Configuration.prototype.getStrHelpUrl = function()
{
	return this.strHelpUrl.replace("lang", StateFactory.GAME_CONFIG.getLanguage());	
}

/**
 * Create winline information with colours 
 */
Configuration.prototype.createWinlineTable = function (xmlData)
{
	//BGBGB
	this.arrWinlineColours = [];
	this.arrWinlineColours.push("#FF0000");
	this.arrWinlineColours.push("#FFB300");
	this.arrWinlineColours.push("#66005F");
	this.arrWinlineColours.push("#FFFF00");
	this.arrWinlineColours.push("#CC6600");
	this.arrWinlineColours.push("#32FF65");
	this.arrWinlineColours.push("#FF6600");
	this.arrWinlineColours.push("#9800FF");
	this.arrWinlineColours.push("#9999FF");
	this.arrWinlineColours.push("#990000");
	this.arrWinlineColours.push("#A90156");
	this.arrWinlineColours.push("#0000FF");
	this.arrWinlineColours.push("#FF6565");
	this.arrWinlineColours.push("#006600");
	this.arrWinlineColours.push("#FF0098");
	this.arrWinlineColours.push("#000099");
	this.arrWinlineColours.push("#FF99FF");
	this.arrWinlineColours.push("#00FFFF");
	this.arrWinlineColours.push("#7D440B");
	this.arrWinlineColours.push("#00CC00");

	this.objWinlineTable = new WinlineTable( xmlData, 
											 this.arrWinlineColours, 
											 this.intWinlineWidth,
											 "40px Arial",
											 "white",
											 "black" );
}

/**
 * 
 * <CustomerDetailsResponse accountId="ashgaming24" 
 * 							customerId="1350600" 
 * 							domain="ashgaming" 
 * 							anonymous="false" 
 * 							currency="GBP" 
 * 							currencyPrefix="£" />'+
 */
Configuration.prototype.storeCustomerDetails = function(xmlData)
{
	var xmlJson = x2js.xml2json(xmlData);
	this.strCurrencyCode = xmlJson._currency;
	//this.strCurrencySymbol = xmlJson._currencyPrefix.toString();
	//this.strAccountId = xmlJson._accountId;
	//this.strCustomerId = xmlJson._customerId;
	//this.strDomain = xmlJson._domain;
	//this.strAnonymous = xmlJson._anonymous;

}

/**
 * Default settings for wild gambler 
 * These should be overwritten by the server on init. 
 */

var stakesXml = '<TitleConfig minStake="5.00" maxStake="1000.00" maxWin="100.00" defaultStake="10.00" roundLimit="1000.00">'+
	'	<Option incStake="0.50" incPeriod="0.00" />'+
	'	<Option incStake="50.00" incPeriod="0.00" />'+
	'	<Option incStake="0.10" incPeriod="0.10" />'+
	'	<Option incStake="1.00" incPeriod="1.00" />'+
	'	<Option incStake="10.00" incPeriod="1.00" />'+
	'	<Option incStake="100.00" incPeriod="100.00" />'+
	'	<Option incStake="0.01" incPeriod="0.01" />'+
	'	<Option incStake="0.05" incPeriod="0.05" />'+
	'	<Option incStake="0.20" incPeriod="0.10" />'+
	'	<Option incStake="5.00" incPeriod="0.00" />'+
	'	<Option incStake="1000.00" incPeriod="1000.00" />'+
	'</TitleConfig>';

var winlineXml = 	'<Winlines value="20"> '+
	'				<Winline id="0" value="1,4,7,10,13" /> '+
	'				<Winline id="1" value="0,3,6,9,12" /> '+
	'				<Winline id="2" value="2,5,8,11,14" /> '+
	'				<Winline id="3" value="0,4,8,10,12" /> '+
	'				<Winline id="4" value="2,4,6,10,14" /> '+
	'				<Winline id="5" value="0,3,7,11,14" /> '+
	'				<Winline id="6" value="2,5,7,9,12" /> '+
	'				<Winline id="7" value="1,3,6,9,13" /> '+
	'				<Winline id="8" value="1,5,8,11,13" /> '+
	'				<Winline id="9" value="1,3,7,9,13" /> '+
	'				<Winline id="10" value="1,5,7,11,13" /> '+
	'				<Winline id="11" value="0,4,6,10,12" /> '+
	'				<Winline id="12" value="2,4,8,10,14" /> '+
	'				<Winline id="13" value="1,4,6,10,13" /> '+
	'				<Winline id="14" value="1,4,8,10,13" /> '+
	'				<Winline id="15" value="0,4,7,10,12" /> '+
	'				<Winline id="16" value="2,4,7,10,14" /> '+
	'				<Winline id="17" value="0,5,6,11,12" /> '+
	'				<Winline id="18" value="2,3,8,9,14" /> '+
	'				<Winline id="19" value="2,5,6,11,14" />'+ 
	'			</Winlines>';

var symbolsXml = '<Symbols> '+
	'				<Symbol id="0" name="Ten" char="T" type="Normal" multiplier="1" consecutive="3" paytable="0,0,5,15,40" /> '+
	'				<Symbol id="1" name="Jack" char="J" type="Normal" multiplier="1" consecutive="3" paytable="0,0,10,20,50" /> '+
	'				<Symbol id="2" name="Queen" char="Q" type="Normal" multiplier="1" consecutive="3" paytable="0,0,15,30,60" /> '+
	'				<Symbol id="3" name="King" char="K" type="Normal" multiplier="1" consecutive="3" paytable="0,0,20,40,70" /> '+
	'				<Symbol id="4" name="Ace" char="A" type="Normal" multiplier="1" consecutive="3" paytable="0,0,25,50,100" /> '+
	'				<Symbol id="5" name="Flamingo" char="F" type="Normal" multiplier="1" consecutive="3" paytable="0,0,80,150,300" /> '+
	'				<Symbol id="6" name="Zebra" char="Z" type="Normal" multiplier="1" consecutive="3" paytable="0,0,100,200,400" /> '+
	'				<Symbol id="7" name="Cheetah" char="C" type="Normal" multiplier="1" consecutive="3" paytable="0,0,150,300,500" />'+ 
	'				<Symbol id="8" name="Rhino" char="R" type="Normal" multiplier="1" consecutive="3" paytable="0,0,200,400,800" />'+ 
	'				<Symbol id="9" name="Elephant" char="E" type="Normal" multiplier="1" consecutive="3" paytable="0,0,0,0,0" /> '+
	'				<Symbol id="10" name="Wild Lion" char="W" type="Wild" multiplier="1" consecutive="5" paytable="0,0,0,0,1000" />'+ 
	'			</Symbols>';


var reelsXml = 	'<Reels value="2"> '+
	'				<ReelLayout id="0" value="5"> '+
	'					<Reel id="0" view="3" value="8,2,1,6,3,2,5,0,1,7,0,1,8,2,3,6,1,0,5,3,0,6,3,1,7,0,4,8,1,0,5,2,0,4,3,0,2,4,3,2,4,6,8,10,7,5,4,2,7,0,1" /> '+
	'					<Reel id="1" view="3" value="0,4,5,7,10,8,6,4,1,8,3,2,7,1,0,5,3,1,6,2,0,5,2,0,6,1,4,7,0,2,8,0,1,8,2,3,6,1,0,7,3,2,5,0,3,4,0,2,4,1,3" /> '+
	'					<Reel id="2" view="3" value="8,10,7,6,4,0,6,2,0,6,2,0,7,3,0,7,1,3,8,0,1,7,3,1,5,4,0,8,2,0,5,3,2,8,1,4,6,1,3,2,0,1,4,2,0,4,2,3,1,4,5" /> '+
	'					<Reel id="3" view="3" value="3,6,1,3,6,4,0,7,3,2,0,1,2,4,3,1,4,0,3,2,4,6,7,10,8,5,4,2,5,0,1,5,2,1,8,3,2,8,1,0,6,1,0,5,3,2,8,0,4,7,0" /> '+
	'					<Reel id="4" view="3" value="4,7,2,3,5,0,3,2,1,0,4,2,3,4,1,3,0,4,6,8,10,7,5,4,3,7,1,2,8,1,0,6,3,1,5,0,2,7,0,2,8,1,3,6,2,0,6,4,0,5,1" />'+ 
	'				</ReelLayout> '+
	'				<ReelLayout id="1" value="5"> '+
	'					<Reel id="0" view="3" value="3,4,6,8,10,7,5,4,1,5,3,1,8,2,0,6,2,0,7,1,2,8,0,3,7,0,1,6,0,3,5,2,0,4,1,0,4,2" /> '+
	'					<Reel id="1" view="3" value="2,4,5,7,10,8,6,4,0,7,1,2,6,3,0,8,1,3,5,0,3,5,2,1,8,0,3,7,1,0,6,2,0,4,2,1,4,0" /> '+
	'					<Reel id="2" view="3" value="1,4,5,8,10,7,6,4,2,8,3,0,7,1,0,5,2,0,6,1,3,7,2,0,6,3,1,5,0,2,8,0,1,4,2,0,4,3" /> '+
	'					<Reel id="3" view="3" value="0,4,6,7,10,8,5,4,3,6,1,2,5,3,2,4,1,0,4,2,0,4,1,0,4,2,1,3,0,2,3,0,1,3,0,1,3,2,1" /> '+
	'					<Reel id="4" view="3" value="2,4,6,8,10,7,5,4,0,5,1,0,6,2,0,4,3,1,4,0,1,4,2,3,4,1,0,3,2,1,3,2,0,3,1,0,2,1,3,0" />'+ 
	'				</ReelLayout>'+ 
	'			</Reels>';
