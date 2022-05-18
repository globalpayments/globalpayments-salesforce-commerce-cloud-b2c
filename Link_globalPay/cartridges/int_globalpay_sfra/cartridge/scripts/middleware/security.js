'use strict';

var URLUtils = require('dw/web/URLUtils');
var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');

/**
 * Middleware validating if user logged in
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 * @returns {void}
 */
function ValidateHeaders(req, res, next) {
  var clientid = globalPayPreferences.getPreferences().clientId;
  if (req.httpHeaders.clientid === clientid) {
    res.setStatusCode(200);
  } else {
    res.setStatusCode(401);
    res.json({
      securityErrorMessage: 'Unauthorized Access:Denied access due to client ID missmatch '
    });
  }
  next();
}


module.exports = {
  ValidateHeaders: ValidateHeaders

};
