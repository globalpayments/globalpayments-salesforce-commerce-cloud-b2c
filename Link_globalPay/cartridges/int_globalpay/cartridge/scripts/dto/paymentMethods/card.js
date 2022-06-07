/* eslint-disable linebreak-style */
'use strict';

var AbstractRequest = require('*/cartridge/scripts/dto/base/abstractRequest');
var AbstractResponse = require('*/cartridge/scripts/dto/base/abstractResponse');

var createSetter = function (fieldName) {
    return function (val) {
        this.__[fieldName] = val;
    };
};
/**
 * Forms all the fields required to send for card request.
 * @param {obj} requestObj - object that contains fields for request to be sent.
 */
var CardRequest = AbstractRequest.extend({
    init: function (requestObj) {
        Object.defineProperties(this, {
            // Add more fields as per the Model here:
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
            // Add more here later
        });

        this._super(requestObj);
    }
});
/**
 * Forms all fields to be Returned as part of card response.
 * @param {obj} responseObj - object that contains fields from response.
 */
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
      // Add more fields as per the Model here:
        });

        this._super(responseObj);
    }
});

module.exports = {
    Request: CardRequest,
    Response: CardResponse
};
