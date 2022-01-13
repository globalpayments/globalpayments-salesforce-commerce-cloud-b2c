'use strict';

var server = require('server');

server.get('Show', function (req, res, next) {
    var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelper');

    var authenticationData = {
        account_name: 'transaction_processing',
        channel: 'CNP',
        country: 'US',
        reference: '93459c79-f3f9-427d-84d9-ca0584bb55bf',
        amount: '10.5',
        currency: 'USD1',
        source: 'BROWSER',
        payment_method: {
            "id": "PMT_6665692a-8853-441a-a0bb-6c3348a9b7c6"
        },
        notifications: {
            challenge_return_url: 'http://testing.test/wc-api/globalpayments_threedsecure_challengenotification/',
            three_ds_method_return_url: 'http://testing.test/wc-api/globalpayments_threedsecure_methodnotification/'
        }
    };
    var authenticationTest = globalPayHelper.authenticate(authenticationData);
    var authorizationData = {
        account_name: 'transaction_processing',
        channel: 'CNP',
        capture_mode: 'LATER',
        type: 'SALE',
        amount: '5000',
        currency: 'USD',
        reference: '93459c79-f3f9-427d-84df-ca0584bb55bf',
        country: 'US',
        payment_method: {
            id: "PMT_8f934092-b57f-4a3b-acd9-e994ee21a610",
            entry_mode :'ECOM',
            authentication: {
                 id: ''
             }
        }
    }

    var captureData = {
        transaction_id: 'TRN_t0cywQPpPAzFpiz5ZGskKtWIsfuHWE_ca0584bb55bf',
        amount: '5000',
        capture_sequence: 'FIRST',
        total_capture_count: 0,
        payment_method: {
            card: {
                tag: 'string'
            }
        }
    }

    var paypalData = {
        account_name: "transaction_processing",
        channel: "CNP",
        capture_mode:"AUTO",
        type: "SALE",
        amount: "2000",
        currency: "USD",
        reference: "93459c79-f3f9-487c-84df-ca0584bb55bf",
        country: "US",
        payment_method: {
            name: "Doe",
            entry_mode: "ECOM",
            apm: {
                provider: "paypal"
            }
        },
        notifications: {
            return_url: "http://testing.test/return",
            status_url: "http://testing.test/status",
            cancel_url: "http://testing.test/cancel"
        }
    }

    res.json({
        // token: globalPayHelper.getAccessToken()
        //authenticationsReq:  authenticationData,
        authentication: globalPayHelper.authenticate(authenticationData)
        //authReq:authorizationData,
        //authorization: globalPayHelper.authorize(authorizationData)
        //capture: globalPayHelper.capture(captureData)
       // paypal : globalPayHelper.paypal(paypalData)
    });
    next();
});

module.exports = server.exports();
