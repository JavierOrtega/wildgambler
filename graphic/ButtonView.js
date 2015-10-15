/**
 * @param { String } strName
 */
function ButtonView( strName )
{
    this.strIdButton = strName;
	this.newElement();
	
	this.strState = ''; //we don't know yet'
	this.strType = "btn"; 
}

Class.extend(ElementView,ButtonView);
