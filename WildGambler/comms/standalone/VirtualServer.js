/**
 * VirtualHost.js
 * @author mark.serlin
 * Standalone server for WildGambler: may relocate as this is totally game-specific
 * and not really a framework item.
 */
function VirtualServer()
{
    this.flCustomerBalance = 1000.00;
    this.objCommCallback;
    this.strXmlResponse = "";
    
    // simulate latency in the server - servers are an asynchronous process.
    // Default is about 500 - more or less immediate but enough to 
    // decouple the code and let the stack unwind.
    this.intLatencyDelay = 500;
    
    this.gameConfiguration;
    
    // Always 20 in Wild Gambler
    this.intLinesBet=0;
    
    // Line stake received, for calculating wins
    this.flTotalLineStake=0;
    
    // End everythign if this goes true
    this.blMaxWin = false;
    // Calculate win value for this spin
    this.intTotalWinMx=0;
    // Winnings for one spin (main or free)
    this.flSpinWin=0;
    // All freespin winnings running total
    this.flFreespinsWin=0;
    // Everything won across an entire game round
    this.flTotalWinnings=0;
    
    // Record array of winline info for each spin.
    this.objWinlines = {};

    // Symbols on the reel after a new spin
    // Winline positions are 0-14 so the reel map can be a linear array
    this.arrReelMap = [];

    // Which reelset we are spinning for new results (main/free)
    this.arrCurrentReels = [];
    
    // New reel positions for this spin
    this.arrReelPositions = [];
    
    // How many letters to show (5 = start bonus)
    this.intBonusLetters = 0;
    this.arrBonusEntryWeights = [981,2,4,4,4,3];
    this.arrStickyWilds = [];
    
    // -- Method bindings
    
    // Initialise hard-coded init response and our helper objects
    this.init = this.init.bind(this);   
    
    // Process a communication request
    this.processComm = this.processComm.bind(this);
    this.performInitRequest = this.performInitRequest.bind(this);
    this.performSpinRequest = this.performSpinRequest.bind(this);
    this.performSpin = this.performSpin.bind(this);
    this.respond = this.respond.bind(this);

    // In-game processes. 
    this.validatedStakeRequested = this.validatedStakeRequested.bind(this);
    this.setNewReelPositions = this.setNewReelPositions.bind(this);
    this.getReelPosition = this.getReelPosition.bind(this);
    this.setReelMap = this.setReelMap.bind(this);
    this.insertWilds = this.insertWilds.bind(this);
    this.evaluateWins = this.evaluateWins.bind(this);
    this.buildSpinXml = this.buildSpinXml.bind(this);
    this.buildFreeSpinXml = this.buildFreeSpinXml.bind(this);
    this.getSymbolsOnLine = this.getSymbolsOnLine.bind(this);
    this.getWinCount = this.getWinCount.bind(this);
    this.getWildIndices = this.getWildIndices.bind(this);
    this.setBonusLetters = this.setBonusLetters.bind(this);
    
    //TO DO : To finish it
    this.processDebugPanelRequest = this.processDebugPanelRequest.bind(this);
    IFrameMessengerModel.processDebugPanelMessages = this.processDebugPanelRequest;
    this.objFixedResults = new FixedResultsObject();
    
}
Class.extend(Class,VirtualServer);

/**
 * This function will handle requests from the DebugPanel (in the sidebar)
 * to fix the next result in some way.
 * We set our fixedResult object up so that any of our usual settings will be overridden.
 */
VirtualServer.prototype.processDebugPanelRequest = function(obJSON)
{   
    
    console.log(obJSON.message);
    var objData = JSON.parse(obJSON.message);

    if (obJSON.type == "debug")
    {
        // Add in new things to intialise in FixedResultsObject constructor
        this.objFixedResults = new FixedResultsObject();
        
        if (objData.actionId == null)
        {
            //disable result fixing
            console.log("Standalone Server - SET NEXT RESULT RANDOM");
        }
        else
        {
            switch(objData.actionId)
            {
                case "freespins":
                    this.objFixedResults.intBonusLetters = 5;
                    break;
                case "bigwin":
                    // Will give 5 rhinos
                    this.objFixedResults.arrReelPositions = [11,4,17,23,18];
                    break;
                    /*
                case "arrReelPositions":
                    if(obJSON.arrReelPositions != null)
                    {
                        this.objFixedResults.arrReelPositions = obJSON.arrReelPositions;
                    }
                    break;
                    */
            }       
        }
    }
    else
    {
        console.log("unknown type", obJSON.type);
    }
}

