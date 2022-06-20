/* eslint-disable linebreak-style */
'use strict';

var AbstractResponse = require('*/cartridge/scripts/dto/base/abstractResponse');
var AbstractRequest = require('*/cartridge/scripts/dto/base/abstractRequest');
var Card = require('*/cartridge/scripts/dto/paymentMethods/card');
var Authentication = require('*/cartridge/scripts/dto/paymentMethods/authentication');
var Apm = require('*/cartridge/scripts/dto/paymentMethods/apm');
var DigitalWallet = require('*/cartridge/scripts/dto/paymentMethods/digitalWallet');

/**
 * Forms all the fields required to send for payment method request.
 * @param {obj} requestObj - object that contains fields for request to be sent.
 */
var PaymentMethodRequest = AbstractRequest.extend({
    init: function (requestObj) {
        Object.defineProperties(this, {
      // add more fields as per the Model here:
            entryMode: {
                enumerable: true,
                writable: true
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
            apm: AbstractResponse.getAccessorDescriptorWithConstructor(Apm.Request)

        });

        this._super(requestObj);
    }
});
/**
 * Forms all the fields to be returned as part of Paymentmethod response.
 * @param {obj} responseObj - object that contains fields from response.
 */
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
            provider_narrative: {
                enumerable: true,
                writable: true
            },
            redirectUrl: {
                enumerable: true,
                writable: true
            },
      // add more fields as per the Model here:
            digitalWallet: AbstractResponse.getAccessorDescriptorWithConstructor(DigitalWallet.Response),
            card: AbstractResponse.getAccessorDescriptorWithConstructor(Card.Response),
            authentication: AbstractResponse.getAccessorDescriptorWithConstructor(Authentication.Response),
            apm: AbstractResponse.getAccessorDescriptorWithConstructor(Apm.Response)
        });

        this._super(responseObj);
    }
});

module.exports = {
    Request: PaymentMethodRequest,
    Response: PaymentMethodResponse
};
