/**
 *
 * @author Petr Urban
 * @date 13/03/2013 
 * 
 * This class will manipulate and store the state of Text Box objects.
 * 
 */

function RulesView (objContext) 
{
    this.strRulesURL;
    this.context;
    
    this.intX;
    this.intY;
    
    this.intWidth;
    this.intHeight;
    
    this.blVisible;
    
    //font preferences
    this.strColour;
    this.strFontFamily;
    this.intFontSize;
    this.strFontStyle;
    this.strFontUnits;
    this.textBoxController;
    this.getFontString = this.getFontString.bind(this);
    
    //alignment
    this.strAlignment = TextBoxView.ALIGN_CENTER;
    this.strVerticalAlign = TextBoxView.VERTICAL_ALIGN_MIDDLE;

    //stroke preferences    
    this.blStroke = false; //true for stroke
    this.blFillText = true; // IMPORTANT! Setting blFillText to false works only in case blStroke is true
    this.intStrokeWidth = 2; //default stroke 2px
    this.strStrokeColour = "#000000"; //default stroke colour is black
    
    this.setFont = this.setFont.bind(this);
    this.setFontSize = this.setFontSize.bind(this);
    this.setBorder = this.setBorder.bind(this);
    this.init = this.init.bind(this);
    this.draw = this.draw.bind(this);
    this.newElement = this.newElement.bind(this);
    this.newElement(text, arrFontDetails, x, y, w, h);
    this.useBorder = false;
    
    this.strType = "txt";
    
    //shadow preferences
    this.blShadowEnabled = false;
    this.strShadowColour = "#000000"; //default shadow color is black
    this.intShadowOffsetX = 2;
    this.intShadowOffsetY = 2;
    this.intShadowBlur = 0;
    
    this.setAlignment(TextBoxView.ALIGN_CENTER);
    this.setVerticalAlign(TextBoxView.VERTICAL_ALIGN_MIDDLE);
}

Class.extend(Class, RulesView);


/**
 * Overriding ElementView .init()
 * 
 * Removing parameter img as it is no longer needed.
 * 
 * @param contextIn - The context which
 * 
 * 
 */
TextBoxView.prototype.init =  function(contextIn, width, height) 
{   
    this.context = contextIn;
    //textBoxController.setContext(this.context);
    
    this.intWidth = width;
    this.intHeight = height;
    
    objIFrame = document.createElement("iframe");
    objIFrame.setAttribute("src", this.strRulesURL); //strRulesURL should hold the url of the iframe content as a string "http://google.com/"
    objIFrame.style.width = this.intWidth+"px";
    objIFrame.style.height = this.intHeight+"px";
    document.body.appendChild(objIFrame); 
};


/**
 * asdf fUNC
 *  
 */
Rules.prototype.asdffunc = function(objJSONData)
{
    //asdf
}
