'use strict';

var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');
var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');

var NotificationsRequest = AbstractRequest.extend({
    init: function (requestObj) {
        Object.defineProperties(this, {
            challengeReturnUrl: {
                enumerable: true,
                writable: true,
            },
            threeDsMethodReturnUrl: {
                enumerable: true,
                writable: true,
            },
            returnUrl: {
                enumerable: true,
                writable: true,
            },
            statusUrl: {
                enumerable: true,
                writable: true,
            },
            cancelUrl: {
                enumerable: true,
                writable: true,
            }
        });

        this._super(requestObj);
    }
});

var NotificationsResponse = AbstractResponse.extend({
    init: function (responseObj) {
        Object.defineProperties(this, {
            challengeReturnUrl: {
                enumerable: true,
                writable: true,
            },
            threeDsMethodReturnUrl: {
                enumerable: true,
                writable: true,
            }
        });

        this._super(responseObj);
    }
});

module.exports = {
    Request: NotificationsRequest,
    Response: NotificationsResponse
};
