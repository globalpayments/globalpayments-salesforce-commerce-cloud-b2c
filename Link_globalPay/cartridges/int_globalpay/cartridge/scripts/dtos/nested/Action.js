'use strict';

var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');
/**
 * Returns all the fields spefied as part of action response.
 * @param {obj} responseObj - object that contains Action response.
 */
var ActionResponse = AbstractResponse.extend({
  init: function (responseObj) {
    Object.defineProperties(this, {
      // add more fields as per the Model here:
      id: {
        enumerable: true,
        writable: true
      },
      timeCreated: {
        enumerable: true,
        writable: true
      },
      type: {
        enumerable: true,
        writable: true
      },
      resultCode: {
        enumerable: true,
        writable: true
      }
    });

    this._super(responseObj);
  }
});

module.exports = {
  Response: ActionResponse
};
