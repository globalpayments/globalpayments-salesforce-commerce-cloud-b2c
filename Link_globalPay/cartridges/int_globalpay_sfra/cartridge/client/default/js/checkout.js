/* eslint-disable no-undef */
'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
  processInclude(require('./checkout/checkout'));
  if (window.dw &&
        window.dw.applepay &&
        window.ApplePaySession &&
        window.ApplePaySession.canMakePayments()) {
    $('body').addClass('apple-pay-enabled');
  }
});