/**
 * 
 */
VirtualServer.prototype.init = function()
{
    // Builds a winline table including hardcoded colour defaults
    this.gameConfiguration = new Configuration();
    
    // Create common game objects so we can generate results
    var xmlDoc = UTILS.createDoc(strInitResponse);
    var xmlNode;

    // Winlines
    xmlNode = xmlDoc.getElementsByTagName(STRINGS.WINLINES)[0];
    this.gameConfiguration.createWinlineTable(xmlNode);
    this.objWinlineTable = this.gameConfiguration.objWinlineTable;
    
    // Wild gambler is fixed at 20 winlines
    this.intLinesBet = this.objWinlineTable.intMaxWinlines;
    
    // Reels
    xmlNode = xmlDoc.getElementsByTagName(STRINGS.REELS)[0];
    //console.log(xmlNode);
    this.objReelsTable = new ReelsTable(xmlNode);

    // Symbols
    xmlNode = xmlDoc.getElementsByTagName(STRINGS.SYMBOLS)[0];
    //console.log(xmlNode);
    this.objSymbolTable = new SymbolTable(xmlNode);

    // Stakes called this in GTS....
    xmlNode = xmlDoc.getElementsByTagName(STRINGS.EEG_CONFIG_RESPONSE)[0];
    //console.log(xmlNode);
    this.objStakeTable = new StakeTable(xmlNode);
}

/** 
 * Method required by commObject in place of a doPost/Get etc
 * 
 * commObject should have 2 things available once this call is made:
 * 1). objComm.dataPayload: a Request in XML format (since this is what we 
 * will be sending to VF in the real world) - we convert this to JSON for 
 * fast and easy processing from here on in.
 * 2). objComm.receiveResult: callack function for when we have contructed 
 * our results, which should be returned in XML format again to replicate 
 * the server response.
 * 
 * The response will be sent after a short timeout to replicate latency.
 *   
 * @param {Object} commObject
 */
VirtualServer.prototype.processComm = function(objComm)
{
    this.objCommCallback = objComm.receiveResult;
    
    var jsonData = x2js.xml_str2json(objComm.dataPayload);

    // Init output
    this.strXmlResponse = "";

    // Check this is a spin request
    if( jsonData.Bet )
    {
        this.performSpinRequest(jsonData);
    }
    else if( jsonData.InitRequest )
    {
        this.performInitRequest();
    }
}


/**
 * Perform the initial request for game settings.
 */
VirtualServer.prototype.performInitRequest = function()
{
    // Set up util objects (ReelTable,SymbolTable etc)
    this.init();
    
    strInitResponse = strInitResponse.replace("balance=\"1000.00\"", "balance=\"" + this.flCustomerBalance + "\"");
    
    // Use hard-coded init response xml
    this.strXmlResponse = strInitResponse;
    
    // Return response to game IMMEDIATELY
    //this.objCommCallback(this.strXmlResponse);
    setTimeout( this.respond, this.intLatencyDelay );

//      TimerManager.getInstance().start(this.respond, this.intLatencyDelay)

}


/**
 * Check balance before allowing spin to continue.
 * If too low return the virtuefusion error xml
 * @param {Object} jsonData
 */
