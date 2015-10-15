/**
 * @author mark.serlin
 */
/**
 * VirtueFusion DataParser.js
 * Parse the result of the objVirtualServer into the 
 * objConfiguration and objServerData objects which
 * make the datas available to the game in a common format. 
 */
function DataParser()
{
    /**
     * Configuration provides all game startup parameters
     * by default and by parsing server responses. 
     */
    this.objConfiguration = new Configuration();    

    /**
     * The request data are remebered so that if the server returns an error
     * we can make some attempt to contruct an emergency error response
     * that the game can understand, with some losing reel positions and no bonus trigger.
     */
    this.objSpinRequestJson;

    /**
     * Return response object. We should attach a code to 
     * each response. 
     */ 
    this.objResponseJson;
    
    
    //
    this.buildInitRequest = this.buildInitRequest.bind(this);
    this.buildSpinRequest = this.buildSpinRequest.bind(this);
    this.buildCustomerBalanceRequest = this.buildCustomerBalanceRequest.bind(this);
    
    this.parseResponse = this.parseResponse.bind(this);
    this.parseInitXml = this.parseInitXml.bind(this);
    this.parseResultXml = this.parseResultXml.bind(this);
    this.createInitResponse = this.createInitResponse.bind(this);
    this.createResultsResponse = this.createResultsResponse.bind(this);
    this.createErrorResultsResponse = this.createErrorResultsResponse.bind(this);
}
Class.extend(Class,DataParser);

/**
 * 
 * @param code: passed in to be attached to response, identifies response type.
 * @param responseXml : received from server for translation to common data format. 
 */
DataParser.prototype.parseResponse = function( code, responseXml )
{
    // New data
    this.objResponseJson = {};

    // Attach id code
    this.objResponseJson.code = code;
    
    //  
    switch(code)
    {
        case STRINGS.INIT:
        {
            // Send relevant bits of the XML to config and serverData:
            // TODO One day will include resume xml!
            this.parseInitXml(responseXml);
            
            // Create appropriate response
            this.createInitResponse();
            
            // Update initial balance
            IFrameMessengerModel.sendBalance(Localisation.formatNumber( ServerData.getInstance().flPlayerBalance) ); 
        }
        break;

        case STRINGS.BET:
        {
            // Send relevant bits of the XML to config (stakes) and serverData (balance)
            // Should mostly be spin results and new stakes
            this.parseResultXml(responseXml);

            // Create appropriate response
            this.createResultsResponse();
        }
        break;

        case STRINGS.BALANCE:
        {
            // parse the balance
            var newBalance = responseXml.substring(responseXml.indexOf("balance=") + 9, responseXml.indexOf("/")-1);

            // Update server data balance
            ServerData.getInstance().updateBalance(Number(newBalance));

            // Update messenger model balance
            IFrameMessengerModel.sendBalance(Localisation.formatNumber(ServerData.getInstance().flPlayerBalance));
        }

        break;
    }

    // Attach balance
    this.objResponseJson.flPlayerBalance = ServerData.getInstance().flPlayerBalance;

    //
    return this.objResponseJson;
}



/**
 * TODO check these parsing methods are valid for all mobile platforms.
 * TODO Requires two distinct parsing methods in each object. Consider refactoring 
 * the parsing into another place, although this keeps the switch between 
 * parsing styles in one place (albeit in each object), i.e. not here && configuration object 
 */
