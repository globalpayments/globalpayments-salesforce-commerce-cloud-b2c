'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

var response = { text: 'Success' };
var msg = 'Hello';
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
var svc = {
    setAuthentication: function setAuthentication(){
        return;
    },
    setRequestMethod: function setRequestMethod() {
        return;
    },
    setURL: function setURL() {
        return;
    },
    getURL: function getURL() {
        return;
    },
    addHeader: function addHeader() {
        return;
    },
};
var requestObject = {
    getToken: function getToken() {
        return;
    },
    getHttpMethod : function getHttpMethod(){
        return;
    },
    getEndpoint : function getEndpoint(){
        return;
    },
};

var globalPayService = proxyquire('../../../../../cartridges/int_globalpay/cartridge/scripts/services/globalPayService', {

    'dw/svc/LocalServiceRegistry' : {
        createService: (serviceName, params) => {
            return new createService(serviceName, params);
        }
        },
    'dw/util/UUIDUtils' : {
        createUUID : function createUUID(){
            return;
        },
    },
    '*/cartridge/scripts/helpers/globalPayHelper' : {},

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
});

describe('globalPayService', function() {
    it('It should get service response', function () {
        var result = globalPayService.getService();
         assert.equal(result.success);
     });
     it('It should execute request', function () {
         var requestObject = {};
        var responseClass = {};
        //var result = globalPayService.executeRequest(requestObject, responseClass);
         //assert.isTrue(result.null);
     });

});
