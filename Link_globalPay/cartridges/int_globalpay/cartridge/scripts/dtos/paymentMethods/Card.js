'use strict';

var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');

var createSetter = function (fieldName) {
    return function (val) {
        this.__[fieldName] = val;
    }
}

var CardRequest = AbstractRequest.extend({
    init: function (requestObj) {
        Object.defineProperties(this, {
            // TODO add more fields as per the Model here:
            number: {
                enumerable: true,
                set: createSetter('number'),
                get: function (val) {
                    return String(this.__.number);
                }
            },
            expiryMonth: {
                enumerable: true,
                set: createSetter('expiryMonth'),
                get: function (val) {
                    return String(this.__.expiryMonth);
                }
            },
            expiryYear: {
                enumerable: true,
                set: createSetter('expiryYear'),
                get: function (val) {
                    return String(this.__.expiryYear);
                }
            },
            cvv: {
                enumerable: true,
                writable: true
            },
            avsAddress: {
                enumerable: true,
                writable: true
            },
            avsPostalCode: {
                enumerable: true,
                writable: true
            },
            tag: {
                enumerable: true,
                writable: true
            }
            // TODO add more here later
        });

        this._super(requestObj);
    }
});

var CardResponse = AbstractResponse.extend({
    init: function (responseObj) {
        Object.defineProperties(this, {
            brand: {
                enumerable: true,
                writable: true
            },
            maskedNumberLast4: {
                enumerable: true,
                writable: true
            },
            authcode: {
                enumerable: true,
                writable: true
            },
            brandReference: {
                enumerable: true,
                writable: true
            },
            brandTimeCreated: {
                enumerable: true,
                writable: true
            },
            cvvResult: {
                enumerable: true,
                writable: true
            },
            avsAddressResult: {
                enumerable: true,
                writable: true
            },
            avsPostalCodeResult: {
                enumerable: true,
                writable: true
            },
            avsAction: {
                enumerable: true,
                writable: true
            },
            tagResponse: {
                enumerable: true,
                writable: true
            }
        });

        this._super(responseObj);
    }
});

module.exports = {
    Request: CardRequest,
    Response: CardResponse
};
