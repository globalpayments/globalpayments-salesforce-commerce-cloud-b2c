'use strict';

var AbstractRequest = require('~/cartridge/scripts/dto/base/abstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dto/base/abstractResponse');
var Action = require('~/cartridge/scripts/dto/nested/action');
var PaymentMethod = require('~/cartridge/scripts/dto/nested/paymentMethod');
/**
 * Forms all the fields required to send for Refund request.
 * @param {obj} requestObj - object that contains fields for request to be sent.
 */
var RefundRequest = AbstractRequest.extend({
  init: function (requestObj) {
    Object.defineProperties(this, {
      transactionId: {
        enumerable: true,
        writable: true
      },
      amount: {
        enumerable: true,
        writable: true
      }
    });
    this._super(requestObj);
  },
  getEndpoint: function () {
    return this.prepareEndpoint(
            'transactions/:transactionId/refund',
            { transactionId: this.transactionId }
        );
  },

  getHttpMethod: function () {
    return 'POST';
  }
});
/**
 * Forms all the fields to be returned as part of Refund response.
 * @param {obj} responseObj - object that contains fields from response.
 */
var RefundResponse = AbstractResponse.extend({
  init: function (responseObj) {
    Object.defineProperties(this, {
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
      reference: {
        enumerable: true,
        writable: true
      },
      batchId: {
        enumerable: true,
        writable: true
      },
      // add more fields as per the Model here:
      action: AbstractResponse.getAccessorDescriptorWithConstructor(Action.Response),
      paymentMethod: AbstractResponse.getAccessorDescriptorWithConstructor(PaymentMethod.Response)
    });

    this._super(responseObj);
  }
});

module.exports = {
  Request: RefundRequest,
  Response: RefundResponse
};
