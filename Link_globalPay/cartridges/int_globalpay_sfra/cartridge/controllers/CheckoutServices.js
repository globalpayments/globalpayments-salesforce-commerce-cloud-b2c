'use strict';

/**
 * @namespace CheckoutServices
 */

var server = require('server');
var page = module.superModule;
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var globalpayconstants = require('*/cartridge/scripts/constants/globalPayConstant');
server.extend(page);


 /* Route to handle payment submission. This route is called only when either
    PayPal Express or Googlepay or Applepay is called from either mini cart or cart page. */
// eslint-disable-next-line
function handlePayments(req, res, next) {
    var billingFormErrors = {};
    var viewData = {};
    var Transaction = require('dw/system/Transaction');
    var BasketMgr = require('dw/order/BasketMgr');
    var paymentForm = server.forms.getForm('billing');
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var PaymentManager = require('dw/order/PaymentMgr');
    var HookManager = require('dw/system/HookMgr');
    var Resource = require('dw/web/Resource');
    var currentBasket = BasketMgr.getCurrentBasket();
    var billingAddress = currentBasket.billingAddress;
    var billingForm = server.forms.getForm('billing');
    var billingData;
    var Locale = require('dw/util/Locale');
    var OrderModel = require('*/cartridge/models/order');
    var AccountModel = require('*/cartridge/models/account');
    var usingMultiShipping;
    var currentLocale = Locale.getLocale(req.locale.id);
    var basketModel;
    var accountModel;
    var renderedStoredPaymentInstrument;
    var paymentMethodIdValue;
    var order;
    var paymentProcessor;
    var handlePaymentResult;
    var gputil = require('*/cartridge/scripts/utils/gputil');
    var URLUtils = require('dw/web/URLUtils');
    var serverErrors = [];
    billingFormErrors = COHelpers.validateBillingForm(paymentForm.addressFields);

    if (Object.keys(billingFormErrors).length) {
        // respond with form data and errors
        res.json({
            form: paymentForm,
            fieldErrors: [billingFormErrors],
            serverErrors: [],
            error: true
        });
    } else {
        viewData.address = {
            firstName: {value: paymentForm.addressFields.firstName.value},
            lastName: {value: paymentForm.addressFields.lastName.value},
            address1: {value: paymentForm.addressFields.address1.value},
            address2: {value: paymentForm.addressFields.address2.value},
            city: {value: paymentForm.addressFields.city.value},
            postalCode: {value: paymentForm.addressFields.postalCode.value},
            countryCode: {value: paymentForm.addressFields.country.value}
        };
        if (Object.prototype.hasOwnProperty.call(paymentForm.addressFields, 'states')) {
            viewData.address.stateCode = {value: paymentForm.addressFields.states.stateCode.value};
        }
        res.setViewData(viewData);
        Transaction.wrap(function () {
            if (!billingAddress) {
                billingAddress = currentBasket.createBillingAddress();
            }
            billingData = res.getViewData();
            billingAddress.setFirstName(billingData.address.firstName.value);
            billingAddress.setLastName(billingData.address.lastName.value);
            billingAddress.setAddress1(billingData.address.address1.value);
            billingAddress.setAddress2(billingData.address.address2.value);
            billingAddress.setCity(billingData.address.city.value);
            billingAddress.setPostalCode(billingData.address.postalCode.value);
            if (Object.prototype.hasOwnProperty.call(billingData.address, 'stateCode')) {
                billingAddress.setStateCode(billingData.address.stateCode.value);
            }
            billingAddress.setCountryCode(billingData.address.countryCode.value);
        });
        usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
        if (usingMultiShipping === true && currentBasket.shipments.length < 2) {
            req.session.privacyCache.set('usingMultiShipping', false);
            usingMultiShipping = false;
        }
        basketModel = new OrderModel(currentBasket, {usingMultiShipping: usingMultiShipping, countryCode: currentLocale.country, containerView: 'basket'});
        accountModel = new AccountModel(req.currentCustomer);
        renderedStoredPaymentInstrument = COHelpers.getRenderedPaymentInstruments(
            req,
            accountModel
        );
        paymentMethodIdValue = paymentForm.paymentMethod.value;


        paymentProcessor = PaymentManager.getPaymentMethod(paymentMethodIdValue).getPaymentProcessor();
        if (HookManager.hasHook('app.payment.processor.' + paymentProcessor.ID.toLowerCase())) {
            HookManager.callHook('app.payment.processor.' + paymentProcessor.ID.toLowerCase(),
                'Handle',
                currentBasket,
                req
            );
        } else {
            HookManager.callHook('app.payment.form.processor.default_form_processor', 'processForm');
        }

        order = COHelpers.createOrder(currentBasket);

         // Handles payment authorization
        handlePaymentResult = COHelpers.handlePayments(order, order.orderNo, req);

        if (empty(handlePaymentResult.error) && paymentForm.paymentMethod.value === Resource.msg('paymentmethodname.paypal', 'globalpay', null)) {
            res.json({
                renderedPaymentInstruments: renderedStoredPaymentInstrument,
                customer: accountModel,
                order: basketModel,
                form: billingForm,
                error: false,
                paypalresp: handlePaymentResult.authorizationResult.paypalresp
            });
        }
        else if (empty(handlePaymentResult.error) && paymentForm.paymentMethod.value === Resource.msg('paymentmethodname.ideal', 'globalpay', null)) {
            res.json({
                renderedPaymentInstruments: renderedStoredPaymentInstrument,
                customer: accountModel,
                order: basketModel,
                form: billingForm,
                error: false,
                paypalresp: handlePaymentResult.authorizationResult.lpmresp
            });
        }
        else if (empty(handlePaymentResult.error) && paymentForm.paymentMethod.value === Resource.msg('paymentmethodname.giropay', 'globalpay', null)) {
            res.json({
                renderedPaymentInstruments: renderedStoredPaymentInstrument,
                customer: accountModel,
                order: basketModel,
                form: billingForm,
                error: false,
                lpmresp: handlePaymentResult.authorizationResult.lpmresp
            });
        }
        else if (empty(handlePaymentResult.error) && paymentForm.paymentMethod.value === Resource.msg('paymentmethodname.alipay', 'globalpay', null)) {
            res.json({
                renderedPaymentInstruments: renderedStoredPaymentInstrument,
                customer: accountModel,
                order: basketModel,
                form: billingForm,
                error: false,
                lpmresp: handlePaymentResult.authorizationResult.lpmresp
            });
        }
        else if (empty(handlePaymentResult.error) && paymentForm.paymentMethod.value === Resource.msg('paymentmethodname.sofortpay', 'globalpay', null)) {
            res.json({
                renderedPaymentInstruments: renderedStoredPaymentInstrument,
                customer: accountModel,
                order: basketModel,
                form: billingForm,
                error: false,
                lpmresp: handlePaymentResult.authorizationResult.lpmresp
            });
        }
        else if (!handlePaymentResult.authorizationResult.error) {
            // place and update order
            gputil.orderUpdate(order);
            COHelpers.sendConfirmationEmail(order, req.locale.id);
            // redirect to Confirmation page
            res.json({
                error: false,
                orderID: order.orderNo,
                orderToken: order.orderToken,
                continueUrl: URLUtils.url('Order-Confirm').toString()
            });
        } else {
            serverErrors.push(Resource.msg('error.payment.not.valid', 'checkout', null));
    // redirect to Cart page if there is error
            res.json({
                error: true,
                cartError: false,
                fieldErrors: [],
                serverErrors: serverErrors
            });
            return;
        }
    }
}

 /**
 * CheckoutServices-SubmitPayment : The CheckoutServices-SubmitPayment endpoint submits payment details
 * @name Base/CheckoutServices-SubmitPayment
 * @function
 * @memberof CheckoutServices
 * @param {middleware} - server.middleware.https
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.prepend(
    'SubmitPayment',
    server.middleware.https,
    csrfProtection.validateAjaxRequest,
    function (req, res, next) {
        var PaymentManager = require('dw/order/PaymentMgr');
        var HookManager = require('dw/system/HookMgr');
        var Resource = require('dw/web/Resource');
        var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
        var viewData = {};
        var paymentForm = server.forms.getForm('billing');
        var paymentFormResult;
        var billingFormErrors;
        var contactInfoFormErrors;
        var formFieldErrors = [];
        var paymentMethodIdValue;
        var paymentProcessor;

        if (paymentForm.paymentMethod.value === Resource.msg('paymentmethodname.paypal', 'globalpay', null) || paymentForm.paymentMethod.value === Resource.msg('paymentmethodname.googlepay', 'globalpay', null) || paymentForm.paymentMethod.value === Resource.msg('paymentmethodname.applepay', 'globalpay', null) || paymentForm.paymentMethod.value === Resource.msg('paymentmethodname.ideal', 'globalpay', null) || paymentForm.paymentMethod.value === Resource.msg('paymentmethodname.giropay', 'globalpay', null) || paymentForm.paymentMethod.value === Resource.msg('paymentmethodname.alipay', 'globalpay', null) || paymentForm.paymentMethod.value === Resource.msg('paymentmethodname.sofortpay', 'globalpay', null)) {
            handlePayments(req, res, next);
            this.emit('route:Complete', req, res);
            return;
        }
        // verify billing form data
        billingFormErrors = COHelpers.validateBillingForm(paymentForm.addressFields);
        contactInfoFormErrors = COHelpers.validateFields(paymentForm.contactInfoFields);
        if (Object.keys(billingFormErrors).length) {
            formFieldErrors.push(billingFormErrors);
        } else {
            viewData.address = {
                firstName: {value: paymentForm.addressFields.firstName.value},
                lastName: {value: paymentForm.addressFields.lastName.value},
                address1: {value: paymentForm.addressFields.address1.value},
                address2: {value: paymentForm.addressFields.address2.value},
                city: {value: paymentForm.addressFields.city.value},
                postalCode: {value: paymentForm.addressFields.postalCode.value},
                countryCode: {value: paymentForm.addressFields.country.value}
            };

            if (Object.prototype.hasOwnProperty.call(paymentForm.addressFields, 'states')) {
                viewData.address.stateCode = {value: paymentForm.addressFields.states.stateCode.value};
            }
        }

        if (Object.keys(contactInfoFormErrors).length) {
            formFieldErrors.push(contactInfoFormErrors);
        } else {
            viewData.phone = {value: paymentForm.contactInfoFields.phone.value};
        }
        paymentMethodIdValue = paymentForm.paymentMethod.value;
        if (!PaymentManager.getPaymentMethod(paymentMethodIdValue).paymentProcessor) {
            throw new Error(Resource.msg(
                'error.payment.processor.missing',
                'checkout',
                null
            ));
        }

        paymentProcessor = PaymentManager.getPaymentMethod(paymentMethodIdValue).getPaymentProcessor();
        paymentForm.creditCardFields.securityCode.htmlValue = globalpayconstants.creditCardPay.securityCode;
        if (HookManager.hasHook('app.payment.globalpay.processor.' + paymentProcessor.ID.toLowerCase())) {
            paymentFormResult = HookManager.callHook('app.payment.globalpay.processor.' + paymentProcessor.ID.toLowerCase(),
                'processForm',
                req,
                paymentForm,
                viewData
            );
        } else {
            paymentFormResult = HookManager.callHook('app.payment.form.processor.default_form_processor', 'processForm');
        }

        if (paymentFormResult.error && paymentFormResult.fieldErrors) {
            formFieldErrors.push(paymentFormResult.fieldErrors);
        }
        if (formFieldErrors.length || paymentFormResult.serverErrors) {
            // respond with form data and errors
            res.json({
                form: paymentForm,
                fieldErrors: formFieldErrors,
                serverErrors: paymentFormResult.serverErrors ? paymentFormResult.serverErrors : [],
                error: true
            });
            return next();
        }

        viewData.paymentMethod = {
            value: paymentForm.paymentMethod.value,
            htmlName: paymentForm.paymentMethod.value
        };
        viewData.paymentInformation = viewData.paymentInformation;
        if (viewData.storedPaymentUUID
            && req.currentCustomer.raw.authenticated
            && req.currentCustomer.raw.registered
        ) {
            viewData.paymentInformation.paymentId = {
                value: viewData.storedPaymentUUID,
                htmlName: viewData.storedPaymentUUID
            };
        } else {
            var paymentReference = paymentForm.creditCardFields.paymentId != null ? JSON.parse(paymentForm.creditCardFields.paymentId.htmlValue).paymentReference : '';
            viewData.paymentInformation.paymentId = {
                value: paymentReference, 
                htmlName: paymentReference
            };
        }

        viewData.paymentInformation.authId = {
            value: req.form.authId,
            htmlName: req.form.authId
        };
        viewData.paymentInformation.isthreeds = {
            value: req.form.isthreeds,
            htmlName: req.form.isthreeds
        };
        viewData.paymentInformation.cardOwner = {
            value: paymentForm.creditCardFields.cardOwner.value,
            htmlName: paymentForm.creditCardFields.cardOwner.value
        };
      
        res.setViewData(viewData);

        this.on('route:BeforeComplete', function (req, res) { // eslint-disable-line no-shadow
            var BasketMgr = require('dw/order/BasketMgr');
            var HookMgr = require('dw/system/HookMgr');
            var PaymentMgr = require('dw/order/PaymentMgr');
            var Transaction = require('dw/system/Transaction');
            var AccountModel = require('*/cartridge/models/account');
            var OrderModel = require('*/cartridge/models/order');
            var URLUtils = require('dw/web/URLUtils');
            var Locale = require('dw/util/Locale');
            var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
            var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
            var validationHelpers = require('*/cartridge/scripts/helpers/basketValidationHelpers');
            var validatedProducts;
            var paymentMethodID;
            var result;
            var processor;
            var calculatedPaymentTransaction;
            var noPaymentMethod = {};
            var usingMultiShipping;
            var currentBasket = BasketMgr.getCurrentBasket();
            var billingData = res.getViewData();
            var billingAddress = currentBasket.billingAddress;
            var billingForm = server.forms.getForm('billing');
            var currentLocale = Locale.getLocale(req.locale.id);
            var basketModel;
            var accountModel;
            var renderedStoredPaymentInstrument;

            if (!currentBasket) {
                delete billingData.paymentInformation;

                res.json({
                    error: true,
                    cartError: true,
                    fieldErrors: [],
                    serverErrors: [],
                    redirectUrl: URLUtils.url('Cart-Show').toString()
                });
                return;
            }

            validatedProducts = validationHelpers.validateProducts(currentBasket);
            if (validatedProducts.error) {
                delete billingData.paymentInformation;

                res.json({
                    error: true,
                    cartError: true,
                    fieldErrors: [],
                    serverErrors: [],
                    redirectUrl: URLUtils.url('Cart-Show').toString()
                });
                return;
            }

            paymentMethodID = billingData.paymentMethod.value;

            billingForm.creditCardFields.cardNumber.htmlValue = '';
            billingForm.creditCardFields.securityCode.htmlValue = '';

            Transaction.wrap(function () {
                if (!billingAddress) {
                    billingAddress = currentBasket.createBillingAddress();
                }

                billingAddress.setFirstName(billingData.address.firstName.value);
                billingAddress.setLastName(billingData.address.lastName.value);
                billingAddress.setAddress1(billingData.address.address1.value);
                billingAddress.setAddress2(billingData.address.address2.value);
                billingAddress.setCity(billingData.address.city.value);
                billingAddress.setPostalCode(billingData.address.postalCode.value);
                if (Object.prototype.hasOwnProperty.call(billingData.address, 'stateCode')) {
                    billingAddress.setStateCode(billingData.address.stateCode.value);
                }
                billingAddress.setCountryCode(billingData.address.countryCode.value);
                billingAddress.setPhone(billingData.phone.value);
            });


            // if there is no selected payment option and balance is greater than zero
            if (!paymentMethodID && currentBasket.totalGrossPrice.value > 0) {
                noPaymentMethod[billingData.paymentMethod.htmlName] =
                    Resource.msg('error.no.selected.payment.method', 'payment', null);
                delete billingData.paymentInformation;

                res.json({
                    form: billingForm,
                    fieldErrors: [noPaymentMethod],
                    serverErrors: [],
                    error: true
                });
                return;
            }

            processor = PaymentMgr.getPaymentMethod(paymentMethodID).getPaymentProcessor();

            // check to make sure there is a payment processor
            if (!processor) {
                throw new Error(Resource.msg(
                    'error.payment.processor.missing',
                    'checkout',
                    null
                ));
            }
            if (HookMgr.hasHook('app.payment.processor.' + processor.ID.toLowerCase())) {
                result = HookMgr.callHook('app.payment.processor.' + processor.ID.toLowerCase(),
                    'Handle',
                    currentBasket,
                    billingData.paymentInformation,
                    paymentMethodID,
                    req
                );
            } else {
                result = HookMgr.callHook('app.payment.processor.default', 'Handle');
            }

            // need to invalidate credit card fields
            if (result.error) {
                delete billingData.paymentInformation;

                res.json({
                    form: billingForm,
                    fieldErrors: result.fieldErrors,
                    serverErrors: result.serverErrors,
                    authenticationData: result.authenticationData,
                    error: true
                });
                return;
            }

            if (HookMgr.hasHook('app.payment.processor.' + processor.ID.toLowerCase())) {
                HookMgr.callHook('app.payment.processor.' + processor.ID.toLowerCase(),
                    'savePaymentInformation',
                    req,
                    currentBasket,
                    billingData
                );
            } else {
                HookMgr.callHook('app.payment.form.processor.default', 'savePaymentInformation');
            }


            // Calculate the basket
            Transaction.wrap(function () {
                basketCalculationHelpers.calculateTotals(currentBasket);
            });

            // Re-calculate the payments.
            calculatedPaymentTransaction = COHelpers.calculatePaymentTransaction(
                currentBasket
            );

            if (calculatedPaymentTransaction.error) {
          // returns error object
                res.json({
                    form: paymentForm,
                    fieldErrors: [],
                    serverErrors: [Resource.msg('error.technical', 'checkout', null)],
                    error: true
                });
                return;
            }

            usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
            if (usingMultiShipping === true && currentBasket.shipments.length < 2) {
                req.session.privacyCache.set('usingMultiShipping', false);
                usingMultiShipping = false;
            }

            hooksHelper('app.customer.subscription', 'subscribeTo', [paymentForm.subscribe.checked, currentBasket.customerEmail], function () {});

            basketModel = new OrderModel(
                currentBasket,
                {usingMultiShipping: usingMultiShipping, countryCode: currentLocale.country, containerView: 'basket'}
            );

            accountModel = new AccountModel(req.currentCustomer);
            renderedStoredPaymentInstrument = COHelpers.getRenderedPaymentInstruments(
                req,
                accountModel
            );

            delete billingData.paymentInformation;

            var threeDRedirectUrl = URLUtils.https('GlobalPay-ThreedsRedirect').toString();
            var authenticationData = {
                threeDRedirectUrl: threeDRedirectUrl
            };

            res.json({
                renderedPaymentInstruments: renderedStoredPaymentInstrument,
                customer: accountModel,
                order: basketModel,
                form: billingForm,
                error: false,
                authenticationData: authenticationData
            });
        });
        return next();
    }
);

/**
 * CheckoutServices-PlaceOrder : The CheckoutServices-PlaceOrder endpoint places the order
 * @name Base/CheckoutServices-PlaceOrder
 * @function
 * @memberof CheckoutServices
 * @param {middleware} - server.middleware.https
 * @param {category} - sensitive
 * @param {returns} - json
 * @param {serverfunction} - post
 */
server.append('PlaceOrder', server.middleware.https, function (req, res, next) {
    var Resource = require('dw/web/Resource');
    var viewData = res.getViewData();
    if ('authorizationResult' in viewData && viewData.authorizationResult.serverErrors.length > 0) {
        res.json({
            error: true,
            errorMessage: Resource.msg('checkout.status.declined', 'globalpay', null)
        });
    }
    res.setViewData(viewData);

    next();
});

module.exports = server.exports();