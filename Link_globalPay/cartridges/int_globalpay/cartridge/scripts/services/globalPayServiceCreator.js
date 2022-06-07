'use strict';

var SERVICE_NAME = 'GlobalPay';
var ENDPOINT_ACCESS_TOKEN = 'accesstoken';
var ENDPOINT_AUTHENTICATION = 'authentications';
var ENDPOINT_TRANSACTION = 'transactions';
var ENDPOINT_CAPTURE = 'transactions/:transactionId/capture';
var ENDPOINT_PAYMENT_METHOD = 'payment_methods';
var ENDPOINT_INITIATE = 'authentications/:authId/initiate';

function prepareEndpoint(endpoint, params) {
    var preparedEndpoint = endpoint;

    if (!empty(params)) {
        Object.keys(params).forEach(function (key) {
            preparedEndpoint = preparedEndpoint.replace(':' + key, params[key]);
        });
    }

    return preparedEndpoint;
}

/**
 * Creates and prepares Global Pay service.
 *
 * @param {string} serviceEndpoint - endpoint
 * @param {string} token - service bearer token
 * @param {Object} endpointParams - endpoint parameters
 * @returns {dw.service.Service} Global Pay service.
 */
function createService(serviceEndpoint, token, endpointParams) {
    var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
    var Site = require('dw/system/Site');
    var currentSite = Site.getCurrent();

    return LocalServiceRegistry.createService(SERVICE_NAME, {
        createRequest: function (svc, params) {
            svc.setRequestMethod('POST');
            svc.setURL(svc.getURL() + '/' + prepareEndpoint(serviceEndpoint, endpointParams));
            svc.addHeader('content-type', 'application/json');
            svc.addHeader('x-gp-version', currentSite.getCustomPreferenceValue('gp_x_gp_version'));

            if (token) {
                svc.addHeader('Authorization', 'Bearer ' + token);
            }

            return JSON.stringify(params);
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
    createService: createService,
    ENDPOINT_ACCESS_TOKEN: ENDPOINT_ACCESS_TOKEN,
    ENDPOINT_AUTHENTICATION: ENDPOINT_AUTHENTICATION,
    ENDPOINT_TRANSACTION: ENDPOINT_TRANSACTION,
    ENDPOINT_CAPTURE: ENDPOINT_CAPTURE,
    ENDPOINT_PAYMENT_METHOD: ENDPOINT_PAYMENT_METHOD,
    ENDPOINT_INITIATE: ENDPOINT_INITIATE
};
