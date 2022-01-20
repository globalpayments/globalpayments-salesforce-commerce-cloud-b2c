'use strict';

var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');
var Action = require('~/cartridge/scripts/dtos/nested/Action');
var PaymentMethod = require('~/cartridge/scripts/dtos/nested/PaymentMethod');

var RefundRequest = AbstractRequest.extend({
    init: function (requestObj) {
        Object.defineProperties(this, {
            transactionId: {
                enumerable: true,
                writable: true
            },
            amount: {
                enumerable: true,
                writable: true
            }
        });
        this._super(requestObj);
     },
    getEndpoint: function () {
        return this.prepareEndpoint(
            'transactions/:transactionId/refund',
            { transactionId: this.transactionId }
        );
    },

    getHttpMethod: function () {
        return 'POST';
    }
});

var RefundResponse = AbstractResponse.extend({
    init: function (responseObj) {
        Object.defineProperties(this, {
            type: {
                enumerable: true,
                writable: true
            },
            status: {
                enumerable: true,
                writable: true
            },
            amount: {
                enumerable: true,
                writable: true
            },
            currency: {
                enumerable: true,
                writable: true
            },
            country: {
                enumerable: true,
                writable: true
            },
            reference: {
                enumerable: true,
                writable: true
            },
            batchId: {
                enumerable: true,
                writable: true
            },
            action: AbstractResponse.getAccessorDescriptorWithConstructor(Action.Response),
            paymentMethod: AbstractResponse.getAccessorDescriptorWithConstructor(PaymentMethod.Response)
        });

        this._super(responseObj);
    }
});

module.exports = {
    Request: RefundRequest,
    Response: RefundResponse
};
