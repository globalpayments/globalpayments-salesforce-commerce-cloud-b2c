/* eslint-disable linebreak-style */
'use strict';

var AbstractRequest = require('*/cartridge/scripts/dto/base/abstractRequest');
var AbstractResponse = require('*/cartridge/scripts/dto/base/abstractResponse');
var ShippingAddress = require('*/cartridge/scripts/dto/nested/shippingAddress');
/**
 * Forms all the fields required to send for payment method request.
 * @param {obj} requestObj - object that contains fields for request to be sent.
 */
var OrderRequest = AbstractRequest.extend({
    init: function (requestObj) {
        Object.defineProperties(this, {
      // add more fields as per the Model here:
            timeCreatedReference: {
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
            addressMatchIndicator: {
                enumerable: true,
                writable: true
            },
            shippingAddress: AbstractResponse.getAccessorDescriptorWithConstructor(ShippingAddress.Request)

        });

        this._super(requestObj);
    }
});


/**
 * Forms all the fields to be returned as part of ThreeDs response.
 * @param {obj} responseObj - object that contains response.
 */
var OrderResponse = AbstractResponse.extend({
    init: function (responseObj) {
        Object.defineProperties(this, {
        });

        this._super(responseObj);
    }
});

module.exports = {
    Request: OrderRequest,
    Response: OrderResponse
};
