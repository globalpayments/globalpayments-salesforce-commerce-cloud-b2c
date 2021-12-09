'use strict';

var SERVICE_NAME = 'int_globalpay.http.generic';

/**
 * Creates and prepares Global Pay service
 *
 * @param {string} token - service bearer token
 *
 * @returns {dw.service.Service} Global Pay service.
 */
function getService(token) {
    var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

    return LocalServiceRegistry.createService(SERVICE_NAME, {
        createRequest: function (svc, requestObject) {
            var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');

            svc.setAuthentication('NONE');
            svc.setRequestMethod('POST');
            svc.setURL(svc.getURL() + '/' + requestObject.getEndpoint());
            svc.addHeader('content-type', 'application/json');
            svc.addHeader('x-gp-version', globalPayHelper.getPreferences().apiVersion);

            if (token) {
                svc.addHeader('Authorization', 'Bearer ' + token);
            }

            return JSON.stringify(requestObject.getDTO());
        },
        parseResponse: function (svc, response) {
            return JSON.parse(response.text);
        },
        filterLogMessage: function (msg) {
            return msg;
        }
    });
}

module.exports = {
    getService: getService
};
