
/**
 * 
 * @author Javier Ortega 
 *
 * This class will add the specific tags for Android Native Browser
 * 
 * @class
 */
function DomBuilderIpad()
{
    
    
}

/**
 * This function will add all the necesary tags to the Dom Tree of the html file 
 * @param {Object} objHead Dom Head
 * @param {Object} objBody Dom Body
 */
DomBuilderIpad.build = function (objHead, objBody)
{
    /////////////////////////////////////////////////Head/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var objMetaViewPort = document.createElement ('meta');
    objMetaViewPort.name = "viewport";
    objMetaViewPort.content = "width=device-width, minimum-scale=1.0, maximum-scale=1.0";
    objHead.appendChild(objMetaViewPort); 
    
    var objLink = document.createElement ('link');
    objLink.rel = "stylesheet";
    objLink.href = "css/framework.css";
    objHead.appendChild(objLink);
    
     
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
        objIframe.setAttribute("scrolling", "no");
        objIframe.setAttribute("frameBorder", "0");
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
