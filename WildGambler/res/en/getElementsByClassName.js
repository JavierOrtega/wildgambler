//shim
if (!document.getElementsByClassName)
{
    document.getElementsByClassName = function(cn)
    {
        var allT = document.getElementsByTagName('*'), allCN = [], i = 0, a;
        while ( a = allT[i++])
        {
            a.className == cn ? allCN[allCN.length] = a : null;
        }
        return allCN
    }
}
