'use strict';

var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');

var ScopeResponse = AbstractResponse.extend({
    init: function (responseObj) {
        Object.defineProperties(this, {
            merchantId: {
                enumerable: true,
                writable: true
            },
            merchantName: {
                enumerable: true,
                writable: true
            },
            accounts: {
                enumerable: true,
                writable: true
            }
        });

        this._super(responseObj);
    }
});

module.exports = {
    Response: ScopeResponse
};
