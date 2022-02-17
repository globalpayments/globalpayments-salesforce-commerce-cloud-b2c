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