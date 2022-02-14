var Status = require('dw/system/Status');
var PaymentInstrument = require('dw/order/PaymentInstrument');
var ApplePayHookResult = require('dw/extensions/applepay/ApplePayHookResult');
var collections = require('*/cartridge/scripts/util/collections');
var Resource = require('dw/web/Resource');
var server = require('server');
var URLUtils = require('dw/web/URLUtils');
var Logger = require('dw/system/Logger');
var hooksHelper = require('*/cartridge/scripts/helpers/hooks');
var shippingMethodValidationHelper = require('~/cartridge/scripts/helpers/shippingMethodValidationHelper');
var shippingHelpers = require('*/cartridge/scripts/checkout/shippingHelpers');


/**
 * update State Code
 * @param Obj
 * @returns {Boolean}
 */
 function updateStateCode(address, stateCode) {
    var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    if (stateCode && stateCode.toString().length > 2) {
        address.stateCode = COHelpers.getStateCode(stateCode.toString());
    } else {
        address.stateCode = stateCode ? stateCode.toString().toUpperCase() : null;
    }
    return address;
}
/**
 * @function isApplePayPaymentInstrument to validate apple pay payment instrument
 */
 function isApplePayPaymentInstrument(Obj) {
    var paymentInstruments = Obj.getPaymentInstruments(
        PaymentInstrument.METHOD_DW_APPLE_PAY).toArray();
    if (!paymentInstruments.length) {
        Logger.error('Unable to find Apple Pay payment instrument for order.');
        return false;
    }
    return true;
}
/**
 * @function getRequest hook is called whenever there is a new request on the site
 */
exports.getRequest = function (basket, response) {
    session.custom.applepaysession = 'yes';   // eslint-disable-line
    var status = new Status(Status.OK);
    var result = new ApplePayHookResult(status, null);
    if (!basket.paymentInstruments.empty && !isApplePayPaymentInstrument(basket)) {
        return result;
    }
return result;
};

/**
 * @function shippingContactSelected hook is called when the selected shippingContact is processed
 * validation of all the shipping address fields should be done here
 */
 exports.shippingContactSelected = function (basket, event, res) {
    // Remove Vertex session objects
    delete session.privacy.VertexAddressSuggestionsError;
    delete session.privacy.VertexAddressSelected;
    delete session.privacy.VertexAddressSelectedMult;

    var validShippingAddress;
    var shippingMethods = [];
    var methodsTodevice = [];
    var shippingAddress = {};
    var status = null;

    // validate coupon lineItem
    var validationHelpers = require('*/cartridge/scripts/helpers/basketValidationHelpers');
    validationHelpers.validateCoupons(basket);

    // if Bopis Only return ok
    if (basket.defaultShipment.custom.fromStoreId) {
        return new Status(Status.OK);
    }

    // Address detail from Apple pay
    shippingAddress.firstName = event.shippingContact.givenName;
    shippingAddress.lastName = event.shippingContact.familyName;
    shippingAddress = updateStateCode(shippingAddress, event.shippingContact.administrativeArea);
    shippingAddress.postalCode = event.shippingContact.postalCode;
    shippingAddress.countryCode = event.shippingContact.countryCode.toUpperCase();
    shippingAddress.city = event.shippingContact.locality;


    // Validate Shipping and State
    var validShippingAddress = addressValidationHelper.validateShippingAddress(shippingAddress, null);
    if (validShippingAddress.error) {
        Logger.error('Error in Shipping contact selection.');
        res.shippingMethods = [];
        status = new Status(Status.ERROR);
        status.addDetail(ApplePayHookResult.STATUS_REASON_DETAIL_KEY, ApplePayHookResult.REASON_SHIPPING_ADDRESS);
        return new ApplePayHookResult(status, URLUtils.https('Cart-Show'));
    }
    // validate Shipping restriction
    shippingMethods = shippingHelpers.getApplicableShippingMethods(basket.defaultShipment, shippingAddress);
    var basketInfo = srHelper.getBasketInfo(basket);
    // filter shoprunner shipping method
    shippingMethods = shippingMethods.filter(function (shippingMethod) {
        if (shippingMethod.ID === 'shoprunner' && empty(session.custom.srtoken) || (shippingMethod.ID === 'shoprunner' && basketInfo.basketHasNonShoprunner)){
            return;
        }
        return shippingMethod;
    });

    if (shippingMethods.length === 0) {
        res.shippingMethods = [];
        status = new Status(Status.ERROR);
        status.addDetail(ApplePayHookResult.STATUS_REASON_DETAIL_KEY, ApplePayHookResult.REASON_SHIPPING_ADDRESS);
        return new ApplePayHookResult(status, URLUtils.https('Cart-Show'));
    }
    // Adding setting Shipping form values as vertex uses Shipping form for tax calculation internally
    var shippingForm = server.forms.getForm('shipping');
    if (shippingForm) {
        shippingForm.clear();
        var addressFields = shippingForm.shippingAddress.addressFields;
        addressFields.postalCode.value = shippingAddress.postalCode;
        addressFields.city.value = shippingAddress.city;
        addressFields.states.stateCode.value = shippingAddress.stateCode;
        addressFields.country.value = shippingAddress.countryCode;
    }

    require('dw/system/Transaction').wrap(function () {
        if (basket.defaultShipment.shippingMethod) {
            shippingHelpers.selectShippingMethod(basket.defaultShipment, basket.defaultShipment.shippingMethod.ID, null, shippingAddress);
        } else {
            shippingHelpers.selectShippingMethod(basket.defaultShipment, null, null, shippingAddress);
        }
        basketCalculationHelpers.calculateTotals(basket);
    });

    shippingMethods.sort(function (a, b) {
        if (b.ID === basket.defaultShipment.shippingMethod.ID) {
            return 1;
        }
        if (a.ID === basket.defaultShipment.shippingMethod.ID) {
            return -1;
        }
    });

    shippingMethods.forEach(function (shippingMethod) {
        methodsTodevice.push({
            amount: shippingMethod.shippingAmount,
            identifier: shippingMethod.ID,
            label: shippingMethod.displayName,
            detail: shippingMethod.description
        });
    });
    res.shippingMethods = methodsTodevice;
    if (basket.totalTax.available) {
        var tax = {};
        tax.label = Resource.msg('order.label.tax', 'checkout', 'Tax');
        tax.amount = basket.getTotalTax().toNumberString();
        if (res.lineItems.length > 2 && res.lineItems[2].label === Resource.msg('order.label.tax', 'checkout', 'Tax')) {
            res.lineItems.splice(2, 1, tax);
        } else {
            res.lineItems.splice(2, 0, tax);
        }
    }
    res.total.amount = basket.getTotalGrossPrice().toNumberString();
    var e = {};
    e.name = 'shippingContactSelected';
    res.event = e;
};

