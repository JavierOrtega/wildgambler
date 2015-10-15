/** 
 * Define some commonly-used strings 
 */
function STRINGS()
{
	
}
STRINGS.VERSION = "Version";
STRINGS.ANDROID = "Android";
STRINGS.CHROME = "Chrome";
STRINGS.FIREFOX = "Firefox";
STRINGS.NETSCAPE = "Netscape";
STRINGS.MOZILLA = "Mozilla";
STRINGS.INIT = "Init";
STRINGS.BET = "Bet";
STRINGS.WINLINES = "Winlines";
STRINGS.REELS = "Reels";
STRINGS.SYMBOLS = "Symbols";
STRINGS.TITLE_CONFIG = "TitleConfig";
STRINGS.EEG_CONFIG_RESPONSE = "EEGConfigResponse";
STRINGS.TEXT_XML = "text/xml";
STRINGS.MS_DOM = "Microsoft.XMLDOM";
STRINGS.CUSTOMER_DETAILS = "CustomerDetailsResponse";
STRINGS.CUSTOMER_BALANCE = "CustomerBalanceResponse";
STRINGS.SPIN = "Spin";
STRINGS.BALANCES = "Balances";
STRINGS.BALANCE = "Balance";
STRINGS.TOTAL = "Total";
STRINGS.BTN_SPIN = "spin";
STRINGS.BTN_LOCKSPIN = "lockspin";
STRINGS.BTN_LINE_BET_PLUS = "lineBetPlus";
STRINGS.BTN_LINE_BET_MINUS = "lineBetMinus";
STRINGS.SETTINGS = "settings";
STRINGS.PAYTABLE = "paytable";
STRINGS.SOUND_OFF = "sound_off";
STRINGS.SOUND_ON = "sound_on";
STRINGS.HELP = "help";
STRINGS.AUTOPLAY = "autoplay";
STRINGS.FREESPINS = "Freespins";

 
/**
 * Define device types that we can work with. 
 * Also define some string constants.
 * One of these will be reported to other parts of our code as the 
 * DetectDevice object's "device" String variable.
 */
function DEVICES()
{
}
DEVICES.IPHONE = "iPhone";
DEVICES.IPOD = "iPod";
DEVICES.IPAD = "iPad";
/** the first 2 letters of iPhone, iPad, iPod, 
 * can be used to determine OS */
DEVICES.IOS_DEVICE = "iP";
/** Basic desire device: further split into S or HD by looking at other params */
DEVICES.DESIRE = "Desire";
DEVICES.DESIRE_S = "DesireS";
DEVICES.DESIRE_HD = "DesireHD";
DEVICES.DESKTOP = "Desktop";
DEVICES.ANDROID = STRINGS.ANDROID;
/**
 * Types to test for in DetectDevice.js. 
 * This list does not include DesireS/DesireHD as these are subtypes,
 * or Desktop as this is not a userAgent string component.
 * @see DetectDevice.js
 */ 
DEVICES.types = [DEVICES.IPHONE, DEVICES.IPOD, DEVICES.IPAD, DEVICES.ANDROID, DEVICES.DESIRE];

/**
 * Define operating system environment.
 */
function OS()
{
	
}
OS.IOS ="iOS";
OS.ANDROID = STRINGS.ANDROID;
OS.WINDOWS = "Windows";
OS.MAC = "MacOs";
OS.UNIX = "UNIX";
OS.LINUX = "Linux";
OS.WIN_ID = "Win";
OS.MAC_ID = "Mac";
OS.UNIX_ID = "X11";

/**
 * Define browsers we can support.  
 * nb Make sure that Chrome comes before Safari in the types list
 * (which is used to search userAgent string) because Chrome reports as 
 * AppleWebKit, Chrome, Safari
 * so if we search Safari first it will test positive on Chrome!
 */
function BROWSERS()
{
}
BROWSERS.IE = "Explorer";
BROWSERS.IE_ID = "MSIE";
BROWSERS.CHROME = STRINGS.CHROME;
BROWSERS.ANDROID = "Android";
BROWSERS.CHROME_MOBILE = "ChromeMobile";
BROWSERS.FIREFOX = STRINGS.FIREFOX;
BROWSERS.SAFARI = "Safari";
BROWSERS.OPERA = "Opera";
BROWSERS.OPERA_MOBILE = "OperaMobile";
BROWSERS.OMNIWEB = "OmniWeb";
BROWSERS.NETSCAPE = STRINGS.NETSCAPE;
BROWSERS.MOZILLA = STRINGS.MOZILLA;
BROWSERS.ANDROID = STRINGS.ANDROID;



/**
 * Define Audio MIME types for sound
 * @see http://voice.firefallpro.com/2012/03/html5-audio-video-mime-types.html
 * audio/aac 	.aac
 * audio/mp4 	.mp4 .m4a
 * audio/mpeg .mp1 .mp2 .mp3 .mpg .mpeg
 * audio/ogg 	.oga .ogg
 * audio/wav 	.wav
 * audio/webm .webm
 */
function AUDIO()
{
}
AUDIO.OGG = "audio/ogg";
AUDIO.MP4 = "audio/mp4";
AUDIO.AAC = "audio/x-aac";
AUDIO.MP3 = "audio/mpeg";
AUDIO.WAV = "audio/vnd.wave";
AUDIO.BUTTON = "iosAudioButton";
AUDIO.ELEMENT = "elmtAudio";	// Name of audio element on our html page

/**
 * 
 */
function VENDORS()
{
	
}
VENDORS.APPLE = "Apple";
VENDORS.ICAB = "iCab";
VENDORS.KDE = "KDE";
VENDORS.CAMINO = "Camino";

/**
 * 
 */
function USER_AGENTS()
{
	
}
USER_AGENTS.ANDROID = STRINGS.ANDROID;
USER_AGENTS.CHROME = STRINGS.CHROME;
USER_AGENTS.FIREFOX = STRINGS.FIREFOX;
USER_AGENTS.OMNIWEB = BROWSERS.OMNIWEB;
USER_AGENTS.NETSCAPE = STRINGS.NETSCAPE;
USER_AGENTS.MOZILLA = STRINGS.MOZILLA;
USER_AGENTS.GECKO = "Gecko";

/**
 *  TODO/Proposed
 */
function CAPABILITIES()
{
	
}
CAPABILITIES.prototype.TOUCH = "touch";
