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

function placeOrderSuccess(data) {
  
    $('[name$="_paReq"]').val(data.challengevalue);
    $('[name$="_acsUrl"]').val(data.acschallengerequesturl);
    $('[name$="_isThreedsone"]').val(true);

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
    $('#errormsg').addClass('sandbox-warning').text('This page is currently in sandbox/test mode. Do not use real/active card numbers.'); 
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
        $('#errormsg').removeClass('sandbox-warning').text(''); 
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
    $('.gpayerror').text('');
    var eciData = JSON.parse($('#eciData').val());
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

            if(
            versionCheckData.versions.directoryServer.start == '1.0.0'
            && versionCheckData.versions.directoryServer.end == '1.0.0' ){
            $('input[name*=_authId]').val(versionCheckData.id);
            var authenticationData = new Object();
            authenticationData.status = 'undefined';
            authenticationData.isthreedsone =  true;
          if(versionCheckData.enrolled == 'ENROLLED'){
            placeOrderSuccess(versionCheckData);
            $('#dwfrm_billing').submit();
            } else {
                $('#dwfrm_billing').submit();   
            }
          } else if (versionCheckData.error) {

            } else {
                $('input[name*=_authId]').val(versionCheckData.id);
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
                        
                        if (authenticationData.mpi != undefined){
                            var eci = authenticationData.mpi.eci;
                        if (authenticationData.status != "CHALLENGE_REQUIRED") {
                            if (eci == eciData.five || eci == eciData.six || eci == eciData.one || eci == eciData.two) {
                                $('#dwfrm_billing').submit();
                            } else {
                                $('.gpayerror').text('Card got declined, please enter another card.');
                            }
                        }// Challenge Flow
                        else {
                            
                            if (JSON.parse(authenticationData.challenge.response.data).transStatus == "Y") {
                                $('#dwfrm_billing').submit();
                            } else {
                                $('.gpayerror').text('Card got declined, please enter another card.');
                            }
                        }
                    }
                    else{
                        $('.gpayerror').text('Card got declined, please enter another card.');
                    }
                    })
                }
                catch (e) {
                }
            }
        });

    }

    catch (e) {
    }
});