VirtualServer.prototype.performSpinRequest = function(jsonData)
{
    this.flTotalLineStake = jsonData.Bet._line;
    this.flTotalWinnings=0;
    this.blMaxWin = false;
    
    // Check stake amount
    if(jsonData.Bet._stake > this.flCustomerBalance)
    {
        this.strXmlResponse = '<PlaceBetResponse error="noFunds" gameId="0"/>';
    }
    else if(this.flTotalLineStake == 0)
    {
        this.strXmlResponse = '<PlaceBetResponse error="invalid" gameId="0"/>'
    }
    else
    {
        this.performSpin(jsonData);

        this.strXmlResponse += '<Balances>'+
            '<Balance amount="'+ this.flCustomerBalance.toFixed(2) + '" category="TOTAL" currency="GBP" name="Total" />'+
            '<Balance amount="'+ this.flCustomerBalance.toFixed(2) + '" category="CASH" currency="GBP" name="Cash" />'+
        '</Balances>';
    }
    
    /*
     * NOTE: setTimeout is not to be used for unit testing!
     * Make immediate response, or we get concurrency issues in the tests. 
     * Use:
     * this.objCommCallback(this.strXmlResponse);
     */
    setTimeout( this.respond, this.intLatencyDelay );
    //this.objCommCallback(this.strXmlResponse);
    //TimerManager.getInstance().start(this.respond, this.intLatencyDelay)
}

/*
 * 
 */
VirtualServer.prototype.performSpin = function(jsonData)
{
    // Validate stake for wilds.
    this.flCustomerBalance -= this.validatedStakeRequested(jsonData.Bet._stake);
    
    // Set reels to main for new spin
    this.arrCurrentReels = this.objReelsTable.arrReelbands[0];

    // Get new reel positions for current reels
    this.setNewReelPositions();
    
    // Winline positions are 0-14 so the reel map
    // can be a linear array
    this.setReelMap();
    
    // Put in the held wilds if any
    var arrHeldWilds = jsonData.Bet._indices.split(",");
    if(arrHeldWilds.length > 0 && 
       arrHeldWilds[0] != "")
    {
        this.insertWilds(arrHeldWilds);
    }
    
    // Evaluate wins 
    this.evaluateWins();
    
    // construct valid XML
    this.buildSpinXml();
    
    // Check for bonus freespins, ignore if max win is hit
    if(this.intBonusLetters == 5)
    {
        this.flFreespinsWin = 0;
        
        // Any wilds on the reels remain throughout freespins
        // First get any on the reels from the main spin.
        this.arrStickyWilds = this.getWildIndices();
        
        // Set reels to main for new spin
        this.arrCurrentReels = this.objReelsTable.arrReelbands[1];

        //  <Freespins award="8" index="0" />
        this.strXmlResponse += '<Freespins award="8" index="0" />';

        for(var spin=0; spin<8; ++spin)
        {
            
            // Get new reel positions for current reels
            /* HACK to give BigWin in freespins
            if(spin == 7)
            {
             this.arrReelPositions =     [11,4,2,4,2];
            }
            else */
            {
                this.setNewReelPositions();
            }
            
            // Winline positions are 0-14 so the reel map
            // can be a linear array
            this.setReelMap();
            
            // Any wilds on the reels remain throughout freespins
            // Add in any sticky wilds from this spin.
            // No worries if this contains duplicates...
            this.arrStickyWilds = this.arrStickyWilds.concat(this.getWildIndices());
            
            //
            this.insertWilds(this.arrStickyWilds);
            
            // Evaluate wins and construct valid XML
            this.evaluateWins();
            
            // construct valid XML for freespins
            if(this.blMaxWin == false)
            {
                this.buildFreeSpinXml(spin);
            }
            else
            {
                this.strXmlResponse += '<Error msg="Invalid request"/>';
            }
        }


        //this.strXmlResponse += '</Freespins>';
    }

    // Add wins to balance
    this.flCustomerBalance += this.flTotalWinnings;
}


/**
 * Evaluate the final reel map for wins 
 * This method is used by Spin AND Freespin.
 */
