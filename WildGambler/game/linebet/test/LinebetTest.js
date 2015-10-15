/**
 * @author Petr Urban
 */

var arrLinebetOptions = [0.01, 0.05, 0.1, 0.25, 0.5, 1, 5, 10, 25, 50, 100];

describe ("LinebetTest", function()
{
    beforeEach( function ()
    {
		//TO ADD stuff that the unit tests will need
    });

    it("LinebetGetCurrentLinebet", function()
    {
		//prepare
		var objSetup = new LinebetSetup(arrLinebetOptions);
		var objLinebet = new Linebet(objSetup);

		//set value
		var intNumber = 10; //valid number
		objLinebet.setCurrentLinebet(intNumber);

		//get value
		var result = objLinebet.getCurrentLinebet();

		//test
		expect(result).toBe(intNumber); //expected to be OK
    });

    it("LinebetSetupInputValuesException", function()
    {
		//test empty setup
		var arrWrongOptions = arrLinebetOptions.slice(); //copy of array
		var arrSetup = new Array();
		expect(function() { return new LinebetSetup(arrSetup); }).toThrow();

		//test wrong values
		expect(function() { new LinebetSetup(null); }).toThrow();
		expect(function() { new LinebetSetup(undefined); }).toThrow();
		expect(function() { new LinebetSetup(Infinity); }).toThrow();
		expect(function() { new LinebetSetup(NaN); }).toThrow();
		expect(function() { new LinebetSetup(""); }).toThrow();
		expect(function() { new LinebetSetup("text"); }).toThrow();

		//test empty string
		var arrWrongOptions = arrLinebetOptions.slice(); //copy of array
		arrWrongOptions.push("");
		expect(function() { new LinebetSetup(arrWrongOptions); }).toThrow();

		//test empty string
		var arrWrongOptions = arrLinebetOptions.slice(); //copy of array
		arrWrongOptions.push("");
		expect(function() { new LinebetSetup(arrWrongOptions); }).toThrow();

		//test string
		var arrWrongOptions = arrLinebetOptions.slice(); //copy of array
		arrWrongOptions.push("text");
		expect(function() { new LinebetSetup(arrWrongOptions); }).toThrow();

		//test negative value
		var arrWrongOptions = arrLinebetOptions.slice(); //copy of array
		arrWrongOptions.push(-10);
		expect(function() { new LinebetSetup(arrWrongOptions); }).toThrow();

		//test null
		var arrWrongOptions = arrLinebetOptions.slice(); //copy of array
		arrWrongOptions.push(null);
		expect(function() { new LinebetSetup(arrWrongOptions); }).toThrow();

		//test undefined
		var arrWrongOptions = arrLinebetOptions.slice(); //copy of array
		arrWrongOptions.push(undefined);
		expect(function() { new LinebetSetup(arrWrongOptions); }).toThrow();

		//test infinity
		var arrWrongOptions = arrLinebetOptions.slice(); //copy of array
		arrWrongOptions.push(Infinity);
		expect(function() { new LinebetSetup(arrWrongOptions); }).toThrow();

		//test -infinity
		var arrWrongOptions = arrLinebetOptions.slice(); //copy of array
		arrWrongOptions.push(-Infinity);
		expect(function() { new LinebetSetup(arrWrongOptions); }).toThrow();

		//test NaN
		var arrWrongOptions = arrLinebetOptions.slice(); //copy of array
		arrWrongOptions.push(NaN);
		expect(function() { new LinebetSetup(arrWrongOptions); }).toThrow();
    });

    it("LinebetSetCurrentLinebetException", function()
    {
		//prepare
		var objSetup = new LinebetSetup(arrLinebetOptions);
		var objLinebet = new Linebet(objSetup);

		//test valid values
		expect(function() { objLinebet.setCurrentLinebet(0.01); }).not.toThrow();
		expect(function() { objLinebet.setCurrentLinebet(10); }).not.toThrow();
		expect(function() { objLinebet.setCurrentLinebet(100); }).not.toThrow();

		//test exceptions - for incorrect values
		expect(function() { objLinebet.setCurrentLinebet(null); }).toThrow();
		expect(function() { objLinebet.setCurrentLinebet(undefined); }).toThrow();
		expect(function() { objLinebet.setCurrentLinebet(Infinity); }).toThrow();
		expect(function() { objLinebet.setCurrentLinebet(NaN); }).toThrow();
		expect(function() { objLinebet.setCurrentLinebet(""); }).toThrow();
		expect(function() { objLinebet.setCurrentLinebet("text"); }).toThrow(); //value is not in setup

		expect(function() { objLinebet.setCurrentLinebet(0.02); }).toThrow(); //value is not in setup
		expect(function() { objLinebet.setCurrentLinebet("10"); }).toThrow(); //value is not in setup
		expect(function() { objLinebet.setCurrentLinebet(-10); }).toThrow(); //value is not in setup
		expect(function() { objLinebet.setCurrentLinebet(-0.01); }).toThrow(); //value is not in setup
		
		//test setting value by index
		expect(function() { objLinebet.setCurrentLinebetIndex(0); }).not.toThrow();
		expect(objLinebet.getCurrentLinebetIndex()).toBe(0);
		
		expect(function() { objLinebet.setCurrentLinebetIndex(1); }).not.toThrow();
		expect(objLinebet.getCurrentLinebetIndex()).toBe(1);
		
		expect(function() { objLinebet.setCurrentLinebetIndex(null); }).toThrow();
		expect(function() { objLinebet.setCurrentLinebetIndex(undefined); }).toThrow();
		expect(function() { objLinebet.setCurrentLinebetIndex(Infinity); }).toThrow();
		expect(function() { objLinebet.setCurrentLinebetIndex(NaN); }).toThrow();
		expect(function() { objLinebet.setCurrentLinebetIndex(""); }).toThrow();
		expect(function() { objLinebet.setCurrentLinebetIndex("text"); }).toThrow();
		expect(function() { objLinebet.setCurrentLinebetIndex(-1); }).toThrow(); //this index is not available
		expect(function() { objLinebet.setCurrentLinebetIndex(10000); }).toThrow(); //this index is not available
    });

});
