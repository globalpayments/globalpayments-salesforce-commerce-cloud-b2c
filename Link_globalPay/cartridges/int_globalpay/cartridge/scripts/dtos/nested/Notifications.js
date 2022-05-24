/* eslint-disable linebreak-style */
'use strict';

var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');
var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
/**
 * Forms all the fields required to send for request.
 * @param {obj} requestObj - object that contains fields for Notification request.
 */
var NotificationsRequest = AbstractRequest.extend({
  init: function (requestObj) {
    Object.defineProperties(this, {
      // add more fields as per the Model here:
      challengeReturnUrl: {
        enumerable: true,
        writable: true
      },
      threeDsMethodReturnUrl: {
        enumerable: true,
        writable: true
      },
      returnUrl: {
        enumerable: true,
        writable: true
      },
      statusUrl: {
        enumerable: true,
        writable: true
      },
      cancelUrl: {
        enumerable: true,
        writable: true
      }
    });

    this._super(requestObj);
  }
});
/**
 * Returns all the fields spefied as part of notifiaction response.
 * @param {obj} responseObj - object that contains Notification response.
 */
var NotificationsResponse = AbstractResponse.extend({
  init: function (responseObj) {
    Object.defineProperties(this, {
      challengeReturnUrl: {
        enumerable: true,
        writable: true
      },
      threeDsMethodReturnUrl: {
        enumerable: true,
        writable: true
      }
    });

    this._super(responseObj);
  }
});

module.exports = {
  Request: NotificationsRequest,
  Response: NotificationsResponse
};