VirtualServer.prototype.evaluateWins = function()
{
    this.intTotalWinMx = 0; 
    this.objWinlines = {};
    this.objWinlines.Lines = [];
    
    // Only evaluate lines that have been bet on.
    for(var line=0; line<this.intLinesBet; ++line)
    {
        var arrSymbolsOnLine = this.getSymbolsOnLine(line);
        var objWinData = this.getWinCount(arrSymbolsOnLine);
        
        var winSymbol = this.objSymbolTable.find(objWinData.normalId);
        
        //
        if( winSymbol.arrPaytable[objWinData.intCount-1] > 0 )
        {
            this.objWinlines.Lines.push( { id:line,
                                           symbol:objWinData.normalId,
                                           count:objWinData.intCount,
                                           win:winSymbol.arrPaytable[objWinData.intCount-1],
                                           symbols:arrSymbolsOnLine});
            this.intTotalWinMx += winSymbol.arrPaytable[objWinData.intCount-1];
        }
        
    }
    
    // Multiply the total LINE wins by the LINE stake
    this.flSpinWin = UTILS.format2dp((this.flTotalLineStake/20) * this.intTotalWinMx);
    
    //
    this.flTotalWinnings += this.flSpinWin;

    //
}


/**
 * "Server" xml spin response
 */
VirtualServer.prototype.buildSpinXml = function()
{   
    //
    this.setBonusLetters();
    
    // If this spin has reached maxWin the freespins are cancelled and
    // this win is capped.
    // No need to change winline info.
    if(this.flSpinWin >= this.objStakeTable.flMaxWin)
    {
        this.blMaxWin = true;
        this.flSpinWin = this.objStakeTable.flMaxWin;
        this.flTotalWinnings = this.objStakeTable.flMaxWin;
        
        // Return only 0-4 meerkats if maxWin reached: don't start freespins
        this.intBonusLetters = Math.floor( (Math.random() * 5) );
    }
    
    //
    this.strXmlResponse += '<Spin stake="' + UTILS.format2dp(this.flTotalLineStake) + 
                           '" spinWin="' + UTILS.format2dp(this.flSpinWin) + 
                           '" maxWin="' + this.blMaxWin + 
                           '" layout="' + 0 +
                           '" position="' + this.arrReelPositions.join(",") + 
                           '" symbols="' + this.arrReelMap + 
                           '" indices="' + this.getWildIndices().join(',') + 
                           '" bonusLetters="' + this.intBonusLetters + '">';
    
    // We have wins
    if(this.intTotalWinMx > 0)
    {
        this.strXmlResponse += '<Winlines>';
        
        // <Winline id="16" symbol="0" count="3" win="5" symbols="0,10,0,7,4" />
        for(var win=0; win<this.objWinlines.Lines.length; ++win)
        {
            this.strXmlResponse += '<Winline id="' + this.objWinlines.Lines[win].id +
                                   '" symbol="' + this.objWinlines.Lines[win].symbol +
                                   '" count="' + this.objWinlines.Lines[win].count +
                                   '" win="' + this.objWinlines.Lines[win].win +
                                   '" symbols="' + this.objWinlines.Lines[win].symbols.join(",") + '" />'; 
        }
        this.strXmlResponse += '</Winlines>';
    }
    else
    {
        this.strXmlResponse += '<Winlines />';
    }
    this.strXmlResponse += '</Spin>';
    
    
}

/**
 * "Server" xml freespin response: Slightly different to spin response.
 * We have set all the variables like the amount won in this spin: we just need
 * to use them to construct some valid XML for this spin result. 
 */
