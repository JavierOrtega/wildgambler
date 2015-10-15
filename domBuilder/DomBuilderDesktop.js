
/**
 * 
 * @author Javier Ortega 
 *
 * This class will add the specific tags for Android Native Browser
 * 
 * @class
 */
function DomBuilderDesktop()
{
    
    
}

/**
 * This function will add all the necesary tags to the Dom Tree of the html file 
 * @param {Object} objHead Dom Head
 * @param {Object} objBody Dom Body
 */
DomBuilderDesktop.build = function (objHead, objBody)
{
    /////////////////////////////////////////////////Head/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var objMetaBrowser = document.createElement ('meta');
    objMetaBrowser.content = "X-UA-Compatible";
    objMetaBrowser.httpEquiv = "IE=edge,chrome=1";
    objHead.appendChild(objMetaBrowser); 
    
    var objMetaContent = document.createElement ('meta');
    objMetaContent.content = "Content-Type";
    objMetaContent.httpEquiv = "text/html;charset=utf-8";
    objHead.appendChild(objMetaContent); 
    
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
        objBody.appendChild(objSideBarArea);
            var objSideBarCV = document.createElement ('canvas');
            objSideBarCV.id = "sideBar";
            objSideBarArea.appendChild(objSideBarCV);
            
        var objBottomArea = document.createElement ('div');
        objBottomArea.id = "bottomArea";
        objBody.appendChild(objBottomArea);
            var objBottom = document.createElement ('canvas');
            objBottom.id = "bottom";
            objBottomArea.appendChild(objBottom);
        var objDpi = document.createElement ('div');
        objDpi.id = "dpi";
        objBody.appendChild(objDpi);
        
        var objIframe = document.createElement ('iframe');
        objIframe.id = "container";
        objIframe.src = "";
        objIframe.scrolling = "no";
        objIframe.frameBorder = "0";
        objBody.appendChild(objIframe);
        
    var objIframe = document.createElement ('audio');
    objIframe.id = "elmtAudio";
    objIframe.src = "about:blank";
    objIframe.style = "display:none;";
    objBody.appendChild(objIframe);    

    /////////////////////////////////////////////////Body/////////////////////////////////////////////////////////////////////////////////////////////////////////////////   
    
}
