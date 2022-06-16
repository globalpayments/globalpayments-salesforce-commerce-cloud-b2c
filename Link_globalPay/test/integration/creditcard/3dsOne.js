var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');
var chai = require('chai');
var chaiSubset = require('chai-subset');
var jsonHelpers = require('../helpers/jsonUtils');
chai.use(chaiSubset);

/**
 * Test case:
 * should be able to submit an order with billingForm using 3ds2 creditcard
 */

describe('billingForm', function () {
    this.timeout(100000);

    it('positive test for 3dsone card', function () {
        var cookieJar = request.jar();
        var myRequest = {
            url: '',
            method: 'POST',
            rejectUnauthorized: false,
            resolveWithFullResponse: true,
            jar: cookieJar,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        var cookieString;
        var variantPid1 = '701643421084M';
        var qty1 = 2;
        var addProd = '/Cart-AddProduct';

        // ----- Step 1 adding product to Cart
        myRequest.url = config.baseUrl + addProd;
        myRequest.form = {
            pid: variantPid1,
            quantity: qty1
        };
        var browserData = new Object();
        browserData.colorDepth = 'TWENTY_FOUR_BITS';
        browserData.javaEnabled = false;
        browserData.javascriptEnabled = false;
        browserData.browserLanguage = 'en_US';
        browserData.screenHeight = 720;
        browserData.screenWidth = 1280;
        browserData.timezoneOffset = 0;
        browserData.userAgent = '';
        browserData.language = 'en_US';
        var authId = '';
        var paReq = '';
        var acsUrl = '';
        return request(myRequest)
            .then(function (addToCartResponse) {
                assert.equal(addToCartResponse.statusCode, 200, 'Expected add to Cart request statusCode to be 200.');
                cookieString = cookieJar.getCookieString(myRequest.url);
                myRequest.url = config.baseUrl + '/GlobalPay-Authentication';
                var cookie = request.cookie(cookieString);
                myRequest.body = {
                    card: {
                        cartData: {amount: 3000, address1: '182 Eagle Street', city: 'Fairview Heights', postalcode: '62208'},
                        reference: 'PMT_bbc1f9bc-b71f-47f0-92ba-ff72860e57a5'
                    }
                };

                myRequest.json = true;
                myRequest.form = null;
                cookieJar.setCookie(cookie, myRequest.body);
                cookieJar.setCookie(cookie, myRequest.url);
                // step2 : get cookies, Get Authentication response, then set cookies
                return request(myRequest);
            }).then(function (authResponse) {
                assert.equal(authResponse.statusCode, 200, 'Expected athentication response statusCode to be 200.');
                authId = authResponse.id;
                paReq = authResponse.challengevalue;
                acsUrl = authResponse.acschallengerequesturl;
                cookieString = cookieJar.getCookieString(myRequest.url);
                myRequest.url = config.baseUrl + '/CSRF-Generate';
                var cookie = request.cookie(cookieString);
                myRequest.body = null;
                myRequest.json = false;
                cookieJar.setCookie(cookie, myRequest.body);
                cookieJar.setCookie(cookie, myRequest.url);
                // step3 : get cookies, Generate CSRF, then set cookies
                return request(myRequest);
            }).then(function (csrfResponse) {
                var csrfJsonResponse = JSON.parse(csrfResponse.body);
                var details = {
                    details: {
                        accountId: 'TKA_b3a46f0f351f43cfad20acf5c32fea50',
                        accountName: 'tokenization',
                        cardBin: '426397',
                        cardLast4: '5262',
                        cardNumber: '4263970000005262',
                        cardSecurityCode: true,
                        cardType: 'visa',
                        expiryMonth: '12',
                        expiryYear: '2030',
                        merchantId: 'MER_7e3e2c7df34f42819b3edee31022ee3f',
                        merchantName: 'Sandbox_merchant_3',
                        reference: '3d3e020c-86da-a68f-e089-9f2bd11c45d2'
                    },
                    paymentReference: 'PMT_b2c6d29f-9ceb-47db-b30f-fc97a279f5da'
                };
                // step5 : submit billing request with token aquired in step 4
                myRequest.url = config.baseUrl + '/CheckoutServices-SubmitPayment?' +
                    csrfJsonResponse.csrf.tokenName + '=' +
                    csrfJsonResponse.csrf.token;
                myRequest.form = {
                    dwfrm_billing_shippingAddressUseAsBillingAddress: 'true',
                    dwfrm_billing_addressFields_firstName: 'John',
                    dwfrm_billing_addressFields_lastName: 'Smith',
                    dwfrm_billing_addressFields_address1: '10 main St',
                    dwfrm_billing_addressFields_address2: '',
                    dwfrm_billing_addressFields_country: 'us',
                    dwfrm_billing_addressFields_states_stateCode: 'MA',
                    dwfrm_billing_addressFields_city: 'burlington',
                    dwfrm_billing_addressFields_postalCode: '09876',
                    dwfrm_billing_paymentMethod: 'CREDIT_CARD',
                    dwfrm_billing_creditCardFields_cardType: 'Visa',
                    dwfrm_billing_creditCardFields_cardNumber: '4263970000005262',
                    dwfrm_billing_creditCardFields_expirationMonth: '12',
                    dwfrm_billing_creditCardFields_expirationYear: '2030',
                    dwfrm_billing_creditCardFields_securityCode: '342',
                    dwfrm_billing_contactInfoFields_email: 'blahblah@gmail.com',
                    dwfrm_billing_contactInfoFields_phone: '9786543213',

                    dwfrm_billing_creditCardFields_authId: 'AUT_b402d18e-5b46-461a-b50e-b32564bb2504',
                    dwfrm_billing_creditCardFields_isthreeds: 'AUTHENTICATION_SUCCESSFUL',
                    dwfrm_billing_creditCardFields_paymentToken: 'PMT_bbc1f9bc-b71f-47f0-92ba-ff72860e57a5',
                    dwfrm_billing_creditCardFields_saveCard: false,
                    dwfrm_billing_creditCardFields_paymentId: JSON.stringify(details),
                    dwfrm_billing_creditCardFields_cardOwner: 'cardOwner'
                };
                var ExpectedResBody = {
                    locale: 'en_US',
                    address: {
                        firstName: {value: 'John'},
                        lastName: {value: 'Smith'},
                        address1: {value: '10 main St'},
                        address2: {value: null},
                        city: {value: 'burlington'},
                        stateCode: {value: 'MA'},
                        postalCode: {value: '09876'},
                        countryCode: {value: 'us'}
                    },
                    paymentMethod: {value: 'CREDIT_CARD', htmlName: 'CREDIT_CARD'},
                    email: {value: 'blahblah@gmail.com'},
                    phone: {value: '9786543213'},
                    error: true,
                    cartError: true,
                    fieldErrors: [],
                    serverErrors: [],
                    saveCard: false
                };

                return request(myRequest)
                    .then(function (response) {
                        var bodyAsJson = JSON.parse(response.body);
                        var strippedBody = jsonHelpers.deleteProperties(bodyAsJson, ['redirectUrl', 'action', 'queryString']);
                        assert.equal(response.statusCode, 200, 'Expected CheckoutServices-SubmitPayment statusCode to be 200.');
                        assert.containSubset(strippedBody.address, ExpectedResBody.address, 'Expecting actual response address to be equal match expected response address');
                        assert.isFalse(strippedBody.error);
                        myRequest.method = 'POST';
                        myRequest.url = config.baseUrl + '/GlobalPay-ThreedsRedirect';
                        var cookie = request.cookie(cookieString);
                        myRequest.form = {
                            authId: authId,
                            paReq: paReq,
                            acsUrl: acsUrl
                        };
                        cookieJar.setCookie(cookie, myRequest.form);
                        cookieJar.setCookie(cookie, myRequest.url);
                        return request(myRequest);
                    });
            });
    });
});

