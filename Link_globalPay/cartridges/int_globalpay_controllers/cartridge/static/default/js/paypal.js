$('body').on('click', '.btn-paypal-button', function () {
    $('#dwfrm_billing').submit();
});

$('body').on('click', '.btn-apple-pay-button', function () {
    $('#dwfrm_billing').submit();
});