'use strict';

var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');
 
var PayerPriorThreeDsAuthenticationDataRequest = AbstractRequest.extend({
    init: function (requestObj) {
      Object.defineProperties(this, {
        // add more fields as per the Model here:
        authenticationMethod: {
          enumerable: true,
          writable: true
        },
        acsTransactionReference: {
          enumerable: true,
          writable: true
        },
        authenticationTimestamp: {
          enumerable: true,
          writable: true
        },authenticationData: {
            enumerable: true,
            writable: true
          } 
      });  
      this._super(requestObj);
    }
  });
  
  module.exports = {
    Request: PayerPriorThreeDsAuthenticationDataRequest
  };
