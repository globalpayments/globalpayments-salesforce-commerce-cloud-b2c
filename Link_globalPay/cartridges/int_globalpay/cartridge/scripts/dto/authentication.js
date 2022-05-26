'use strict';

var AbstractRequest = require('*/cartridge/scripts/dto/base/abstractRequest');
var AbstractResponse = require('*/cartridge/scripts/dto/base/abstractResponse');
var Action = require('*/cartridge/scripts/dto/nested/action');
var PaymentMethod = require('*/cartridge/scripts/dto/nested/paymentMethod');
var ThreeDs = require('*/cartridge/scripts/dto/nested/threeDs');
var Notifications = require('*/cartridge/scripts/dto/nested/notifications');

/**
 * Forms all the fields required to send for Authentication request.
 * @param {obj} requestObj - object that contains fields for request to be sent.
 */
var AuthenticationRequest = AbstractRequest.extend({
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

/**
 * Forms all the fields to be returned as part of Authentication response.
 * @param {obj} responseObj - object that contains fields from response.
 */
var AuthenticationResponse = AbstractResponse.extend({
    init: function (responseObj) {
        Object.defineProperties(this, {
            // add more fields as per the Model here:
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
