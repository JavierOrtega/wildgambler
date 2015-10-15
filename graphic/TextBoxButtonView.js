/**
 * @param { String } strName
 */
function TextBoxButtonView( strName, objTextBoxView )
{
    this.strIdButton = strName;
    
    this.objTextBoxView = objTextBoxView;
    this.intTextOffsetY = 10;
	
	this.newElement();
}

Class.extend(ButtonView, TextBoxButtonView);

/**
 * Draw method
 *  
 * @param {Object} intOffsetX
 * @param {Object} intOffsetY
 */
TextBoxButtonView.prototype.draw = function(intOffsetX, intOffsetY) 
{
    if ( this.blVisible )
    {        
            this.intOffsetX = 0;
            this.intOffsetY = 0;
            
            if (this.blEnableOffsetX)
            {
                this.intOffsetX = intOffsetX;
            }
            if (this.blEnableOffsetY)
            {
                this.intOffsetY = intOffsetY;
            }
            this.imImage.setXY(this.intX + this.intOffsetX, this.intY + this.intOffsetY);           
        
        this.imImage.draw();
    }
    
    //draw text box
    this.objTextBoxView.draw(this.getX() + intOffsetX, this.getY() + intOffsetY);
}

/**
 * Set canvas context
 * @param {DomCanvasContext} objContext 
 */
TextBoxButtonView.prototype.setContext = function(objContext)
{
	this.context = objContext;
	this.objTextBoxView.setContext(objContext);
}

TextBoxButtonView.prototype.setText = function(strText)
{
	this.objTextBoxView.setText(strText);
	this.update();
}

TextBoxButtonView.prototype.setScaling = function(flX, flY)
{
	ButtonView.prototype.setScaling.call(this, flX, flY); //run super
	this.objTextBoxView.setScaling(flX, flY); //set scaling to the textbox as well
}
