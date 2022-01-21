'use strict';

var SERVICE_NAME = 'int_globalpay.http.generic';

/**
 * Creates and prepares Global Pay service
 *
 * @returns {dw.service.Service} Global Pay service.
 */
function getService() {
  var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
  var UUIDUtils = require('dw/util/UUIDUtils');

  return LocalServiceRegistry.createService(SERVICE_NAME, {
    createRequest: function (svc, requestObject) {
      var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');
      var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
      var accessToken = requestObject.getToken();

      svc.setAuthentication('NONE');
      svc.setRequestMethod(requestObject.getHttpMethod());
      svc.setURL(svc.getURL() + '/' + requestObject.getEndpoint());

      svc.addHeader('content-type', 'application/json');
      svc.addHeader('x-gp-version', globalPayPreferences.getPreferences().apiVersion);
      svc.addHeader('x-gp-idempotency', UUIDUtils.createUUID());

      if (accessToken) {
        svc.addHeader('Authorization', 'Bearer ' + accessToken);
      }

      if (['POST', 'PATCH'].indexOf(requestObject.getHttpMethod()) > -1) {
        return requestObject.getDTO();
      }
    },

    parseResponse: function (svc, response) {
      var serviceResponse = null;

      try {
        serviceResponse = JSON.parse(response.text);
      } catch (e) {
                // TODO add error handling
      }

      return serviceResponse;
    },

    filterLogMessage: function (msg) {
      return msg;
    }
  });
}

function executeRequest(requestObject, responseClass) {
  var service = getService();
  var serviceResult = service.call(requestObject);

  if (serviceResult.isOk()) {
    return {
      success: true,
      response: new responseClass(serviceResult.getObject())
    };
  }
  var errorObject = {
    error_code: 'GENERAL_ERROR',
    detailed_error_code: serviceResult.getError(),
    detailed_error_description: serviceResult.getMsg()
  };

  if (serviceResult.getErrorMessage()) {
    var APIError = require('*/cartridge/scripts/dtos/APIError');

    try {
      errorObject = JSON.parse(serviceResult.getErrorMessage());
    } catch (e) {}
  }

        // TODO add retry mechanism for expired/invalid access token with max retries = 3 // https://developer.globalpay.com/authentication
        // 40001/40002

  return {
    success: false,
    error: new APIError.Response(errorObject)
  };
}

module.exports = {
  executeRequest: executeRequest
};
