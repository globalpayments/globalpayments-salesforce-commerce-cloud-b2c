'use strict';

/**
 * @module models/securityModel
 */
var URLUtils = require('dw/web/URLUtils');
var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
var responsedata = require('app_storefront_controllers/cartridge/scripts/util/Response');

function validateHeaders(args) {
  var clientid = globalPayPreferences.getPreferences().clientId;
  var result;
  if (args == clientid) {
    response.setStatus(200);
    result = true;
  } else {
    response.setStatus(401);
    result = false;
    responsedata.renderJSON({
      securityErrorMessage: 'Unauthorized Access:Denied access due to client ID missmatch '
    });
  }
  return result;
}


module.exports = {
  validateHeaders: validateHeaders
};
