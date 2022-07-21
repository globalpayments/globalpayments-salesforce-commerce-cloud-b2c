/* eslint-disable linebreak-style */
'use strict';
/**
 * @module dtos/base/abstractResponse
 */

var AbstractBase = require('*/cartridge/scripts/dto/base/abstractBase');

/**
 * AbstractResponse class
 * Other DTO modules extend this class.
 *
 * @class AbstractResponse
 * @extends module:util/abstractBase~AbstractBase
 * @returns {module:dtos/base/abstractResponse~AbstractResponse}
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
            .filter(function (key) {return key !== '_super';})
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

/** @type {module:dtos/base/abstractResponse~AbstractResponse.prototype} */
module.exports = AbstractResponse;
