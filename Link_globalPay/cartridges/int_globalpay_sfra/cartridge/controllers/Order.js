'use strict';

/**
 * @namespace Order
 */

var server = require('server');
var page = module.superModule;
var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var reportingUrlsHelper = require('*/cartridge/scripts/reportingUrls');
var OrderMgr = require('dw/order/OrderMgr');
var OrderModel = require('*/cartridge/models/order');
var Locale = require('dw/util/Locale');
var lastOrderID;
var config = {
    numberOfLineItems: '*'
};
var currentLocale;
var orderModel;
var passwordForm;
var reportingURLs;

server.extend(page);

/**
 * Order-Confirm : This endpoint is invoked when the shopper's Order is Placed and Confirmed
 * @name Base/Order-Confirm
 * @function
 * @memberof Order
 * @param {middleware} - consentTracking.consent
 * @param {middleware} - server.middleware.https
 * @param {middleware} - csrfProtection.generateToken
 * @param {querystringparameter} - ID - Order ID
 * @param {querystringparameter} - token - token associated with the order
 * @param {category} - sensitive
 * @param {serverfunction} - get
 */
server.append(
    'Confirm',
    consentTracking.consent,
    server.middleware.https,
    csrfProtection.generateToken,
    function (req, res, next) {
        var order;
      // When order form is empty
        if (!req.form.orderToken || !req.form.orderID) {
            res.render('/error', {
                message: Resource.msg('error.confirmation.error', 'confirmation', null)
            });

            return next();
        }

        order = OrderMgr.getOrder(req.form.orderID, req.form.orderToken);
        lastOrderID = Object.prototype.hasOwnProperty.call(
        req.session.raw.custom, 'orderID') ? req.session.raw.custom.orderID : null;
        if (lastOrderID === req.querystring.ID) {
            res.redirect(URLUtils.url('Home-Show'));
            return next();
        }
        currentLocale = Locale.getLocale(req.locale.id);

        orderModel = new OrderModel(
            order,
            {config: config, countryCode: currentLocale.country, containerView: 'order'}
        );
        reportingURLs = reportingUrlsHelper.getOrderReportingURLs(order);

        if (!req.currentCustomer.profile) {
            passwordForm = server.forms.getForm('newPasswords');
            passwordForm.clear();
            res.render('checkout/confirmation/confirmation', {
                order: orderModel,
                returningCustomer: false,
                passwordForm: passwordForm,
                reportingURLs: reportingURLs,
                orderUUID: order.getUUID(),
                paymentMode: order.paymentTransaction.paymentInstrument.paymentMethod
            });
        } else {
            res.render('checkout/confirmation/confirmation', {
                order: orderModel,
                returningCustomer: true,
                reportingURLs: reportingURLs,
                orderUUID: order.getUUID(),
                paymentMode: order.paymentTransaction.paymentInstrument.paymentMethod
            });
        }
        req.session.raw.custom.orderID = req.querystring.ID;
        return next();
    }
);
module.exports = server.exports();
