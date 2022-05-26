'use strict';

var AbstractRequest = require('*/cartridge/scripts/dto/base/abstractRequest');
var AbstractResponse = require('*/cartridge/scripts/dto/base/abstractResponse');
var Action = require('*/cartridge/scripts/dto/nested/action');
var PaymentMethod = require('*/cartridge/scripts/dto/nested/paymentMethod');
/**
 * Forms all the fields required to send for Authorize request.
 * @param {obj} requestObj - object that contains fields for request to be sent.
 */
var AuthorizeRequest = AbstractRequest.extend({
    init: function (requestObj) {
        Object.defineProperties(this, {
            // add more fields as per the Model here:
            accountName: {
                enumerable: true,
                writable: true
            },
            channel: {
                enumerable: true,
                writable: true
            },
            captureMode: {
                enumerable: true,
                writable: true
            },
            type: {
                enumerable: true,
                writable: true
            },
            amount: {
                enumerable: true,
                writable: true
            },
            currency: {
                enumerable: true,
                writable: true
            },
            reference: {
                enumerable: true,
                writable: true
            },
            country: {
                enumerable: true,
                writable: true
            },
            paymentMethod: AbstractResponse.getAccessorDescriptorWithConstructor(PaymentMethod.Request)
        });

        this._super(requestObj);
    },

    getEndpoint: function () {
        return 'transactions';
    },

    getHttpMethod: function () {
        return 'POST';
    }
});
/**
 * Forms all the fields to be returned as part of Authorize response.
 * @param {obj} responseObj - object that contains fields from response.
 */
var AuthorizeResponse = AbstractResponse.extend({
    init: function (responseObj) {
        Object.defineProperties(this, {
            id: {
                enumerable: true,
                writable: true
            },
            status: {
                enumerable: true,
                writable: true
            },
            captureMode: {
                enumerable: true,
                writable: true
            },
            action: {
                enumerable: true,
                writable: true
            },
            // add more fields as per the Model here:
            action: AbstractResponse.getAccessorDescriptorWithConstructor(Action.Response),
            paymentMethod: AbstractResponse.getAccessorDescriptorWithConstructor(PaymentMethod.Response)
        });

        this._super(responseObj);
    }
});

module.exports = {
    Request: AuthorizeRequest,
    Response: AuthorizeResponse
};
