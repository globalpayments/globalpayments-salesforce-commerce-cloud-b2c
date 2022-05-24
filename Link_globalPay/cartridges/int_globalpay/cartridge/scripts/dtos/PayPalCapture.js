/* eslint-disable linebreak-style */
'use strict';

var AbstractRequest = require('*/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('*/cartridge/scripts/dtos/base/AbstractResponse');

/**
 * Forms all the fields required to send for Authentication request.
 * @param {obj} requestObj - object that contains fields for request to be sent.
 */
var PayPalCaptureRequest = AbstractRequest.extend({
  init: function (requestObj) {
    Object.defineProperties(this, {
      transactionId: {
        enumerable: true,
        writable: true
      }
    });
    this._super(requestObj);
  },
  getEndpoint: function () {
    return this.prepareEndpoint(
                    'transactions/:transactionId/confirmation',
                    { transactionId: this.transactionId }
                );
  },
  getHttpMethod: function () {
    return 'POST';
  }
});


/**
 * Forms all the fields to be returned as part of Authentication response.
 * @param {obj} responseObj - object that contains fields from response.
 */
var PayPalCaptureResponse = AbstractResponse.extend({
  init: function (responseObj) {
    Object.defineProperties(this, {
      id: {
        enumerable: true,
        writable: true
      },
      timeCreated: {
        enumerable: true,
        writable: true
      },
      type: {
        enumerable: true,
        writable: true
      },
      status: {
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
      country: {
        enumerable: true,
        writable: true
      },
      merchantId: {
        enumerable: true,
        writable: true
      },
      accountId: {
        enumerable: true,
        writable: true
      },
      reference: {
        enumerable: true,
        writable: true
      }
    });

    this._super(responseObj);
  }
});

module.exports = {
  Request: PayPalCaptureRequest,
  Response: PayPalCaptureResponse
};
