'use strict';

var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');

var createSetter = function (fieldName) {
    return function (val) {
        this.__[fieldName] = val;
    }
}

var AuthenticationRequest = AbstractRequest.extend({
    init: function (requestObj) {
        Object.defineProperties(this, {
            id: {
                enumerable: true,
                set: createSetter('id'),
                get: function (val) {
                    return String(this.__.id);
                }
            }
        });

        this._super(requestObj);
    }
});

var AuthenticationResponse = AbstractResponse.extend({
    init: function (responseObj) {
        Object.defineProperties(this, {
            id: {
                enumerable: true,
                writable: true
            }
        });

        this._super(responseObj);
    }
});

module.exports = {
    Request: AuthenticationRequest,
    Response: AuthenticationResponse
};