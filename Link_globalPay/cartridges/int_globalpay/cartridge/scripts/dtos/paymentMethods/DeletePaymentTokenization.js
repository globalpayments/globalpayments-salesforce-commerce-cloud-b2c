'use strict';

var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');
var Action = require('~/cartridge/scripts/dtos/nested/Action');

var createSetter = function (fieldName) {
    return function (val) {
        this.__[fieldName] = val;
    }
}
var DeletePaymentTokenRequest = AbstractRequest.extend({
    init: function (requestObj) {
        Object.defineProperties(this, {
            // TODO add more fields as per the Model here:
            cctokenId: {
                enumerable: true,
                writable: true
            }
        });

        this._super(requestObj);
    },
    
    getEndpoint: function () {
        return this.prepareEndpoint(
            'payment-methods/:cctokenId/detokenize',
            {cctokenId: this.cctokenId }
        );
    },

    getHttpMethod: function () {
        return 'POST';
    }
});

var DeletePaymentTokenResponse = AbstractResponse.extend({
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
    Request: DeletePaymentTokenRequest,
    Response: DeletePaymentTokenResponse
};
