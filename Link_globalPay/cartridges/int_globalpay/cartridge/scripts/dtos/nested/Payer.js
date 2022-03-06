'use strict';

var AbstractRequest = require('~/cartridge/scripts/dtos/base/AbstractRequest');
var AbstractResponse = require('~/cartridge/scripts/dtos/base/AbstractResponse');
var HomePhone = require('~/cartridge/scripts/dtos/nested/HomePhone');
var WorkPhone = require('~/cartridge/scripts/dtos/nested/WorkPhone');
var PayerRequest = AbstractRequest.extend({
    init: function (requestObj) {
      Object.defineProperties(this, {
        // add more fields as per the Model here:
        reference: {
          enumerable: true,
          writable: true
        },
        accountAge: {
          enumerable: true,
          writable: true
        },
        accountCreationDate: {
          enumerable: true,
          writable: true
        },accountChangeDate: {
            enumerable: true,
            writable: true
          },accountChangeIndicator: {
            enumerable: true,
            writable: true
          },accountPasswordChangeDate: {
            enumerable: true,
            writable: true
          },accountPasswordChangeIndicator: {
            enumerable: true,
            writable: true
          },
          homePhone : AbstractResponse.getAccessorDescriptorWithConstructor(HomePhone.Request),
          workPhone : AbstractResponse.getAccessorDescriptorWithConstructor(WorkPhone.Request),
          paymentAccountCreationDate: {
            enumerable: true,
            writable: true
          },paymentAccountAgeIndicator: {
            enumerable: true,
            writable: true
          },suspiciousAccountActivity: {
            enumerable: true,
            writable: true
          },purchases_last_6months_count: {
            enumerable: true,
            writable: true
          },transactionsLast24hoursCount: {
            enumerable: true,
            writable: true
          },transactionLastYearCount: {
            enumerable: true,
            writable: true
          },provisionAttemptLast24hoursCount: {
            enumerable: true,
            writable: true
          },shippingAddressTimeCreatedReference: {
            enumerable: true,
            writable: true
          },shippingAddressCreationIndicator: {
            enumerable: true,
            writable: true
          },
      });  
      this._super(requestObj);
    }
  });
  
  module.exports = {
    Request: PayerRequest
  };
