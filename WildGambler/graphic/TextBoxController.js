/**
 *
 * @author Petr Urban
 * @date 13/03/2013
 *
 * This class will manipulate and store the state of Text Box objects.
 *
 */
TextBoxController = function(viewObject)
{
    this.newElement(viewObject);
}

Class.extend(ElementController, TextBoxController);

/**
 * onTouchMove
 *
 * @param {number} intX X Offset done with the swipe
 * @param {number} intY Y Offset done with the swipe
 */
TextBoxController.prototype.onTouchMove = function(objEvent,intX, intY, intSwipeY)
{
    if (this.viewObject.objParent && this.viewObject.objParent.blVisible)
    {
        this.viewObject.intSwipeY = intSwipeY;
        this.viewObject.update();
    }
}
