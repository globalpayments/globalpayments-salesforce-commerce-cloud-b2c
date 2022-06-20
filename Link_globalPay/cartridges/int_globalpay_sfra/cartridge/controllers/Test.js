'use strict';
var server = require('server');
var URLUtils = require('dw/web/URLUtils');
var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelpers');
/**
 * GlobalPay-Authorization : The GlobalPay-Authorization endpoint invokes
 * authorization call from applepay
 * @name Base/GlobalPay-Authorization
 * @function
 * @memberof GlobalPay
 */
server.get('Show', server.middleware.https, function (req, res, next) {
  // Returning Success in the basic Auth method
    var lpmData = {
        account_name: 'transaction_processing',
        type: 'SALE',
        channel: 'CNP',
        amount: '1999',
        currency: 'EUR',
        reference: '93459c78-f3f9-427c-84df-ca0584bb55bf',
        country: 'NL',
        payment_method: {
            name: 'James Mason',
            entry_mode: 'ECOM',
            apm: {
                provider: 'ideal'
            }
        },
        notifications: {
            return_url: 'https://www.example.com/return_url',
            status_url: 'https://www.example.com/status_url'
        }
    };
    var lpmresp = globalPayHelper.paypal(lpmData);
    res.json(lpmresp);
    next();
});

module.exports = server.exports();