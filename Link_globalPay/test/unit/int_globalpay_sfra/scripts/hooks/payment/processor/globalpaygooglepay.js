'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var gpay = sinon.stub();

var paymentInstrument = {
    creditCardNumberLastDigits: '1111',
    creditCardHolder: 'The Muffin Man',
    creditCardExpirationYear: 2018,
    creditCardType: 'Visa',
    maskedCreditCardNumber: '************1111',
    paymentMethod: 'CREDIT_CARD',
    creditCardExpirationMonth: 1,
    paymentTransaction: {
        amount: {
            value: 1000
        }
    }
};
var paymentProcessor = {};
var order = {
    totalGrossPrice: 10.00,
    currencyCode: 'US',
    orderNo: '12345',
    customerName: 'test_user'
};

describe('google pay', function () {
    var orderNumber = '12345';
    var gpconst = proxyquire('../../../../../../../cartridges/int_globalpay/cartridge/scripts/constants/globalpayConstant', {});
    var googlepayProcessor = proxyquire('../../../../../../../cartridges/int_globalpay_sfra/cartridge/scripts/hooks/payment/processor/globalpaygooglepay', {
        '*/cartridge/scripts/util/collections': {},
        '*/cartridge/scripts/util/paymentInstrumentUtil':{},
        'dw/web/Resource': {
            msg: function (param) {
                return param;
            }
        },
        'dw/system/Transaction': {
            wrap: function (arg) { arg(); }
        },
        'server': {
            forms: {
                getForm: function () {
                    return {
                        creditCardFields: {
                            paymentToken: {
                                htmlValue: JSON.stringify('token')
                            }
                        }
                    };
                }
            }
        },
        'dw/util/StringUtils': {},
        '*/cartridge/scripts/constants/globalpayConstant': gpconst,
        'dw/util/Locale': {
            getLocale: function (param) {
                return param;
            }
        },
        'dw/system/Site': {
            getCurrent: function () {
                return { defaultLocale: 'US' }
            }
        },
        '*/cartridge/scripts/helpers/globalPayPreferences': {
            getPreferences: function () {
                return {
                    appId: 'gp_app_id',
                    appKey: 'gp_app_key',
                    apiVersion: 'gp_api_version',
                    grantType: 'gp_grant_type',
                    enableGooglepay: 'gp_enable_googlepay',
                    enableApplepay: 'gp_enable_applepay',
                    enablePaypal: 'gp_enable_paypal',
                    captureMode: 'gp_captureMode',
                    clientId: 'gp_clientID',
                    env: 'gp_env',
                    threedsecureChallenge: 'gp_threedsecure_challengenotification', // http://testing.test/wc-api/globalpayments_threedsecure_challengenotification/
                    threedsecureMethod: 'gp_threedsecure_methodnotification', // http://testing.test/wc-api/globalpayments_threedsecure_methodnotification/
                    gpayMerchantId: 'gp_gpayMerchantId',
                    gpayMerchantName: 'gp_gpayMerchantName',
                    gpayEnv: 'gp_gpayEnv',
                    gatewayMerchantId: 'gp_gatewayMerchantId'
                }
            }
        },
        '*/cartridge/scripts/helpers/globalPayHelper': { gpay: gpay },
        '*/cartridge/scripts/services/globalPayService': {}
    });
    describe('Authorize', function () {
        it('Should process the google pay with succes result', function () {
            gpay.returns(
                {
                    success: true,
                    status: 'AUTHORIZED',
                }
            )
            var result = googlepayProcessor.Authorize(orderNumber, paymentInstrument, paymentProcessor, order);
            var googlePayresp = result.googlePayresp;
            assert.isTrue(googlePayresp.success);

            assert.equal(googlePayresp.status, 'AUTHORIZED');
        });
        it('Should return error message for invalid amount with declined card', function () {
            order = {
                totalGrossPrice: 11.00,
                currencyCode: 'US',
                orderNo: '12345',
                customerName: 'test_user'
            };
            gpay.returns(
                {
                    success: true,
                    status: 'DECLINED',
                }
            )
            var result = googlepayProcessor.Authorize(orderNumber, paymentInstrument, paymentProcessor, order);
            var googlePayresp = result.googlePayresp;
            assert.isTrue(googlePayresp.success);

            assert.equal(googlePayresp.status, 'DECLINED');
        });

    });

});

