'use strict';

var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');

/**
 * Forms all the fields required to send for Authentication request.
 * @param {obj} requestObj - object that contains fields for request to be sent.
 */
 var ThreeDsSteptwoRequest = AbstractRequest.extend({
        init: function (requestObj) {
            Object.defineProperties(this, {
                authId: {
                    enumerable: true,
                    writable: true
                }
            });
            this._super(requestObj);
        },
        getEndpoint: function () {
            return this.prepareEndpoint(
                    'authentications/:authId/result',
                    { authId: this.authId }
                );
            },
        getHttpMethod: function () {
            return 'POST';
        }
});


/**
 * Forms all the fields to be returned as part of Authentication response.
 * @param {obj} responseObj - object that contains fields from response.
 */
 var ThreeDsSteptwoResponse = AbstractResponse.extend({
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
    Request: ThreeDsSteptwoRequest,
    Response: ThreeDsSteptwoResponse
};