DataParser.prototype.parseInitXml = function (responseXml)
{
    //console.log(responseXml);

    // -- Server Data
    ServerData.getInstance().storeServerData(responseXml);

    var xmlDoc = UTILS.createDoc(responseXml);
    var xmlNode;

    // Balance node containing name=Total   
    var xmlNodes = xmlDoc.getElementsByTagName("Balance");
    for(var nodeIt=0; nodeIt<xmlNodes.length; ++nodeIt)
    {
        var node = xmlNodes[nodeIt];
       
        var JSONresponseXml = node;
        var objResultsJson = x2js.xml2json(JSONresponseXml);

        if(objResultsJson._name == "Total")
        {
            this.objConfiguration.storeCustomerDetails(node);
            var xmlJson = x2js.xml2json(node);
            ServerData.getInstance().updateBalance(Number(xmlJson._amount));
            break;
        }
    }
    
    
    // -- Mark Ash/GTS style init xml:
    
    // Winlines
    xmlNode = xmlDoc.getElementsByTagName(STRINGS.WINLINES)[0];
    //console.log(xmlNode);
    this.objConfiguration.createWinlineTable(xmlNode);
    
    // Reels
    xmlNode = xmlDoc.getElementsByTagName(STRINGS.REELS)[0];
    //console.log(xmlNode);
    this.objConfiguration.objReelsTable = new ReelsTable(xmlNode);

    // Symbols
    xmlNode = xmlDoc.getElementsByTagName(STRINGS.SYMBOLS)[0];
    //console.log(xmlNode);
    this.objConfiguration.objSymbolTable = new SymbolTable(xmlNode);

    // Stakes called this in GTS....
    xmlNode = xmlDoc.getElementsByTagName(STRINGS.TITLE_CONFIG)[0];
    //console.log(xmlNode);
    this.objConfiguration.objStakeTable = new StakeTable(xmlNode);
}

/**
 * Note: We are not getting all the xml in the xmlString unless it is wrapped
 * in <xml></xml> tags. This resuires slightly different referencing once parsed
 * into the JSON format.
 */
DataParser.prototype.parseResultXml = function (responseXml)
{
    //console.log(responseXml);

    // -- Server Data
    ServerData.getInstance().storeServerData(responseXml);

    var xmlDoc = UTILS.createDoc(responseXml);
    var xmlNode;
    
    // Balance node containing name=Total   
    var xmlNodes = xmlDoc.getElementsByTagName("Balance");
    for(var nodeIt=0; nodeIt<xmlNodes.length; ++nodeIt)
    {
        var node = xmlNodes[nodeIt];
        console.log( "DataParser.prototype.parseInitXml found " + node );

        var JSONresponseXml = node;
        var objResultsJson = x2js.xml2json(JSONresponseXml);

        if(objResultsJson._name == "Total")
        {
            this.objConfiguration.storeCustomerDetails(node);
            var xmlJson = x2js.xml2json(node);
            ServerData.getInstance().updateBalance(Number(xmlJson._amount));
            break;
        }
    }
    
    //
    xmlNodes = xmlDoc.getElementsByTagName("Spin");
    this.objResultsJson = x2js.xml2json(xmlNodes[0])

    var freespinXmlNodes = xmlDoc.getElementsByTagName("Freespin");
    if(freespinXmlNodes.length > 0)
    {
        //this.objResultsJson.Freespins = {};
        this.objResultsJson.Freespins.Freespin = [];
        
        for(var i=0; i<freespinXmlNodes.length; ++i)
        {
            this.objResultsJson.Freespins.Freespin.push(x2js.xml2json(freespinXmlNodes[i]));
        }
    }
}

/**
  * In case of error, contruct valid game result which stops the 
  * reels on a lose and does not trigger bonus.
  */
