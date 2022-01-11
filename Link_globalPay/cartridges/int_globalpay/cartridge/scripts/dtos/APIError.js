'use strict';

var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');

var APIErrorResponse = AbstractResponse.extend({
    init: function (responseObj) {
        Object.defineProperties(this, {
            errorCode: {
                enumerable: true,
                writable: true
            },
            detailedErrorCode: {
                enumerable: true,
                writable: true
            },
            detailedErrorDescription: {
                enumerable: true,
                writable: true
            }
        });

        this._super(responseObj);
    }
});

module.exports = {
    Response: APIErrorResponse
};
