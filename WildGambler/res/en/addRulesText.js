var arrElems;

var fillPlaceholders = function(){
    
    arrElems = document.getElementsByClassName("replace")

    for (var i = 0; i<arrElems.length; i++)
    {
        var key = arrElems[i].getAttribute("key");
        var val = getUrlVars()[key];
        if (val != undefined)
        {
	        arrElems[i].innerHTML = decodeURIComponent(val);
        }
    }
};

var getUrlVarsResults = null;
function getUrlVars()
{
    if (getUrlVarsResults == null)
    {
        getUrlVarsResults = [];
        var vars =
        {
        };
        var url;
        url = document.location.href

        var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value)
        {
            vars[key] = value;
        });
        getUrlVarsResults = vars;
    }
    return getUrlVarsResults;
}
