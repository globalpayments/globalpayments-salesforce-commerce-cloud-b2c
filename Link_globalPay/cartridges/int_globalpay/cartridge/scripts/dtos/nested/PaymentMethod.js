'use strict';

var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');
var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var Card = require('~/cartridge/scripts/dtos/paymentMethods/Card');
var Authentication = require('~/cartridge/scripts/dtos/paymentMethods/Authentication');
var Apm = require('~/cartridge/scripts/dtos/paymentMethods/Apm');
var DigitalWallet=require('~/cartridge/scripts/dtos/paymentMethods/DigitalWallet');

var PaymentMethodRequest = AbstractRequest.extend({
    init: function (requestObj) {
        Object.defineProperties(this, {
            entryMode: {
                enumerable: true,
                writable: true,
            },
            firstName: {
                enumerable: true,
                writable: true
            },
            lastName: {
                enumerable: true,
                writable: true
            },
            name: {
                enumerable: true,
                writable: true
            },
            id: {
                enumerable: true,
                writable: true
            },
            digitalWallet: AbstractResponse.getAccessorDescriptorWithConstructor(DigitalWallet.Request),
            card: AbstractResponse.getAccessorDescriptorWithConstructor(Card.Request),
            authentication: AbstractResponse.getAccessorDescriptorWithConstructor(Authentication.Request),
            apm:AbstractResponse.getAccessorDescriptorWithConstructor(Apm.Request),

        });

        this._super(requestObj);
    }
});

var PaymentMethodResponse = AbstractResponse.extend({
    init: function (responseObj) {
        Object.defineProperties(this, {
            result: {
                enumerable: true,
                writable: true
            },
            message: {
                enumerable: true,
                writable: true
            },
            entryMode: {
                enumerable: true,
                writable: true
            },
            redirectUrl:{
                enumerable: true,
                writable: true
            },
            digitalWallet: AbstractResponse.getAccessorDescriptorWithConstructor(DigitalWallet.Request),
            card: AbstractResponse.getAccessorDescriptorWithConstructor(Card.Response),
            authentication: AbstractResponse.getAccessorDescriptorWithConstructor(Authentication.Response),
            apm:AbstractResponse.getAccessorDescriptorWithConstructor(Apm.Response),
        });

        this._super(responseObj);
    }
});

module.exports = {
    Request: PaymentMethodRequest,
    Response: PaymentMethodResponse
};
