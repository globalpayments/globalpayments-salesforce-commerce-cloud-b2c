'use strict';

var MessageDigest = require('dw/crypto/MessageDigest');
var Encoding = require('dw/crypto/Encoding');
var Bytes = require('dw/util/Bytes');

function AccessTokenRequest() {
    this.grantType = null;
    this.appId = null;
    this.appKey = null;
    this.nonce = null;

    Object.defineProperty(this, 'secret', {
        enumerable: true,
        set: function () {
            throw new Error('Forbidden to set "secret" value');
        },
        get: function () {
            var digest = new MessageDigest(MessageDigest.DIGEST_SHA_512);

            return Encoding.toHex(digest.digestBytes(new Bytes(this.nonce + this.appKey)));
        }
    });

    Object.seal(this);
}

AccessTokenRequest.prototype.setGrantType = function (grantType) {
    this.grantType = grantType;
};

AccessTokenRequest.prototype.setAppId = function (appId) {
    this.appId = appId;
};

AccessTokenRequest.prototype.setAppKey = function (appKey) {
    this.appKey = appKey;
};

AccessTokenRequest.prototype.setNonce = function (nonce) {
    this.nonce = nonce;
};

AccessTokenRequest.prototype.getDTO = function () {
    return {
        app_id: this.appId,
        nonce: this.nonce,
        secret: this.secret,
        grant_type: this.grantType
    };
};

AccessTokenRequest.prototype.getEndpoint = function () {
    return 'accesstoken';
};

function AccessTokenResponse() {}

module.exports = {
    Request: AccessTokenRequest,
    Response: AccessTokenResponse
};
