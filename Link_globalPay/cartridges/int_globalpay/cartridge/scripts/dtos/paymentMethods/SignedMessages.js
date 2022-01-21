'use strict';

var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');

var createSetter = function (fieldName) {
  return function (val) {
    this.__[fieldName] = val;
  };
};
/**
 * Forms all the fields required to send for SignedMessages request.
 * @param {obj} requestObj - object that contains fields for request to be sent.
 */
var SignedMessagesRequest = AbstractRequest.extend({
  init: function (requestObj) {
    Object.defineProperties(this, {
           // add more fields as per the Model here:
      encryptedMessage: {
        enumerable: true,
        writable: true
      },
      ephemeralPublicKey: {
        enumerable: true,
        writable: true
      },
      tag: {
        enumerable: true,
        writable: true
      }
    });

    this._super(requestObj);
  }
});
/**
 * Forms all fields to be Returned as part of SignedMessages response.
 * @param {obj} responseObj - object that contains fields from response.
 */
var SignedMessagesResponse = AbstractResponse.extend({
  init: function (responseObj) {
    Object.defineProperties(this, {
      encryptedMessage: {
        enumerable: true,
        writable: true
      },
      ephemeralPublicKey: {
        enumerable: true,
        writable: true
      },
      tag: {
        enumerable: true,
        writable: true
      }
    });

    this._super(responseObj);
  }
});

module.exports = {
  Request: SignedMessagesRequest,
  Response: SignedMessagesResponse
};
