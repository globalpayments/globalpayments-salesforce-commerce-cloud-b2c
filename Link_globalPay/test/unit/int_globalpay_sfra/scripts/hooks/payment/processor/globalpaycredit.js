'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var ArrayList = require('../../../../../../mocks/dw.util.Collection');
var paymentInstrument = {
    creditCardNumberLastDigits: '1111',
    creditCardHolder: 'The Muffin Man',
    creditCardExpirationYear: 2018,
    creditCardType: 'Visa',
    maskedCreditCardNumber: '************1111',
    paymentMethod: 'CREDIT_CARD',
    creditCardExpirationMonth: 1,
    raw:{
        creditCardToken:'token'
    },
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
    },
        setCreditCardHolder(param){
        return param;
        },
        setCreditCardType(){},
        setCreditCardExpirationMonth(){},
        setCreditCardNumber(){},
        setCreditCardExpirationYear(){},
        setCreditCardToken(){}
};
var basket = {
    billingAddress:{
        fullName:'someName'
    },
    allProductLineItems: new ArrayList([{
        bonusProductLineItem: false,
        gift: false,
        UUID: 'some UUID',
        adjustedPrice: {
            value: 'some value',
            currencyCode: 'US'
        },
        quantity: {
            value: 1
        }
    }])
};
var paymentProcessor = {};
var order = {
    totalGrossPrice: 10.00,
    currencyCode: 'US',
    orderNo: '12345',
    customerName: 'test_user'
};
var paymentform={
    paymentMethod: {
        value: 'some value'
    },
    paymentId:{value:'some ID'
    },
    creditCardFields:{
        cardType: {
            value: 'some card type value',
            htmlName: 'some card type html name'
        },
        cardNumber: {
            value: 'some card number value',
            htmlName: 'some card number html name'
        },
        securityCode: {
            value: 'some card cvv value',
            htmlName: 'some card cvv html name'
        },
        expirationMonth: {
            selectedOption: '10',
            htmlName: 'some card expiration month html name'
        },
        expirationYear: {
            value: '2018',
            htmlName: 'some card expiration year html name'
        },
        email: {
            value: 'some email value'
        },
        phone: {
            value: 'some phone value'
        },
        saveCard: {
            checked: null
        }
    }
}
var formdata = {
    paymentMethod: {
        value: 'some value'
    },
    paymentId:{value:'some ID'
    },
    name:"some Name",
        cardType: {
            value: 'some card type value',
            htmlName: 'some card type html name'
        },
        cardOwner:{
            value: 'card Owner name',
            htmlName: 'card Owner name'
        },
        cardNumber: {
            value: 'some card number value',
            htmlName: 'some card number html name'
        },
        securityCode: {
            value: 'some card cvv value',
            htmlName: 'some card cvv html name'
        },
        expirationMonth: {
            selectedOption: '10',
            htmlName: 'some card expiration month html name'
        },
        expirationYear: {
            value: '2018',
            htmlName: 'some card expiration year html name'
        },
        email: {
            value: 'some email value'
        },
        phone: {
            value: 'some phone value'
        },
        saveCard: {
            checked: null
        },
        isthreeds:{
        value:false
        },
        authId:{
            value:"someID"
        }
};
var req = {
    currentCustomer: {
       wallet:{ 
           paymentInstruments:{forEach (param){
            return param;
            }
           }
        },
        profile: {
            email: 'abc@test.com'
        },
        raw:
        {
            authenticated:true,
            registered:true
        },
        addressBook: {
            preferredAddress: {
                address1: '5 Wall St.'
            }
        }
    },
    form:{
        storedPaymentUUID:'someUUID'
    }
};
var billingData={

}

describe('creditcard', function () {
    var orderNumber = '12345';
    var gpconst = proxyquire('../../../../../../../cartridges/int_globalpay/cartridge/scripts/constants/globalPayConstant', {});

    var creditCardProcessor = proxyquire('../../../../../../../cartridges/int_globalpay_sfra/cartridge/scripts/hooks/payment/processor/gp_credit', {
        '*/cartridge/scripts/util/collections': {},
        'dw/order/PaymentMgr': {},
        '*/cartridge/scripts/checkout/checkoutHelpers':{
            savePaymentInstrumentToWallet: function (param) {
                return param;
            }
        },
        'dw/order/PaymentInstrumentreedsstepone':{},
        '*/cartridge/scripts/util/array':{
            find:function(param)
            {
                return paymentInstrument;
            }
        },
        'dw/order/PaymentInstrument':{},
        'dw/order/PaymentStatusCodes':{},
        '*/cartridge/scripts/util/paymentInstrumentUtils':
        {
            removeExistingPaymentInstruments:function(param)
            {
                return  paymentInstrument ;
            }
        },
        'dw/customer/CustomerMgr':{},
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
        '*/cartridge/scripts/constants/globalPayConstant': gpconst,
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
        '*/cartridge/scripts/helpers/globalPayHelpers': {
            authorize: function () {
                return {
                    success: true,
                    status: 'AUTHORIZED',
                    id:'12345'
                }
            },
            updateTokenUsageMode:function(param)
            {
               return {id:'token',
               success: true}
            },
            tokenize:function(param)
            {
                return {id:'token'}
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
    describe('processForm', function () {
        it('Should processForm', function () {
           var  viewFormData={
           }
            var result = creditCardProcessor.processForm(req, paymentform, viewFormData);
            assert.isFalse(result.error);
        });


    });
    describe('savePaymentInformation', function () {
        it('Should create and return token', function () {
            var result = creditCardProcessor.savePaymentInformation(req, basket, billingData);           
        });
    });
    
    describe('Handle', function () {
        it('Should update payment methods', function () {
            var paymentMethodID='id';
            var result = creditCardProcessor.Handle(basket, formdata, paymentMethodID, req);
            assert.isFalse(result.error);
        });
    });
    describe('CreateToken', function () {
        it('Should create and return token', function () {
            var result = creditCardProcessor.createToken1(formdata);           
            assert.equal(result, null);
        });
    });

    describe('updateToken', function () {
        it('Should return creditcard token', function () {
            var paymentTokenID="token";
            var result = creditCardProcessor.updateToken(paymentTokenID);
            assert.equal(result, 'token');
        });
    });
    
});
