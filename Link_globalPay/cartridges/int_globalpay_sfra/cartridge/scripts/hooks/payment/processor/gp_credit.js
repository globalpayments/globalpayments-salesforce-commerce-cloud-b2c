/* eslint-disable linebreak-style */
'use strict';

var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
var PaymentMgr = require('dw/order/PaymentMgr');
var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');
var globalpayconstants = require('*/cartridge/scripts/constants/globalPayConstant');
var globalPayHelper = require('*/cartridge/scripts/helpers/globalPayHelpers');
var globalPayPreferences = require('*/cartridge/scripts/helpers/globalPayPreferences');
var PaymentInstrumentUtils = require('*/cartridge/scripts/util/paymentInstrumentUtil');
var array = require('*/cartridge/scripts/util/array');
var CustomerMgr = require('dw/customer/CustomerMgr');

/**
 * Verifies the required information for billing form is provided.
 * @param {Object} req - The request object
 * @param {Object} paymentForm - the payment form
 * @param {Object} viewFormData - object contains billing form data
 * @returns {Object} an object that has error information or payment information
 */
function processForm(req, paymentForm, viewFormData) {
  var viewData = viewFormData;
  var creditCardErrors = {};

  if (Object.keys(creditCardErrors).length) {
    return {
      fieldErrors: creditCardErrors,
      error: true
    };
  }

  viewData.paymentMethod = {
    value: paymentForm.paymentMethod.value,
    htmlName: paymentForm.paymentMethod.value
  };

  viewData.paymentInformation = {
    cardType: {
      value: paymentForm.creditCardFields.cardType.value,
      htmlName: paymentForm.creditCardFields.cardType.htmlName
    },
    cardNumber: {
      value: paymentForm.creditCardFields.cardNumber.value,
      htmlName: paymentForm.creditCardFields.cardNumber.htmlName
    },
    expirationMonth: {
      value: parseInt(
                paymentForm.creditCardFields.expirationMonth.selectedOption,
                10
            ),
      htmlName: paymentForm.creditCardFields.expirationMonth.htmlName
    },
    expirationYear: {
      value: parseInt(paymentForm.creditCardFields.expirationYear.value, 10),
      htmlName: paymentForm.creditCardFields.expirationYear.htmlName
    }
  };

  if (req.form.storedPaymentUUID) {
    viewData.storedPaymentUUID = req.form.storedPaymentUUID;
  }

  viewData.saveCard = paymentForm.creditCardFields.saveCard.checked;

    // process payment information
  if (viewData.storedPaymentUUID
        && req.currentCustomer.raw.authenticated
        && req.currentCustomer.raw.registered
    ) {
    var paymentInstruments = req.currentCustomer.wallet.paymentInstruments;
    var paymentInstrument = array.find(paymentInstruments, function (item) {
      return viewData.storedPaymentUUID === item.UUID;
    });

    viewData.paymentInformation.cardNumber.value = paymentInstrument.creditCardNumber;
    viewData.paymentInformation.cardType.value = paymentInstrument.creditCardType;
    viewData.paymentInformation.expirationMonth.value = paymentInstrument.creditCardExpirationMonth;
    viewData.paymentInformation.expirationYear.value = paymentInstrument.creditCardExpirationYear;
    viewData.paymentInformation.creditCardToken = paymentInstrument.raw.creditCardToken;
  }

  return {
    error: false,
    viewData: viewData
  };
}

/**
 * Save the credit card information to login account if save card option is selected
 * @param {Object} req - The request object
 * @param {dw.order.Basket} basket - The current basket
 * @param {Object} billingData - payment information
 */
function savePaymentInformation(req, basket, billingData) {
  if (req.currentCustomer.raw.authenticated
        && req.currentCustomer.raw.registered
        && billingData.saveCard
    ) {
    var customer = CustomerMgr.getCustomerByCustomerNumber(
            req.currentCustomer.profile.customerNo
        );
    var token = updateToken(billingData.paymentInformation.paymentId.value);
    var saveCardResult = COHelpers.savePaymentInstrumentToWallet(
            billingData,
            basket,
            customer,
            token
        );

    req.currentCustomer.wallet.paymentInstruments.push({
      creditCardHolder: saveCardResult.creditCardHolder,
      maskedCreditCardNumber: saveCardResult.maskedCreditCardNumber,
      creditCardType: saveCardResult.creditCardType,
      creditCardExpirationMonth: saveCardResult.creditCardExpirationMonth,
      creditCardExpirationYear: saveCardResult.creditCardExpirationYear,
      UUID: saveCardResult.UUID,
      creditCardNumber: Object.hasOwnProperty.call(
                saveCardResult,
                globalpayconstants.creditCardPay.CreditCardNumber
            )
                ? saveCardResult.creditCardNumber
                : null,
      raw: saveCardResult
    });
  }
}

