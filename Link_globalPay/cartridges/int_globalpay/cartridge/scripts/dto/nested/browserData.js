/* eslint-disable linebreak-style */
'use strict';

var AbstractRequest = require('*/cartridge/scripts/dto/base/abstractRequest');
var AbstractResponse = require('*/cartridge/scripts/dto/base/abstractResponse'); 
/**
 * Forms all the fields required to send for payment method request.
 * @param {obj} requestObj - object that contains fields for request to be sent.
 */
var BrowserDataRequest = AbstractRequest.extend({
  init: function (requestObj) {
    Object.defineProperties(this, {
      // add more fields as per the Model here:
      acceptHeader: {
        enumerable: true,
        writable: true
      },
      colorDepth: {
        enumerable: true,
        writable: true
      },
      ip: {
        enumerable: true,
        writable: true
      },
      javaEnabled: {
        enumerable: true,
        writable: true
      },
      javascriptEnabled: {
        enumerable: true,
        writable: true
      },
      language: {
        enumerable: true,
        writable: true
      },
      screenHeight: {
        enumerable: true,
        writable: true
      },
      screenWidth: {
        enumerable: true,
        writable: true
      },
      challengeWindowSize: {
        enumerable: true,
        writable: true
      },
      timezone: {
        enumerable: true,
        writable: true
      },
      userAgent: {
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
var BrowserDataResponse = AbstractResponse.extend({
  init: function (responseObj) {
    Object.defineProperties(this, {
    });

    this._super(responseObj);
  }
});

module.exports = {
  Request: BrowserDataRequest,
  Response: BrowserDataResponse
};
