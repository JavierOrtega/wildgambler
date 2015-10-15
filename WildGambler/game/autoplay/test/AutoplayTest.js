/**
 * @author Petr Urban
 */

var autoplayOptions = [5, 10, 15, 20];
describe ("AutoplayTest", function()
{
    beforeEach( function ()
    {
		//TO ADD stuff that the unit tests will need
    });

    it("SetupAutoplayAvailable",function()
    {
		//prepare
		var objSetupEnabled = new AutoplaySetup(true, autoplayOptions);
		var objSetupDisabled = new AutoplaySetup(false, autoplayOptions);

		//get results
		var resultEnabled = objSetupEnabled.isAvailable();
		var resultDisabled = objSetupDisabled.isAvailable();
		
		//test
		expect(resultEnabled).toBe(true);
		expect(resultDisabled).toBe(false);
    });

    it("AutoplayAvailable", function()
    {
		//prepare
		var objSetupEnabled = new AutoplaySetup(true, autoplayOptions);
		var objSetupDisabled = new AutoplaySetup(false, autoplayOptions);

		objAutoplayEnabled = new Autoplay(objSetupEnabled);
		objAutoplayDisabled = new Autoplay(objSetupDisabled);

		//get results
		var resultEnabled = objAutoplayEnabled.isAvailable();
		var resultDisabled = objAutoplayDisabled.isAvailable();

		//test
		expect(resultEnabled).toBe(true);
		expect(resultDisabled).toBe(false);
    });

    it("AutoplayGetSetAutoplaysRemaining", function()
    {
		//prepare
		objSetupEnabled = new AutoplaySetup(true, autoplayOptions);
		objAutoplayEnabled = new Autoplay(objSetupEnabled);

		//set value		
		var intNumber = 10;
		objAutoplayEnabled.setAutoplaysRemaining(intNumber);

		//get value
		var result = objAutoplayEnabled.getAutoplaysRemaining();

		//test
		expect(result).toBe(intNumber); //expected to be OK
    });

    it("AutoplaySetAutoplaysRemainingException", function()
    {
		//prepare
		objSetupEnabled = new AutoplaySetup(true, autoplayOptions);
		objSetupDisabled = new AutoplaySetup(false, autoplayOptions);

		objAutoplayEnabled = new Autoplay(objSetupEnabled);
		objAutoplayDisabled = new Autoplay(objSetupDisabled);

		//test valid values
		expect(function() { objAutoplayEnabled.setAutoplaysRemaining(10); }).not.toThrow();
		expect(function() { objAutoplayEnabled.setAutoplaysRemaining(1); }).not.toThrow();
		expect(function() { objAutoplayEnabled.setAutoplaysRemaining(0); }).not.toThrow();

		//test exception - because autoplay functionality is not available
		expect(function() { objAutoplayDisabled.setAutoplaysRemaining(10); }).toThrow(); //expected to throw AutoplayException
		expect(function() { objAutoplayDisabled.setAutoplaysRemaining(0); }).not.toThrow(); //zero is the only value that is possible for disabled autoplay

		//test exceptions - for incorrect values
		expect(function() { objAutoplayEnabled.setAutoplaysRemaining(null); }).toThrow();
		expect(function() { objAutoplayEnabled.setAutoplaysRemaining(undefined); }).toThrow();
		expect(function() { objAutoplayEnabled.setAutoplaysRemaining(""); }).toThrow();
		expect(function() { objAutoplayEnabled.setAutoplaysRemaining(Infinity); }).toThrow();
		expect(function() { objAutoplayEnabled.setAutoplaysRemaining(NaN); }).toThrow();

		expect(function() { objAutoplayEnabled.setAutoplaysRemaining(10.1); }).toThrow(); //float

		//test exceptions - incorrect values - string values
		expect(function() { objAutoplayEnabled.setAutoplaysRemaining("text"); }).toThrow();
		expect(function() { objAutoplayEnabled.setAutoplaysRemaining("1"); }).toThrow(); //throws AutoplayException

		//test exceptions - incorrect values - negative values
		expect(function() { objAutoplayEnabled.setAutoplaysRemaining(-1); }).toThrow();
		expect(function() { objAutoplayEnabled.setAutoplaysRemaining(-12.5); }).toThrow();
    });
});
