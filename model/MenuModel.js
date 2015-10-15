/**
 * This class handles the data for the controller
 * @class
 */
function MenuModel()
{

    /**
     * Collection id's for the buttons
     * @type {Array}
     */
    //this.arrButtons = ['home','help', 'btnInfo', 'btnSupport' , 'btnDeposit' ,
    // 'btnWithDraw', 'btnCashier', 'btnTransactions', 'btnPlayForReal',
    // 'btnLogin', 'btnLogout', 'btnGambling2', 'btnGambling3'];
    this.arrButtons = ['home', 'help', 'info', 'deposit', 'withdraw', 'cashier', 'transactions', 'playForReal', 'login', 'logout', 'responsiblegamblinglink2', 'responsiblegamblinglink3'];

    /**
     * Collection url's from VF
     * @type {Array}
     */
    //this.arrUrls = ['home.url','help.url', 'info.url', 'support.url',
    // 'deposit.url', 'withdraw.url', 'cashier.url', 'betHistory.url',
    // 'playForReal.url', 'login.url', 'logout.url',
    // 'responsibleGamblingIconLink2.url', 'responsibleGamblingIconLink3.url'];
    this.arrUrls = ['home.url', 'help.url', 'info.url', 'support.url', 'deposit.url', 'withdraw.url', 'cashier.url', 'betHistory.url', 'playForReal.url', 'loginBack.url', 'logoutBack.url', 'responsibleGamblingIconLink2.url', 'responsibleGamblingIconLink3.url'];

    /**
     * Texts for the different buttons
     * @type {Array}
     */
    this.arrNames = new Array();

    this.arrNames["home"] = "Lobby";
    this.arrNames["paytable"] = "paytable";
    this.arrNames["soundOn"] = "Sound";
    this.arrNames["soundOff"] = "Sound";
    this.arrNames["help"] = "Help";
    this.arrNames["info"] = "Info";
    //DSMT
    this.arrNames["support"] = "Support";
    this.arrNames["deposit"] = "Deposit";
    this.arrNames["withdraw"] = "Withdraw";
    this.arrNames["cashier"] = "Cashier";
    //DSMT
    this.arrNames["transactions"] = "Transactions";
    this.arrNames["playForReal"] = "PlayForReal";
    this.arrNames["settings"] = "Settings";
    this.arrNames["logIn"] = "Login";
    //registration
    this.arrNames["logOut"] = "Logout";
    //DSMT
    this.arrNames["addFriend"] = "InviteFriend";
    //DSMT
    this.arrNames["share"] = "Share";
    //DSMT
    this.arrNames["gambling2"] = "GamCare";
    this.arrNames["gambling3"] = "ResponsibleGambling3";

};
