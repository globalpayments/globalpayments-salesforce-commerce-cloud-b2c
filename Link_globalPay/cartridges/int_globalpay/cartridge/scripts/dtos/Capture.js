'use strict';

var AbstractRequest = require('*/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('*/cartridge/scripts/dtos/base/AbstractResponse');
var Action = require('*/cartridge/scripts/dtos/nested/Action');
var PaymentMethod = require('*/cartridge/scripts/dtos/nested/PaymentMethod');
/**
 * Forms all the fields required to send for Capture request.
 * @param {obj} requestObj - object that contains fields for request to be sent.
 */
var CaptureRequest = AbstractRequest.extend({
  init: function (requestObj) {
    Object.defineProperties(this, {
        // add more fields as per the Model here:
      transactionId: {
        enumerable: false,
        writable: true
      },
      amount: {
        enumerable: true,
        writable: true
      },
      captureSequence: {
        enumerable: true,
        writable: true
      },
      totalCaptureCount: {
        enumerable: true,
        writable: true
      },
      paymentMethod: {
        enumerable: true,
        writable: true
      }
    });

    this._super(requestObj);
  },

  getEndpoint: function () {
    return this.prepareEndpoint(
            'transactions/:transactionId/capture',
            { transactionId: this.transactionId }
        );
  },

  getHttpMethod: function () {
    return 'POST';
  }
});
/**
 * Forms all the fields to be returned as part of Capture response.
 * @param {obj} responseObj - object that contains fields from response.
 */
var CaptureResponse = AbstractResponse.extend({
  init: function (responseObj) {
    Object.defineProperties(this, {
        // add more fields as per the Model here:
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
      action: AbstractResponse.getAccessorDescriptorWithConstructor(Action.Response),
      paymentMethod: AbstractResponse.getAccessorDescriptorWithConstructor(PaymentMethod.Response)
    });

    this._super(responseObj);
  }
});

module.exports = {
  Request: CaptureRequest,
  Response: CaptureResponse
};