VirtualServer.prototype.buildFreeSpinXml = function( intIndex )
{   
    // Freespins must end if we hit max win.
    // Also cap total winnings and this win.
    // No need to change winline info.
    if(this.flTotalWinnings >= this.objStakeTable.flMaxWin)
    {
        this.blMaxWin = true;
        
        /*
         * If the total won in this transaction (since the initial spin)
         * is greater than the max win the most we can award for this 
         * spin is the maxWin minus winnings already paid.
         */
        var flPaidSoFar = this.flTotalWinnings - this.flSpinWin;
        // Cap this win
        this.flSpinWin = this.objStakeTable.flMaxWin - flPaidSoFar;
        // Cap total winnings
        this.flTotalWinnings = this.objStakeTable.flMaxWin;
    }

    // flTotFreespinsWin keeps a runnign total across all freespins
    // flTotWin is for this spin only
    this.flFreespinsWin += this.flSpinWin;
    
    //
    this.strXmlResponse += '<Freespin index="' + (intIndex+1) + '" award="8' + 
                           '" spinWin="' + UTILS.format2dp(this.flSpinWin) + 
                           '" freespinsWin="' + UTILS.format2dp(this.flFreespinsWin) + 
                           '" maxWin="' + this.blMaxWin + 
                           '" layout="' + 1 +
                           '" position="' + this.arrReelPositions.join(",") + 
                           '" symbols="' + this.arrReelMap + 
                           '" indices="' + this.getWildIndices().join(',') + '">';
    
    // We have wins
    if(this.intTotalWinMx > 0)
    {
        this.strXmlResponse += '<Winlines>';
        
        // <Winline id="16" symbol="0" count="3" win="5" symbols="0,10,0,7,4" />
        for(var win=0; win<this.objWinlines.Lines.length; ++win)
        {
            this.strXmlResponse += '<Winline id="' + this.objWinlines.Lines[win].id +
                                   '" symbol="' + this.objWinlines.Lines[win].symbol +
                                   '" count="' + this.objWinlines.Lines[win].count +
                                   '" win="' + this.objWinlines.Lines[win].win +
                                   '" symbols="' + this.objWinlines.Lines[win].symbols.join(",") + '" />'; 
        }
        this.strXmlResponse += '</Winlines>';
    }
    else
    {
        this.strXmlResponse += '<Winlines />';
    }
    this.strXmlResponse += '</Freespin>';
    
    
    //  console.log(this.strXmlResponse);
}



/**
 * Determine whether to start freespins...
 * Account for debug panel setting. 
 * intBonusLetters == 5 will start freespins
 */
VirtualServer.prototype.setBonusLetters = function()
{
    // HACK
    //this.intBonusLetters = this.intBonusLetters == 5 ? 0 : this.intBonusLetters+1;
    //return;
    
    // Set from debug panel if setting exists, then clear the setting
    if( this.objFixedResults.intBonusLetters != null )
    {
        this.intBonusLetters = this.objFixedResults.intBonusLetters;
        this.objFixedResults.intBonusLetters = null;
        return;
    }
    
    // Set normally
    else
    {
        this.intBonusLetters = 0;
    
        var totalWeights=0;
        for(var weight in this.arrBonusEntryWeights)
        {
            totalWeights += parseInt(this.arrBonusEntryWeights[weight]);
        }
        
        var rand = Math.floor((Math.random()*totalWeights));
        
        totalWeights=0;
        
        for(var i=0; i<this.arrBonusEntryWeights.length; ++i)
        {
            totalWeights += this.arrBonusEntryWeights[i];
            if(rand < totalWeights)
            {
                this.intBonusLetters = i;
                break;
            }   
        }
    }
}



/**
 * Wild Gambler: Get the indices of any wilds from the reel map 
 */
VirtualServer.prototype.getWildIndices = function()
{
    var indices = [];
    var wildId = this.objSymbolTable.find("Wild").intId;
    
    for(var i=0; i<this.arrReelMap.length; ++i)
    {
        if(this.arrReelMap[i] == wildId)
        {
            indices.push(i);
        }   
    }
    
    //
    return indices;
}

/**
 * Insert the wilds held by the player into the 
 * new reel map generated by this spin. 
 */
VirtualServer.prototype.insertWilds = function(arrHeldWilds)
{
    for(var pos=0; pos<arrHeldWilds.length; ++pos)
    {
        this.arrReelMap[arrHeldWilds[pos]] = this.objSymbolTable.find("Wild").intId;
    }
}


/**
 * Wild gambler: wilds only pay if 5, otherwise pay symbol count value
 */
VirtualServer.prototype.getWinCount = function(arrSymbols)
{
    var wildId = this.objSymbolTable.find("Wild").intId;
    
    var objWinData = {};
    objWinData.normalId = -1;
    objWinData.intCount = 0;
    
    for(var s=0; s<arrSymbols.length; ++s)
    {
        if(arrSymbols[s] == wildId)
        {
            ++objWinData.intCount;
        }
        else
        {
            if(objWinData.normalId == -1)
            {
                objWinData.normalId = arrSymbols[s];
                ++objWinData.intCount;
            }
            else
            {
                if(arrSymbols[s] == objWinData.normalId)
                {
                    ++objWinData.intCount;
                }
                else
                {
                    break;
                }
            }
        }
    }
    
    // Check for 5 wilds
    if(objWinData.intCount == arrSymbols.length && objWinData.normalId == -1)
    {
        objWinData.normalId = wildId;
    }
    
    //
    return objWinData;
}