DataParser.prototype.createErrorResultsResponse = function ()
{
    this.objResponseJson = {};
    this.objResponseJson.Spin = {};
    this.objResponseJson.Spin.flStake = this.objSpinRequestJson.stake.toFixed(2);
    this.objResponseJson.Spin.flSpinWin = 0;
    this.objResponseJson.Spin.blMaxWin = false;
    this.objResponseJson.Spin.intLayout = 0;
    this.objResponseJson.Spin.intBonusLetters = 0;
    this.objResponseJson.Spin.arrPosition = [0,0,2,0,0];
    
    /* 
     * NOTE:
     * This reinstates wilds which might make it look like we had a win.
     * However it is even weirder if the wilds all disappear, and it is 
     * creates problems with the UI because of the way it's been implemented.
     */
    this.objResponseJson.Spin.arrIndices = this.objSpinRequestJson.indices;
    
    /*
     * Reinstate player balance
     * NOTE this is the pre-spin balance as displayed to the Player. 
     * It may NOT be their actual balance, if (in the real world) they have spent
     * some money elsewhere and returned, and our onscreen balance has not been updated.
     * We should really get the REAL balance somehow!
     */
    this.objResponseJson.flPlayerBalance = this.objSpinRequestJson.flPlayerBalance;
    ServerData.getInstance().updateBalance(this.objResponseJson.flPlayerBalance);
    
    /*
     * Get all the symbols that should be showing
     */
    var arrReelMap = [];
    var arrCurrentReels = this.objConfiguration.objReelsTable.getReelband(0);
    for( var r=0; r<arrCurrentReels.length; ++r )
    {
        var reel = arrCurrentReels[r];
        var arrSymbols = reel.getSymbolsInView(this.objResponseJson.Spin.arrPosition[r]);
        arrReelMap = arrReelMap.concat(arrSymbols);
    }
    
    /*
     * Put in any wilds that were held
     */
    var intWildId = this.objConfiguration.objSymbolTable.find("WILD").intId;
    for(var s=0; s<this.objResponseJson.Spin.arrIndices.length; ++s )
    {
        arrReelMap[this.objResponseJson.Spin.arrIndices[s]] = intWildId;
    }
    
    //    
    this.objResponseJson.Spin.arrSymbols = arrReelMap;

    //
    return this.objResponseJson;
}

/**
  * 
  */
DataParser.prototype.createResultsResponse = function ()
{
    var i = 0;
    // this.objResponseJson should be already new-ed apart from code:Bet
    this.objResponseJson.Spin = {};
    this.objResponseJson.Spin.flStake = parseFloat(this.objResultsJson._stake);
    this.objResponseJson.Spin.flSpinWin = parseFloat(this.objResultsJson._spinWin);
    this.objResponseJson.Spin.blMaxWin = this.objResultsJson._maxWin == "false" ? false : true;
    this.objResponseJson.Spin.intLayout = parseInt(this.objResultsJson._layout);
    
    // ensure ints
    this.objResponseJson.Spin.arrPosition = this.objResultsJson._position.split(",");
    for( i in this.objResponseJson.Spin.arrPosition )
    {
        this.objResponseJson.Spin.arrPosition[i] = parseInt(this.objResponseJson.Spin.arrPosition[i], 10);
    }

    // ensure ints. Definitely force parseInt to base 10 here!
    this.objResponseJson.Spin.arrSymbols = this.objResultsJson._symbols.split(",");
    for( i in this.objResponseJson.Spin.arrSymbols )
    {
        this.objResponseJson.Spin.arrSymbols[i] = parseInt(this.objResponseJson.Spin.arrSymbols[i], 10);
    }

    // ensure ints if any values exist
    this.objResponseJson.Spin.arrIndices = [];
    if(this.objResultsJson._indices != "")
    {
        this.objResponseJson.Spin.arrIndices = this.objResultsJson._indices.split(",");
        for( i=0; i<this.objResponseJson.Spin.arrIndices.length; ++i )
        {
            this.objResponseJson.Spin.arrIndices[i] = parseInt(this.objResponseJson.Spin.arrIndices[i], 10);
        }
    }

    // ensure int
    this.objResponseJson.Spin.intBonusLetters = parseInt(this.objResultsJson._bonusLetters, 10);
    
    // Record any winlines
    var arrWinlines = [];

    //
    if(this.objResultsJson.Winlines.__cnt > 0)
    {
        for(var wl=0; wl<this.objResultsJson.Winlines.Winline_asArray.length; ++wl)
        {
            var line = this.objResultsJson.Winlines.Winline_asArray[wl];
            arrWinlines.push(new WinlineResult(line));
        }
    }

    // Add in winlines (or lack of them)    
    this.objResponseJson.Spin.arrWinlines = arrWinlines;
    
    // -- Freespins
    if(this.objResponseJson.Spin.intBonusLetters == 5)
    {
        this.objResponseJson.Freespins = {};
        this.objResponseJson.Freespins.intIndex = parseInt(this.objResultsJson.Freespins._index);
        this.objResponseJson.Freespins.intAward = parseInt(this.objResultsJson.Freespins._award);
        this.objResponseJson.Freespins.arrFreespin = [];
        for(var s in this.objResultsJson.Freespins.Freespin)
        {
            var spin = this.objResultsJson.Freespins.Freespin[s];
            var freespin = {};
            freespin.intAward = parseInt(spin._award, 10);
            freespin.intIndex = parseInt(spin._index, 10);
            freespin.flSpinWin = parseFloat(spin._spinWin);
            freespin.flFreespinsWin = parseFloat(spin._freespinsWin);
            freespin.blMaxWin = spin._maxWin == "false" ? false : true;
            freespin.intLayout = parseInt(spin._layout);

            freespin.arrPosition = spin._position.split(",");
            for( i in freespin.arrPosition)
            {
                freespin.arrPosition[i] = parseInt(freespin.arrPosition[i], 10);
            }

            freespin.arrIndices = spin._indices.split(",");
            for( i in freespin.arrIndices)
            {
                freespin.arrIndices[i] = parseInt(freespin.arrIndices[i], 10);
            }

            freespin.arrSymbols = spin._symbols.split(",");
            for( i in freespin.arrSymbols)
            {
                freespin.arrSymbols[i] = parseInt(freespin.arrSymbols[i], 10);
            }

            freespin.arrWinlines = [];
            
            var wls = spin.Winlines_asArray;
            if(wls[0].Winline)
            {
                for(wl=0; wl<wls[0].Winline_asArray.length; ++wl)
                {
                    var line = wls[0].Winline_asArray[wl];
                    freespin.arrWinlines.push(new WinlineResult(line));
                }
            }
            

            this.objResponseJson.Freespins.arrFreespin.push(freespin);
        }
    }
}

