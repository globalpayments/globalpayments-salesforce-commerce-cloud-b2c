/* eslint-disable linebreak-style */
'use strict';
/**
 * @module dtos/base/abstractRequest
 */

var AbstractBase = require('*/cartridge/scripts/dto/base/abstractBase');

/**
 * AbstractRequest class
 * Other DTO modules extend this class.
 *
 * @class AbstractRequest
 * @extends module:util/abstractBase~AbstractBase
 * @returns {module:dtos/base/abstractRequest~AbstractRequest}
 */
var AbstractRequest = AbstractBase.extend({
    init: function (requestObj) {
        Object.defineProperties(this, {
            __: {
                enumerable: false,
                writable: true,
                value: {}
            },
            token: {
                enumerable: true,
                writable: true
            }
        });

        if (!empty(requestObj)) {
            Object.keys(requestObj)
            .forEach(function (key) {
                this[AbstractBase.snakeToCamelCase('set_' + key)](requestObj[key]);
            }.bind(this));
        }

        this._super();
    },
    getDTO: function (indent) {
        return JSON.stringify(this, function replacer(key, value) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                var replacement = {};
                for (var k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        var response = AbstractBase.skipReplacement(key) ? k : AbstractBase.camelToSnakeCase(k);
                        replacement[response] = value[k];
                    }
                }
                return replacement;
            }
            return value;
        }, indent || 0);
    },
    prepareEndpoint: function (endpoint, params) {
        var preparedEndpoint = endpoint;

        if (!empty(params)) {
            Object.keys(params).forEach(function (key) {
                preparedEndpoint = preparedEndpoint.replace(':' + key, params[key]);
            });
        }

        return preparedEndpoint;
    }
});

/** @type {module:dtos/base/abstractRequest~AbstractRequest.prototype} */
module.exports = AbstractRequest;