/**
 * Updates a token to usage mode Multiple.
 * @returns {string} a token
 */
function updateToken(paymentTokenID) {
  var tokenizeData = {
    usage_mode: globalpayconstants.authorizationData.usage_mode,
    paymentInformationID: paymentTokenID
  };
  var tokenization = globalPayHelper.updateTokenUsageMode(tokenizeData);
  if (typeof tokenization !== 'undefined' && tokenization.id != null) {
    return tokenization.id;
  }
  return tokenization.error;
}
/**
 * Creates a token. This should be replaced by utilizing a tokenization provider
 * @returns {string} a token
 */
function gpcreateToken(formdata) {
  var expirymonth = formdata.expirationMonth >= 10 ? formdata.expirationMonth : '0' + formdata.expirationMonth;
  var expiryyear = formdata.expirationYear.toString().split('')[2] + formdata.expirationYear.toString().split('')[3];

  var tokenizeData = {
    usage_mode: globalpayconstants.authorizationData.usage_mode,
    reference: globalpayconstants.authorizationData.reference,
    first_name: formdata.name.split(' ')[0],
    last_name: formdata.name.split(' ')[1],
    card: {
      number: formdata.cardNumber,
      expiry_month: expirymonth,
      expiry_year: expiryyear
    },
    entry_mode: globalpayconstants.creditCardPay.entry_mode
  };
  var tokenization = globalPayHelper.tokenize(tokenizeData);
  return tokenization;
}

function createToken1() {
  return null;
}
  /**
   * Removes token. This should be replaced by utilizing a tokenization provider
   * @returns {string} a detokenize result
   */
function gpremoveToken(creditcrdaToken) {
  var tokenizeData = {
    id: creditcrdaToken // CreditcardToken
  };
  var detokenization = globalPayHelper.detokenize(tokenizeData);
  return detokenization;
}


/**
 * Authorizes a payment using a credit card. Customizations may use other processors and custom
 *      logic to authorize credit card payment.
 * @param {number} orderNumber - The current order's number
 * @param {dw.order.PaymentInstrument} paymentInstrument -  The payment instrument to authorize
 * @param {dw.order.PaymentProcessor} paymentProcessor -  The payment processor of the current
 *      payment method
 * @return {Object} returns an error object
 */
function Authorize(orderNumber, paymentInstrument, paymentProcessor, order) {
  var Site = require('dw/system/Site');
  var currentSite = Site.getCurrent();
  var Locale = require('dw/util/Locale');
  var serverErrors = [];
  var fieldErrors = {};
  var error = false;
  var preferences = globalPayPreferences.getPreferences();
  var captureMode = preferences.captureMode;
  var authorizationData = {
    account_name: globalpayconstants.authorizationData.account_name,
    channel: globalpayconstants.authorizationData.channel,
    capture_mode: captureMode.value,
    type: globalpayconstants.authorizationData.type,
    amount: (order.totalGrossPrice.value * 100).toFixed(),
    currency: order.currencyCode,
    reference: orderNumber,
    country: Locale.getLocale(currentSite.defaultLocale).country,
    payment_method: {
      id: paymentInstrument.custom.gp_paymentmethodid,
      entry_mode: globalpayconstants.authorizationData.entrymode,
      authentication: {
        id: paymentInstrument.custom.gp_authenticationid
      }
    }
  };
  // authorize payment
  var authorization = globalPayHelper.authorize(authorizationData);
  if (typeof authorization !== 'undefined' && 'success' in authorization && !authorization.success) {
    var error = true;
    var serverErrors = [];
    if ('error' in authorization) { serverErrors.push(authorization.error.detailedErrorDescription); }
  } else {
    if ('status' in authorization && authorization.status === 'DECLINED') {
      error = true;
      serverErrors.push(Resource.msg('checkout.status.declined', 'globalpay', null));
      return {
        fieldErrors: fieldErrors,
        serverErrors: serverErrors,
        error: error
      };
    }
    try {
      Transaction.wrap(function () {
        paymentInstrument.custom.gp_transactionid = authorization.id;
        paymentInstrument.paymentTransaction.setTransactionID(orderNumber);
        paymentInstrument.paymentTransaction.setPaymentProcessor(paymentProcessor);
      });
    } catch (e) {
      error = true;
      serverErrors.push(Resource.msg('error.technical', 'checkout', null));
    }
  }
  return { fieldErrors: fieldErrors, serverErrors: serverErrors, error: error };
}
/**
 * Update payment method and authentication for credit card payment also  handle 3d secured transaction
 * @param {*} basket
 * @param {*} paymentInformation
 * @param {*} paymentMethodID
 * @param {*} req
 * @returns
 */