/**
 * We have parsed all the incoming init configuration xml
 * into a group of objects. 
 * We use these to give the values to a less complex object
 * that we can pass to the game. 
 * This object should have everything needed by the game 
 * but nothing extraeneous. 
 */
DataParser.prototype.createInitResponse = function ()
{
    // this.objResponseJson should be new apart from code:Init
    
    /**
     * Anything general required by games 
     */
    this.objResponseJson.strLanguageCode = this.objConfiguration.strLanguageCode;
    this.objResponseJson.strCurrencyCode = this.objConfiguration.strCurrencyCode;
    this.objResponseJson.getStrPaytableUrl = this.objConfiguration.getStrPaytableUrl;
    this.objResponseJson.getStrHelpUrl = this.objConfiguration.getStrHelpUrl;
    this.objResponseJson.arrAutoplays = this.objConfiguration.arrAutoplays;


    /** 
     * Stake info. Rather than pass the stakeTable object, which would
     * come with its methods as well as its data, we can use the table to 
     * make a set of the required data only for the game.
     */
    this.objResponseJson.Stakes = {};
    this.objResponseJson.Stakes.intNumGameWinLines = this.objConfiguration.objStakeTable.intNumGameWinLines;
    this.objResponseJson.Stakes.arrValidStakes = this.objConfiguration.objStakeTable.arrValidStakes;
    this.objResponseJson.Stakes.intDefaultStakeIndex = this.objConfiguration.objStakeTable.intDefaultStakeIndex;
    this.objResponseJson.Stakes.flMinStake = this.objConfiguration.objStakeTable.flMinStake;
    this.objResponseJson.Stakes.flMaxStake = this.objConfiguration.objStakeTable.flMaxStake;
    this.objResponseJson.flMaxWin = this.objConfiguration.objStakeTable.flMaxWin;
    this.objResponseJson.flRoundLimit = this.objConfiguration.objStakeTable.flRoundLimit;
    
    /**
     * SymbolTable. In this case we want to pass the whole object as it has
     * some utility methods that are useful for the game.
     * E.G. method find(...) which will return a given symbol description based on
     * its id, name, char or type
     */ 
    this.objResponseJson.objSymbolTable = this.objConfiguration.objSymbolTable;
    
    /**
     * Winlines. Again, the game doesn't need the WinlineTable's methods as all these do
     * is to store the incoming xml. By making a Winlines object within our response object
     * we can just return the data.
     */ 
    this.objResponseJson.Winlines = {};
    this.objResponseJson.Winlines.arrWinlines = this.objConfiguration.objWinlineTable.arrWinlines;
    this.objResponseJson.Winlines.intMaxWinlines = this.objConfiguration.objWinlineTable.intMaxWinlines;
    this.objResponseJson.Winlines.intMinWinlines = this.objConfiguration.objWinlineTable.intMinWinlines;
    this.objResponseJson.Winlines.strFont = this.objConfiguration.objWinlineTable.strFont;
    this.objResponseJson.Winlines.strFontColour = this.objConfiguration.objWinlineTable.strFontColour;
    this.objResponseJson.Winlines.strBoxBgColour = this.objConfiguration.objWinlineTable.strBoxBgColour;
    
    /**
     * Reels. Here we return the whole table as it has many methods useful to the game.
     */ 
    this.objResponseJson.objReelsTable = this.objConfiguration.objReelsTable;
    
    /**
     * Sound configuration. path and filename properties for Json and Sound-sprite files.
     */ 
    this.objResponseJson.objSoundConfiguration = {};
    this.objResponseJson.objSoundConfiguration.strSoundConfigPath = this.objConfiguration.strSoundConfigPath;
    this.objResponseJson.objSoundConfiguration.strSoundConfigFileName = this.objConfiguration.strSoundConfigFileName;
    this.objResponseJson.objSoundConfiguration.strSoundFileName = this.objConfiguration.strSoundFileName;
}


