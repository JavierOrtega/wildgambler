/**
 * @author Javier.Ortega 
 * 
 * This class represents the functionality of a ParticleSystem
 */

/**
 * Constructor  
 */


function ParticleSystem(objContext, objCenter, intCount, intWidth, intHeight, imImage)
{
    // --
    //Binding the necessary methods
    var i = 0;
    this.objContext = objContext;

    this.intCount = intCount || 0;

    this.arrParticles = [];
    
    this.intWidth = intWidth;
    this.intHeight = intHeight;
    this.imImage = imImage;

    this.objCenter =
    {
        x : objCenter.x || 0,
        y : objCenter.y || 0
    };

    var arrDirections = [7,7,-7,-7];

    // Initialization
    for (; i < intCount; ++i)
    {
        var tempVx = arrDirections[Math.floor (Math.random() * 3)]
        var tempVy = arrDirections[Math.floor (Math.random() * 3)]
        
        var x = this.objCenter.x, y = this.objCenter.y, vx = tempVx, vy = tempVy;

        this.arrParticles.push(new Particle(x, y, vx, vy));
    }
}


/**
 * Derive ParticleSystem from our base type to provide inheritance
 */ 
Class.extend(Class, ParticleSystem);

/**
 * This will update the particles
 */
ParticleSystem.prototype.update = function ( intVX, intVY )
{
    for ( i = 0 ; i < this.intCount ; ++i ) 
    {
     
        // We don't want to process particles that
        // we can't see anymore
        if (this.arrParticles[i].intX >= this.objCenter.x - this.intWidth &&
            this.arrParticles[i].intX <= this.objCenter.x + this.intWidth &&
            this.arrParticles[i].intY >= this.objCenter.y - this.intHeight &&
            this.arrParticles[i].intY <= this.objCenter.y + this.intHeight)
        //if (true) 
        {
         
            this.arrParticles[i].update();
            var objImage = this.imImage.arrSprites[this.arrParticles[i].intIndex].imImage;
         
            if ((objImage.strType) && objImage.strType == "ImageSprite")
            {
                objImage.setXY(this.arrParticles[i].intX , this.arrParticles[i].intY);
                objImage.draw();
            }
            else
            {
                this.objContext.drawImage(objImage.objImage, this.arrParticles[i].intX, this.arrParticles[i].intY );
            }
        }
    }
}
