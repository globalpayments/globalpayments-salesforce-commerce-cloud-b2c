'use strict';

var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');

var createSetter = function (fieldName) {
    return function (val) {
        this.__[fieldName] = val;
    }
}

var SignedMessagesRequest = AbstractRequest.extend({
    init: function (requestObj) {
        Object.defineProperties(this, {
           
            encryptedMessage: {
                enumerable: true,
                writable: true
            },
            ephemeralPublicKey: {
                enumerable: true,
                writable: true
            },
            tag: {
                enumerable: true,
                writable: true
            }   
        });

        this._super(requestObj);
    }
});

var SignedMessagesResponse = AbstractResponse.extend({
    init: function (responseObj) {
        Object.defineProperties(this, {
            encryptedMessage: {
                enumerable: true,
                writable: true
            },
            ephemeralPublicKey: {
                enumerable: true,
                writable: true
            },
            tag: {
                enumerable: true,
                writable: true
            }
        });

        this._super(responseObj);
    }
});

module.exports = {
    Request: SignedMessagesRequest,
    Response: SignedMessagesResponse
};