function Handle(basket, paymentInformation, paymentMethodID, req) {
  var currentBasket = basket;
  var cardErrors = {};
  var cardNumber = paymentInformation.cardNumber.value;
  var cardOwner=paymentInformation.cardOwner.value;
  var expirationMonth = paymentInformation.expirationMonth.value;
  var expirationYear = paymentInformation.expirationYear.value;
  var serverErrors = [];
  var cardType = paymentInformation.cardType.value;
  var PaymentInstrument = require('dw/order/PaymentInstrument');


    // Validate payment instrument
  if (paymentMethodID === PaymentInstrument.METHOD_CREDIT_CARD) {
    var creditCardPaymentMethod = PaymentMgr.getPaymentMethod(PaymentInstrument.METHOD_CREDIT_CARD);
    var paymentCardValue = PaymentMgr.getPaymentCard(cardType);

    var applicablePaymentCards = creditCardPaymentMethod.getApplicablePaymentCards(
            req.currentCustomer.raw,
            req.geolocation.countryCode,
            null
        );

    if (!applicablePaymentCards.contains(paymentCardValue)) {
            // Invalid Payment Instrument
      var invalidPaymentMethod = Resource.msg('error.show.valid.payments', 'globalpay', null);
      return { fieldErrors: [], serverErrors: [invalidPaymentMethod], error: true };
    }
  }

  var preferences = globalPayPreferences.getPreferences();

  if (typeof paymentInformation.isthreeds.value !== 'undefined' && paymentInformation.isthreeds.value === 'CHALLENGE_REQUIRED') {
    var threeDsStepTwo = {
      auth_id: paymentInformation.authId.value
    };

    var threeDsStepTwoResp = globalPayHelper.threeDsSteptwo(threeDsStepTwo);

    if (typeof threeDsStepTwoResp !== 'undefined' && typeof threeDsStepTwoResp.success !== 'undefined' && !threeDsStepTwoResp.success) {
      var serverErrors = [];
      serverErrors.push(threeDsStepTwoResp.error.detailedErrorDescription);
      return { fieldErrors: [], serverErrors: serverErrors, error: true };
    }
  }


  Transaction.wrap(function () {
    // clear previous payment instrument and update new selected payment instrument
    var paymentInstrument = PaymentInstrumentUtils.RemoveExistingPaymentInstruments(PaymentInstrument.METHOD_CREDIT_CARD);
    paymentInstrument.setCreditCardHolder(cardOwner?cardOwner:currentBasket.billingAddress.fullName);
    paymentInstrument.custom.gp_authenticationid = paymentInformation.authId.value;
    paymentInstrument.custom.gp_paymentmethodid = req.form.storedPaymentUUID && req.currentCustomer.raw.authenticated && req.currentCustomer.raw.registered ? getTokenbyUUID(req, paymentInformation.paymentId.value) : paymentInformation.paymentId.value;
    paymentInstrument.setCreditCardNumber(cardNumber);
    paymentInstrument.setCreditCardType(cardType);
    paymentInstrument.setCreditCardExpirationMonth(expirationMonth);
    paymentInstrument.setCreditCardExpirationYear(expirationYear);
    paymentInstrument.setCreditCardToken(paymentInformation.authId.value);
  });
  return { fieldErrors: cardErrors, serverErrors: serverErrors, error: false, threeDsStepTwoResp: threeDsStepTwoResp };
}
/**
 * update payment tokenId to paymentInstruments
 * @param {*} req
 * @param {*} uuidToken
 * @returns
 */
function getTokenbyUUID(req, uuidToken) {
  var testcust = req.currentCustomer;
  var creditCardToken;
  testcust.wallet.paymentInstruments.forEach(function (each) {
    if (each.UUID === uuidToken) {
      creditCardToken = each.raw.creditCardToken;
      return creditCardToken;
    }
  });
  return creditCardToken;
}

exports.processForm = processForm;
exports.savePaymentInformation = savePaymentInformation;
exports.Authorize = Authorize;
exports.updateToken = updateToken;
exports.createToken1 = createToken1;
exports.gpcreateToken = gpcreateToken;
exports.gpremoveToken = gpremoveToken;
exports.Handle = Handle;
