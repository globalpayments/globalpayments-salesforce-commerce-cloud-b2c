'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

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
            value: 0
        }
    },
    custom:{
gp_paymentmethodid: '11'
    },
    paymentTransaction:{
        setTransactionID(){
            '12345'
        },
        setPaymentProcessor(){}
    }
};
var paymentProcessor = {};
var order = {
    totalGrossPrice: 10.00,
    currencyCode: 'US',
    orderNo: '12345',
    customerName: 'test_user'
};


describe('creditcard', function () {
    var orderNumber = '12345';
    var gpconst = proxyquire('../../../../../../../cartridges/int_globalpay/cartridge/scripts/constants/globalpayconstants', {});

    var creditCardProcessor = proxyquire('../../../../../../../cartridges/int_globalpay_sfra/cartridge/scripts/hooks/payment/processor/globalpaycredit', {
        '*/cartridge/scripts/util/collections': {},
        'dw/order/PaymentMgr': {},
        '*/cartridge/scripts/checkout/checkoutHelpers':{
            savePaymentInstrumentToWallet: function (param) {
                return param;
            }
        },
        'dw/order/PaymentInstrument':{},
        'dw/order/PaymentStatusCodes':{},
        '*/cartridge/scripts/util/PaymentInstrumentUtils':
        {},
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
                                htmlValue: 'token'
                            }
                        }
                    };
                }
            }
        },
        'dw/util/StringUtils': {},
        '*/cartridge/scripts/constants/globalpayconstants': gpconst,
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
                    gatewayMerchantId: 'gp_gatewayMerchantId',
                    gp_paymentmethodid:'gp_paymentmethodid'
                };
            }
        },
        '*/cartridge/scripts/helpers/globalPayHelper': {
            authorize: function () {
                return {
                    success: true,
                    status: 'AUTHORIZED',
                    id:'12345'
                }
            }
        },
        '*/cartridge/scripts/services/globalPayService': {}
    });
    describe('Authorize', function () {
        it('Should process the creditcard with success result', function () {
            var result = creditCardProcessor.Authorize(orderNumber, paymentInstrument, paymentProcessor, order);
            var authorization = result.error;
            assert.isFalse(result.error);
        });


    });
});
