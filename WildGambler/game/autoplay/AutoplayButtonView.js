/**
 * @param { String } strName
 */
function AutoplayButtonView( strName, intValue, objTextBoxView )
{
    this.intValue = intValue;

    this.strIdButton = strName;
    
    this.objTextBoxView = objTextBoxView;
    this.intTextOffsetY = 10;
	
	this.newElement();
}

Class.extend(TextBoxButtonView, AutoplayButtonView);
