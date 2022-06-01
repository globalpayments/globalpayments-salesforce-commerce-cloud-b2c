/* eslint-disable no-undef */
'use strict';
var formHelpers = require('base/checkout/formErrors');
var scrollAnimate = require('base/components/scrollAnimate');
var threeDFormRedirection = function (data) {
  var redirect = $('<form>')
          .appendTo(document.body)
          .attr({
            method: 'POST',
            action: data.authenticationData.threeDRedirectUrl
          });
  $('<input>')
          .appendTo(redirect)
          .attr({
            name: 'PaReq',
            value: $('#paReq').val()
          });

  $('<input>')
          .appendTo(redirect)
          .attr({
            name: 'acsUrl',
            value: $('#acsUrl').val()
          });
  $('<input>')
          .appendTo(redirect)
          .attr({
            name: 'MD',
            value: $('#authId').val()
          });
  redirect.submit();
};

var submitPaymentAajx = function (versionCheckData, authenticationData, paymentForm, defer) {
  paymentForm += '&authId=' + versionCheckData.id;
  paymentForm += '&isthreeds=' + authenticationData.status;
  $('#authId').val(versionCheckData.id);
  $.ajax({
    url: $('#dwfrm_billing').attr('action'),
    method: 'POST',
    data: paymentForm,
    success: function (data) {
            // enable the next:Place Order button here
      $('body').trigger('checkout:enableButton', '.next-step-button button');
            // look for field validation errors
      if (data.error) {
        $('a.nav-link.credit-card-tab').removeClass('disabled');
        $('a.nav-link.google-pay-tab').removeClass('disabled');
        $('a.nav-link.apple-pay-tab').removeClass('disabled');
        if (data.fieldErrors.length) {
          data.fieldErrors.forEach(function (error) {
            if (Object.keys(error).length) {
              formHelpers.loadFormErrors('.payment-form', error);
            }
          });
        }

        if (data.serverErrors.length) {
          data.serverErrors.forEach(function (error) {
            $('.error-message').show();
            $('.error-message-text').text(error);
            scrollAnimate($('.error-message'));
          });
        }

        if (data.cartError) {
          window.location.href = data.redirectUrl;
        }

        defer.reject();
      } else {
        if ($('.tab-pane.active').attr('id') === 'paypal-content') {
          window.location.href = data.paypalresp.paymentMethod.apm.provider_redirect_url;
        }
                // Populate the Address Summary
        if ($('#isthreeds').val() === 'threeDs1') {
          threeDFormRedirection(data);
        } else {
          $('body').trigger('checkout:updateCheckoutView', {
            order: data.order,
            customer: data.customer
          });

          if (data.renderedPaymentInstruments) {
            $('.stored-payments').empty().html(data.renderedPaymentInstruments);
          }

          if (data.customer.registeredUser &&
                        data.customer.customerPaymentInstruments.length
                    ) {
            $('.cancel-new-payment').removeClass('checkout-hidden');
          }
          if ($('.tab-pane.active').attr('id') !== 'paypal-content') {}

          defer.resolve(data);
        }
      }
    },
    error: function (err) {
            // enable the next:Place Order button here
      $('body').trigger('checkout:enableButton', '.next-step-button button');
      if (err.responseJSON && err.responseJSON.redirectUrl) {
        window.location.href = err.responseJSON.redirectUrl;
      }
    }
  });
};
var handle = function (versionCheckData, authenticationData, paymentForm, defer) {
  var eci;
  var eciData = JSON.parse($('#eciData').val());
  if (!authenticationData.isthreedsone) {
    $('#isthreeds').val(authenticationData.status);
  }

  if (authenticationData.isthreedsone) {
    submitPaymentAajx(versionCheckData, authenticationData, paymentForm, defer);
  } else if (authenticationData.mpi !== undefined) {
    eci = authenticationData.mpi.eci;
    if (authenticationData.status !== 'CHALLENGE_REQUIRED') {
      if (eci === eciData.five || eci === eciData.six || eci === eciData.one || eci === eciData.two) {
        submitPaymentAajx(versionCheckData, authenticationData, paymentForm, defer);
      } else {
        $('#gpayerror').text('Card got declined, Please enter another card.');
      }
    } // Challenge Flow
    else if (JSON.parse(authenticationData.challenge.response.data).transStatus === 'Y') {
      submitPaymentAajx(versionCheckData, authenticationData, paymentForm, defer);
    } else {
      $('#gpayerror').text('Card got declined, Please enter another card.');
    }
  } else {
    $('#gpayerror').text('Card got declined, Please enter another card.');
  }
};

module.exports = {
  handle: handle
};
