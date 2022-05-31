/* eslint-disable linebreak-style */
'use strict';

var AbstractRequest = require('*/cartridge/scripts/dto/base/abstractRequest');
var AbstractResponse = require('*/cartridge/scripts/dto/base/abstractResponse');
var ThreeDs = require('*/cartridge/scripts/dto/nested/threeDs');
var Order = require('*/cartridge/scripts/dto/nested/order');
var PaymentMethod = require('*/cartridge/scripts/dto/nested/paymentMethod');
var BrowserData = require('*/cartridge/scripts/dto/nested/browserData');
/**
 * Forms all the fields required to send for Authentication request.
 * @param {obj} requestObj - object that contains fields for request to be sent.
 */
var ThreeDsStepOneRequest = AbstractRequest.extend({
  init: function (requestObj) {
    Object.defineProperties(this, {
      threeDs: AbstractResponse.getAccessorDescriptorWithConstructor(ThreeDs.Request),
      methodUrlCompletionStatus: {
        enumerable: true,
        writable: true
      },
      authId: {
        enumerable: true,
        writable: true
      },
      merchantContactUrl: {
        enumerable: true,
        writable: true
      },
      order: AbstractResponse.getAccessorDescriptorWithConstructor(Order.Request),
      paymentMethod: AbstractResponse.getAccessorDescriptorWithConstructor(PaymentMethod.Request),
      browserData: AbstractResponse.getAccessorDescriptorWithConstructor(BrowserData.Request)

    });

    this._super(requestObj);
  },
  getEndpoint: function () {
    return this.prepareEndpoint(
                'authentications/:authId/initiate',
                { authId: this.authId }
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

/**
 * Forms all the fields to be returned as part of Authentication response.
 * @param {obj} responseObj - object that contains fields from response.
 */
var ThreeDsStepOneResponse = AbstractResponse.extend({
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
      time_last_updated: {
        enumerable: true,
        writable: true
      },
      transactionType: {
        enumerable: true,
        writable: true
      },
      status: {
        enumerable: true,
        writable: true
      },
      threeDs: AbstractResponse.getAccessorDescriptorWithConstructor(ThreeDs.Response)
    });

    this._super(responseObj);
  }
});
module.exports = {
  Request: ThreeDsStepOneRequest,
  Response: ThreeDsStepOneResponse
};
