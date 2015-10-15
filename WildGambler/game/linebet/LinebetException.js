/**
 * @author Petr Urban
 * Exception related to Linebet functionality
 */
function LinebetException(message) {
    this.message = message;
    this.name = 'LinebetException';
};
LinebetException.prototype = Object.create(Error.prototype);
