'use strict';
var formHelpers = require('base/checkout/formErrors');
var scrollAnimate = require('base/components/scrollAnimate');
var handle = function(versionCheckData,authenticationData,paymentForm, defer){
    
    console.log('Authentication Data', authenticationData);
    console.log(':::status:' + authenticationData.status);
    $("#isthreeds").val(authenticationData.status);
    console.log('::before calling to ajax:::');

      var eci = authenticationData.mpi.eci;
  if (authenticationData.status != "CHALLENGE_REQUIRED") {
        if (eci == "05" || eci == "06" || eci == "01" || eci == "02") {
            console.log("Frictionless Issuer Authentication Success, Recommend proceed to auth");
            console.log("ECI: ", eci);
            //$( ".submit-payment" ).trigger( "click" );
            submitPaymentAajx(versionCheckData,authenticationData,paymentForm, defer );
        } else {
            console.log("Frictionless Issuer Authentication Failed, Recommend decline auth!");
            console.log("ECI: ", eci);
        }
}// Challenge Flow
else {
    console.log(':::'+JSON.parse(authenticationData.challenge.response.data).transStatus);
    if (JSON.parse(authenticationData.challenge.response.data).transStatus == "Y") {
        console.log("Challenge Issuer Authentication Success, Recommend proceed to auth");
      // $( ".submit-payment" ).trigger( "click" );
      submitPaymentAajx(versionCheckData,authenticationData,paymentForm, defer );
    } else {
        console.log("Challenge Issuer Authentication Failed, Recommend decline auth!");
        //$( ".submit-payment" ).trigger( "click" );
    }
}  
    // end ajax   
}
var submitPaymentAajx = function(versionCheckData,authenticationData,paymentForm, defer ){
    paymentForm += '&authId=' + versionCheckData.id;
    paymentForm += '&isthreeds=' + authenticationData.status;
    $("#authId").val(versionCheckData.id);
    //  =======
    $.ajax({
        url: $('#dwfrm_billing').attr('action'),
        method: 'POST',
        data: paymentForm,
        success: function(data) {
            // enable the next:Place Order button here
            $('body').trigger('checkout:enableButton', '.next-step-button button');
            // look for field validation errors
            if (data.error) {
                $('a.nav-link.credit-card-tab').removeClass('disabled');
                $('a.nav-link.google-pay-tab').removeClass('disabled');
                $('a.nav-link.apple-pay-tab').removeClass('disabled');
                if (data.fieldErrors.length) {
                    data.fieldErrors.forEach(function(error) {
                        if (Object.keys(error).length) {
                            formHelpers.loadFormErrors('.payment-form', error);
                        }
                    });
                }

                if (data.serverErrors.length) {
                    data.serverErrors.forEach(function(error) {
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
                if ($('.tab-pane.active').attr('id') == 'paypal-content') {
                    window.location.href = data.paypalresp.paymentMethod.apm.provider_redirect_url;
                } //
                // Populate the Address Summary
                //
               
                    $('body').trigger('checkout:updateCheckoutView', {
                        order: data.order,
                        customer: data.customer
                    });

                    if (data.renderedPaymentInstruments) {
                        $('.stored-payments').empty().html(
                            data.renderedPaymentInstruments
                        );
                    }

                    if (data.customer.registeredUser &&
                        data.customer.customerPaymentInstruments.length
                    ) {
                        $('.cancel-new-payment').removeClass('checkout-hidden');
                    }
                    if ($('.tab-pane.active').attr('id') !== 'paypal-content') {
                        scrollAnimate();
                    }

                    defer.resolve(data);
                
            }
        },
        error: function(err) {
            // enable the next:Place Order button here
            $('body').trigger('checkout:enableButton', '.next-step-button button');
            if (err.responseJSON && err.responseJSON.redirectUrl) {
                window.location.href = err.responseJSON.redirectUrl;
            }
        }
    });
}



module.exports = {
    handle:handle
}