/**
 * @function shippingMethodSelected hook is called when the selected shippingMethod is processed
 */
exports.shippingMethodSelected = function (basket, shippingMethod) {
    var status = new Status(Status.OK);
    // Validate shipping Address
    var error = new Status(Status.ERROR);
    var validationFail = false;
    var shippingMethod;
    // loop of order shipments
    collections.forEach(basket.getShipments(), function (shipment) {
        shippingMethod = shippingMethodValidationHelper.validateShippingMethod(shipment);
        if (shippingMethod.error) {
            validationFail = true;
        }
    });
    var result;
    if (validationFail) {
        result = new ApplePayHookResult(error, null);
    } else {
        result = new ApplePayHookResult(status, null);
    }
    return result;
};
/**
 *	prepareBasket hook implementation for Apple pay updating the  personalization data in Basket from PDP and Quickview
 * @param order
 * @param payment
 * @param custom
 * @param status
 * @returns status
 */
 exports.prepareBasket = function (basket, parameters) {
    var status = new Status(Status.OK), result;
    var basketError = new Status(Status.ERROR);
    var errorMessage;
    if (!empty(basket)) {
        result = new ApplePayHookResult(basketError, null);
    } else {
        result = new ApplePayHookResult(status, null);
    }
    return result;
};
/**
 * @param  {Basket} basket
 * @param  {Object} event
 * @returns status
 */
 exports.createOrder = function (basket) {
    var Transaction = require('dw/system/Transaction');
    var failedStatus = new Status(Status.ERROR);
    try {
        if (!basket.defaultShipment.custom.fromStoreId) {
            Transaction.wrap(function () {
                updateStateCode(basket.billingAddress, basket.billingAddress.stateCode);
                updateStateCode(basket.defaultShipment.shippingAddress, basket.defaultShipment.shippingAddress.stateCode);
                basket.billingAddress.setCountryCode(basket.billingAddress.countryCode.value.toString().toUpperCase());
                basket.defaultShipment.shippingAddress.setCountryCode(basket.defaultShipment.shippingAddress.countryCode.value.toString().toUpperCase());
            });

            var validShippingAddress = addressValidationHelper.validateShippingAddress({
                firstName: basket.defaultShipment.shippingAddress.firstName,
                lastName: basket.defaultShipment.shippingAddress.lastName,
                address1: basket.defaultShipment.shippingAddress.address1,
                address2: basket.defaultShipment.shippingAddress.address2,
                city: basket.defaultShipment.shippingAddress.city,
                stateCode: basket.defaultShipment.shippingAddress.stateCode,
                countryCode: basket.defaultShipment.shippingAddress.countryCode.value
            }, PaymentInstrument.METHOD_DW_APPLE_PAY);
            if (validShippingAddress.error) {
                session.custom.invalidAddress = true;
                failedStatus.addDetail(ApplePayHookResult.STATUS_REASON_DETAIL_KEY, ApplePayHookResult.REASON_SHIPPING_ADDRESS);
                return failedStatus;
            }
        }
    } catch (e) {
        return failedStatus;
    }
};
exports.authorizeOrderPayment = function (order) {
    order.addNote('Payment Authorization Warning!', 'This is a dummy ' +
      'authorizeOrderPayment hook implementation. Please disable it to use ' +
      'the built-in PSP API, or implement the necessary calls to the ' +
      'Payment Provider for authorization.');
    var paymentInstruments = order.getPaymentInstruments(
        PaymentInstrument.METHOD_DW_APPLE_PAY).toArray();
    if (!paymentInstruments.length) {
        Logger.error('Unable to find Apple Pay payment instrument for order.');
        return null;
    }
    var paymentInstrument = paymentInstruments[0];
    var paymentTransaction = paymentInstrument.getPaymentTransaction();
    paymentTransaction.setTransactionID('DUMMY-APPLEPAY-PSP-TRANSACTION-ID');
    return new Status(Status.OK);
};