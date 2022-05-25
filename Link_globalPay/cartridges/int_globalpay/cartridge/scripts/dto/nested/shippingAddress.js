'use strict';

var AbstractRequest = require('~/cartridge/scripts/dto/base/abstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dto/base/abstractResponse');

/**
 * Forms all the fields required to send for payment method request.
 * @param {obj} requestObj - object that contains fields for request to be sent.
 */
 var ShippingAddressRequest = AbstractRequest.extend({
  init: function (requestObj) {
    Object.defineProperties(this, {  
        // add more fields as per the Model here:
        line1: {
        enumerable: true,
        writable: true
        },
        city: {
            enumerable: true,
            writable: true
        },
        postalCode: {
            enumerable: true,
            writable: true
        },
        country: {
            enumerable: true,
            writable: true
        }
    });

    this._super(requestObj);
  }
});


/**
 * Forms all the fields to be returned as part of ThreeDs response.
 * @param {obj} responseObj - object that contains response.
 */
var ShippingAddressResponse = AbstractResponse.extend({
  init: function (responseObj) {
    Object.defineProperties(this, {
    });

    this._super(responseObj);
  }
});

module.exports = {
  Request: ShippingAddressRequest,
  Response: ShippingAddressResponse
};
