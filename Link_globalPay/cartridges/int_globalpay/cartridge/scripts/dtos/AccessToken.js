'use strict';

var MessageDigest = require('dw/crypto/MessageDigest');
var Encoding = require('dw/crypto/Encoding');
var Bytes = require('dw/util/Bytes');

var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');
var Scope = require('~/cartridge/scripts/dtos/nested/Scope');

var AccessTokenRequest = AbstractRequest.extend({
    init: function (requestObj) {
        Object.defineProperties(this, {
            grantType: {
                enumerable: true,
                writable: true
            },
            appId: {
                enumerable: true,
                writable: true
            },
            appKey: {
                enumerable: false,
                writable: true
            },
            nonce: {
                enumerable: true,
                writable: true
            },
            secret: {
                enumerable: true,
                set: function () {
                    throw new Error('Forbidden to set "secret" value');
                },
                get: function () {
                    var digest = new MessageDigest(MessageDigest.DIGEST_SHA_512);

                    return Encoding.toHex(digest.digestBytes(new Bytes(this.nonce + this.appKey)));
                }
            }
        });

        this._super(requestObj);
    },

    getEndpoint: function () {
        return 'accesstoken';
    },

    getHttpMethod: function () {
        return 'POST';
    }
});

var AccessTokenResponse = AbstractResponse.extend({
    init: function (responseObj) {
        Object.defineProperties(this, {
            token: {
                enumerable: true,
                writable: true
            },
            type: {
                enumerable: true,
                writable: true
            },
            appId: {
                enumerable: true,
                writable: true
            },
            scope: AbstractResponse.getAccessorDescriptorWithConstructor(Scope.Response)
        });

        this._super(responseObj);
    }
});

module.exports = {
    Request: AccessTokenRequest,
    Response: AccessTokenResponse
};
