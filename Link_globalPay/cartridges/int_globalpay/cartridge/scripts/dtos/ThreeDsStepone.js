'use strict';

var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');
var ThreeDs = require('~/cartridge/scripts/dtos/nested/ThreeDs');
var Order = require('~/cartridge/scripts/dtos/nested/Order');
var PaymentMethod = require('~/cartridge/scripts/dtos/nested/PaymentMethod');
var BrowserData = require('~/cartridge/scripts/dtos/nested/BrowserData');
var Payer = require('~/cartridge/scripts/dtos/nested/Payer');
var PayerPriorThreeDsAuthenticationData = require('~/cartridge/scripts/dtos/nested/PayerPriorThreeDsAuthenticationData');
var RecurringAuthorizationData = require('~/cartridge/scripts/dtos/nested/RecurringAuthorizationData');
var PayerLoginData = require('~/cartridge/scripts/dtos/nested/PayerLoginData');
var WorkPhone = require('~/cartridge/scripts/dtos/nested/WorkPhone');
/**
 * Forms all the fields required to send for Authentication request.
 * @param {obj} requestObj - object that contains fields for request to be sent.
 */
 var ThreeDsSteponeRequest = AbstractRequest.extend({
    init: function (requestObj) {
        Object.defineProperties(this, {
            threeDs: AbstractResponse.getAccessorDescriptorWithConstructor(ThreeDs.Request),
            methodUrlCompletionStatus: {
                enumerable: true,
                writable: true
              },
              authId: {
                enumerable: true,
                writable: true
              },
              merchantContactUrl: {
                enumerable: true,
                writable: true
              },
              order : AbstractResponse.getAccessorDescriptorWithConstructor(Order.Request),
             // payer : AbstractResponse.getAccessorDescriptorWithConstructor(Payer.Request),
              //payerPriorThreeDsAuthenticationData : AbstractResponse.getAccessorDescriptorWithConstructor(PayerPriorThreeDsAuthenticationData.Request),
              //recurringAuthorizationData : AbstractResponse.getAccessorDescriptorWithConstructor(RecurringAuthorizationData.Request),
              //payerLoginData : AbstractResponse.getAccessorDescriptorWithConstructor(PayerLoginData.Request),
              paymentMethod: AbstractResponse.getAccessorDescriptorWithConstructor(PaymentMethod.Request),
              browserData: AbstractResponse.getAccessorDescriptorWithConstructor(BrowserData.Request),

        });

        this._super(requestObj);
    },
    getEndpoint: function () {
        return this.prepareEndpoint(
                'authentications/:authId/initiate',
                { authId: this.authId }
            );
        },
    getHttpMethod: function () {
        return 'POST';
    }
});

/**
 * Forms all the fields to be returned as part of Authentication response.
 * @param {obj} responseObj - object that contains fields from response.
 */
 
/**
 * Forms all the fields to be returned as part of Authentication response.
 * @param {obj} responseObj - object that contains fields from response.
 */
var ThreeDsSteponeResponse = AbstractResponse.extend({
    init: function (responseObj) {
        Object.defineProperties(this, {
            id: {
                enumerable: true,
                writable: true
              },
              timeCreated: {
                enumerable: true,
                writable: true
              },
              time_last_updated: {
                enumerable: true,
                writable: true
              },
              transactionType: {
                enumerable: true,
                writable: true
              },
              status: {
                enumerable: true,
                writable: true
              }, messageCategory:{
                enumerable: true,
                writable: true
              },
              threeDs: AbstractResponse.getAccessorDescriptorWithConstructor(ThreeDs.Response),
             });

        this._super(responseObj);
    }
});
module.exports = {
    Request: ThreeDsSteponeRequest,
    Response: ThreeDsSteponeResponse
};