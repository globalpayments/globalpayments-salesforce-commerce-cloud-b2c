'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();


var globalpayHelper = proxyquire('../../../../../cartridges/int_globalpay/cartridge/scripts/helpers/globalPayHelper', {
'*/cartridge/scripts/dto/authentication' : {
    Request : function(){
        return{
            setToken : function () {
                return 'token';
            },
            setAccountName : function (){
                return 'account_name';
            },
            setPaymentMethod : function (){
                return 'payment_method';
            },
            setChannel : function (){
                return 'channel';
            },
            setCountry : function (){
                return 'country';
            },
            setReference : function (){
                return 'reference';
            },
            setAmount : function () {
                return 'amount';
            },
            setCurrency : function (){
                return 'currency';
            },
            setSource : function() {
                return 'source';
            },
            setNotifications : function(){
                return 'notifications';
            },
        }

    }
},
'*/cartridge/scripts/dto/paymentMethods/paymentTokenization' : {
    Request : function(){
        return{
            setToken : function () {
                return 'token';
            },
            setusage_mode : function () {
                return 'usage_mode';
            },
            setReference : function () {
                return 'reference';
            },
            setFirst_name : function () {
                return 'first_name';
            },
            setLast_name : function () {
                return 'last_name';
            },
            setentry_mode : function () {
                return 'entry_mode';
            },
            setcard : function () {
                return 'card';
            }
        }
    }
},

'*/cartridge/scripts/dto/paymentMethods/updatePaymentTokenizationMode' : {
    Request : function(){
        return{
            setToken : function () {
                return {
                    getAccessToken : function (){
                        return 'token';
                    },
                };
            },
            setusage_mode : function () {
                return 'usage_mode';
            },
            setcctokenId : function () {
                return 'paymentInformationID';
            },
        }
    }
},

'*/cartridge/scripts/dto/paymentMethods/deletePaymentTokenization' : {
    Request : function(){
        return{
            setToken : function () {
                return 'token';
            },
            setcctokenId : function () {
                return 'id';
            },
        }
    }
},

'*/cartridge/scripts/dto/authorize' : {
    Request : function(){
        return{
            setToken : function () {
                return 'token';
            },
            setAccountName : function (){
                return 'account_name';
            },
            setChannel : function (){
                return 'channel';
            },
            setCaptureMode : function (){
                return 'capture_mode';
            },
            setType : function () {
                return 'type';
            },
            setAmount : function () {
                return 'amount';
            },
            setCurrency : function (){
                return 'currency';
            },
            setReference : function (){
                return 'reference';
            },
            setCountry : function (){
                return 'country';
            },
            setPaymentMethod : function (){
                return 'payment_method';
            },
        }
    }
},
'*/cartridge/scripts/dto/refund' : {
    Request : function(){
    return {
        setToken : function () {
            return 'token';
        },
        setTransactionId : function () {
            return 'transaction_id';
        },
        setAmount : function () {
            return 'amount';
        },
    }
}
},

'*/cartridge/scripts/dto/capture' : {
    Request : function(){
        return {
            setToken : function () {
                return 'token';
            },
            setTransactionId : function () {
                return 'transaction_id';
            },
            setAmount : function () {
                return 'amount';
            },
            setCaptureSequence : function () {
                return 'capture_sequence';
            },
            setTotalCaptureCount : function () {
                return 'total_capture_count';
            },
            setPaymentMethod : function () {
                return 'payment_method';
            },
        }
    }
},

'*/cartridge/scripts/dto/paypal' : {
    Request : function(){
        return {
            setToken : function () {
                return 'token';
            },
            setAccountName : function (){
                return 'account_name';
            },
            setChannel : function (){
                return 'channel';
            },
            setCaptureMode : function (){
                return 'capture_mode';
            },
            setType : function () {
                return 'type';
            },
            setAmount : function () {
                return 'amount';
            },
            setCurrency : function (){
                return 'currency';
            },
            setReference : function (){
                return 'reference';
            },
            setCountry : function (){
                return 'country';
            },
            setPaymentMethod : function (){
                return 'payment_method';
            },
            setNotifications : function(){
                return 'notifications';
            },
        }
    }
},

'*/cartridge/scripts/dto/googlePay' : {
    Request : function(){
        return {
            setToken : function () {
                return 'token';
            },
            setAccountName : function (){
                return 'account_name';
            },
            setChannel : function (){
                return 'channel';
            },
            setCaptureMode : function (){
                return 'capture_mode';
            },
            setType : function () {
                return 'type';
            },
            setAmount : function () {
                return 'amount';
            },
            setCurrency : function (){
                return 'currency';
            },
            setReference : function (){
                return 'reference';
            },
            setCountry : function (){
                return 'country';
            },
            setPaymentMethod : function (){
                return 'payment_method';
            },
        }
    }

},

'*/cartridge/scripts/dto/applePay' : {
    Request : function(){
        return {
            setToken : function () {
                return 'token';
            },
            setAccountName : function (){
                return 'account_name';
            },
            setChannel : function (){
                return 'channel';
            },
            setCaptureMode : function (){
                return 'capture_mode';
            },
            setType : function () {
                return 'type';
            },
            setAmount : function () {
                return 'amount';
            },
            setCurrency : function (){
                return 'currency';
            },
            setReference : function (){
                return 'reference';
            },
            setCountry : function (){
                return 'country';
            },
            setPaymentMethod : function (){
                return 'payment_method';
            },
        }
    }
},
'*/cartridge/scripts/dto/3dsStepOne' : {
    Request : function(){
        return {
            setToken : function () {
                return 'token';
            },
            setThreeDs : function () {
                return 'three_ds';
            },
            setAuthId : function () {
                return 'auth_id';
            },
            setMethodUrlCompletionStatus : function(){
                return 'method_url_completion_status';
            },
            setMerchantContactUrl : function () {
                return 'merchant_contact_url';
            },
            setOrder : function() {
                return 'order';
            },
            setPaymentMethod : function() {
                return 'payment_method';
            },
            setBrowserData : function () {
                return 'browser_data';
            },
        }
    }
},

'*/cartridge/scripts/dto/3dsStepTwo' : {
    Request : function(){
        return {
            setToken : function () {
                return 'token';
            },
            setAuthId : function () {
                return 'auth_id';
            },
        }
    }
},
'*/cartridge/scripts/dto/paypalCaptures' : {
    Request : function(){
        return {
            setToken : function () {
                return 'token';
            },
            setTransactionId : function () {
                return 'transactionId';
            },
        }
    }
},
'*/cartridge/scripts/dto/accessToken' : {
    Request : function(){
        return {
            setGrantType : function () {
                return 'SetGrantType';
            },
            setAppId : function () {
                return 'SetAppId';
            },
            setAppKey : function () {
                return 'SetAppKey';
            },
            setNonce : function () {
                return 'SetNonce';
            },
            setPermissions : function () {
                return 'permissions';
            },
        }
    }
},

'*/cartridge/scripts/services/globalPayService': {

    globalPayService : function () {
        return {
            success: true,
            response: new responseClass(serviceResult.getObject())
          };
          
    },
    executeRequest : function () {
        return 'success';
     }

},

'dw/system/CacheMgr': {
    getCache : function(){
        return {
            get : function(){
            return 'accessToken';
        }}
    }
},
'dw/system/Site':{
    getCurrent: function () {
        return { ID : 'US' }
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
}
});

describe('AccessToken', function () {
    it('Should generate the Access tocken when requested', function () {
        var result = globalpayHelper.getAccessToken();
        assert.equal(result,'accessToken');
    });
});

var data = {};

describe('authenticate', function(){
    it('Should return authentication response for the given data', function () {
    var result = globalpayHelper.authenticate(data);
    assert.equal(result,'success');
    });
});

describe('tokenize', function(){
    it('Should return tokenize response for the given data', function () {
    var result = globalpayHelper.tokenize(data);
    assert.equal(result,'success');
    });
});

describe('updateTokenUsageMode', function(){
    it('Should return updated token usage response for the given data', function () {
    var result = globalpayHelper.updateTokenUsageMode(data);
    assert.equal(result,'success');
    });
});

describe('detokenize', function(){
    it('Should detokenize the request', function () {
    var result = globalpayHelper.detokenize(data);
    assert.equal(result,'success');
    });
});

describe('authorize', function(){
    it('Should authorize the request data', function () {
    var result = globalpayHelper.authorize(data);
    assert.equal(result,'success');
    });
});

describe('refund', function(){
    it('Should authorize the request data', function () {
    var result = globalpayHelper.refund(data);
    assert.equal(result,'success');
    });
});

describe('capture', function(){
    it('should send for capture call', function () {
    var result = globalpayHelper.capture(data);
    assert.equal(result, undefined );
    });
});

describe('paypal', function(){
    it('should get response from paypal', function () {
    var result = globalpayHelper.paypal(data);
    assert.equal(result, null );
    });
});

describe('gpay', function(){
    it('should get response from gpay', function () {
    var result = globalpayHelper.gpay(data);
    assert.equal(result, null );
    });
});

describe('applePay', function(){
    it('should get response from applePay', function () {
    var result = globalpayHelper.applePay(data);
    assert.equal(result, 'success' );
    });
});

describe('threeDsStepone', function(){
    it('should get response from threeDsStepone', function () {
    var result = globalpayHelper.threeDsStepone(data);
    assert.equal(result, null );
    });
});

describe('threeDsSteptwo', function(){
    it('should get response from threeDsSteptwo', function () {
    var result = globalpayHelper.threeDsSteptwo(data);
    assert.equal(result, null );
    });
});

describe('payPalCapture', function(){
    it('should get response from payPalCapture', function () {
    var result = globalpayHelper.payPalCapture(data);
    assert.equal(result, null );
    });
});

describe('getCheckoutToken', function(){
    it('should get CheckoutToken', function () {
    var result = globalpayHelper.getCheckoutToken();
    assert.equal(result, null );
    });
});