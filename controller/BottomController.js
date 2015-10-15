/**
 * @author Javier.Ortega
 * 
 * This class will handle the specific functionalities for the BottomBar Controller
 */


/**
 * Constructor
 * @param {Object} objDeviceModel Reference to the device model
 * @param {Object} objGuiController Reference to the GuiController 
 * 
 */
function BottomController( objDeviceModel,
                              objGuiController )
{   
    this.assignLang = this.assignLang.bind (this);
    
    this.objDivContainer = document.getElementById('bottomArea');    
    this.objCanvas = document.getElementById('bottom');
 
    this.objGuiController = objGuiController;
    
    this.objLeftImage = this.objGuiController.objGuiView.getElement (0,'hud_bg_edge_left.png');
    this.objCenterImage = this.objGuiController.objGuiView.getElement (0,'hud_bg.png');  
    this.objRightImage = this.objGuiController.objGuiView.getElement (0,'hud_bg_edge_right.png');
    this.objLogoImage = this.objGuiController.objGuiView.getElement (0,'hud_logo.png');
    this.imgLowBalance = this.objGuiController.objGuiView.getElement (0,'balance_low.png');
    this.imgOkBalance = this.objGuiController.objGuiView.getElement (0,'balance_ok.png');
    
    this.txtAmount = this.objGuiController.objGuiView.getElement (0,'balance');
    this.txtAmount.setAlignment(TextBoxView.ALIGN_LEFT);
    this.txtAmount.setText ("0");
    this.txtPlayForFunReal = this.objGuiController.objGuiView.getElement (0,'playForFunReal');
    this.txtPlayForFunReal.blVisible = false;
    
    this.objRightImage.intX = BottomController.WIDTH - this.objRightImage.intWidth;
    this.objLogoImage.intX = BottomController.WIDTH - this.objLogoImage.intWidth;
    
    var objTextureView = new TextureView("texture");
    
    objTextureView.setTexture(this.objLeftImage.intX + this.objLeftImage.intWidth, 
                             this.objLeftImage.intY,
                             BottomController.WIDTH - this.objRightImage.intWidth * 2,
                             BottomController.HEIGHT,
                             this.objCenterImage.imImage);    
    this.objGuiController.objGuiView.addElement(0,"texture",objTextureView);    
    
    this.objCenterImage.blVisible = false;  
    
    this.create(objDeviceModel, objGuiController );

    /*
     * Set the mode from the querystring params provided.
     */    
    if(StateFactory.initParamsObj.forMoney == null )
    {
        throw new Error("StateFactory.initParamsObj.forMoney MUST exist.");
    } 
    else
    {
        this.setModeReal(StateFactory.initParamsObj.forMoney);
    }



    /*
     * No idea what this is
     */
    this.setLowBalance(false);
}

/**
 * Derive BottomController from our base type to provide inheritance
 */
Class.extend(ScreenLogicController, BottomController)

BottomController.WIDTH = 1024;
BottomController.WIDTH_RIGHT_BORDER = 8;

if (navigator.userAgent.match(/Safari/i) //safari browser
    && !navigator.userAgent.match(/CriOS/i) //not chrome browser
    && navigator.userAgent.match(/OS 7/i) //iOS7
    && (navigator.userAgent.match(/Iphone/i) || navigator.userAgent.match(/Ipod/i)))    
{
    BottomController.HEIGHT = 60;
}
else
{
    BottomController.HEIGHT = 40;  
}

/**
 * Show the low balance icon or the ok balance
 *  
 * @param { Boolean } blTrue Variable to make visible the low Balance icon or the ok balance
 */
BottomController.prototype.setLowBalance = function (blTrue)
{
    this.imgLowBalance.blVisible = blTrue;
    this.imgOkBalance.blVisible = !blTrue;
    this.objGuiController.objGuiView.blDirty = true;
}

/**
 * Assign the texts
 *  
 * @param { Object } objLang The collection of texts
 */
BottomController.prototype.assignLang = function (objLang)
{
    this.objLang = objLang;
    
    var objText;
    
    if ( this.blModeReal )
    {
        objText = this.objLang["PlayingForReal"];
    }
    else
    {
        objText = this.objLang["PlayingForFun"];   
    }
    
    this.txtPlayForFunReal.setText (objText.text);
    this.txtPlayForFunReal.setStrokeColour (objText.color);
    this.txtPlayForFunReal.setAlignment(TextBoxView.ALIGN_CENTER);
    this.txtPlayForFunReal.setVerticalAlign (TextBoxView.VERTICAL_ALIGN_MIDDLE);
    this.txtPlayForFunReal.blVisible = true;
    this.txtPlayForFunReal.blDirty = true;
}

/**
 * This function will set if the game is in free mode or not
 *  
 * @param { Boolean } blModeReal A boolean to indicate if we are playing for fun (false) or for real (true)
 */
BottomController.prototype.setModeReal = function ( blModeReal)
{
    this.blModeReal = blModeReal;
    
    if (this.objLang)
    {
        this.assignLang (this.objLang);
    }
}

/**
 * To handle an error
 * @param {String} strMessage The string for the error message
 */
BottomController.prototype.resize = function(flZoomRatio)
{
    var widthToHeight = BottomController.WIDTH / BottomController.HEIGHT;
    
    var newWidth = window.innerWidth;
    var newHeight = window.innerHeight;
    
    var newWidthToHeight = newWidth / newHeight;
    
    if ( newWidthToHeight > widthToHeight )
    {
        this.intrelation = newHeight / BottomController.HEIGHT;
    }
    else
    {
        this.intrelation = newWidth / BottomController.WIDTH;
    }
    
    this.objCanvas.width = BottomController.WIDTH;
    this.objCanvas.height = BottomController.HEIGHT;
    
    
    this.objCanvas.style.width = (BottomController.WIDTH *this.intrelation)+ 'px';
    this.objCanvas.style.height = (BottomController.HEIGHT * (this.intrelation)) + 'px';
    
    if ( this.objDeviceModel.platform == OS.IOS || this.objDeviceModel.platform == OS.WINDOWS )
    {
        this.objDivContainer.style.marginTop = (window.innerHeight - (BottomController.HEIGHT * this.intrelation )) + 'px';
        
            
        this.objDivContainer.style.marginLeft = (0) + 'px';
        this.intHeightBottomBar = BottomController.HEIGHT * this.intrelation ;
    }
    else
    {
        this.objDivContainer.style.marginTop = (window.innerHeight - (BottomController.HEIGHT * this.intrelation )) + 'px';
        this.objDivContainer.style.marginLeft = (0) + 'px';
            
        this.intHeightBottomBar = BottomController.HEIGHT * this.intrelation ;
    }
    
    this.txtPlayForFunReal.intX = (BottomController.WIDTH)/ 2 - (this.txtPlayForFunReal.intWidth /2);
      
    this.intHeightPx = this.intHeightBottomBar;
    
    this.objGuiController.objGuiView.blDirty = true;
    
    
    window.scrollTo( 0, 1 );

}
