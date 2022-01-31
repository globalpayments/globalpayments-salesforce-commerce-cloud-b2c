'use strict';

var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');
var MethodData = require('~/cartridge/scripts/dtos/nested/MethodData');
/**
 * Forms all the fields required to send for payment method request.
 * @param {obj} requestObj - object that contains fields for request to be sent.
 */
 var ThreeDsRequest = AbstractRequest.extend({
  init: function (requestObj) {
    Object.defineProperties(this, {
      // add more fields as per the Model here:
      source: {
        enumerable: true,
        writable: true
      },
      preference: {
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
var ThreeDsResponse = AbstractResponse.extend({
  init: function (responseObj) {
    Object.defineProperties(this, {
      // add more fields as per the Model here:
      enrolledStatus: {
        enumerable: true,
        writable: true
      },
      challengeModel: {
        enumerable: true,
        writable: true
      },
      challengeStatus: {
        enumerable: true,
        writable: true
      },
      challengeValue: {
        enumerable: true,
        writable: true
      },
      redirectUrl: {
        enumerable: true,
        writable: true
      },
      source: {
        enumerable: true,
        writable: true
      },
      preference: {
        enumerable: true,
        writable: true
      },
      methodData:AbstractResponse.getAccessorDescriptorWithConstructor(MethodData.Response)
    });

    this._super(responseObj);
  }
});

module.exports = {
  Request: ThreeDsRequest,
  Response: ThreeDsResponse
};
