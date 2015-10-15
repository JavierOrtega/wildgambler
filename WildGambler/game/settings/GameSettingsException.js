/**
 * @author Petr Urban
 * Exception related to Game Settings
 */
function GameSettingsException(message) {
    this.message = message;
    this.name = 'GameSettingsException';
};
GameSettingsException.prototype = Object.create(Error.prototype);
