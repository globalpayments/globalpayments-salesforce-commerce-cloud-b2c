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
  this.timeout(10000);

  it('positive test for googlepay', function () {
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
    var variantPid1 = '013742335262M';
    var qty1 = 1;
    var addProd = '/Cart-AddProduct';

        // ----- Step 1 adding product to Cart
    myRequest.url = config.baseUrl + addProd;
    myRequest.form = {
      pid: variantPid1,
      quantity: qty1
    };

    return request(myRequest)
            .then(function (addToCartResponse) {
              assert.equal(addToCartResponse.statusCode, 200, 'Expected add to Cart request statusCode to be 200.');
                // cookieString = cookieJar.getCookieString(myRequest.url);
              var myRequest = {
                url: '',
                method: 'POST',
                rejectUnauthorized: false,
                resolveWithFullResponse: true,
                jar: cookieJar
              };
              myRequest.url = config.baseUrl + '/CheckoutShippingServices-UpdateShippingMethodsList';
              myRequest.form = {
                stateCode: 'CA',
                postalCode: '09876'

              };
              myRequest.currentCustomer = {

                profile: {
                  email: 'abc@test.com'
                },
                raw:
                {
                  authenticated: true,
                  registered: true
                },
                addressBook: {
                  preferredAddress: {
                    address1: '5 Wall St.'
                  }
                }
              };
            // step2 : update shipping method
              return request(myRequest);
            }).then(function (initResponse) {
              assert.equal(initResponse.statusCode, 200, 'Expected add to Cart request statusCode to be 200.');
              cookieString = cookieJar.getCookieString(myRequest.url);
              myRequest.url = config.baseUrl + '/CSRF-Generate';
              var cookie = request.cookie(cookieString);
              myRequest.body = null;
              myRequest.json = false;
              cookieJar.setCookie(cookie, myRequest.body);
              cookieJar.setCookie(cookie, myRequest.currentCustomer);
              cookieJar.setCookie(cookie, myRequest.url);
                // step4 : get cookies, Generate CSRF, then set cookies
              return request(myRequest);
            }).then(function (csrfResponse) {
              var csrfJsonResponse = JSON.parse(csrfResponse.body);

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
                dwfrm_billing_paymentMethod: 'GP_DW_GOOGLE_PAY',
                dwfrm_billing_contactInfoFields_email: 'blahblah@gmail.com',
                dwfrm_billing_contactInfoFields_phone: '9786543213',
                dwfrm_billing_creditCardFields_authId: '',
                dwfrm_billing_creditCardFields_isthreeds: '',
                dwfrm_billing_creditCardFields_paymentToken: '',
                dwfrm_billing_creditCardFields_saveCard: false,
                dwfrm_billing_creditCardFields_paymentId: '',
                dwfrm_billing_creditCardFields_cardOwner: '',
                dwfrm_billing_creditCardFields_paymentToken: JSON.stringify({
                  signature: 'MEUCIQDrwan57tjxB62/Ji3VzPCCyPZOv5oKM5X/0w1beJ0eTQIgPQyl5B+zkPFfFfXiO/WzZgNImTK7h4IEvJsLRkUchsY\u003d',
                  protocolVersion: 'ECv1',
                  signedMessage: '{"encryptedMessage":"0/+0QJmFypbWuC37CVTaWxrB1G7QWDNHADy3D657SJDCjtNXUfrcc/60GzL8x04X2W8813ZR7jeogksMGattV/XEdr9doRbho0pCBGrS1qYn/yMUosc+zMLKfdms0HeC2UGA8MqtjzKeILQZB3kSJ1Yi0TNlV/gnHi3W7420xC7jyJcYX0cf3RsgL5VZWIyRqQy1ox13qGksqZjk3E2pK8drAwWxsGQLzGBjicEw5itbOS3q6QZQh9Nz16fvD+t4NKszY+fsFdw2DKe6E+P5I5mvdrbCcy2PWA7aWOmWiT9Do3EhW8S11NBovhb9821lEDEKyIe5ftqqMNF1ETEp4ljua734Fvn6hM2gcn25IATWWLNs/w4A4Dr78lcskwqOmZfwKUrDEn4JOdYDbUIsgrNszn0vJpe3gJ3K/Zrrylhzcs2hzYn4K/LoB5GEfHLCh5rJ","ephemeralPublicKey":"BJMR2FsGaONPqoMd4bNbn2DwEpTlNR9PZg+jmnIU+Iwm8IaOQeRh02032WviD6dBZU66GLG2NDlnDUq+8Ht2sHs\\u003d","tag":"mfgiB9gduk2f+KmlCMEf2d4OFE7pEg6VVjmmPJeu76A\\u003d"}'
                })
              };

              var ExpectedResBody = {
                locale: 'en_US',
                address: {
                  firstName: { value: 'John' },
                  lastName: { value: 'Smith' },
                  address1: { value: '10 main St' },
                  address2: { value: null },
                  city: { value: 'burlington' },
                  stateCode: { value: 'MA' },
                  postalCode: { value: '09876' },
                  countryCode: { value: 'us' }
                },
                paymentMethod: { value: 'GP_DW_GOOGLE_PAY', htmlName: 'GP_DW_GOOGLE_PAY' },
                email: { value: 'blahblah@gmail.com' },
                phone: { value: '9786543213' },
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
                    });
            });
  });
});

