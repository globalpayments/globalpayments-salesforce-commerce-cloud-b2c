/* eslint-disable linebreak-style */
'use strict';

var AbstractRequest = require('*/cartridge/scripts/dto/base/abstractRequest');
var AbstractResponse = require('*/cartridge/scripts/dto/base/abstractResponse');
var Action = require('*/cartridge/scripts/dto/nested/action');

/**
 * Forms all the fields required to send for PaymentToken request.
 * @param {obj} requestObj - object that contains fields for request to be sent.
 */
var PaymentTokenRequest = AbstractRequest.extend({
    init: function (requestObj) {
        Object.defineProperties(this, {
            // add more fields as per the Model here:
            usage_mode: {
                enumerable: true,
                writable: true
            },
            cctokenId: {
                enumerable: true,
                writable: true
            }
        });

        this._super(requestObj);
    },
    getEndpoint: function () {
        return this.prepareEndpoint(
            'payment-methods/:cctokenId',
            {cctokenId: this.cctokenId}
        );
    },
    getHttpMethod: function () {
        return 'PATCH';
    }
});
/**
 * Forms all fields to be Returned as part of DigitalWallet response.
 * @param {obj} responseObj - object that contains fields from response.
 */
var PaymentTokenResponse = AbstractResponse.extend({
    init: function (responseObj) {
        Object.defineProperties(this, {
            id: {
                enumerable: true,
                writable: true
            },
            status: {
                enumerable: true,
                writable: true
            },
            action: AbstractResponse.getAccessorDescriptorWithConstructor(Action.Response)
        });

        this._super(responseObj);
    }
});
module.exports = {
    Request: PaymentTokenRequest,
    Response: PaymentTokenResponse
};
