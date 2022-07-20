'use strict';

var keyboardAccessibility = require('base/components/keyboardAccessibility');

module.exports = function () {
    $('#custcurrencies').click(function (e) {
        e.preventDefault();
        var action = $('.page').data('action');
        var localeCode = $(this).data('locale');
        var localeCurrencyCode = $(this).data('currencycode');
        var queryString = $('.page').data('querystring');
        var url = '/on/demandware.store/Sites-RefArch-Site/en_US/Page-SetLocale';// $('.country-selector').data('url');

        $.ajax({
            url: url,
            type: 'get',
            dataType: 'json',
            data: {
                code: localeCode,
                queryString: queryString,
                CurrencyCode: localeCurrencyCode,
                action: action
            },
            success: function (response) {
                $.spinner().stop();
                if (response && response.redirectUrl) {
                    window.location.href = response.redirectUrl;
                }
            },
            error: function () {
                $.spinner().stop();
            }
        });
    });
    $('.country-selector.step a').click(function (e) {
        e.preventDefault();

        var action = $('.page').data('action');
        var localeCode = $(this).data('locale');
        var localeCurrencyCode = $(this).data('currencycode');
        var currencies = $(this).data('currencies');
        var queryString = $('.page').data('querystring');
        var url = $('.country-selector').data('url');

        $.ajax({
            url: url,
            type: 'get',
            dataType: 'json',
            data: {
                code: localeCode,
                queryString: queryString,
                CurrencyCode: localeCurrencyCode,
                action: action,
                currencies: currencies
            },
            success: function (response) {
                $.spinner().stop();
               // if (response && response.redirectUrl) {
               //     window.location.href = response.redirectUrl;
               // }
                $('#custcurrencies').empty();
                var ccy = response.currencies;// ['inr', 'usd', 'eur'];
                var $select = $('<select></select>');
                for (var val in ccy.toString().split(',')) {
                    var $option = $('<option value="' + ccy[val] + '">' + ccy[val] + '</option>');
                    $select.append($option);
                }
                $('#custcurrencies').append($select);
            },
            error: function () {
                $.spinner().stop();
            }
        });
    });

    keyboardAccessibility('.navbar-header .country-selector',
        {
            40: function ($countryOptions) { // down
                if ($(this).is(':focus')) {
                    $countryOptions.first().focus();
                } else {
                    $(':focus').next().focus();
                }
            },
            38: function ($countryOptions) { // up
                if ($countryOptions.first().is(':focus') || $(this).is(':focus')) {
                    $(this).focus();
                    $(this).removeClass('show');
                } else {
                    $(':focus').prev().focus();
                }
            },
            27: function () { // escape
                $(this).focus();
                $(this).removeClass('show').children('.dropdown-menu').removeClass('show');
            },
            9: function () { // tab
                $(this).removeClass('show').children('.dropdown-menu').removeClass('show');
            }
        },
        function () {
            if (!($(this).hasClass('show'))) {
                $(this).addClass('show');
            }
            return $(this).find('.dropdown-country-selector').children('a');
        }
    );

    $('.navbar-header .country-selector').on('focusin', function () {
        $(this).addClass('show').children('.dropdown-menu').addClass('show');
    });
};
