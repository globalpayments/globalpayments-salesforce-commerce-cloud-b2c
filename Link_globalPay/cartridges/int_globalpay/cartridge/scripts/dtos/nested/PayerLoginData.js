'use strict';

var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');

var PayerLoginDataRequest = AbstractRequest.extend({
    init: function (requestObj) {
      Object.defineProperties(this, {
        // add more fields as per the Model here:
        authenticationData: {
          enumerable: true,
          writable: true
        },
        authenticationTimestamp: {
          enumerable: true,
          writable: true
        },
        authenticationType: {
          enumerable: true,
          writable: true
        }
      });  
      this._super(requestObj);
    }
  });
  
  module.exports = {
    Request: PayerLoginDataRequest
  };
