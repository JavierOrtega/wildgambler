/**
 * @author Javier.Ortega 
 * 
 * This class represents the functionality of a Particle
 */

/**
 * Constructor
 * @param {String} strSrc The string for the source 
 */
function Particle(intX, intY, intVX, intVY)
{
  // --
  //Binding the necessary methods
  
  this.intX = intX || 0;
  this.intY = intY || 0;
  this.intVX = intVX || 0;
  this.intVY = intVY || 0;
  this.intIndex = Math.floor (Math.random() * 8) + 1;
}

/**
 * Derive Particle from our base type to provide inheritance
 */ 
Class.extend(Class, Particle);

/**
 * This will update the particle 
 */
Particle.prototype.update = function ( intVX, intVY )
{
    var intVX = intVX || 0;
    var intVY = intVY || 0;
 
    this.intX += this.intVX + intVX;
    this.intY += this.intVY + intVY;
}
