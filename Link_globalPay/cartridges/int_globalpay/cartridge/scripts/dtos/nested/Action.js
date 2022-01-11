'use strict';

var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');

var ActionResponse = AbstractResponse.extend({
    init: function (responseObj) {
        Object.defineProperties(this, {
            id: {
                enumerable: true,
                writable: true
            },
            timeCreated: {
                enumerable: true,
                writable: true
            },
            type: {
                enumerable: true,
                writable: true
            },
            resultCode: {
                enumerable: true,
                writable: true
            }
        });

        this._super(responseObj);
    }
});

module.exports = {
    Response: ActionResponse
};
