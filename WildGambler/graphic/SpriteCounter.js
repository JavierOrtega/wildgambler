function SpriteCounter(arrImages)
{
    this.arrImages = arrImages;
	this.intX=0;
	this.intY=0;
	this.blVisible = false;
	this.blContinuous = true;
	this.frames = 0;
	this.intFrame = 0;
	
	this.setXY = this.setXY.bind(this);
	this.setTarget = this.setTarget.bind(this);
	this.run = this.run.bind(this);
}
Class.extend(Class, SpriteCounter);



SpriteCounter.prototype.run = function()
{
	// If we are not looping, and are showing the target number, do nothing.
	if(this.blContinuous == false && this.intFrame == this.intTarget)
	{
		return;
	}
	
	// Swap image every 10 frames
	if(++this.frames == 4)
	{
		this.arrImages[this.intFrame].blVisible = false;
		this.frames = 0;
		this.intFrame = this.intFrame == this.arrImages.length-1 ? 0 : this.intFrame + 1;	
		this.arrImages[this.intFrame].blVisible = true;
	}
	this.arrImages[this.intFrame].draw(this.intX,this.intY);

}

/**
 * Counter should stop when it gets to the target number 
 * @param {Object} intTarget
 */
SpriteCounter.prototype.setTarget = function( intTarget )
{
	this.intTarget = intTarget;
	this.blContinuous = false;
}

SpriteCounter.prototype.setXY = function( intX, intY )
{
	console.log("set to " + intX)
	this.intX = intX;
	this.intY = intY;
	for(var i in this.arrImages)
	{
		this.arrImages[i].intX = intX;
		this.arrImages[i].intY = intY;
	}
}
