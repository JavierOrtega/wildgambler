/**
 * @author Petr Urban
 * Exception related to LocalStorage functionality
 */
function LocalStorageException(message) {
    this.message = message;
    this.name = 'LocalStorage';
};
LocalStorageException.prototype = Object.create(Error.prototype);
