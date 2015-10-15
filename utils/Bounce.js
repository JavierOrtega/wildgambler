/**
 * @author Javier.Ortega, Petr Urban
 * 
 * This class provides a way to implement a bouncing interpolation
 */


/**
 * Constructor
 */
function Bounce()
{
  // --
  //Binding the necessary methods

}

/**
 * Derive Bounce from our base type to provide inheritance
 */ 
Class.extend(Class, Bounce);

/**
 * The <code>easeOut()</code> method starts the bounce motion fast 
 * and then decelerates motion as it executes. 
 * @param { int } intT  Specifies the current time, between 0 and duration inclusive.
 * @param { int } intB  Specifies the initial value of the animation property.
 * @param { int } intC  Specifies the total change in the animation property.
 * @param { int } intD  Specifies the duration of the motion
 */
Bounce.easeOut = function  ( intT, intB, intC, intD )
{
    if ((intT /= intD) < (1 / 2.75))
    {
        return intC * (7.5625 * intT * intT) + intB;
    }   
    else if (intT < (2 / 2.75))
    {
        return intC * (7.5625 * (intT -= (1.5 / 2.75)) * intT + 0.75) + intB;
    }   
    else if (intT < (2.5 / 2.75))
    {
        return intC * (7.5625 * (intT -= (2.25 / 2.75)) * intT + 0.9375) + intB;
    }
    else
    {
        return intC * (7.5625 * (intT -= (2.625 / 2.75)) * intT + 0.984375) + intB;
    }
}

/**
 * The <code>easeIn()</code> method starts the bounce motion slowly 
 * and then accelerates motion as it executes. 
 * @param { int } intT  Specifies the current time, between 0 and duration inclusive.
 * @param { int } intB  Specifies the initial value of the animation property.
 * @param { int } intC  Specifies the total change in the animation property.
 * @param { int } intD  Specifies the duration of the motion
 */
Bounce.easeIn = function  ( intT, intB,intC, intD )
{
    return intC - this.easeOut(intD - intT, 0, intC, intD) + intB;
}

/**
 * The <code>easeInOut()</code> method combines the motion
 * of the <code>easeIn()</code> and <code>easeOut()</code> methods
 * to start the bounce motion slowly, accelerate motion, then decelerate
 * @param { int } intT  Specifies the current time, between 0 and duration inclusive.
 * @param { int } intB  Specifies the initial value of the animation property.
 * @param { int } intC  Specifies the total change in the animation property.
 * @param { int } intD  Specifies the duration of the motion
 */
Bounce.easeInOut = function  ( intT, intB,intC, intD )
{
    if (intT < intD/2)
    {
        return this.easeIn(intT * 2, 0, intC, intD) * 0.5 + intB;
    }
    else
    {
        return this.easeOut(intT * 2 - intD, 0, intC, intD) * 0.5 + intC * 0.5 + intB;
    }
}
    /**
     *  The <code>easeInOut()</code> method combines the motion
	 *  of the <code>easeIn()</code> and <code>easeOut()</code> methods
	 *  to start the motion by backtracking, then reversing direction and 
	 *  moving toward the target, overshooting the target slightly, reversing 
     * direction again, and then moving back toward the target.
	 *
     *  @param t Specifies the current time, between 0 and duration inclusive.
	 *
     *  @param b Specifies the initial value of the animation property.
	 *
     *  @param c Specifies the total change in the animation property.
	 *
     *  @param d Specifies the duration of the motion.
     *
	 *  @param s Specifies the amount of overshoot, where the higher the value, 
	 *  the greater the overshoot.
     *
     *  @return The value of the interpolated property at the specified time.
     * @playerversion Flash 9.0.28.0
     * @langversion 3.0
     * @keyword Ease, Copy Motion as ActionScript    
     * @see fl.motion.FunctionEase      
     */  
	Bounce.easeInOut2 = function (t, b, c, d, s )
	{
		if (s == null)
			s = 1.70158; 
		
		if ((t /= d / 2) < 1)
		{
			return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
		}
		
		return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
	}
/**
 * The <code>easeInOut()</code> method combines the motion
 * of the <code>easeIn()</code> and <code>easeOut()</code> methods
 * to start the bounce motion slowly, accelerate motion, then decelerate
 * @param { int } intT  Specifies the current time, between 0 and duration inclusive.
 * @param { int } intB  Specifies the initial value of the animation property.
 * @param { int } intC  Specifies the total change in the animation property.
 * @param { int } intD  Specifies the duration of the motion
 */
Bounce.easeOut2 = function  ( intT, intB,intC, intD )
{
    return - intC * ( intT /= intD ) * ( intT - 2) + intB ;
}
