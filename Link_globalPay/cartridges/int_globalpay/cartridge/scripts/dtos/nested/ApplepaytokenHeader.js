'use strict';

var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');



/**
 * Forms all the fields required to send for PaymentToken request.
 * @param {obj} requestObj - object that contains fields for request to be sent.
 */
var HeaderRequest = AbstractRequest.extend({
  init: function (requestObj) {
    Object.defineProperties(this, {
      // add more fields as per the Model here:
        ephemeralPublicKey:{
            enumerable: true,
            writable: true
        }, 
        transactionId:{
          enumerable: true,
          writable: true
        },
        publicKeyHash:{
          enumerable: true,
          writable: true
        }
      //signedMessage: AbstractResponse.getAccessorDescriptorWithConstructor(SignedMessages.Request)
    //  add more here later as per model
    });

    this._super(requestObj);
  }
});
/**
 * Forms all fields to be Returned as part of PaymentToken response.
 * @param {obj} responseObj - object that contains fields from response.
 */
 var HeaderResponse = AbstractResponse.extend({
  init: function (responseObj) {
    Object.defineProperties(this, {
      // add more fields as per the Model here:
      ephemeralPublicKey:{
          enumerable: true,
          writable: true
      }, 
      transactionId:{
        enumerable: true,
        writable: true
      },
      publicKeyHash:{
        enumerable: true,
        writable: true
      }
    });

    this._super(responseObj);
  }
});

module.exports = {
  Request: HeaderRequest,
  Response: HeaderResponse
};
