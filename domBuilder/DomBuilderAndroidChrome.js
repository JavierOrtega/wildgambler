
/**
 * 
 * @author Javier Ortega 
 *
 * This class will add the specific tags for Android Native Browser
 * 
 * @class
 */
function DomBuilderAndroidChrome()
{
    
    
}

/**
 * This function will add all the necesary tags to the Dom Tree of the html file 
 * @param {Object} objHead Dom Head
 * @param {Object} objBody Dom Body
 */
DomBuilderAndroidChrome.build = function (objHead, objBody)
{
    /////////////////////////////////////////////////Head/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var objMetaViewPort = document.createElement ('meta');
    objMetaViewPort.name = "viewport";
    objMetaViewPort.content = "width=device-width, minimum-scale=1.0, maximum-scale=1.0, initial-scale=1";
    objHead.appendChild(objMetaViewPort); 
    
    var objMetaMobileWeb = document.createElement ('meta');
    objMetaMobileWeb.name = "apple-mobile-web-app-capable";
    objMetaMobileWeb.content = "yes";    
    objHead.appendChild(objMetaMobileWeb);
    
    var objMetaType = document.createElement ('meta');
    objMetaType.httpEquiv = "Content-Type";
    objMetaType.content = "text/html;charset=utf-8";    
    objHead.appendChild(objMetaType); 
    
    var objLink = document.createElement ('link');
    objLink.rel = "stylesheet";
    objLink.href = "css/framework.css";
    objHead.appendChild(objLink);
    
    var objMetaName = document.createElement ('link');
    objMetaName.name = "viewport";
    objMetaName.content = "height=768,width=1024";
    objMetaName.userScalable = "no";
    objHead.appendChild(objMetaName);
     
    /////////////////////////////////////////////////Head///////////////////////////////////////////////////////////////////////////////////////////////////////////////// 
    
    objBody.style = "background-color: #000;"
    
    var objHiddenLink = document.createElement ('a');
    objHiddenLink.href = "_blank";
    objHiddenLink.id = "hidden_link";
    objHiddenLink.style = "display:none;";
    objBody.appendChild(objHiddenLink);
    
    var objPortrait = document.createElement ('div');
    objPortrait.id = "portrait";    
    // Attach
    objBody.appendChild(objPortrait);
    
    var objWrapper = document.createElement ('div');
    objWrapper.id = "sidebar-wrapper";
    objBody.appendChild(objWrapper);
       
        var objSideBarArea = document.createElement ('div');
        objSideBarArea.id = "sideBarArea";
        objWrapper.appendChild(objSideBarArea);
            var objSideBarCV = document.createElement ('canvas');
            objSideBarCV.id = "sideBar";
            objSideBarArea.appendChild(objSideBarCV);
            
        var objBottomArea = document.createElement ('div');
        objBottomArea.id = "bottomArea";
        objWrapper.appendChild(objBottomArea);
            var objBottom = document.createElement ('canvas');
            objBottom.id = "bottom";
            objBottomArea.appendChild(objBottom);
        var objDpi = document.createElement ('div');
        objDpi.id = "dpi";
        objWrapper.appendChild(objDpi);
        
        var objIframe = document.createElement ('iframe');
        objIframe.id = "container";
        objIframe.src = "";
        objIframe.scrolling = "container"; //TODO: objIframe.scrolling = "no";
        objIframe.frameBorder = "0";
        objWrapper.appendChild(objIframe);
        
    var objIframe = document.createElement ('audio');
    objIframe.id = "elmtAudio";
    objIframe.src = "about:blank";
    objIframe.style = "display:none;";
    objBody.appendChild(objIframe);    
    /////////////////////////////////////////////////Body/////////////////////////////////////////////////////////////////////////////////////////////////////////////////   
    
      //To prevent the double tap
    document.ontouchmove = function(e)
    {
        e.preventDefault();
    };
}
