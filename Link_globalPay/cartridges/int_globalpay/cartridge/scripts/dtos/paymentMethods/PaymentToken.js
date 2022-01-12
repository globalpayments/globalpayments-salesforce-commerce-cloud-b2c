'use strict';

var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');
var SignedMessages= require('~/cartridge/scripts/dtos/paymentMethods/SignedMessages');

var createSetter = function (fieldName) {
    return function (val) {
        this.__[fieldName] = val;
    }
}

var PaymentTokenRequest = AbstractRequest.extend({
    init: function (requestObj) {
        Object.defineProperties(this, {
            signature: {
                enumerable: true,
                writable: true
            },
            protocolVersion: {
                enumerable: true,
                writable: true
            },
            signedMessage: AbstractResponse.getAccessorDescriptorWithConstructor(SignedMessages.Request)
        });

        this._super(requestObj);
    }
});

var PaymentTokenResponse = AbstractResponse.extend({
    init: function (responseObj) {
        Object.defineProperties(this, {
            signature: {
                enumerable: true,
                writable: true
            },
            protocolVersion: {
                enumerable: true,
                writable: true
            },
            signedMessage: AbstractResponse.getAccessorDescriptorWithConstructor(SignedMessages.Request),
        });

        this._super(responseObj);
    }
});

module.exports = {
    Request: PaymentTokenRequest,
    Response: PaymentTokenResponse
};
