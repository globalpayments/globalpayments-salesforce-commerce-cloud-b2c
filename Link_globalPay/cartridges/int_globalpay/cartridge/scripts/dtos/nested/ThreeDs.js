'use strict';

var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');
var MethodData = require('~/cartridge/scripts/dtos/nested/MethodData');
/**
 * Forms all the fields required to send for payment method request.
 * @param {obj} requestObj - object that contains fields for request to be sent.
 */
 var ThreeDsRequest = AbstractRequest.extend({
  init: function (requestObj) {
    Object.defineProperties(this, {
      // add more fields as per the Model here:
      source: {
        enumerable: true,
        writable: true
      },
      preference: {
        enumerable: true,
        writable: true
      }

    });

    this._super(requestObj);
  }
});


/**
 * Forms all the fields to be returned as part of ThreeDs response.
 * @param {obj} responseObj - object that contains response.
 */
var ThreeDsResponse = AbstractResponse.extend({
  init: function (responseObj) {
    Object.defineProperties(this, {
      // add more fields as per the Model here:
      enrolledStatus: {
        enumerable: true,
        writable: true
      },
      challengeModel: {
        enumerable: true,
        writable: true
      },
      challengeStatus: {
        enumerable: true,
        writable: true
      },
      challengeValue: {
        enumerable: true,
        writable: true
      },
      redirectUrl: {
        enumerable: true,
        writable: true
      },
      source: {
        enumerable: true,
        writable: true
      },
      preference: {
        enumerable: true,
        writable: true
      },
      acsChallengeRequestUrl: {
        enumerable: true,
        writable: true
      },
      serverTransRef: {
        enumerable: true,
        writable: true
      },
      messageVersion: {
        enumerable: true,
        writable: true
      },
      enrolledStatus: {
        enumerable: true,
        writable: true
      },
      eci: {
        enumerable: true,
        writable: true
      },
      liabilityShift: {
        enumerable: true,
        writable: true
      },
      methodUrl: {
        enumerable: true,
        writable: true
      },
      sessionDataFieldName: {
        enumerable: true,
        writable: true
      },
      messageType: {
        enumerable: true,
        writable: true
      },
      acsTransRef:{
        enumerable: true,
        writable: true
      },acsPotocolVersionStart:{
        enumerable: true,
        writable: true
      },acsProtocolVersionEnd:{
        enumerable: true,
        writable: true
      },dsProtocolVersionStart:{
        enumerable: true,
        writable: true
      },dsProtocolVersionEnd:{
        enumerable: true,
        writable: true
      },authenticationSource:{
        enumerable: true,
        writable: true
      },messageCategory:{
        enumerable: true,
        writable: true
      },cardholderResponseInfo:{
        enumerable: true,
        writable: true
      },dsTransRef:{
        enumerable: true,
        writable: true
      },status:{
        enumerable: true,
        writable: true
      },statusReason:{
        enumerable: true,
        writable: true
      },

      methodData:AbstractResponse.getAccessorDescriptorWithConstructor(MethodData.Response)
    });

    this._super(responseObj);
  }
});

module.exports = {
  Request: ThreeDsRequest,
  Response: ThreeDsResponse
};