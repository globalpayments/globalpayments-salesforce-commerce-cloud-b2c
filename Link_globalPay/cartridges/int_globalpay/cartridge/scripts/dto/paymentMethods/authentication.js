'use strict';

var AbstractRequest = require('~/cartridge/scripts/dto/base/abstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dto/base/abstractResponse');

var createSetter = function (fieldName) {
  return function (val) {
    this.__[fieldName] = val;
  };
};
/**
 * Forms all the fields required to send for Authentication request.
 * @param {obj} requestObj - object that contains fields for request to be sent.
 */
var AuthenticationRequest = AbstractRequest.extend({
  init: function (requestObj) {
    Object.defineProperties(this, {
      // add more fields as per the Model here:
      id: {
        enumerable: true,
        set: createSetter('id'),
        get: function (val) {
          return String(this.__.id);
        }
      }
    });

    this._super(requestObj);
  }
});
/**
 * Forms all fields to be Returned as part of  Authentication response.
 * @param {obj} responseObj - object that contains fields from response.
 */
var AuthenticationResponse = AbstractResponse.extend({
  init: function (responseObj) {
    Object.defineProperties(this, {
      id: {
        enumerable: true,
        writable: true
      }
    });

    this._super(responseObj);
  }
});

module.exports = {
  Request: AuthenticationRequest,
  Response: AuthenticationResponse
};
