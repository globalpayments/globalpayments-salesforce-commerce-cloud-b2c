'use strict';

var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');
/**
 * Returns all the fields spefied as part of action response.
 * @param {obj} responseObj - object that contains Action response.
 */
var MethodResponse = AbstractResponse.extend({
  init: function (requestObj) {
    Object.defineProperties(this, {
      // add more fields as per the Model here:
      threeDsServerTransId: {
        enumerable: true,
        writable: true
      },
      threeDsMethodReturnUrl: {
        enumerable: true,
        writable: true
      },
      encodedMethodData: {
        enumerable: true,
        writable: true
      },methodUrl: {
        enumerable: true,
        writable: true
      },serverTransRef: {
        enumerable: true,
        writable: true
      }
    });

    this._super(requestObj);
  }
});

module.exports = {
  Response: MethodResponse
};