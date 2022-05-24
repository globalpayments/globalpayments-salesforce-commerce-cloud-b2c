/* eslint-disable linebreak-style */
'use strict';

var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');
/**
 * Forms all the fields to be returned as part of ApiError response.
 * @param {obj} responseObj - object that contains fields from response.
 */
var APIErrorResponse = AbstractResponse.extend({
  init: function (responseObj) {
    Object.defineProperties(this, {
        // add more fields as per the Model here:
      errorCode: {
        enumerable: true,
        writable: true
      },
      detailedErrorCode: {
        enumerable: true,
        writable: true
      },
      detailedErrorDescription: {
        enumerable: true,
        writable: true
      }
    });

    this._super(responseObj);
  }
});

module.exports = {
  Response: APIErrorResponse
};
