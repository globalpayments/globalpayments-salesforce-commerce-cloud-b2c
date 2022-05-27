/* eslint-disable linebreak-style */
'use strict';

var MessageDigest = require('dw/crypto/MessageDigest');
var Encoding = require('dw/crypto/Encoding');
var Bytes = require('dw/util/Bytes');

var AbstractRequest = require('*/cartridge/scripts/dto/base/abstractRequest');
var AbstractResponse = require('*/cartridge/scripts/dto/base/abstractResponse');
var Scope = require('*/cartridge/scripts/dto/nested/scope');

/**
 * Forms the request passing required headers and data for AccessToken request.
 * @returns {requestObj} - object that contains fields for request to be sent.
 */
var AccessTokenRequest = AbstractRequest.extend({
  init: function (requestObj) {
    Object.defineProperties(this, {
      // add more fields as per the Model here:
      grantType: {
        enumerable: true,
        writable: true
      },
      appId: {
        enumerable: true,
        writable: true
      },
      appKey: {
        enumerable: false,
        writable: true
      },
      nonce: {
        enumerable: true,
        writable: true
      },
      secret: {
        enumerable: true,
        set: function () {
          throw new Error('Forbidden to set "secret" value');
        },
        get: function () {
          var digest = new MessageDigest(MessageDigest.DIGEST_SHA_512);

          return Encoding.toHex(digest.digestBytes(new Bytes(this.nonce + this.appKey)));
        }
      },
      permissions: {
        enumerable: true,
        writable: true
      }
    });

    this._super(requestObj);
  },

  getEndpoint: function () {
    return 'accesstoken';
  },

  getHttpMethod: function () {
    return 'POST';
  }
});

/**
 * Forms all the fields to be returned as response with Accesstoken from service.
 * @returns {responseObj} - object that contains fields from response.
 */

var AccessTokenResponse = AbstractResponse.extend({
  init: function (responseObj) {
    Object.defineProperties(this, {
      token: {
        enumerable: true,
        writable: true
      },
      type: {
        enumerable: true,
        writable: true
      },
      appId: {
        enumerable: true,
        writable: true
      },
      scope: AbstractResponse.getAccessorDescriptorWithConstructor(Scope.Response)
    });

    this._super(responseObj);
  }
});

module.exports = {
  Request: AccessTokenRequest,
  Response: AccessTokenResponse
};
