/* eslint-disable linebreak-style */
'use strict';
/**
 * @module app
 */
exports.getForm = function (formReference) {
  var formInstance,
    FormModel;

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
  return require('*/cartridge/controllers/' + controllerName);
};
