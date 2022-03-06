'use strict';

var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');

var HomePhoneRequest = AbstractRequest.extend({
    init: function (requestObj) {
      Object.defineProperties(this, {
        // add more fields as per the Model here:
        countryCode: {
          enumerable: true,
          writable: true
        },
        subscriberNumber: {
          enumerable: true,
          writable: true
        }
      });  
      this._super(requestObj);
    }
  });
  
  module.exports = {
    Request: HomePhoneRequest
  };