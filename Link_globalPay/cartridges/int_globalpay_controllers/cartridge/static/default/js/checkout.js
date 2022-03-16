'use strict';

var util = {
    /**
    * @function
    * @description appends the parameter with the given name and value to the given url and returns the changed url
    * @param {String} url the url to which the parameter will be added
    * @param {String} name the name of the parameter
    * @param {String} value the value of the parameter
    */
    appendParamToURL: function (url, name, value) {
        // quit if the param already exists
        if (url.indexOf(name + '=') !== -1) {
            return url;
        }
        var separator = url.indexOf('?') !== -1 ? '&' : '?';
        return url + separator + name + '=' + encodeURIComponent(value);
    }

}
/**
* Submit billing form on click of paypal 
*/
$('body').on('click', '.btn-paypal-button', function () {
    $('#dwfrm_billing').submit();
});
/**
* Submit billing form on click of apple-pay 
*/
$('body').on('click', '.btn-apple-pay-button', function () {
    $('#dwfrm_billing').submit();
});
/**
 * @function
 * @description Fills the Credit Card form with the passed data-parameter and clears the former cvn input
 * @param {Object} data The Credit Card data (holder, type, masked number, expiration month/year)
 */
function setCCFields(data) {
    var $creditCard = $('[data-method="CREDIT_CARD"]');
    $creditCard.find('input[name$="creditCard_owner"]').val(data.holder).trigger('change');
    $creditCard.find('select[name$="_type"]').val(data.type).trigger('change');
    $creditCard.find('input[name*="_creditCard_number"]').val(data.maskedNumber).trigger('change');
    $creditCard.find('[name$="_month"]').val(data.expirationMonth).trigger('change');
    $creditCard.find('[name$="_year"]').val(data.expirationYear).trigger('change');
    $creditCard.find('input[name$="_cvn"]').val('').trigger('change');
}

/**
 * @function
 * @description Updates the credit card form with the attributes of a given card
 * @param {String} cardID the credit card ID of a given card
 */
function populateCreditCardForm(cardID) {
    // load card details
    var url = util.appendParamToURL(Urls.billingSelectCC, 'creditCardUUID', cardID);
    $.ajax({
        url: url,
        type: 'get',
        success: function (data) {
            if (!data) {
                window.alert(Resources.CC_LOAD_ERROR);
                return false;
            }
            setCCFields(data);
        }
    });
}

// select credit card from list
$('.GPcreditCardList').on('change', function () {
    var cardUUID = $(this).val();
    if (cardUUID) {
        $('.default-creditcard').removeClass('d-none');
        $('.button-fancy-large').css('display', 'inline-block');
        $('.GP-creditcard-iframe').addClass('d-none');
        $('.save-card').addClass('d-none');
        $('[name$="_saveCard"]').val('false');
        $('#savedPaymentToken').val($(this).find(':selected').attr('data-pmt'));
        populateCreditCardForm(cardUUID);
    }
    else {
        $('.default-creditcard').addClass('d-none');
        $('.GP-creditcard-iframe').removeClass('d-none');
        $('.save-card').removeClass('d-none');
        $('.button-fancy-large').css('display', 'none');
        $('[name$="_saveCard"]').val('true');

    }
    // remove server side error
    $('.required.error').removeClass('error');
    $('.error-message').remove();
});

//submit billing form for selected credit card  from the list
$('.button-fancy-large').on('click', function () {
    var pmttoken = $('#savedPaymentToken').val();
    var cartData = {
        amount: parseFloat($('.order-total .order-value').text().replace('$', '').replace(/,/g, '')) * 100,
        address1: $('input[name*="_addressFields_address1"]').val(),
        city: $('input[name*="_addressFields_city"]').val(),
        postalcode: $('input[name*="_addressFields_postal"]').val()
    };

    const {
        checkVersion,
        getBrowserData,
        initiateAuthentication,
        ChallengeWindowSize,
    } = GlobalPayments.ThreeDSecure;

    try {
        checkVersion($('#autenticationurl').val(), {
            card: {
                reference: pmttoken,
                cartData: cartData
            },
        }).then(function (versionCheckData) {
            if (versionCheckData.error) {

            } else {
                $("#authId").val(versionCheckData.id);
                try {
                    authenticationData = initiateAuthentication($('#initiationurl').val(), {
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
                    }).then(function (authenticationData) {
                        $("#isthreeds").val(authenticationData.status);
                        $('input[name*=_isthreeds]').val(authenticationData.status);
                        $('input[name*=_authId]').val(versionCheckData.id);
                        var eci = authenticationData.mpi.eci;
                        if (authenticationData.status != "CHALLENGE_REQUIRED") {
                            if (eci == "05" || eci == "06" || eci == "01" || eci == "02") {
                                console.log("Frictionless Issuer Authentication Success, Recommend proceed to auth");
                                console.log("ECI: ", eci);
                                $('#dwfrm_billing').submit();
                            } else {
                                console.log("Frictionless Issuer Authentication Failed, Recommend decline auth!");
                                console.log("ECI: ", eci);
                            }
                        }// Challenge Flow
                        else {
                            
                            if (JSON.parse(authenticationData.challenge.response.data).transStatus == "Y") {
                                console.log("Challenge Issuer Authentication Success, Recommend proceed to auth");
                                $('#dwfrm_billing').submit();
                            } else {
                                console.log("Challenge Issuer Authentication Failed, Recommend decline auth!");
                            }
                        }
                    })
                }
                catch (e) {
                }
            }
        });

    }

    catch (e) {
        // TODO: add your error handling here
    }
});