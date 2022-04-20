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
        prepareEndpoint :  function (endpoint, params ){
            this.endpoint = endpoint;
            this.params = params;
                return {
                    preparedEndpoint : 'preparedEndpoint'
                };
        },
        createService: function (serviceName, params) {
            this.serviceName = serviceName;
            this.params = params;
                this.createRequest = function (svc,params){
                this.params.setRequestMethod('POST');
                this.params.setURL();
                this.params.addHeader();
                return {
                    params: 'some string'
                };
            };
            this.parseResponse = function(svc, response){
                return 'text';
            };
            this.filterLogMessage = function (){
                return 'msg';
            };
        },
    },
        'dw/system/Site':{
            getCurrent : function(){
                return;
            }
        },

});

var endpointParams = {};
var serviceEndpoint = {};
var token = 'token';

describe('globalPayServiceCreator', function() {
    it('It should create service request', function () {
        var result = globalPayServiceCreator.createService(serviceEndpoint, token, endpointParams);
        assert.equal(result, undefined);
     });
});
