/* eslint-disable linebreak-style */
'use strict';

var AbstractRequest = require('*/cartridge/scripts/dto/base/abstractRequest');
var AbstractResponse = require('*/cartridge/scripts/dto/base/abstractResponse');
var PaymentToken = require('*/cartridge/scripts/dto/paymentMethods/paymentToken');
var createSetter = function (fieldName) {
  return function (val) {
    this.__[fieldName] = val;
  };
};
/**
 * Forms all the fields required to send for DigitalWallet request.
 * @param {obj} requestObj - object that contains fields for request to be sent.
 */
var DigitalWalletRequest = AbstractRequest.extend({
  init: function (requestObj) {
    Object.defineProperties(this, {
      // add more fields as per the Model here:
      provider: {
        enumerable: true,
        set: createSetter('provider'),
        get: function (val) {
          return String(this.__.provider);
        }
      },
      eci: {
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
    //  add more here later as per model
    });

    this._super(requestObj);
  }
});
/**
 * Forms all fields to be Returned as part of DigitalWallet response.
 * @param {obj} responseObj - object that contains fields from response.
 */
var DigitalWalletResponse = AbstractResponse.extend({
  init: function (responseObj) {
    Object.defineProperties(this, {
      // add more fields as per the Model here:
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
      //  add more fields here later as per model
      paymentToken: AbstractResponse.getAccessorDescriptorWithConstructor(PaymentToken.Response)
    });

    this._super(responseObj);
  }
});

module.exports = {
  Request: DigitalWalletRequest,
  Response: DigitalWalletResponse
};
