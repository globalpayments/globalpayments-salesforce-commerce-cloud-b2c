'use strict';

var AbstractResponse = require('~/cartridge/scripts/dto/base/abstractResponse');
/**
 * Forms all the fields to be returned as part of Scope response.
 * @param {obj} responseObj - object that contains response.
 */
var ScopeResponse = AbstractResponse.extend({
  init: function (responseObj) {
    Object.defineProperties(this, {
      // add more fields as per the Model here:
      merchantId: {
        enumerable: true,
        writable: true
      },
      merchantName: {
        enumerable: true,
        writable: true
      },
      accounts: {
        enumerable: true,
        writable: true
      }
    });

    this._super(responseObj);
  }
});

module.exports = {
  Response: ScopeResponse
};
