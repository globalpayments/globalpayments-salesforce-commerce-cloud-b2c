/* eslint-disable linebreak-style */
'use strict';
/**
 * @module dtos/base/AbstractBase
 */

var Logger = require('dw/system/Logger');

var Class = require('*/cartridge/scripts/util/class').Class;

/**
 * AbstractBase class
 * Other DTO modules extend this class.
 *
 * @class AbstractBase
 * @extends module:util/class~Class
 * @returns {module:dtos/base/abstractBase~AbstractBase}
 */
var AbstractBase = Class.extend({
    init: function () {
        Object.seal(this);
    },
    __noSuchMethod__: function (methodName, methodArgs) {
        var errorMsg = 'No such method .' + methodName + '()';
        if (methodName.length >= 4) {
            var command = methodName.slice(0, 3);
            if (command === 'set' || command === 'get') {
                var propertyName = methodName.slice(3);
                propertyName = propertyName.charAt(0).toLowerCase() + propertyName.slice(1);
                var hasOwnProperty = this.hasOwnProperty(propertyName);

                if (hasOwnProperty) {
                    if (command === 'set') {
                        this[propertyName] = methodArgs.pop();
                        return this;
                    }
                    return this[propertyName];
                }
                errorMsg = 'No such property .' + propertyName;
            }
        }

        Logger.error(errorMsg);
        throw new TypeError(errorMsg);
    }
});

AbstractBase.camelToSnakeCase = function (str) {
    return str.replace(/[A-Z]/g, function (letter) {
        return '_' + letter.toLowerCase();
    });
};

AbstractBase.snakeToCamelCase = function (str) {
    return str.replace(/([_][a-z])/g, function ($1) {
        return $1.toUpperCase()
            .replace('_', '');
    });
};
// define object values here if that should  skip the camelToSnakeCase
AbstractBase.skipReplacement = function (key) {
    var object = ['paymentToken', 'payment_token'];
    return object.indexOf(key) >= 0;
};

/** @type {module:dtos/base/abstractBase~AbstractBase.prototype} */
module.exports = AbstractBase;
