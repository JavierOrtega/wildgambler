/**
 * @author Petr Urban
 * Exception related to Autoplay functionality
 */
function AutoplayException(message) {
    this.message = message;
    this.name = 'AutoplayException';
};
AutoplayException.prototype = Object.create(Error.prototype);
