var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var SERVICE_NAME = 'GlobalPay';
var ENDPOINT_ACCESS_TOKEN = 'accesstoken';
var ENDPOINT_AUTHENTICATION = 'authentications';
var ENDPOINT_TRANSACTION = 'transactions';
var ENDPOINT_CAPTURE = 'transactions/:transactionId/capture';
var ENDPOINT_PAYMENT_METHOD = 'payment_methods';
var ENDPOINT_INITIATE = 'authentications/:authId/initiate';

var globalPayServiceCreator = proxyquire('../../../../../cartridges/int_globalpay/cartridge/scripts/services/globalPayServiceCreator', {
    'dw/svc/LocalServiceRegistry' : {
        createService: (serviceName, params) => {
            return new createService(serviceName, params);
        }
        },
        'dw/system/Site':{
            getCurrent : function(){
                return;
            }
        },

});
function createService(serviceName, params) {
    this.serviceName = serviceName;
    this.params = params;
    this.call = function () {
        this.params.createRequest(svc,requestObject);
        this.params.parseResponse(svc, response);
        this.params.filterLogMessage(msg);
        return {
            ok: true,
            status: 'OK',
            object: 'some string'
        };
    };
}

describe('globalPayServiceCreator', function() {
    it('It should create service request', function () {
        var result = globalPayServiceCreator.createService();
         assert.equal(result.success);
     });
});
