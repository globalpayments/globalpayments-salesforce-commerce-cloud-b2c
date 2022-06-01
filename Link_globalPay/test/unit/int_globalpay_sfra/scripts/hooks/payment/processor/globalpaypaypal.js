'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var paypal = sinon.stub();
var paymentInstrument = {
    creditCardNumberLastDigits: '1111',
    creditCardHolder: 'The Muffin Man',
    creditCardExpirationYear: 2018,
    creditCardType: 'Visa',
    maskedCreditCardNumber: '************1111',
    paymentMethod: 'CREDIT_CARD',
    creditCardExpirationMonth: 1,
    custom:{
        gp_transactionid:''
    },
    paymentTransaction: {
        amount: {
            value: 0
        },
        setTransactionID(){
            '12345'
        },
        setPaymentProcessor(){} 
    }
};
var paymentProcessor = paymentInstrument;
var order = {
    totalGrossPrice: 10.00,
    currencyCode: 'US',
    orderNo: '12345',
    customerName: 'test_user'
};

describe('paypal', function () {
    var orderNumber = '12345';
    var gpconst = proxyquire('../../../../../../../cartridges/int_globalpay/cartridge/scripts/constants/globalpayconstants', {});

    var paypalProcessor = proxyquire('../../../../../../../cartridges/int_globalpay_sfra/cartridge/scripts/hooks/payment/processor/globalpaypaypal', {
        '*/cartridge/scripts/util/collections': {},
        '*/cartridge/scripts/util/PaymentInstrumentUtils':{},
        'dw/order/PaymentInstrument': {},
        'dw/order/PaymentMgr': {},
        'dw/order/PaymentStatusCodes': {},
        'dw/web/URLUtils': {
            https: function (param) {
                return param;
            }
        },
        'dw/system/HookMgr': {},
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
                    gatewayMerchantId: 'gp_gatewayMerchantId'
                };
            }
        },
        '*/cartridge/scripts/helpers/globalPayHelper': {
            paypal:paypal 
        },
        '*/cartridge/scripts/services/globalPayService': {}
    });
    describe('Authorize', function () {
        it('Should process the paypal with success result', function () {
            paypal.returns(
                {
                    success: true,
                    status: 'AUTHORIZED',
                    id:"AUT_id"
                }
            )
            var result = paypalProcessor.Authorize(orderNumber, paymentInstrument, paymentProcessor, order);
            var paypalresp = result.paypalresp;
            assert.isTrue(paypalresp.success);
            assert.equal(paypalresp.status, 'AUTHORIZED');
        });
        it('Should process the paypal with error result', function () {
            paypal.returns(
                {
                    success: false,
                    status: 'NOT_AUTHORIZED',
                    error:{detailedErrorDescription:"some error"}
                }
            )
            var result = paypalProcessor.Authorize(orderNumber, paymentInstrument, paymentProcessor, order);
            var paypalresp = result.paypalresp;
            assert.isTrue(result.error);
            assert.isFalse(paypalresp.success);
            assert.equal(paypalresp.status, 'NOT_AUTHORIZED');
        });

    });
});