/**
 * 
 */
VirtualServer.prototype.getSymbolsOnLine = function(winlineId)
{
    var symbols = [];
    var winline = this.objWinlineTable.arrWinlines[winlineId];
    for(var s=0; s<winline.arrMapping.length; ++s)
    {
        symbols.push(this.arrReelMap[winline.arrMapping[s]]);
    }   
    return symbols;
}

/**
 * Set our linear reel map to the symbols on the current reels
 * at our current reel positions 
 */
VirtualServer.prototype.setReelMap = function()
{
    this.arrReelMap = [];
    for( var r=0; r<this.arrCurrentReels.length; ++r )
    {
        var reel = this.arrCurrentReels[r];
        var arrSymbols = reel.getSymbolsInView(this.arrReelPositions[r]);
        this.arrReelMap = this.arrReelMap.concat(arrSymbols);
    }
    
}

/**
 * Set the value of this.arrReelPositions on the reels passed in.
 * These might be the main reels, freespin reels, etc
 * @param a set of reels to get new positions for.  
 */
VirtualServer.prototype.setNewReelPositions = function()
{
    // HACK                   0 wins both reels             
    //this.arrReelPositions = [43,39,1,26,34];//[0,0,13,0,0];           //[8,36,47,11,35];//[7,12,5,7,1];//[43,39,1,26,34];//[6,13,4,5,1];//[0,0,0,0,0];//;
    //return;
    
    // If fixed positions exist use them and then clear the setting
    if(this.objFixedResults.arrReelPositions != null)
    {
        this.arrReelPositions = this.objFixedResults.arrReelPositions;
        this.objFixedResults.arrReelPositions = null;
    }
    else
    {
        for(var r=0; r<this.arrCurrentReels.length; ++r)
        {
            this.arrReelPositions[r] = this.getReelPosition(this.arrCurrentReels[r].intLength);
        }
    }
}

/**
 * Get a random number between 0 and max-1 
 */
VirtualServer.prototype.getReelPosition = function(intMax)
{
    return Math.floor((Math.random()*intMax));
}

/**
 * Validate the stake requested by the game.
 * In the case of wildgambler this is arrived at by a complex algorithm 
 * due to the pattern of held wilds. 
 */
VirtualServer.prototype.validatedStakeRequested = function(flStakeRequested)
{
    // TODO
    
    return flStakeRequested;
}


/**
 * Replicate latency  
 */
VirtualServer.prototype.respond = function()
{
    this.objCommCallback(this.strXmlResponse);
}


/**
 * This object should contain a version of everything that
 * gets set to give a new result of some sort in the Virtual Host.
 * Reel positions and bonus letters in Wild Gambler, for example.
 * Later we may want to set specific symbol wins to check animations.
 * Also we need a big win of some sort, but in WG we can just hold a bunch
 * of wilds and that is guaranteed to give a big win.
 * In the server code, we use one or more of these values if they have been set. 
 */
function FixedResultsObject()
{
    this.arrReelPositions = null;
    this.intBonusLetters = null;
}

 
var losingSpinNoHolds = '<Spin stake="20.00" spinWin="0.00" maxWin="false" layout="0" position="10,39,19,27,43" symbols="0,1,8,7,3,2,0,1,7,2,5,0,6,2,0" indices="" bonusLetters="0">'+
            '<Winlines />'+
        '</Spin>';

