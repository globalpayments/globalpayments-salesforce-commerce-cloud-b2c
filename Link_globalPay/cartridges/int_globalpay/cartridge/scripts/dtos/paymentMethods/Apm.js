'use strict';

var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');

var createSetter = function (fieldName) {
    return function (val) {
        this.__[fieldName] = val;
    }
}

var ApmRequest = AbstractRequest.extend({
    init: function (requestObj) {
        Object.defineProperties(this, {
            provider: {
                enumerable: true,
                set: createSetter('provider'),
                get: function (val) {
                    return String(this.__.provider);
                }
            }
        });

        this._super(requestObj);
    }
});

var ApmResponse = AbstractResponse.extend({
    init: function (responseObj) {
        Object.defineProperties(this, {
            provider: {
                enumerable: true,
                writable: true
            },
            providerRedirectUrl: {
                enumerable: true,
                writable: true
            },
            ack: {
                enumerable: true,
                writable: true
            },
             provider_redirect_url: {
                enumerable: true,
                writable: true
            },
            provider: {
                enumerable: true,
                writable: true
            },
            session_token: {
                enumerable: true,
                writable: true
            },
            correlation_reference: {
                enumerable: true,
                writable: true
            },
            version_reference: {
                enumerable: true,
                writable: true
            }

        });

        this._super(responseObj);
    }
});

module.exports = {
    Request: ApmRequest,
    Response: ApmResponse
};