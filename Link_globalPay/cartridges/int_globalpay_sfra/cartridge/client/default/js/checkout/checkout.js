/* eslint-disable no-undef */
'use strict';

var customerHelpers = require('base/checkout/customer');
var addressHelpers = require('base/checkout/address');
var shippingHelpers = require('base/checkout/shipping');
var billingHelpers = require('base/checkout/billing');
var summaryHelpers = require('base/checkout/summary');
var formHelpers = require('base/checkout/formErrors');
var scrollAnimate = require('base/components/scrollAnimate');
var threeds = require('./threeds');

/**
 * Create the jQuery Checkout Plugin.
 *
 * This jQuery plugin will be registered on the dom element in checkout.isml with the
 * id of "checkout-main".
 *
 * The checkout plugin will handle the different state the user interface is in as the user
 * progresses through the varying forms such as shipping and payment.
 *
 * Billing info and payment info are used a bit synonymously in this code.
 *
 */
(function($) {
    $.fn.checkout = function() { // eslint-disable-line
        var plugin = this;
        //
        // Collect form data from user input
        //
        var formData = {
            // Customer Data
            customer: {},

            // Shipping Address
            shipping: {},

            // Billing Address
            billing: {},

            // Payment
            payment: {},

            // Gift Codes
            giftCode: {}
        };

        //
        // The different states/stages of checkout
        //
        var checkoutStages = [
            'customer',
            'shipping',
            'payment',
            'placeOrder',
            'submitted'
        ];

        /**
         * Updates the URL to determine stage
         * @param {number} currentStage - The current stage the user is currently on in the checkout
         */
        function updateUrl(currentStage) {
            history.pushState(
                checkoutStages[currentStage],
                document.title,
                location.pathname +
                '?stage=' +
                checkoutStages[currentStage] +
                '#' +
                checkoutStages[currentStage]
            );
        }

        //
        // Local member methods of the Checkout plugin
        //
        var members = {

            // initialize the currentStage variable for the first time
            currentStage: 0,

            /**
             * Set or update the checkout stage (AKA the shipping, billing, payment, etc... steps)
             * @returns {Object} a promise
             */
            updateStage: function() {
                var stage = checkoutStages[members.currentStage];
                var defer = $.Deferred(); // eslint-disable-line

                if (stage === 'customer') {
                    //
                    // Clear Previous Errors
                    //
                    customerHelpers.methods.clearErrors();
                    //
                    // Submit the Customer Form
                    //
                    var customerFormSelector = customerHelpers.methods.isGuestFormActive() ? customerHelpers.vars.GUEST_FORM : customerHelpers.vars.REGISTERED_FORM;
                    var customerForm = $(customerFormSelector);
                    $.ajax({
                        url: customerForm.attr('action'),
                        type: 'post',
                        data: customerForm.serialize(),
                        success: function(data) {
                            if (data.redirectUrl) {
                                window.location.href = data.redirectUrl;
                            } else {
                                customerHelpers.methods.customerFormResponse(defer, data);
                            }
                        },
                        error: function(err) {
                            if (err.responseJSON && err.responseJSON.redirectUrl) {
                                window.location.href = err.responseJSON.redirectUrl;
                            }
                            // Server error submitting form
                            defer.reject(err.responseJSON);
                        }
                    });
                    return defer;
                } else if (stage === 'shipping') {
                    //
                    // Clear Previous Errors
                    //
                    formHelpers.clearPreviousErrors('.shipping-form');

                    //
                    // Submit the Shipping Address Form
                    //
                    var isMultiShip = $('#checkout-main').hasClass('multi-ship');
                    var formSelector = isMultiShip ?
                        '.multi-shipping .active form' : '.single-shipping .shipping-form';
                    var form = $(formSelector);

                    if (isMultiShip && form.length === 0) {
                        // disable the next:Payment button here
                        $('body').trigger('checkout:disableButton', '.next-step-button button');
                        // in case the multi ship form is already submitted
                        var url = $('#checkout-main').attr('data-checkout-get-url');
                        $.ajax({
                            url: url,
                            method: 'GET',
                            success: function(data) {
                                // enable the next:Payment button here
                                $('body').trigger('checkout:enableButton', '.next-step-button button');
                                if (!data.error) {
                                    $('body').trigger('checkout:updateCheckoutView', {
                                        order: data.order,
                                        customer: data.customer
                                    });
                                    defer.resolve();
                                } else if (data.message && $('.shipping-error .alert-danger').length < 1) {
                                    var errorMsg = data.message;
                                    var errorHtml = '<div class="alert alert-danger alert-dismissible valid-cart-error ' +
                                        'fade show" role="alert">' +
                                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
                                        '<span aria-hidden="true">&times;</span>' +
                                        '</button>' + errorMsg + '</div>';
                                    $('.shipping-error').append(errorHtml);
                                    scrollAnimate($('.shipping-error'));
                                    defer.reject();
                                } else if (data.redirectUrl) {
                                    window.location.href = data.redirectUrl;
                                }
                            },
                            error: function() {
                                // enable the next:Payment button here
                                $('body').trigger('checkout:enableButton', '.next-step-button button');
                                // Server error submitting form
                                defer.reject();
                            }
                        });
                    } else {
                        var shippingFormData = form.serialize();

                        $('body').trigger('checkout:serializeShipping', {
                            form: form,
                            data: shippingFormData,
                            callback: function(data) {
                                shippingFormData = data;
                            }
                        });
                        // disable the next:Payment button here
                        $('body').trigger('checkout:disableButton', '.next-step-button button');
                        $.ajax({
                            url: form.attr('action'),
                            type: 'post',
                            data: shippingFormData,
                            success: function(data) {
                                // enable the next:Payment button here
                                $('body').trigger('checkout:enableButton', '.next-step-button button');
                                shippingHelpers.methods.shippingFormResponse(defer, data);
                            },
                            error: function(err) {
                                // enable the next:Payment button here
                                $('body').trigger('checkout:enableButton', '.next-step-button button');
                                if (err.responseJSON && err.responseJSON.redirectUrl) {
                                    window.location.href = err.responseJSON.redirectUrl;
                                }
                                // Server error submitting form
                                defer.reject(err.responseJSON);
                            }
                        });
                    }
                    return defer;
                } else if (stage === 'payment') {
                    //
                    // Submit the Billing Address Form
                    formHelpers.clearPreviousErrors('.payment-form');

                    var billingAddressForm = $('#dwfrm_billing .billing-address-block :input').serialize();

                    $('body').trigger('checkout:serializeBilling', {
                        form: $('#dwfrm_billing .billing-address-block'),
                        data: billingAddressForm,
                        callback: function(data) {
                            if (data) {
                                billingAddressForm = data;
                            }
                        }
                    });

                    var contactInfoForm = $('#dwfrm_billing .contact-info-block :input').serialize();

                    $('body').trigger('checkout:serializeBilling', {
                        form: $('#dwfrm_billing .contact-info-block'),
                        data: contactInfoForm,
                        callback: function(data) {
                            if (data) {
                                contactInfoForm = data;
                            }
                        }
                    });

                    var activeTabId = $('.tab-pane.active').attr('id');
                    var paymentInfoSelector = '#dwfrm_billing .' + activeTabId + ' .payment-form-fields :input';
                    var paymentInfoForm = $(paymentInfoSelector).serialize();

                    $('body').trigger('checkout:serializeBilling', {
                        form: $(paymentInfoSelector),
                        data: paymentInfoForm,
                        callback: function(data) {
                            if (data) {
                                paymentInfoForm = data;
                            }
                        }
                    });

                    var paymentForm = billingAddressForm + '&' + contactInfoForm + '&' + paymentInfoForm;

                    if ($('.data-checkout-stage').data('customer-type') === 'registered') {
                        // if payment method is credit card
                        if ($('.payment-information').data('payment-method-id') === 'CREDIT_CARD') {
                            if (!($('.payment-information').data('is-new-payment'))) {
                                var cvvCode = $('.saved-payment-instrument.' +
                                    'selected-payment .saved-payment-security-code').val();

                                if (cvvCode === '') {
                                    var cvvElement = $('.saved-payment-instrument.' +
                                        'selected-payment ' +
                                        '.form-control');
                                    cvvElement.addClass('is-invalid');
                                    scrollAnimate(cvvElement);
                                    defer.reject();
                                    return defer;
                                }

                                var $savedPaymentInstrument = $('.saved-payment-instrument' +
                                    '.selected-payment'
                                );

                                paymentForm += '&storedPaymentUUID=' +
                                    $savedPaymentInstrument.data('uuid');

                                paymentForm += '&securityCode=' + cvvCode;
                            }
                        }
                    }
                    // disable the next:Place Order button here
                    $('body').trigger('checkout:disableButton', '.next-step-button button');
                    if ($('#isnewcard').val() == 'false' &&
                        $('.saved-payment-instrument' + '.selected-payment').data('pmt') !== undefined &&
                        ($('.tab-pane.active').attr('id') == 'credit-card-content')) {
                        var selectedUUID = $('.saved-payment-instrument' + '.selected-payment').data('uuid');
                        var pmttoken;
                        var pmtJson = JSON.parse($('#pmttokes').val());
                        pmtJson.pmt.map(function(eachPmt) {
                            if (eachPmt.uuid == selectedUUID) {
                                pmttoken = eachPmt.pmttoken;
                            }
                        });
                        var cartData = {
                            amount: parseInt(parseFloat($('.grand-total-sum').text().replace('$', '').replace(',', '')) *100),
                            address1: $('input[name*="shippingAddress_addressFields_address1"]').val(),
                            city: $('input[name*="shippingAddress_addressFields_city"]').val(),
                            postalcode: $('input[name*="shippingAddress_addressFields_postalCode"]').val()
                        };

                        const {
                            checkVersion,
                            initiateAuthentication,
                            ChallengeWindowSize,
                        } = GlobalPayments.ThreeDSecure;

                        checkVersion('GlobalPay-Authentication', {
                            card: {
                                reference: pmttoken,
                                cartData: cartData
                            },
                        }).then(function(versionCheckData) {
                            if(versionCheckData.versions.directoryServer.start == '1.0.0'
                            && versionCheckData.versions.directoryServer.end == '1.0.0'){
                                $('#authId').val(versionCheckData.id);
                                if(versionCheckData.enrolled == 'ENROLLED')
                           {
                                    $('#paReq').val(versionCheckData.challengevalue);
                                    $('#acsUrl').val(versionCheckData.acschallengerequesturl);   
                                    $('#isthreeds').val('threeDs1');                      
                                }
                                else{
                                    $('#isthreeds').val(versionCheckData.serverTransactionId);
                                }
                                var authenticationData = new Object();
                                authenticationData.status = 'undefined';
                                authenticationData.isthreedsone =  true;
                                threeds.handle(versionCheckData, authenticationData ,paymentForm, defer);
                            // eslint-disable-next-line no-empty
                            } else if (versionCheckData.error) {

                            } else {
                                $('#authId').val(versionCheckData.id);
                                $('#isthreeds').val(versionCheckData.serverTransactionId);
                                try {
                                    authenticationData = initiateAuthentication('GlobalPay-Initiation', {
                                        serverTransactionId: versionCheckData.serverTransactionId,
                                        challengeNotificationUrl: '',
                                        authId: versionCheckData.id,
                                        methodUrlComplete: true,
                                        card: {
                                            reference: pmttoken,
                                            cartData: cartData
                                        },
                                        challengeWindow: {
                                            windowSize: ChallengeWindowSize.Windowed600x400,
                                            displayMode: 'lightbox',
                                        }                               
                                    }).then(function(authenticationData) {
                                        // invoking ajax
                                        threeds.handle(versionCheckData, authenticationData,paymentForm, defer);
                                    }).catch(function(){
                                        $('.gpayerror').text('Unable to process your request, please try again or use another card.');
                                    });
                                // eslint-disable-next-line no-empty
                                } catch (e) {
                                   
                                }
                            }
                        }).catch(function(){
                            $('.gpayerror').text('Unable to process your request, please try again or use another card.');
                        });
                    } else if ($('.tab-pane.active').attr('id') == 'google-pay-content' || $('.tab-pane.active').attr('id') == 'paypal-content' || $('#isnewcard').val() == 'true' || $('.tab-pane.active').attr('id') == 'ideal-content' || $('.tab-pane.active').attr('id') == 'giroPay-content' || $('.tab-pane.active').attr('id') == 'aliPay-content'
                    || $('.tab-pane.active').attr('id') == 'sofortPay-content'|| $('.tab-pane.active').attr('id') == 'bitPay-content'|| $('.tab-pane.active').attr('id') == 'bancontactpay-content' || $('.tab-pane.active').attr('id') == 'epsPay-content' || $('.tab-pane.active').attr('id') == 'mybankPay-content' || $('.tab-pane.active').attr('id') == 'uniounpay-content'
                    || $('.tab-pane.active').attr('id') == 'wechatpay-content') {

                        paymentForm += '&authId=' + $('#authId').val();
                        paymentForm += '&paReq=' + $('#paReq').val();
                        paymentForm += '&acsUrl=' + $('#acsUrl').val();
                        paymentForm += '&isthreeds=' + $('#isthreeds').val();
                        
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
                                         window.location.href = data.paypalresp.paymentMethod.apm.providerRedirectUrl;
                                    }
                                    else if ($('.tab-pane.active').attr('id') == 'ideal-content' || $('.tab-pane.active').attr('id') == 'giroPay-content' || $('.tab-pane.active').attr('id') == 'aliPay-content' || $('.tab-pane.active').attr('id') == 'sofortPay-content'
                                    || $('.tab-pane.active').attr('id') == 'bitPay-content'|| $('.tab-pane.active').attr('id') == 'epsPay-content' || $('.tab-pane.active').attr('id') == 'mybankPay-content'|| $('.tab-pane.active').attr('id') == 'bancontactpay-content'
                                    || $('.tab-pane.active').attr('id') == 'uniounpay-content' || $('.tab-pane.active').attr('id') == 'wechatpay-content') {
                                        window.location.href = data.lpmresp.paymentMethod.apm.redirect_url;
                                    }
                                    // Populate the Address Summary
                                    //
                                    if ($('.tab-pane.active').attr('id') == 'google-pay-content' || $('.tab-pane.active').attr('id') == 'apple-pay-content') {
                                        placeOrderSuccess(data); //populate order details
                                        defer.resolve(data);
                                    } else {
                                        if($('#isthreeds').val()==='threeDs1')
                                        {
                                            threeDFormRedirection(data);
                                        }
                                        else{
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
                                           // scrollAnimate();
                                            }
                                                                              
                                            defer.resolve(data);
                                        }
                                    }
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
                    return defer;
                } else if (stage === 'placeOrder') {
                    // disable the placeOrder button here
                    $('body').trigger('checkout:disableButton', '.next-step-button button');
                    $.ajax({
                        url: $('.place-order').data('action'),
                        method: 'POST',
                        success: function(data) {
                            // enable the placeOrder button here
                            $('body').trigger('checkout:enableButton', '.next-step-button button');

                            if (data.error) {
                                if (data.cartError) {
                                    window.location.href = data.redirectUrl;
                                    defer.reject();
                                } else {
                                    // go to appropriate stage and display error message
                                    defer.reject(data);
                                }
                            } else {
                                placeOrderSuccess(data); // populate order details
                                defer.resolve(data);
                            }
                        },
                        error: function() {
                            // enable the placeOrder button here
                            $('body').trigger('checkout:enableButton', $('.next-step-button button'));
                        }
                    });

                    return defer;
                }
                function threeDFormRedirection(data)
                {
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
                }
                function placeOrderSuccess(data) {
                    var redirect = $('<form>')
                        .appendTo(document.body)
                        .attr({
                            method: 'POST',
                            action: data.continueUrl
                        });

                    $('<input>')
                        .appendTo(redirect)
                        .attr({
                            name: 'orderID',
                            value: data.orderID
                        });

                    $('<input>')
                        .appendTo(redirect)
                        .attr({
                            name: 'orderToken',
                            value: data.orderToken
                        });

                    redirect.submit();
                }
                var p = $('<div>').promise(); // eslint-disable-line
                setTimeout(function() {
                    p.done(); // eslint-disable-line
                }, 500);
                return p; // eslint-disable-line
            },

            /**
             * Initialize the checkout stage.
             *
             * TODO: update this to allow stage to be set from server?
             */
            initialize: function() {
                // set the initial state of checkout
                members.currentStage = checkoutStages
                    .indexOf($('.data-checkout-stage').data('checkout-stage'));
                $(plugin).attr('data-checkout-stage', checkoutStages[members.currentStage]);
                $('.save-credit-card.custom-control.custom-checkbox').find('#saveCreditCard').attr('checked', false)

                if ($('.data-checkout-stage').data('customer-type') === 'registered') {
                    // if payment method is credit card
                    if ($('.payment-information').data('payment-method-id') === 'CREDIT_CARD') {
                        // if saved cards section is shown
                        if (!($('.payment-information').data('is-new-payment'))) {
                            $('.next-step-button .submit-payment').removeClass('d-none');
                        }
                    }
                }
                $('body').on('click', '.payment-options .nav-item', function(e) {
                    e.preventDefault();
                    if (e.target.classList[1] == 'google-pay-tab' || e.target.classList[1] == 'paypal-tab' || e.target.classList[1] == 'apple-pay-tab' || e.target.classList[1] == 'ideal-tab' || e.target.classList[1] == 'giropay-tab'
                    || e.target.classList[1] == 'alipay-tab' || e.target.classList[1] == 'sofortpay-tab' || e.target.classList[1] == 'union-tab' || e.target.classList[1] == 'wechatpay-tab') {
                        //if clecked on googlepay, applepay and paypal, LPM tabs
                        $('.next-step-button .submit-payment').hide();
                    } else {
                        $('.next-step-button .submit-payment').show();
                    }
                });

                $('body').on('click', '.submit-customer-login', function(e) {
                    e.preventDefault();
                    members.nextStage();
                });

                $('body').on('click', '.submit-customer', function(e) {
                    e.preventDefault();
                    members.nextStage();
                });

                //
                // Handle Payment option selection
                //
                $('input[name$="paymentMethod"]', plugin).on('change', function() {
                    $('.credit-card-form').toggle($(this).val() === 'CREDIT_CARD');
                });

                //
                // Handle Next State button click
                //
                $(plugin).on('click', '.next-step-button button', function() {
                    members.nextStage();
                });

                //
                // Handle Edit buttons on shipping and payment summary cards
                //
                $('.customer-summary .edit-button', plugin).on('click', function() {
                    members.gotoStage('customer');
                });
                // Handle add payment and back to saved cards for login flow and 
                // Handle next step button and save card checkbox
                //
                $(document).on('click', '.saved-payment-instrument', function () {
                    $('.next-step-button .submit-payment').removeAttr('disabled');
                    $('.gpayerror').text('');
                });

                $('.cancel-new-payment', plugin).on('click', function() {
                    $('.next-step-button .submit-payment').removeClass('d-none');
                    $('.gpayerror').text('');
                    $('.save-credit-card.custom-control.custom-checkbox').find('#saveCreditCard').attr('checked', false)
                    $('#isnewcard').val(false);
                });
                $('.add-payment', plugin).on('click', function() {
                    $('.gpayerror').text('');
                    $('.next-step-button .submit-payment').addClass('d-none');
                    $('.save-credit-card.custom-control.custom-checkbox').find('#saveCreditCard').attr('checked', true)
                    $('#isnewcard').val(true);
                });
                $('.shipping-summary .edit-button', plugin).on('click', function() {
                    if (!$('#checkout-main').hasClass('multi-ship')) {
                        $('body').trigger('shipping:selectSingleShipping');
                    }

                    members.gotoStage('shipping');
                });

                $('.payment-summary .edit-button', plugin).on('click', function() {
                    members.gotoStage('payment');
                });
                // On button click disable other payment tabs
                $('.btn-paypal-button', plugin).on('click', function() {
                    $('a.nav-link.credit-card-tab').addClass('disabled');
                    $('a.nav-link.google-pay-tab').addClass('disabled');
                    $('a.nav-link.apple-pay-tab').addClass('disabled');
                    members.nextStage();
                });

                $('.btn-ideal-pay-button', plugin).on('click', function() {
                    $('a.nav-link.credit-card-tab').addClass('disabled');
                    $('a.nav-link.google-pay-tab').addClass('disabled');
                    $('a.nav-link.apple-pay-tab').addClass('disabled');
                    members.nextStage();
                });

                $('.btn-ali-pay-button', plugin).on('click', function() {
                    $('a.nav-link.credit-card-tab').addClass('disabled');
                    $('a.nav-link.google-pay-tab').addClass('disabled');
                    $('a.nav-link.apple-pay-tab').addClass('disabled');
                    members.nextStage();
                });

                $('.btn-giro-pay-button', plugin).on('click', function() {
                    $('a.nav-link.credit-card-tab').addClass('disabled');
                    $('a.nav-link.google-pay-tab').addClass('disabled');
                    $('a.nav-link.apple-pay-tab').addClass('disabled');
                    members.nextStage();
                });

                $('.btn-sofort-pay-button', plugin).on('click', function() {
                    $('a.nav-link.credit-card-tab').addClass('disabled');
                    $('a.nav-link.google-pay-tab').addClass('disabled');
                    $('a.nav-link.apple-pay-tab').addClass('disabled');
                    members.nextStage();
                });

                $('.btn-bancontact-pay-button', plugin).on('click', function() {
                    $('a.nav-link.credit-card-tab').addClass('disabled');
                    $('a.nav-link.google-pay-tab').addClass('disabled');
                    $('a.nav-link.apple-pay-tab').addClass('disabled');
                    members.nextStage();
                });

                $('.btn-bit-pay-button', plugin).on('click', function() {
                    $('a.nav-link.credit-card-tab').addClass('disabled');
                    $('a.nav-link.google-pay-tab').addClass('disabled');
                    $('a.nav-link.apple-pay-tab').addClass('disabled');
                    members.nextStage();
                });

                $('.btn-eps-pay-button', plugin).on('click', function() {
                    $('a.nav-link.credit-card-tab').addClass('disabled');
                    $('a.nav-link.google-pay-tab').addClass('disabled');
                    $('a.nav-link.apple-pay-tab').addClass('disabled');
                    members.nextStage();
                });

                $('.btn-mybank-pay-button', plugin).on('click', function() {
                    $('a.nav-link.credit-card-tab').addClass('disabled');
                    $('a.nav-link.google-pay-tab').addClass('disabled');
                    $('a.nav-link.apple-pay-tab').addClass('disabled');
                    members.nextStage();
                });

                $('.btn-unioun-pay-button', plugin).on('click', function() {
                    $('a.nav-link.credit-card-tab').addClass('disabled');
                    $('a.nav-link.google-pay-tab').addClass('disabled');
                    $('a.nav-link.apple-pay-tab').addClass('disabled');
                    members.nextStage();
                });

                $('.btn-wechat-pay-button', plugin).on('click', function() {
                    $('a.nav-link.credit-card-tab').addClass('disabled');
                    $('a.nav-link.google-pay-tab').addClass('disabled');
                    $('a.nav-link.apple-pay-tab').addClass('disabled');
                    members.nextStage();
                });

                $('body').on('submit:googlepay', function(e, data) {
                    $('#paymentToken').val(data.paymentToken);
                    members.nextStage();
                });
                $('.apple-pay-content #apple-pay-button', plugin).on('click', function() {
                    members.nextStage();
                });
                //
                // remember stage (e.g. shipping)
                //
                updateUrl(members.currentStage);

                //
                // Listen for foward/back button press and move to correct checkout-stage
                //
                $(window).on('popstate', function(e) {
                    //
                    // Back button when event state less than current state in ordered
                    // checkoutStages array.
                    //
                    if (e.state === null ||
                        checkoutStages.indexOf(e.state) < members.currentStage) {
                        members.handlePrevStage(false);
                    } else if (checkoutStages.indexOf(e.state) > members.currentStage) {
                        // Forward button  pressed
                        members.handleNextStage(false);
                    }
                });

                //
                // Set the form data
                //
                plugin.data('formData', formData);
            },

            /**
             * The next checkout state step updates the css for showing correct buttons etc...
             */
            nextStage: function() {
                var promise = members.updateStage();

                promise.done(function() {
                    // Update UI with new stage
                    $('.error-message').hide();
                    members.handleNextStage(true);
                });

                promise.fail(function(data) {
                    // show errors
                    if (data) {
                        if (data.errorStage) {
                            members.gotoStage(data.errorStage.stage);

                            if (data.errorStage.step === 'billingAddress') {
                                var $billingAddressSameAsShipping = $(
                                    'input[name$="_shippingAddressUseAsBillingAddress"]'
                                );
                                if ($billingAddressSameAsShipping.is(':checked')) {
                                    $billingAddressSameAsShipping.prop('checked', false);
                                }
                            }
                        }

                        if (data.errorMessage) {
                            $('.error-message').show();
                            $('.error-message-text').text(data.errorMessage);
                        }
                    }
                });
            },

            /**
             * The next checkout state step updates the css for showing correct buttons etc...
             *
             * @param {boolean} bPushState - boolean when true pushes state using the history api.
             */
            handleNextStage: function(bPushState) {
                if (members.currentStage < checkoutStages.length - 1) {
                    // move stage forward
                    members.currentStage++;

                    //
                    // show new stage in url (e.g.payment)
                    //
                    if (bPushState) {
                        updateUrl(members.currentStage);
                    }
                }

                // Set the next stage on the DOM
                $(plugin).attr('data-checkout-stage', checkoutStages[members.currentStage]);
            },

            /**
             * Previous State
             */
            handlePrevStage: function() {
                if (members.currentStage > 0) {
                    // move state back
                    members.currentStage--;
                    updateUrl(members.currentStage);
                }

                $(plugin).attr('data-checkout-stage', checkoutStages[members.currentStage]);
            },

            /**
             * Use window history to go to a checkout stage
             * @param {string} stageName - the checkout state to goto
             */
            gotoStage: function(stageName) {
                members.currentStage = checkoutStages.indexOf(stageName);
                updateUrl(members.currentStage);
                $(plugin).attr('data-checkout-stage', checkoutStages[members.currentStage]);
            }
        };

        //
        // Initialize the checkout
        //
        members.initialize();

        return this;
    };
}(jQuery));


