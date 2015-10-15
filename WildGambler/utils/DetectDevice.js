/**
 * This class seeks to detect Device details:
 * iPhone, iPod, iPad, Android, Desire, Desire HD, Desktop.
 * Results are used to set this.device (String).
 * 
 * TODO ideally we need a full list of devices' userAgent strings;
 * then we can re-work this code in a much better way.
 * 
 * 
 *   
 * 
 * 
 * 
 * @author maserlin 
 */
function DetectDevice()
{
	this.device = "";
	
	this.detectDevices = this.detectDevices.bind(this);
	this.detectNextDevice = this.detectNextDevice.bind(this);
	this.detectDesire = this.detectDesire.bind(this);
	this.detectDesktop = this.detectDesktop.bind(this);
	
	this.detectDevices();
}
Class.extend(Class, DetectDevice);



/**
 * To detect further devices we have to add them into the DEVICES types list.
 * @see Constants.js
 * 
 * TODO
 * This is not ideal and could do with reworking some tim, when we have a full
 * set of userAgent examples to work with. Need to get this framework fired up into some
 * devices first though!
 */
DetectDevice.prototype.detectDevices = function()
{
	this.device = "";
	
	//
	for( var i=0; i<DEVICES.types.length; ++i )
	{
		if( this.detectNextDevice( DEVICES.types[ i ] ) )
		{
			break;
		}
	}

    
	//
	return this.device;
}

/**
 * This method will set device="Desktop"" on the first pass by checking for "ontouchstart" in window.
 * This idea may not work well on a touch-enabled PC: We might have to get one to test on.
 * This method will discriminate between Desire & Desire HD, also iPod, iPhone, iPad 
 * and "Android" which I suspect is generic to any droid phone (?)
 * 
 * TODO 
 * This is a rather device-dependent way to do things and could use a re-work
 * at some point: Better to extract details from userAgent somehow but need a 
 * full set of examples to work with. userAgent is tied up with browser type as well 
 * so I will re-code when I know more about our targets (maserlin). 
 */
DetectDevice.prototype.detectNextDevice = function( name )
{
	// case-insensitive name to match
	var matchStr = new RegExp( name, "i" );

  // Desire/DesireHD
  if( name == DEVICES.DESIRE )
  {
  	return this.detectDesire( name );
  } 
  // iPhone, iPad, iPod, Android
  else if( navigator.userAgent.match( matchStr ) )
  { 
  	this.device = name;
    return true;
  }
  // This can go last as we are usually going to be mobile.
  // Anyway, if we *are on desktop it will succeed immediately 
  // and break the loop, we won't have to run through the others.
  else 
  {
  	return this.detectDesktop();
  }

  //
  return false;
}

/**
 * Detects desktop environment by rukling out touch-enabled.
 * TODO Does this still work for touch-enabled (win8) PC's?
 */
DetectDevice.prototype.detectDesktop = function()
{
	var blnTouch = !!( "ontouchstart" in window );

  // Touch not enabled.
  // TODO what about Win8 etc?
	if( !blnTouch )
	{
		this.device = DEVICES.DESKTOP;
		return true;
	}

	return false;
}

/**
 * This method discriminates between Desire and Desire HD phones
 * which apparently report themsleves as GT-I9100 and GT-I9300 (need to check this maybe).
 */
DetectDevice.prototype.detectDesire = function ( name )
{
	var matchStr = new RegExp( name, "i" );
	var matchGTI9100 = new RegExp( "GT-I9100", "i" );
	var matchGTI9300 = new RegExp( "GT-I9300", "i" );
	var hdStr = new RegExp( "HD", "i" );
	
	// userAgent contains "Desire"
	if( navigator.userAgent.match( matchStr ) )
	{
		// Match "GT-I9100"
		if( navigator.userAgent.match( matchGTI9100 ) )
		{
			// Check for NO ocurrence of "HD" in userAgent string
			if( navigator.userAgent.match( hdStr ) == false )
			{
				this.device = DEVICES.DESIRE_S;
				return true;
			}
		}
		// Match "GT-I9300"
		else if( navigator.userAgent.match( matchGTI9300 ) )
		{
			// Check for the ocurrence of "HD" in userAgent string
			if( navigator.userAgent.match( hdStr ) )
			{
				this.device = DEVICES.DESIRE_HD;
				return true;
			}
		}
	}

	// Not a Desire
  return false;
}

