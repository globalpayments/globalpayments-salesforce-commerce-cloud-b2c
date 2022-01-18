'use strict';

var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');
var PaymentToken= require('~/cartridge/scripts/dtos/paymentMethods/PaymentToken');
var createSetter = function (fieldName) {
    return function (val) {
        this.__[fieldName] = val;
    }
}

var DigitalWalletRequest = AbstractRequest.extend({
    init: function (requestObj) {
        Object.defineProperties(this, {
            provider: {
                enumerable: true,
                set: createSetter('provider'),
                get: function (val) {
                    return String(this.__.provider);
                }
            },
            token:{
                enumerable: true,
                writable: true
            },
            eci:{
                enumerable: true,
                writable: true
            },
            tokenFormat: {
                enumerable: true,
                writable: true
            },
            cryptogram: {
                enumerable: true,
                writable: true
            },
            expiryMonth: {
                enumerable: true,
                writable: true
            },
            expiryYear: {
                enumerable: true,
                writable: true
            },
            cvv: {
                enumerable: true,
                writable: true
            },
            avsAddress: {
                enumerable: true,
                writable: true
            },
            avsPostalCode: {
                enumerable: true,
                writable: true
            },
            paymentToken: AbstractResponse.getAccessorDescriptorWithConstructor(PaymentToken.Request)
        });

        this._super(requestObj);
    }
});

var DigitalWalletResponse = AbstractResponse.extend({
    init: function (responseObj) {
        Object.defineProperties(this, {
            provider: {
                enumerable: true,
                writable: true
            },
            tokenFormat: {
                enumerable: true,
                writable: true
            },
            eci: {
                enumerable: true,
                writable: true
            },
            authcode: {
                enumerable: true,
                writable: true
            },
            brand_reference: {
                enumerable: true,
                writable: true
            },
            brand: {
                enumerable: true,
                writable: true
            },
            paymentToken: AbstractResponse.getAccessorDescriptorWithConstructor(PaymentToken.Response)
        });

        this._super(responseObj);
    }
});

module.exports = {
    Request: DigitalWalletRequest,
    Response: DigitalWalletResponse
};