/**
 * The init request to the mobile server is pretty simple!
 * <InitRequest gameTitle="AG-WildGambler" />
 */
DataParser.prototype.buildInitRequest = function()
{
    return '<InitRequest gameTitle="' + this.objConfiguration.strGameTitle + '" />';
}

/**
 * The customer balance request to the mobile server is VERY simple!
 * <CustomerBalanceRequest/>
 */
DataParser.prototype.buildCustomerBalanceRequest = function ()
{
    return '<CustomerBalanceRequest/>';
}


/**
 * <Bet stake="81.58" line="6.00" wilds="75.58" indices="1,4" /> 
 * <PlaceBetRequest gameTitle="AG-WildGambler"><Bet stake="1.00" line="1.00" wilds="0.00" indices="" /></PlaceBetRequest>
 */
DataParser.prototype.buildSpinRequest = function (jsonData)
{
    // Used to construct an error response ONLY.
    this.objSpinRequestJson = jsonData;
    this.objSpinRequestJson.flPlayerBalance = ServerData.getInstance().flPlayerBalance;

    // Init output.
    var strSpinRequest="";
    
    // Remove spin cost from onscreen balance.
    ServerData.getInstance().deductCostOfSpin(jsonData.stake.toFixed(2));
    
    // Bet Request. Check input is in fact a bet request.
    if( jsonData.code == "Bet" )
    {
        strSpinRequest = '<PlaceBetRequest gameTitle=\"' + this.objConfiguration.strGameTitle + '">';
        strSpinRequest += '<' + jsonData.code + ' stake="' + jsonData.stake.toFixed(2) + 
                 '" line="' + jsonData.line.toFixed(2) + 
                 '" wilds="' + jsonData.wilds.toFixed(2); 
                 
                 // Web game does not include indices if no wilds are held.
                 if(jsonData.indices && jsonData.indices.length > 0)
                 {
                    strSpinRequest += '" indices="' + jsonData.indices.join(",");
                 }
                 else
                 {
                    if(jsonData.wilds.toFixed(2) != 0)
                    {
                        // TODO Error!
                        alert("Error: DataParser.prototype.buildSpinRequest");
                    }
                 }
        
        strSpinRequest += '" />';
        strSpinRequest += '</PlaceBetRequest>';
    }

    //
    return strSpinRequest;
}


/**
 * A winline result as received from the server
 * <Winline id="0" symbol="0" count="3" win="5" symbols="10,10,0,7,6" />
 * @param {Object} jsonData
 */
function WinlineResult(jsonData)
{
    this.intId = parseInt(jsonData._id);
    this.intSymbolId = parseInt(jsonData._symbol);
    this.intCount = parseInt(jsonData._count);
    this.flWin = parseFloat(jsonData._win);
    this.arrSymbols = jsonData._symbols.split(",");
}


