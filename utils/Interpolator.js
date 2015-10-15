/**
 * @author Petr Urban
 * 
 * Interpolation functions (easing)
 * - all these functions have the same parameters, therefore one can be changed for another 
 */

/**
 * Linear interpolation
 *  
 * @param {number} intDuration - total duration of animation
 * @param {number} intCurrentTime - current time (0 - intDuration)
 * @param {number} intStartValue - starting value
 * @param {number} intValueChange - change in value
 */
Interpolator = {};
Interpolator.linear = function(intCurrentTime, intDuration, intStartValue, intValueChange)
{
	if (intCurrentTime > intDuration)
	{
		intCurrentTime = intDuration; 
	}
	return intStartValue + (intValueChange * (intCurrentTime / intDuration));
}

/**
 * QuadraticIn interpolation - starts slow, ends fast
 *  
 * @param {number} intDuration - total duration of animation
 * @param {number} intCurrentTime - current time (0 - intDuration)
 * @param {number} intStartValue - starting value
 * @param {number} intValueChange - change in value
 */
Interpolator.quadraticIn = function (intDuration, intCurrentTime, intStartValue, intValueChange) {
	if (intCurrentTime > intDuration)
	{
		intCurrentTime = intDuration; 
	}
	intCurrentTime = intCurrentTime / intDuration;
	return intStartValue + (intValueChange * intCurrentTime * intCurrentTime);
};

/**
 * QuadraticOut interpolation - starts fast, ends slow
 *  
 * @param {number} intDuration - total duration of animation
 * @param {number} intCurrentTime - current time (0 - intDuration)
 * @param {number} intStartValue - starting value
 * @param {number} intValueChange - change in value
 */
Interpolator.quadraticOut = function (intDuration, intCurrentTime, intStartValue, intValueChange) {
	if (intCurrentTime > intDuration)
	{
		intCurrentTime = intDuration; 
	}
	intCurrentTime = intCurrentTime / intDuration;
	return intStartValue + (-intValueChange * intCurrentTime * (intCurrentTime-2));
};

/**
 * QuadraticInOut interpolation - slow - fast - slow
 *  
 * @param {number} intDuration - total duration of animation
 * @param {number} intCurrentTime - current time (0 - intDuration)
 * @param {number} intStartValue - starting value
 * @param {number} intValueChange - change in value
 */
Interpolator.quadraticInOut = function (intDuration, intCurrentTime, intStartValue, intValueChange) {
	if (intCurrentTime > intDuration)
	{
		intCurrentTime = intDuration; 
	}
	intCurrentTime = intCurrentTime / (intDuration / 2);
	
	if (intCurrentTime < 1) {
		return intStartValue + (intValueChange / 2 * intCurrentTime * intCurrentTime);
	}
	intCurrentTime--;
	return intStartValue + (-intValueChange / 2 * ( intCurrentTime * (intCurrentTime - 2) - 1));
};

/**
 * constant interpolation returns original position all the time until current time is eqeal or greater that given number
 * can be used as delay or for animating
 *  
 * @param {number} intDuration - total duration of animation
 * @param {number} intCurrentTime - current time (0 - intDuration)
 * @param {number} intStartValue - starting value
 * @param {number} intValueChange - change in value
 */
Interpolator.constant = function(intDuration, intCurrentTime, intStartValue, intValueChange)
{
	if (intCurrentTime >= intDuration)
	{
		return intStartValue;
	}
	else
	{
		return intStartValue + intValueChange;
	}
}
