'use strict';
/**
 * @module dtos/base/AbstractBase
 */

var Logger = require('dw/system/Logger');

var Class = require('~/cartridge/scripts/util/Class').Class;

/**
 * AbstractBase class
 * Other DTO modules extend this class.
 *
 * @class AbstractBase
 * @extends module:util/Class~Class
 * @returns {module:dtos/base/AbstractBase~AbstractBase}
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
                var myflag = this.hasOwnProperty(propertyName);

                if (myflag ) {
                    if (command === 'set') {
                        this[propertyName] = methodArgs.pop();
                        return this;
                    } else {
                        return this[propertyName];
                    }
                } else {
                    errorMsg = 'No such property .' + propertyName;
                }
            }
        }

        Logger.error(errorMsg);
        throw new TypeError(errorMsg);
    }
});

AbstractBase.camelToSnakeCase = function (str) {
    return str.replace(/[A-Z]/g, function(letter) {
        return '_' + letter.toLowerCase();
    });
}

AbstractBase.snakeToCamelCase = function (str) {
    return str.replace(/([_][a-z])/g, function ($1) {
        return $1.toUpperCase()
            .replace('_', '');
    });
}

/** @type {module:dtos/base/AbstractBase~AbstractBase.prototype} */
module.exports = AbstractBase;