var exports = {
    initialize: function() {
        $('#checkout-main').checkout();
    },

    updateCheckoutView: function() {
        $('body').on('checkout:updateCheckoutView', function(e, data) {
            if (data.csrfToken) {
                $('input[name*=\'csrf_token\']').val(data.csrfToken);
            }
            customerHelpers.methods.updateCustomerInformation(data.customer, data.order);
            shippingHelpers.methods.updateMultiShipInformation(data.order);
            summaryHelpers.updateTotals(data.order.totals);
            data.order.shipping.forEach(function(shipping) {
                shippingHelpers.methods.updateShippingInformation(
                    shipping,
                    data.order,
                    data.customer,
                    data.options
                );
            });
            billingHelpers.methods.updateBillingInformation(
                data.order,
                data.customer,
                data.options
            );
            billingHelpers.methods.updatePaymentInformation(data.order, data.options);
            summaryHelpers.updateOrderProductSummaryInformation(data.order, data.options);
        });
    },

    disableButton: function() {
        $('body').on('checkout:disableButton', function(e, button) {
            $(button).prop('disabled', true);
        });
    },

    enableButton: function() {
        $('body').on('checkout:enableButton', function(e, button) {
            $(button).prop('disabled', false);
        });
    }


};

[customerHelpers, billingHelpers, shippingHelpers, addressHelpers].forEach(function(library) {
    Object.keys(library).forEach(function(item) {
        if (typeof library[item] === 'object') {
            exports[item] = $.extend({}, exports[item], library[item]);
        } else {
            exports[item] = library[item];
        }
    });
});

module.exports = exports;