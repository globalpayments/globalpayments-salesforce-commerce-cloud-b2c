/* eslint-disable linebreak-style */
'use strict';

var AbstractResponse = require('*/cartridge/scripts/dto/base/abstractResponse');
var AbstractRequest = require('*/cartridge/scripts/dto/base/abstractRequest');
/**
 * Forms all the fields required to send for Payer request.
 * @param {obj} requestObj - object that contains fields for Payer request.
 */
var PayerRequest = AbstractRequest.extend({
    init: function (requestObj) {
        Object.defineProperties(this, {
      // add more fields as per the Model here:
            email: {
                enumerable: true,
                writable: true
            },
        });

        this._super(requestObj);
    }
});
/**
 * Returns all the fields spefied as part of Payer response.
 * @param {obj} responseObj - object that contains Payer response.
 */
var PayerResponse = AbstractResponse.extend({
    init: function (responseObj) {
        Object.defineProperties(this, {
            country: {
                enumerable: true,
                writable: true
            },
            email: {
                enumerable: true,
                writable: true
            }
        });

        this._super(responseObj);
    }
});

module.exports = {
    Request: PayerRequest,
    Response: PayerResponse
};
