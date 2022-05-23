'use strict';
var AbstractRequest = require('*/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('*/cartridge/scripts/dtos/base/AbstractResponse');
var Action = require('*/cartridge/scripts/dtos/nested/Action');
var PaymentMethod = require('*/cartridge/scripts/dtos/nested/PaymentMethod');

var AuthorizeRequest = AbstractRequest.extend({
    init: function (requestObj) {
        Object.defineProperties(this, {
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
