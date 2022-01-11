'use strict';

var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');
var Action = require('~/cartridge/scripts/dtos/nested/Action');
var PaymentMethod = require('~/cartridge/scripts/dtos/nested/PaymentMethod');
var ThreeDs = require('~/cartridge/scripts/dtos/nested/ThreeDs');
var Notifications = require('~/cartridge/scripts/dtos/nested/Notifications');

var AuthenticationRequest = AbstractRequest.extend({
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
            country: {
                enumerable: true,
                writable: true
            },
            reference: {
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
            source: {
                enumerable: true,
                writable: true
            },
            id: {
                enumerable: true,
                writable: true
            },
            paymentMethod: AbstractResponse.getAccessorDescriptorWithConstructor(PaymentMethod.Request),
            notifications: AbstractResponse.getAccessorDescriptorWithConstructor(Notifications.Request)
        });

        this._super(requestObj);
    },

    getEndpoint: function () {
        return 'authentications';
    },

    getHttpMethod: function () {
        return 'POST';
    }
});

var AuthenticationResponse = AbstractResponse.extend({
    init: function (responseObj) {
        Object.defineProperties(this, {
            status: {
                enumerable: true,
                writable: true
            },
            notifications: {
                enumerable: true,
                writable: true
            },
            action: {
                enumerable: true,
                writable: true
            },
            id: {
                enumerable: true,
                writable: true
            },
            threeDs: AbstractResponse.getAccessorDescriptorWithConstructor(ThreeDs.Response),
            action: AbstractResponse.getAccessorDescriptorWithConstructor(Action.Response),
            notifications: AbstractResponse.getAccessorDescriptorWithConstructor(Notifications.Response)
        });

        this._super(responseObj);
    }
});

module.exports = {
    Request: AuthenticationRequest,
    Response: AuthenticationResponse
};
