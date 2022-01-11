'use strict';

var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');

var ThreeDsResponse = AbstractResponse.extend({
    init: function (responseObj) {
        Object.defineProperties(this, {
            enrolledStatus: {
                enumerable: true,
                writable: true
            },
            challengeModel: {
                enumerable: true,
                writable: true
            },
            challengeStatus: {
                enumerable: true,
                writable: true
            },
            challengeValue: {
                enumerable: true,
                writable: true
            },
            redirectUrl: {
                enumerable: true,
                writable: true
            }
        });

        this._super(responseObj);
    }
});

module.exports = {
    Response: ThreeDsResponse
};
