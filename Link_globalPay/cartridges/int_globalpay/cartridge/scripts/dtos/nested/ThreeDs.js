'use strict';

var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');
/**
 * Forms all the fields to be returned as part of ThreeDs response.
 * @param {obj} responseObj - object that contains response.
 */
var ThreeDsResponse = AbstractResponse.extend({
  init: function (responseObj) {
    Object.defineProperties(this, {
      // add more fields as per the Model here:
      enrolledStatus: {
        enumerable: true,
        writable: true
      },
      challengeModel: {
        enumerable: true,
        writable: true
      },
      challengeStatus: {
        enumerable: true,
        writable: true
      },
      challengeValue: {
        enumerable: true,
        writable: true
      },
      redirectUrl: {
        enumerable: true,
        writable: true
      }
    });

    this._super(responseObj);
  }
});

module.exports = {
  Response: ThreeDsResponse
};
