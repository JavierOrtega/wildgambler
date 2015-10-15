

/**
 *  FontLoader
 *  
 */

function FontLoader(strSrc) {
    this.strSrc = strSrc;
    this.currFontString = "";
    this.arrfontStrings = new Array();
    this.strFontDir = "res/"
    this.fontHeader = "@font-face {";
    this.fontFooter = "}";
    this.fontFamilyHeader = "font-family: '" // myFirstFont;
    this.fontFamilyFooter = "';"
    this.fontSrcHeader = "src: url('"; // sansation_light.woff
    this.fontSrcFooter = "');";
    this.fontFooter = "}";
    this.fontContinuation = "url('";
    this.formatInfoHeader = "') format('";
    this.fontSrcSeperator = "'),"
    this.loader;
    this.arrFileTypes = [".eot#iefix",".woff",".ttf",".svg"];
    this.arrFormatTypes = ["embedded-opentype","woff","truetype","svg"];
     
    FontLoader.fontMappingData;

    
    this.appendFontToStyleString = this.appendFontToStyleString.bind( this );
    this.processFontMappingObject = this.processFontMappingObject.bind( this );
    
//@font-face {
//    font-family: DigitaldreamFatRegular;
//    src: url('fonts/DIGITALDREAMFAT-webfont.eot');
//    src: url('fonts/DIGITALDREAMFAT-webfont.eot?#iefix') format('embedded-opentype'),
//         url('fonts/DIGITALDREAMFAT-webfont.woff') format('woff'),
//         url('fonts/DIGITALDREAMFAT-webfont.ttf') format('truetype'),
//         url('fonts/DIGITALDREAMFAT-webfont.svg#DigitaldreamFatRegular') format('svg');
//    font-weight: normal;
//    font-style: normal;
// }

}

Class.extend(LoaderData, FontLoader);


/**
 * 
 */
FontLoader.prototype.load = function ()
{

    this.loader = new LoaderData(this.strSrc);
    this.loader.setCallback(this.processFontMappingObject);
    this.loader.load();
    
}

FontLoader.prototype.processFontMappingObject = function (fontMappingData, src)
{
    FontLoader.fontMappingData = fontMappingData;
    if(fontMappingData.fonts != undefined)
    {
        if (fontMappingData.fonts.length > 0)
        {
            for(var i = 0; i < fontMappingData.fonts.length; i++) {
                strOriginalFont = fontMappingData.fonts[i].originalFont;
                strMappedFont = fontMappingData.fonts[i].mappedFont;
                // console.log("Mapping font ",strOriginalFont,"to",strMappedFont);
                this.appendFontToStyleString(strOriginalFont,strMappedFont);
            }
        }
    }
    
    this.includeStyleSheet();
        
    this.callBack(fontMappingData, this.strSrc );
}

FontLoader.prototype.appendFontToStyleString = function (fontFace,fontLocation)
{
    var fontDetails = "";
    if(this.currFontString == "")
    {
        this.currFontString = this.fontHeader + this.fontFamilyHeader + fontFace + this.fontFamilyFooter;
        this.appendSourcesToStyleString("res/fonts/"+fontLocation);
    }
}

FontLoader.prototype.appendSourcesToStyleString = function (strLocation)
{
    this.currFontString += this.fontSrcHeader + strLocation + ".eot" +  this.fontSrcFooter;
    
    for(var i = 0; i < this.arrFileTypes.length; i++) {
        if(i==0)
        {
            this.currFontString += this.fontSrcHeader
        }
        else
        {
            this.currFontString += this.fontContinuation;
        }
        this.currFontString += strLocation + this.arrFileTypes[i] + this.formatInfoHeader + this.arrFormatTypes[i]
        if(i == (this.arrFileTypes.length - 1))
        {
            this.currFontString += this.fontSrcFooter + this.fontFooter
        }
        else
        {
            this.currFontString += this.fontSrcSeperator;
        }
    }
    
    this.arrfontStrings.push(this.currFontString);
    this.currFontString == "";
}

FontLoader.prototype.includeStyleSheet = function ()
{
    var styleElement = document.createElement('style');
    styleElement.type = 'text/css';

    for(var i = 0; i < this.arrfontStrings.length; i++) {
        if (styleElement.styleSheet){
          styleElement.styleSheet.cssText += this.arrfontStrings[i];
        } else {
          styleElement.appendChild(document.createTextNode(this.arrfontStrings[i]));
        }
    }
    
    document.getElementsByTagName('head')[0].appendChild(styleElement);
}
