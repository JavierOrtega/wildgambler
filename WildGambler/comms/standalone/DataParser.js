/**
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
     * Return response object. We should attach a code to 
     * each response. 
     */ 
    this.objResponseToGameJson;
    
    /**
     * The request data are remebered so that if the server returns an error
     * we can make some attempt to contruct an emergency error response
     * that the game can understand, with some losing reel positions and no bonus trigger.
     */
    this.objSpinRequestJson;
    
    //
    this.buildInitRequest = this.buildInitRequest.bind(this);
    this.buildSpinRequest = this.buildSpinRequest.bind(this);
    
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
    this.objResponseToGameJson = {};

    // Attach id code
    this.objResponseToGameJson.code = code;
    
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
            IFrameMessengerModel.sendBalance( Localisation.formatNumber( ServerData.getInstance().flPlayerBalance) ); 
        }
        break;

        case STRINGS.BET:
        {
            // Send relevant bits of the XML to config (stakes) and serverData (balance)
            // Should mostly be spin results and new stakes
            this.parseResultXml(responseXml);

            // Create appropriate response
            this.createResultsResponse()
        }
        break;
    }

    // Attach balance
    this.objResponseToGameJson.flPlayerBalance = ServerData.getInstance().flPlayerBalance;

    //
    return this.objResponseToGameJson;
}


/**
 * TODO check these parsing methods are valid for all mobile platforms.
 * TODO Requires two distinct parsing methods in each object. Consider refactoring 
 * the parsing into another place, although this keeps the switch between 
 * parsing styles in one place (albeit in each object), i.e. not here && configuration object 
 */
