'use strict';

var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');
 
var RecurringAuthorizationDataRequest = AbstractRequest.extend({
    init: function (requestObj) {
      Object.defineProperties(this, {
        // add more fields as per the Model here:
        maxNumberOfInstalments: {
          enumerable: true,
          writable: true
        },
        frequency: {
          enumerable: true,
          writable: true
        },
        expiryDate: {
          enumerable: true,
          writable: true
        }
      });  
      this._super(requestObj);
    }
  });
  
  module.exports = {
    Request: RecurringAuthorizationDataRequest
  };
