'use strict';
/**
 * @module dtos/base/AbstractResponse
 */

var AbstractBase = require('~/cartridge/scripts/dtos/base/AbstractBase');

/**
 * AbstractResponse class
 * Other DTO modules extend this class.
 *
 * @class AbstractResponse
 * @extends module:util/AbstractBase~AbstractBase
 * @returns {module:dtos/base/AbstractResponse~AbstractResponse}
 */
var AbstractResponse = AbstractBase.extend({
  init: function (responseObj) {
    Object.defineProperties(this, {
      __: {
        enumerable: false,
        writable: true,
        value: {}
      }
    });

    if (!empty(responseObj)) {
      Object.keys(this)
            .filter(function (key) { return key !== '_super'; })
            .forEach(function (key) {
              this[key] = responseObj[AbstractBase.camelToSnakeCase(key)];
            }.bind(this));
    }

    this._super();
  }
});

AbstractResponse.getAccessorDescriptorWithConstructor = function (constructorFn) {
  var UUIDUtils = require('dw/util/UUIDUtils');
  var uniqueInternalProperty = UUIDUtils.createUUID();

  return {
    enumerable: true,
    set: function (val) {
      this.__[uniqueInternalProperty] = new constructorFn(val);
    },
    get: function () {
      return this.__[uniqueInternalProperty];
    }
  };
};

/** @type {module:dtos/base/AbstractResponse~AbstractResponse.prototype} */
module.exports = AbstractResponse;
