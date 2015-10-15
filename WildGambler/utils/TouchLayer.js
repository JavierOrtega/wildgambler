/**
 *  
 * @param {mixed} x (function or number)
 * @param {mixed} y  (function or number)
 * @param {mixed} width (function or number)
 * @param {mixed} height (function or number)
 * @param {Function} onClick function
 */
var TouchLayer = function(x, y, width, height, onClick) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.onClick = onClick;
}

TouchLayer.prototype.getX = function()
{
	if (typeof this.x == "function")
	{
		return this.x();
	}
	return this.x;
}

TouchLayer.prototype.getY = function()
{
	if (typeof this.y == "function")
	{
		return this.y();
	}
	return this.y;
}

TouchLayer.prototype.getWidth = function()
{
	if (typeof this.width == "function")
	{
		return this.width();
	}
	return this.width;
}

TouchLayer.prototype.getHeight = function()
{
	if (typeof this.height == "function")
	{
		return this.height();
	}
	return this.height;
}

TouchLayer.prototype.onTouchStart = function()
{
	return;
}

TouchLayer.prototype.onTouchMove = function()
{
	return;
}

TouchLayer.prototype.onTouchEnd = function()
{
	return;
}

TouchLayer.prototype.onClick = function()
{
	return this.onClick();
}
