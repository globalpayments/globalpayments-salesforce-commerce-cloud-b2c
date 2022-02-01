'use strict';

/**
 * @namespace CheckoutServices
 */

var server = require('server');
var page = module.superModule;
server.extend(page);
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var globalpayconstants = require('*/cartridge/scripts/constants/globalpayconstants');

 /* Route to handle paypal submission. This route is called only when either
    PayPal Express or PayPal billing agreement is called from either mini cart or cart page. */
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
  var OrderMgr = require('dw/order/OrderMgr');
  var Resource = require('dw/web/Resource');
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
    var currentBasket = BasketMgr.getCurrentBasket();
    var billingAddress = currentBasket.billingAddress;
    var billingForm = server.forms.getForm('billing');
    viewData.address = {
      firstName: { value: paymentForm.addressFields.firstName.value },
      lastName: { value: paymentForm.addressFields.lastName.value },
      address1: { value: paymentForm.addressFields.address1.value },
      address2: { value: paymentForm.addressFields.address2.value },
      city: { value: paymentForm.addressFields.city.value },
      postalCode: { value: paymentForm.addressFields.postalCode.value },
      countryCode: { value: paymentForm.addressFields.country.value }
    };
    if (Object.prototype.hasOwnProperty.call(paymentForm.addressFields, 'states')) {
      viewData.address.stateCode = { value: paymentForm.addressFields.states.stateCode.value };
    }
    res.setViewData(viewData);
    Transaction.wrap(function () {
      if (!billingAddress) {
        billingAddress = currentBasket.createBillingAddress();
      }
      var billingData = res.getViewData();
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
    var Locale = require('dw/util/Locale');
    var OrderModel = require('*/cartridge/models/order');
    var AccountModel = require('*/cartridge/models/account');
    var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
    if (usingMultiShipping === true && currentBasket.shipments.length < 2) {
      req.session.privacyCache.set('usingMultiShipping', false);
      usingMultiShipping = false;
    }
    var currentLocale = Locale.getLocale(req.locale.id);
    var basketModel = new OrderModel(currentBasket, { usingMultiShipping: usingMultiShipping, countryCode: currentLocale.country, containerView: 'basket' });
    var accountModel = new AccountModel(req.currentCustomer);
    var renderedStoredPaymentInstrument = COHelpers.getRenderedPaymentInstruments(
            req,
            accountModel
        );
    var paymentMethodIdValue = paymentForm.paymentMethod.value;

    var paymentProcessor = PaymentManager.getPaymentMethod(paymentMethodIdValue).getPaymentProcessor();
    var paymentFormResult;
    if (HookManager.hasHook('app.payment.processor.' + paymentProcessor.ID.toLowerCase())) {
      paymentFormResult = HookManager.callHook('app.payment.processor.' + paymentProcessor.ID.toLowerCase(),
                'Handle',
                currentBasket,
                req
            );
    } else {
      paymentFormResult = HookManager.callHook('app.payment.form.processor.default_form_processor', 'processForm');
    }


    var order = COHelpers.createOrder(currentBasket);

         // Handles payment authorization
    var handlePaymentResult = COHelpers.handlePayments(order, order.orderNo, req);

    if (paymentForm.paymentMethod.value == Resource.msg('paymentmethodname.paypal', 'globalpay', null)) {
      res.json({
        renderedPaymentInstruments: renderedStoredPaymentInstrument,
        customer: accountModel,
        order: basketModel,
        form: billingForm,
        error: false,
        paypalresp: handlePaymentResult.authorizationResult.paypalresp
      });
    } else {
            // place and update order
      var gputil = require('*/cartridge/scripts/utils/gputil');
      gputil.orderUpdate(order);
      COHelpers.sendConfirmationEmail(order, req.locale.id);
      var URLUtils = require('dw/web/URLUtils');
            // redirect to Confirmation page
      res.json({
        error: false,
        orderID: order.orderNo,
        orderToken: order.orderToken,
        continueUrl: URLUtils.url('Order-Confirm').toString()
      });
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

      if (paymentForm.paymentMethod.value == Resource.msg('paymentmethodname.paypal', 'globalpay', null) || paymentForm.paymentMethod.value == Resource.msg('paymentmethodname.googlepay', 'globalpay', null) || paymentForm.paymentMethod.value == Resource.msg('paymentmethodname.applepay', 'globalpay', null)) {
        handlePayments(req, res, next);
        this.emit('route:Complete', req, res);
        return;
      }
        // verify billing form data
      var billingFormErrors = COHelpers.validateBillingForm(paymentForm.addressFields);
      var contactInfoFormErrors = COHelpers.validateFields(paymentForm.contactInfoFields);
      var formFieldErrors = [];
      if (Object.keys(billingFormErrors).length) {
        formFieldErrors.push(billingFormErrors);
      } else {
        viewData.address = {
          firstName: { value: paymentForm.addressFields.firstName.value },
          lastName: { value: paymentForm.addressFields.lastName.value },
          address1: { value: paymentForm.addressFields.address1.value },
          address2: { value: paymentForm.addressFields.address2.value },
          city: { value: paymentForm.addressFields.city.value },
          postalCode: { value: paymentForm.addressFields.postalCode.value },
          countryCode: { value: paymentForm.addressFields.country.value }
        };

        if (Object.prototype.hasOwnProperty.call(paymentForm.addressFields, 'states')) {
          viewData.address.stateCode = { value: paymentForm.addressFields.states.stateCode.value };
        }
      }

      if (Object.keys(contactInfoFormErrors).length) {
        formFieldErrors.push(contactInfoFormErrors);
      } else {
        viewData.phone = { value: paymentForm.contactInfoFields.phone.value };
      }
      var paymentMethodIdValue = paymentForm.paymentMethod.value;
      if (!PaymentManager.getPaymentMethod(paymentMethodIdValue).paymentProcessor) {
        throw new Error(Resource.msg(
                'error.payment.processor.missing',
                'checkout',
                null
            ));
      }

      var paymentProcessor = PaymentManager.getPaymentMethod(paymentMethodIdValue).getPaymentProcessor();
      var paymentFormResult;
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
        viewData.paymentInformation.paymentId = {
          value: JSON.parse(paymentForm.creditCardFields.paymentId.htmlValue).paymentReference,
          htmlName: JSON.parse(paymentForm.creditCardFields.paymentId.htmlValue).paymentReference
        };
      }

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

        var currentBasket = BasketMgr.getCurrentBasket();

        var billingData = res.getViewData();

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

        var validatedProducts = validationHelpers.validateProducts(currentBasket);
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

        var billingAddress = currentBasket.billingAddress;
        var billingForm = server.forms.getForm('billing');
        var paymentMethodID = billingData.paymentMethod.value;
        var result;

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
          var noPaymentMethod = {};

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

        var processor = PaymentMgr.getPaymentMethod(paymentMethodID).getPaymentProcessor();

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
        var calculatedPaymentTransaction = COHelpers.calculatePaymentTransaction(
                currentBasket
            );

        if (calculatedPaymentTransaction.error) {
          res.json({
            form: paymentForm,
            fieldErrors: [],
            serverErrors: [Resource.msg('error.technical', 'checkout', null)],
            error: true
          });
          return;
        }

        var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
        if (usingMultiShipping === true && currentBasket.shipments.length < 2) {
          req.session.privacyCache.set('usingMultiShipping', false);
          usingMultiShipping = false;
        }

        hooksHelper('app.customer.subscription', 'subscribeTo', [paymentForm.subscribe.checked, currentBasket.customerEmail], function () {});

        var currentLocale = Locale.getLocale(req.locale.id);

        var basketModel = new OrderModel(
                currentBasket,
                { usingMultiShipping: usingMultiShipping, countryCode: currentLocale.country, containerView: 'basket' }
            );

        var accountModel = new AccountModel(req.currentCustomer);
        var renderedStoredPaymentInstrument = COHelpers.getRenderedPaymentInstruments(
                req,
                accountModel
            );

        delete billingData.paymentInformation;

        res.json({
          renderedPaymentInstruments: renderedStoredPaymentInstrument,
          customer: accountModel,
          order: basketModel,
          form: billingForm,
          error: false
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
server.replace('PlaceOrder', server.middleware.https, function (req, res, next) {
  var BasketMgr = require('dw/order/BasketMgr');
  var OrderMgr = require('dw/order/OrderMgr');
  var Order = require('dw/order/Order');
  var Resource = require('dw/web/Resource');
  var Transaction = require('dw/system/Transaction');
  var URLUtils = require('dw/web/URLUtils');
  var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
  var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
  var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
  var validationHelpers = require('*/cartridge/scripts/helpers/basketValidationHelpers');
  var addressHelpers = require('*/cartridge/scripts/helpers/addressHelpers');
  var gputil = require('*/cartridge/scripts/utils/gputil');

  var currentBasket = BasketMgr.getCurrentBasket();

  if (!currentBasket) {
    res.json({
      error: true,
      cartError: true,
      fieldErrors: [],
      serverErrors: [],
      redirectUrl: URLUtils.url('Cart-Show').toString()
    });
    return next();
  }

  var validatedProducts = validationHelpers.validateProducts(currentBasket);
  if (validatedProducts.error) {
    res.json({
      error: true,
      cartError: true,
      fieldErrors: [],
      serverErrors: [],
      redirectUrl: URLUtils.url('Cart-Show').toString()
    });
    return next();
  }

  if (req.session.privacyCache.get('fraudDetectionStatus')) {
    res.json({
      error: true,
      cartError: true,
      redirectUrl: URLUtils.url('Error-ErrorCode', 'err', '01').toString(),
      errorMessage: Resource.msg('error.technical', 'checkout', null)
    });

    return next();
  }

  // Validate Order
  var validationOrderStatus = hooksHelper('app.validate.order', 'validateOrder', currentBasket, require('*/cartridge/scripts/hooks/validateOrder').validateOrder);
  if (validationOrderStatus.error) {
    res.json({
      error: true,
      errorMessage: validationOrderStatus.message
    });
    return next();
  }

    // Check to make sure there is a shipping address
  if (currentBasket.defaultShipment.shippingAddress === null) {
    res.json({
      error: true,
      errorStage: {
        stage: 'shipping',
        step: 'address'
      },
      errorMessage: Resource.msg('error.no.shipping.address', 'checkout', null)
    });
    return next();
  }

    // Check to make sure billing address exists
  if (!currentBasket.billingAddress) {
    res.json({
      error: true,
      errorStage: {
        stage: 'payment',
        step: 'billingAddress'
      },
      errorMessage: Resource.msg('error.no.billing.address', 'checkout', null)
    });
    return next();
  }

    // Calculate the basket
  Transaction.wrap(function () {
    basketCalculationHelpers.calculateTotals(currentBasket);
  });

    // Re-validates existing payment instruments
  var validPayment = COHelpers.validatePayment(req, currentBasket);
  if (validPayment.error) {
    res.json({
      error: true,
      errorStage: {
        stage: 'payment',
        step: 'paymentInstrument'
      },
      errorMessage: Resource.msg('error.show.valid.payments', 'globalpay', null)
    });
    return next();
  }

    // Re-calculate the payments.
  var calculatedPaymentTransactionTotal = COHelpers.calculatePaymentTransaction(currentBasket);
  if (calculatedPaymentTransactionTotal.error) {
    res.json({
      error: true,
      errorMessage: Resource.msg('error.technical', 'checkout', null)
    });
    return next();
  }

    // Creates a new order.
  var order = COHelpers.createOrder(currentBasket);
  if (!order) {
    res.json({
      error: true,
      errorMessage: Resource.msg('error.technical', 'checkout', null)
    });
    return next();
  }

    // Handles payment authorization
  var handlePaymentResult = COHelpers.handlePayments(order, order.orderNo, req);

    // Handle custom processing post authorization
  var options = {
    req: req,
    res: res
  };
  var postAuthCustomizations = hooksHelper('app.post.auth', 'postAuthorization', handlePaymentResult, order, options, require('*/cartridge/scripts/hooks/postAuthorizationHandling').postAuthorization);
  if (postAuthCustomizations && Object.prototype.hasOwnProperty.call(postAuthCustomizations, 'error')) {
    res.json(postAuthCustomizations);
    return next();
  }

  // handle error
  if (handlePaymentResult.error) {
    res.json({
      error: true,
      errorMessage: Resource.msg('error.technical', 'checkout', null)
    });
    return next();
  }
  var fraudDetectionStatus = hooksHelper('app.fraud.detection', 'fraudDetection', currentBasket, require('*/cartridge/scripts/hooks/fraudDetection').fraudDetection);
  if (fraudDetectionStatus.status === 'fail') {
    Transaction.wrap(function () { OrderMgr.failOrder(order, true); });

        // fraud detection failed
    req.session.privacyCache.set('fraudDetectionStatus', true);

    res.json({
      error: true,
      cartError: true,
      redirectUrl: URLUtils.url('Error-ErrorCode', 'err', fraudDetectionStatus.errorCode).toString(),
      errorMessage: Resource.msg('error.technical', 'checkout', null)
    });

    return next();
  }

    // Places the order
  var placeOrderResult = COHelpers.placeOrder(order, fraudDetectionStatus);
  if (placeOrderResult.error) {
    res.json({
      error: true,
      errorMessage: Resource.msg('error.technical', 'checkout', null)
    });
    return next();
  }

  if (req.currentCustomer.addressBook) {
        // save all used shipping addresses to address book of the logged in customer
    var allAddresses = addressHelpers.gatherShippingAddresses(order);
    allAddresses.forEach(function (address) {
      if (!addressHelpers.checkIfAddressStored(address, req.currentCustomer.addressBook.addresses)) {
        addressHelpers.saveAddress(address, req.currentCustomer, addressHelpers.generateAddressName(address));
      }
    });
  }

  if (order.getCustomerEmail()) {
    gputil.orderUpdate(order);
    COHelpers.sendConfirmationEmail(order, req.locale.id);
  }

    // Reset usingMultiShip after successful Order placement
  req.session.privacyCache.set('usingMultiShipping', false);
    // TODO: Exposing a direct route to an Order, without at least encoding the orderID
    //  is a serious PII violation.  It enables looking up every customers orders, one at a
    //  time.
  res.json({
    error: false,
    orderID: order.orderNo,
    orderToken: order.orderToken,
    continueUrl: URLUtils.url('Order-Confirm').toString()
  });

  return next();
});

module.exports = server.exports();