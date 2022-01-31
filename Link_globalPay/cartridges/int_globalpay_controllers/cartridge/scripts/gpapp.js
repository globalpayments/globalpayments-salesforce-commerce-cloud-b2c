'use strict';

/**
 * @module app
 */

/**
 * Returns the model for the given name. The model is expected under the models directory.
 */
exports.getModel = function (modelName) {
    return require('./models/' + modelName + 'Model');
};
/**
 * Returns the controller with the given name.
 */
 exports.getController = function (controllerName) {
    return require('~/cartridge/controllers/' + controllerName);
};