DataParser.prototype.parseInitXml = function (responseXml)
{ 
    var xmlDoc = UTILS.createDoc(responseXml);
    var xmlNode;
    
    // TODO resume data - none in this first game, at least

    // -- Server Data
    // -- Probably almost nothing in MOBILE: The following is from 
    // -- a GTS init xml currently coming from the virtual host:

    xmlNode = xmlDoc.getElementsByTagName(STRINGS.CUSTOMER_DETAILS)[0];
    this.objConfiguration.storeCustomerDetails(xmlNode);
    
    // TODO Use of real data when we get the real engine running
    xmlNode = xmlDoc.getElementsByTagName(STRINGS.CUSTOMER_BALANCE)[0];
    var xmlJson = x2js.xml2json(xmlNode);
    ServerData.getInstance().updateBalance( Number(xmlJson._balance) );
    
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
    xmlNode = xmlDoc.getElementsByTagName(STRINGS.EEG_CONFIG_RESPONSE)[0];
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
    responseXml = "<xml>"+responseXml+"</xml>";
    this.objServerResultsJson = x2js.xml_str2json(responseXml)
    
    ServerData.getInstance().updateBalance(Number(this.objServerResultsJson.xml.Balances.Balance[0]._amount));
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
     * Reinstate player balance.
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
    // this.objResponseToGameJson should be already new-ed apart from code:Bet
    this.objResponseToGameJson.Spin = {};
    this.objResponseToGameJson.Spin.flStake = parseFloat(this.objServerResultsJson.xml.Spin._stake);
    this.objResponseToGameJson.Spin.flSpinWin = parseFloat(this.objServerResultsJson.xml.Spin._spinWin);
    this.objResponseToGameJson.Spin.blMaxWin = this.objServerResultsJson.xml.Spin._maxWin == "false" ? false : true;
    this.objResponseToGameJson.Spin.intLayout = parseInt(this.objServerResultsJson.xml.Spin._layout);
    
    // ensure ints
    this.objResponseToGameJson.Spin.arrPosition = this.objServerResultsJson.xml.Spin._position.split(",");
    for( i in this.objResponseToGameJson.Spin.arrPosition )
    {
        this.objResponseToGameJson.Spin.arrPosition[i] = parseInt(this.objResponseToGameJson.Spin.arrPosition[i], 10);
    }

    // ensure ints
    this.objResponseToGameJson.Spin.arrSymbols = this.objServerResultsJson.xml.Spin._symbols.split(",");
    for( i in this.objResponseToGameJson.Spin.arrSymbols )
    {
        this.objResponseToGameJson.Spin.arrSymbols[i] = parseInt(this.objResponseToGameJson.Spin.arrSymbols[i], 10);
    }

    // ensure ints
    this.objResponseToGameJson.Spin.arrIndices = this.objServerResultsJson.xml.Spin._indices.split(",");
    for( i in this.objResponseToGameJson.Spin.arrIndices )
    {
        this.objResponseToGameJson.Spin.arrIndices[i] = parseInt(this.objResponseToGameJson.Spin.arrIndices[i], 10);
    }

    // ensure int
    this.objResponseToGameJson.Spin.intBonusLetters = parseInt(this.objServerResultsJson.xml.Spin._bonusLetters, 10);
    
    // Record any winlines
    var arrWinlines = [];

    //
    if(this.objServerResultsJson.xml.Spin.Winlines.__cnt > 0)
    {
        for(var wl=0; wl<this.objServerResultsJson.xml.Spin.Winlines.Winline_asArray.length; ++wl)
        {
            var line = this.objServerResultsJson.xml.Spin.Winlines.Winline_asArray[wl];
            arrWinlines.push(new WinlineResult(line));
        }
    }

    // Add in winlines (or lack of them)    
    this.objResponseToGameJson.Spin.arrWinlines = arrWinlines;
    
    // -- Freespins
    if(this.objResponseToGameJson.Spin.intBonusLetters == 5)
    {
        this.objResponseToGameJson.Freespins = {};
        this.objResponseToGameJson.Freespins.intIndex = parseInt(this.objServerResultsJson.xml.Freespins._index);
        this.objResponseToGameJson.Freespins.intAward = parseInt(this.objServerResultsJson.xml.Freespins._award);
        this.objResponseToGameJson.Freespins.arrFreespin = [];
        for(var s in this.objServerResultsJson.xml.Freespin_asArray)
        {
            var spin = this.objServerResultsJson.xml.Freespin_asArray[s];
            var freespin = {};
            freespin.intAward = parseInt(spin._award);
            freespin.intIndex = parseInt(spin._index);
            freespin.flSpinWin = parseFloat(spin._spinWin);
            freespin.flFreespinsWin = parseFloat(spin._freespinsWin);
            freespin.blMaxWin = spin._maxWin == "false" ? false : true;
            freespin.intLayout = parseInt(spin._layout);

            freespin.arrPosition = spin._position.split(",");
            for( i in freespin.arrPosition)
            {
                freespin.arrPosition[i] = parseInt(freespin.arrPosition[i]);
            }

            freespin.arrIndices = spin._indices.split(",");
            for( i in freespin.arrIndices)
            {
                freespin.arrIndices[i] = parseInt(freespin.arrIndices[i]);
            }

            freespin.arrSymbols = spin._symbols.split(",");
            for( i in freespin.arrSymbols)
            {
                freespin.arrSymbols[i] = parseInt(freespin.arrSymbols[i]);
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
            

            this.objResponseToGameJson.Freespins.arrFreespin.push(freespin);
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
    // this.objResponseToGameJson should be new apart from code:Init
    
    /**
     * Anything general required by games 
     */
    this.objResponseToGameJson.strLanguageCode = this.objConfiguration.strLanguageCode;
    this.objResponseToGameJson.strCurrencyCode = this.objConfiguration.strCurrencyCode;
    this.objResponseToGameJson.getStrPaytableUrl = this.objConfiguration.getStrPaytableUrl;
    this.objResponseToGameJson.getStrHelpUrl = this.objConfiguration.getStrHelpUrl;
    this.objResponseToGameJson.arrAutoplays = this.objConfiguration.arrAutoplays;


    /** 
     * Stake info. Rather than pass the stakeTable object, which would
     * come with its methods as well as its data, we can use the table to 
     * make a set of the required data only for the game.
     */
    this.objResponseToGameJson.Stakes = {};
    this.objResponseToGameJson.Stakes.intNumGameWinLines = this.objConfiguration.objStakeTable.intNumGameWinLines;
    this.objResponseToGameJson.Stakes.arrValidStakes = this.objConfiguration.objStakeTable.arrValidStakes;
    this.objResponseToGameJson.Stakes.intDefaultStakeIndex = this.objConfiguration.objStakeTable.intDefaultStakeIndex;
    this.objResponseToGameJson.Stakes.flMinStake = this.objConfiguration.objStakeTable.flMinStake;
    this.objResponseToGameJson.Stakes.flMaxStake = this.objConfiguration.objStakeTable.flMaxStake;
    this.objResponseToGameJson.flRoundLimit = this.objConfiguration.objStakeTable.flRoundLimit;
    this.objResponseToGameJson.flMaxWin = this.objConfiguration.objStakeTable.flMaxWin;
    
    /**
     * SymbolTable. In this case we want to pass the whole object as it has
     * some utility methods that are useful for the game.
     * E.G. method find(...) which will return a given symbol description based on
     * its id, name, char or type
     */ 
    this.objResponseToGameJson.objSymbolTable = this.objConfiguration.objSymbolTable;
    
    /**
     * Winlines. Again, the game doesn't need the WinlineTable's methods as all these do
     * is to store the incoming xml. By making a Winlines object within our response object
     * we can just return the data.
     */ 
    this.objResponseToGameJson.Winlines = {};
    this.objResponseToGameJson.Winlines.arrWinlines = this.objConfiguration.objWinlineTable.arrWinlines;
    this.objResponseToGameJson.Winlines.intMaxWinlines = this.objConfiguration.objWinlineTable.intMaxWinlines;
    this.objResponseToGameJson.Winlines.intMinWinlines = this.objConfiguration.objWinlineTable.intMinWinlines;
    this.objResponseToGameJson.Winlines.strFont = this.objConfiguration.objWinlineTable.strFont;
    this.objResponseToGameJson.Winlines.strFontColour = this.objConfiguration.objWinlineTable.strFontColour;
    this.objResponseToGameJson.Winlines.strBoxBgColour = this.objConfiguration.objWinlineTable.strBoxBgColour;
    
    /**
     * Reels. Here we return the whole table as it has many methods useful to the game.
     */ 
    this.objResponseToGameJson.objReelsTable = this.objConfiguration.objReelsTable;
    
    /**
     * Sound configuration. path and filename properties for Json and Sound-sprite files.
     */ 
    this.objResponseToGameJson.objSoundConfiguration = {};
    this.objResponseToGameJson.objSoundConfiguration.strSoundConfigPath = this.objConfiguration.strSoundConfigPath;
    this.objResponseToGameJson.objSoundConfiguration.strSoundConfigFileName = this.objConfiguration.strSoundConfigFileName;
    this.objResponseToGameJson.objSoundConfiguration.strSoundFileName = this.objConfiguration.strSoundFileName;
}


/**
 * The init request to the mobile server is pretty simple!
 */
DataParser.prototype.buildInitRequest = function()
{
    return '<InitRequest gameTitle="' + this.objConfiguration.strGameTitle + '" />';
}

/**
 * <Bet stake="81.58" line="6.00" wilds="75.58" indices="1,4" /> 
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
    
    // Bet Request. Simple for now, will wrap it up when I know 
    // what the actual send/receive formats are.
    if( jsonData.code == "Bet" )
    {
        strSpinRequest = '<' + jsonData.code + ' stake="' + jsonData.stake.toFixed(2) + 
                 '" line="' + jsonData.line.toFixed(2) + 
                 '" wilds="' + jsonData.wilds.toFixed(2); 
                 
                 // Web game does not include indices if no wilds are held.
                 if(jsonData.indices)
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
