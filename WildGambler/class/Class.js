/**
 * Basic Implementation of inheritance
 * 
 * @author Javier Ortega Santos
 * 
 */
function Class()
{
	
}

// TO DO
// Petr to take a deep look in the Object.create methods to be used instance of this inherit
// Different definitions in different sites, to check exactly how this is working
/**
 * To integrate the inheritance from one class to other
 * @param {Object} objPrototype The prototype to be extended
 * @return {Object} And object with the prototype of the Parent
 */
if (Object.create) {
	//native inheritance using Object.create
	Class.inherit = Object.create;
} else {
	//use this when Object.create is not available
	Class.inherit = function (objPrototype) 
	{
		function F() {};
		F.prototype = objPrototype;
		return new F;
	}
}

/**
 * To simplify the process to extend a class from other
 * @param {Object} objParent The Parent class to be extended
 * @param {Object} objChild The Child class what will extend the Parent functionality
 */
Class.extend = function (objParent,objChild)
{
	objChild.prototype = Class.inherit(objParent.prototype)
	objChild.prototype.constructor = objChild
	objChild.prototype.parent = objParent.prototype;
}


//Standard Code to add support for bind, in the case that bind doesn't exist
if (!Function.prototype.bind) 
{
  Function.prototype.bind = function (oThis) 
  {
    if (typeof this !== "function") 
    {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }
 
    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () 
        {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };
 
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
 
    return fBound;
  };
}