var strInitResponse = '<CompositeResponse elapsed="0" date="2013-02-19T13:31:37+0000">'+
    '<CustomerDetailsResponse accountId="ashgaming24" customerId="1350600" domain="ashgaming" anonymous="false" currency="&#163;" currencyPrefix="Â£" />'+
    '<CustomerBalanceResponse balance="1000.00" />'+
    '<EEGOpenGameResponse gameId="1600538000">'+
    '   <Resume />'+
    '</EEGOpenGameResponse>'+
    '<EEGConfigResponse defaultStake="0.10" maxStake="200.00" maxWin="200000.00" minStake="0.01">'+
    '<Option incPeriod="0.01" incStake="0.01"/>'+
    '<Option incPeriod="0.00" incStake="0.12"/>'+
    '<Option incPeriod="0.05" incStake="0.15"/>'+
    '<Option incPeriod="0.10" incStake="0.30"/>'+
    '<Option incPeriod="0.25" incStake="0.50"/>'+
    '<Option incPeriod="1.00" incStake="1.00"/>'+
    '<Option incPeriod="0.00" incStake="2.00"/>'+
    '</EEGConfigResponse>'+
    /*
    '<EEGConfigResponse minStake="0.10" maxStake="10000.00" maxWin="123456789.00" defaultStake="10.00" roundLimit="100000.00">'+
    '   <Option incStake="0.50" incPeriod="0.00" />'+
    '   <Option incStake="50.00" incPeriod="0.00" />'+
    '   <Option incStake="0.10" incPeriod="0.10" />'+
    '   <Option incStake="1.00" incPeriod="1.00" />'+
    '   <Option incStake="10.00" incPeriod="10.00" />'+
    '   <Option incStake="100.00" incPeriod="100.00" />'+
    '   <Option incStake="0.01" incPeriod="0.01" />'+
    '   <Option incStake="0.05" incPeriod="0.05" />'+
    '   <Option incStake="0.20" incPeriod="0.10" />'+
    '   <Option incStake="5.00" incPeriod="0.00" />'+
    '   <Option incStake="1000.00" incPeriod="1000.00" />'+
    '</EEGConfigResponse>'+
    */
    '<EEGLoadOddsResponse gameId="1600538000">'+
    '   <Profile>'+
    '       <WildGambler version="RC5">'+
    '           <Symbols> '+
    '               <Symbol id="0" name="Ten" char="T" type="Normal" multiplier="1" consecutive="3" paytable="0,0,5,15,40" /> '+
    '               <Symbol id="1" name="Jack" char="J" type="Normal" multiplier="1" consecutive="3" paytable="0,0,10,20,50" /> '+
    '               <Symbol id="2" name="Queen" char="Q" type="Normal" multiplier="1" consecutive="3" paytable="0,0,15,30,60" /> '+
    '               <Symbol id="3" name="King" char="K" type="Normal" multiplier="1" consecutive="3" paytable="0,0,20,40,70" /> '+
    '               <Symbol id="4" name="Ace" char="A" type="Normal" multiplier="1" consecutive="3" paytable="0,0,25,50,100" /> '+
    '               <Symbol id="5" name="Flamingo" char="F" type="Normal" multiplier="1" consecutive="3" paytable="0,0,80,150,300" /> '+
    '               <Symbol id="6" name="Zebra" char="Z" type="Normal" multiplier="1" consecutive="3" paytable="0,0,100,200,400" /> '+
    '               <Symbol id="7" name="Cheetah" char="C" type="Normal" multiplier="1" consecutive="3" paytable="0,0,150,300,500" />'+ 
    '               <Symbol id="8" name="Rhino" char="R" type="Normal" multiplier="1" consecutive="3" paytable="0,0,200,400,800" />'+ 
    '               <Symbol id="9" name="Elephant" char="E" type="Normal" multiplier="1" consecutive="3" paytable="0,0,0,0,0" /> '+
    '               <Symbol id="10" name="Wild Lion" char="W" type="Wild" multiplier="1" consecutive="5" paytable="0,0,0,0,1000" />'+ 
    '           </Symbols>'+
    '           <Reels value="2"> '+
    '               <ReelLayout id="0" value="5"> '+
    '                   <Reel id="0" view="3" value="8,2,1,6,3,2,5,0,1,7,0,1,8,2,3,6,1,0,5,3,0,6,3,1,7,0,4,8,1,0,5,2,0,4,3,0,2,4,3,2,4,6,8,10,7,5,4,2,7,0,1" /> '+
    '                   <Reel id="1" view="3" value="0,4,5,7,10,8,6,4,1,8,3,2,7,1,0,5,3,1,6,2,0,5,2,0,6,1,4,7,0,2,8,0,1,8,2,3,6,1,0,7,3,2,5,0,3,4,0,2,4,1,3" /> '+
    '                   <Reel id="2" view="3" value="8,10,7,6,4,0,6,2,0,6,2,0,7,3,0,7,1,3,8,0,1,7,3,1,5,4,0,8,2,0,5,3,2,8,1,4,6,1,3,2,0,1,4,2,0,4,2,3,1,4,5" /> '+
    '                   <Reel id="3" view="3" value="3,6,1,3,6,4,0,7,3,2,0,1,2,4,3,1,4,0,3,2,4,6,7,10,8,5,4,2,5,0,1,5,2,1,8,3,2,8,1,0,6,1,0,5,3,2,8,0,4,7,0" /> '+
    '                   <Reel id="4" view="3" value="4,7,2,3,5,0,3,2,1,0,4,2,3,4,1,3,0,4,6,8,10,7,5,4,3,7,1,2,8,1,0,6,3,1,5,0,2,7,0,2,8,1,3,6,2,0,6,4,0,5,1" />'+ 
    '               </ReelLayout> '+
    '               <ReelLayout id="1" value="5"> '+
    '                   <Reel id="0" view="3" value="3,4,6,8,10,7,5,4,1,5,3,1,8,2,0,6,2,0,7,1,2,8,0,3,7,0,1,6,0,3,5,2,0,4,1,0,4,2" /> '+
    '                   <Reel id="1" view="3" value="2,4,5,7,10,8,6,4,0,7,1,2,6,3,0,8,1,3,5,0,3,5,2,1,8,0,3,7,1,0,6,2,0,4,2,1,4,0" /> '+
    '                   <Reel id="2" view="3" value="1,4,5,8,10,7,6,4,2,8,3,0,7,1,0,5,2,0,6,1,3,7,2,0,6,3,1,5,0,2,8,0,1,4,2,0,4,3" /> '+
    '                   <Reel id="3" view="3" value="0,4,6,7,10,8,5,4,3,6,1,2,5,3,2,4,1,0,4,2,0,4,1,0,4,2,1,3,0,2,3,0,1,3,0,1,3,2,1" /> '+
    '                   <Reel id="4" view="3" value="2,4,6,8,10,7,5,4,0,5,1,0,6,2,0,4,3,1,4,0,1,4,2,3,4,1,0,3,2,1,3,2,0,3,1,0,2,1,3,0" />'+ 
    '               </ReelLayout>'+ 
    '           </Reels>'+
    '           <Winlines value="20"> '+
    '               <Winline id="0" value="1,4,7,10,13" /> '+
    '               <Winline id="1" value="0,3,6,9,12" /> '+
    '               <Winline id="2" value="2,5,8,11,14" /> '+
    '               <Winline id="3" value="0,4,8,10,12" /> '+
    '               <Winline id="4" value="2,4,6,10,14" /> '+
    '               <Winline id="5" value="0,3,7,11,14" /> '+
    '               <Winline id="6" value="2,5,7,9,12" /> '+
    '               <Winline id="7" value="1,3,6,9,13" /> '+
    '               <Winline id="8" value="1,5,8,11,13" /> '+
    '               <Winline id="9" value="1,3,7,9,13" /> '+
    '               <Winline id="10" value="1,5,7,11,13" /> '+
    '               <Winline id="11" value="0,4,6,10,12" /> '+
    '               <Winline id="12" value="2,4,8,10,14" /> '+
    '               <Winline id="13" value="1,4,6,10,13" /> '+
    '               <Winline id="14" value="1,4,8,10,13" /> '+
    '               <Winline id="15" value="0,4,7,10,12" /> '+
    '               <Winline id="16" value="2,4,7,10,14" /> '+
    '               <Winline id="17" value="0,5,6,11,12" /> '+
    '               <Winline id="18" value="2,3,8,9,14" /> '+
    '               <Winline id="19" value="2,5,6,11,14" />'+ 
    '           </Winlines>'+
    '       </WildGambler>'+
    '   </Profile>'+
    '</EEGLoadOddsResponse>'+
'</CompositeResponse>';

