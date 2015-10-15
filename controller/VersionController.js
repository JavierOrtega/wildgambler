/**
 * @author Mikey Sorhaindo
 * 
 * This class contains all the necessary functionality to process VERSION.txt Files.
 */


/**
 * Constructor
 * 
 */

function VersionController(objPortraitScreen)
{   
    this.parseRawVersionData = this.parseRawVersionData.bind(this);
    
    /**
     * arrVersDetails a string indexed array of data elements
     * from the version file.
     */
    
    this.arrVersionDetails = [];
    
    
    /**
     * Reference to the portrait screen. 
     */
    this.objPortraitController = objPortraitScreen;
    
    this.objNodeVersion = null;
    
    /**
     * Holds the amount of times the portrait has been clicked registering
     * these as a request for version details
     */
    this.requestCount = 0;
}

Class.extend(Class, VersionController); 

VersionController.prototype.parseRawVersionData = function ( strData )
{
    
    var arrTempData = strData.split("\n");
    
    for(var i=0; i<arrTempData.length; i++) // For every line in the version file
    {
        var lineData = arrTempData[i].split(": ")
        if(lineData.length>1) // If it found the split token ": "
        {
            this.arrVersionDetails[lineData[0]] = lineData[1];  // Add to Details array in a dictionary style.  
        }
    }
    this.populateDomNode(this.arrVersionDetails);
}

VersionController.prototype.getVersionDetails = function ()
{
    return this.arrVersionDetails
}

VersionController.prototype.getDomNode = function()
{
    if (!this.objNodeVersion)
    {
        this.objNodeVersion = document.createElement("div");
        this.objNodeVersion.className = "versioning";
        this.objNodeVersion.style.display = "none";
    }
    return this.objNodeVersion;
}

VersionController.prototype.populateDomNode = function(objResults)
{
    var objNode = this.getDomNode();
    
    //empty
    for (var i = 0; i < objNode.childNodes.length; i++)
    {
        objNode.removeChild(objNode.childNodes[i]);
    }
    
    for (var strKey in objResults)
    {
        var strValue = objResults[strKey];
        
        var nodeDetail = document.createElement("span");
        nodeDetail.innerHTML = strKey + ": " + strValue;
        
        objNode.appendChild(nodeDetail);
    }
}

VersionController.prototype.setVisible = function(blVisible)
{
    this.objNodeVersion.style.display = blVisible ? "block" : "none";
}

VersionController.prototype.getRequestCount = function()
{
    return this.requestCount;    
}

VersionController.prototype.resetRequestCount = function()
{
    this.requestCount = 0;
}

VersionController.prototype.incRequestCount = function()
{
    this.requestCount++;
}
