'use strict';

/**
 * @module app
 */

/**
 * Use this method to get a new instance for a given form reference or form object.
 *
 * @param formReference {dw.web.FormElement|String} Salesforce form id (/forms/$name$.xml) or Salesforce form object.
 * @returns {module:models/FormModel~FormModel}
 * @example
 * // simple form preparation
 * var form = require('~/app').getForm('registration');
 * form.clear();
 *
 * // handling the form submit
 * var form = require('~/app').getForm('registration');
 * form.handleAction({
 *     'register' : function(formGroup, action){
 *         // handle the action here
 *     },
 *     'error'    : function(){
 *         // handle form errors here
 *     }
 * });
 */
 exports.getForm = function (formReference) {
    var formInstance, FormModel;
 
    FormModel = require('app_storefront_controllers/cartridge/scripts/models/FormModel');
    formInstance = null;
    if (typeof formReference === 'string') {
        formInstance = require('app_storefront_controllers/cartridge/scripts/object').resolve(session.forms, formReference);
    } else if (typeof formReference === 'object') {
        formInstance = formReference;
    }

    return new FormModel(formInstance);
};

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
