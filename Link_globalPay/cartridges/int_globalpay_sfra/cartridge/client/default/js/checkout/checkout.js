'use strict';

var customerHelpers = require('base/checkout/customer'); 
var addressHelpers = require('base/checkout/address');
var shippingHelpers = require('base/checkout/shipping');
var billingHelpers = require('base/checkout/billing');
var summaryHelpers = require('base/checkout/summary');
var formHelpers = require('base/checkout/formErrors');
var scrollAnimate = require('base/components/scrollAnimate');

/**
 * Create the jQuery Checkout Plugin.
 *
 * This jQuery plugin will be registered on the dom element in checkout.isml with the
 * id of "checkout-main".
 *
 * The checkout plugin will handle the different state the user interface is in as the user
 * progresses through the varying forms such as shipping and payment.
 *
 * Billing info and payment info are used a bit synonymously in this code.
 *
 */

 function ensureIframeClosed(timeout) {
  if (timeout) {
      clearTimeout(timeout);
  }
  try {
      Array.prototype.slice.call(document
          .querySelectorAll("[target$=\"-" + randomId + "\"],[id$=\"-" + randomId + "\"]"))
          .forEach(function (element) {
          if (element.parentNode) {
              element.parentNode.removeChild(element);
          }
      });
  }
  catch (e) {
      /** */
  }
}
(function ($) {
   function ChallengeWindowSize() {
    ChallengeWindowSize["FullScreen"] = "FULL_SCREEN";
    ChallengeWindowSize["Windowed250x400"] = "WINDOWED_250X400";
    ChallengeWindowSize["Windowed390x400"] = "WINDOWED_390X400";
    ChallengeWindowSize["Windowed500x600"] = "WINDOWED_500X600";
    ChallengeWindowSize["Windowed600x400"] = "WINDOWED_600X400";
}
function getWindowMessageEventHandler(resolve, data) {
  return function (e) {
      var origin = data.origin || window.location.origin;
      if (origin !== e.origin) {
          return;
      }
      ensureIframeClosed(data.timeout || 0);
      resolve(e.data);
  };
}

  function dimensionsFromChallengeWindowSize(options) {
    var height = 0;
    var width = 0;
    switch (options.size || options.windowSize) {
        case ChallengeWindowSize.Windowed250x400:
            height = 250;
            width = 400;
            break;
        case ChallengeWindowSize.Windowed390x400:
            height = 390;
            width = 400;
            break;
        case ChallengeWindowSize.Windowed500x600:
            height = 500;
            width = 600;
            break;
        case ChallengeWindowSize.Windowed600x400:
            height = 600;
            width = 400;
            break;
    }
    return { height: height, width: width };
}

  function createSpinner() {
    var spinner = document.createElement("img");
    spinner.setAttribute("src", 
    // tslint:disable-next-line:max-line-length
    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PHN2ZyB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjAiIHdpZHRoPSIzMnB4IiBoZWlnaHQ9IjMycHgiIHZpZXdCb3g9IjAgMCAxMjggMTI4IiB4bWw6c3BhY2U9InByZXNlcnZlIj48Zz48cGF0aCBkPSJNMzguNTIgMzMuMzdMMjEuMzYgMTYuMkE2My42IDYzLjYgMCAwIDEgNTkuNS4xNnYyNC4zYTM5LjUgMzkuNSAwIDAgMC0yMC45OCA4LjkyeiIgZmlsbD0iIzAwNzBiYSIgZmlsbC1vcGFjaXR5PSIxIi8+PHBhdGggZD0iTTM4LjUyIDMzLjM3TDIxLjM2IDE2LjJBNjMuNiA2My42IDAgMCAxIDU5LjUuMTZ2MjQuM2EzOS41IDM5LjUgMCAwIDAtMjAuOTggOC45MnoiIGZpbGw9IiNjMGRjZWUiIGZpbGwtb3BhY2l0eT0iMC4yNSIgdHJhbnNmb3JtPSJyb3RhdGUoNDUgNjQgNjQpIi8+PHBhdGggZD0iTTM4LjUyIDMzLjM3TDIxLjM2IDE2LjJBNjMuNiA2My42IDAgMCAxIDU5LjUuMTZ2MjQuM2EzOS41IDM5LjUgMCAwIDAtMjAuOTggOC45MnoiIGZpbGw9IiNjMGRjZWUiIGZpbGwtb3BhY2l0eT0iMC4yNSIgdHJhbnNmb3JtPSJyb3RhdGUoOTAgNjQgNjQpIi8+PHBhdGggZD0iTTM4LjUyIDMzLjM3TDIxLjM2IDE2LjJBNjMuNiA2My42IDAgMCAxIDU5LjUuMTZ2MjQuM2EzOS41IDM5LjUgMCAwIDAtMjAuOTggOC45MnoiIGZpbGw9IiNjMGRjZWUiIGZpbGwtb3BhY2l0eT0iMC4yNSIgdHJhbnNmb3JtPSJyb3RhdGUoMTM1IDY0IDY0KSIvPjxwYXRoIGQ9Ik0zOC41MiAzMy4zN0wyMS4zNiAxNi4yQTYzLjYgNjMuNiAwIDAgMSA1OS41LjE2djI0LjNhMzkuNSAzOS41IDAgMCAwLTIwLjk4IDguOTJ6IiBmaWxsPSIjYzBkY2VlIiBmaWxsLW9wYWNpdHk9IjAuMjUiIHRyYW5zZm9ybT0icm90YXRlKDE4MCA2NCA2NCkiLz48cGF0aCBkPSJNMzguNTIgMzMuMzdMMjEuMzYgMTYuMkE2My42IDYzLjYgMCAwIDEgNTkuNS4xNnYyNC4zYTM5LjUgMzkuNSAwIDAgMC0yMC45OCA4LjkyeiIgZmlsbD0iI2MwZGNlZSIgZmlsbC1vcGFjaXR5PSIwLjI1IiB0cmFuc2Zvcm09InJvdGF0ZSgyMjUgNjQgNjQpIi8+PHBhdGggZD0iTTM4LjUyIDMzLjM3TDIxLjM2IDE2LjJBNjMuNiA2My42IDAgMCAxIDU5LjUuMTZ2MjQuM2EzOS41IDM5LjUgMCAwIDAtMjAuOTggOC45MnoiIGZpbGw9IiNjMGRjZWUiIGZpbGwtb3BhY2l0eT0iMC4yNSIgdHJhbnNmb3JtPSJyb3RhdGUoMjcwIDY0IDY0KSIvPjxwYXRoIGQ9Ik0zOC41MiAzMy4zN0wyMS4zNiAxNi4yQTYzLjYgNjMuNiAwIDAgMSA1OS41LjE2djI0LjNhMzkuNSAzOS41IDAgMCAwLTIwLjk4IDguOTJ6IiBmaWxsPSIjYzBkY2VlIiBmaWxsLW9wYWNpdHk9IjAuMjUiIHRyYW5zZm9ybT0icm90YXRlKDMxNSA2NCA2NCkiLz48YW5pbWF0ZVRyYW5zZm9ybSBhdHRyaWJ1dGVOYW1lPSJ0cmFuc2Zvcm0iIHR5cGU9InJvdGF0ZSIgdmFsdWVzPSIwIDY0IDY0OzQ1IDY0IDY0OzkwIDY0IDY0OzEzNSA2NCA2NDsxODAgNjQgNjQ7MjI1IDY0IDY0OzI3MCA2NCA2NDszMTUgNjQgNjQiIGNhbGNNb2RlPSJkaXNjcmV0ZSIgZHVyPSIxMjgwbXMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIj48L2FuaW1hdGVUcmFuc2Zvcm0+PC9nPjwvc3ZnPg==");
    spinner.setAttribute("id", "GlobalPayments-loader-" + randomId);
    spinner.style.left = "50%";
    spinner.style.position = "fixed";
    spinner.style.background = "#FFFFFF";
    spinner.style.borderRadius = "50%";
    spinner.style.width = "30px";
    spinner.style.zIndex = "200";
    spinner.style.marginLeft = "-15px";
    spinner.style.top = "120px";
    return spinner;
}


  function createLightbox(iFrame, options) {
    // Create the overlay
    var overlayElement = createOverlay();
    // Create the spinner
    var spinner = createSpinner();
    document.body.appendChild(spinner);
    var _a = dimensionsFromChallengeWindowSize(options), height = _a.height, width = _a.width;
    // Configure the iframe
    if (height) {
        iFrame.setAttribute("height", height + "px");
    }
    iFrame.setAttribute("frameBorder", "0");
    if (width) {
        iFrame.setAttribute("width", width + "px");
    }
    iFrame.setAttribute("seamless", "seamless");
    iFrame.style.zIndex = "10001";
    iFrame.style.position = "absolute";
    iFrame.style.transition = "transform 0.5s ease-in-out";
    iFrame.style.transform = "scale(0.7)";
    iFrame.style.opacity = "0";
    overlayElement.appendChild(iFrame);
    if (isMobileIFrame || options.windowSize === ChallengeWindowSize.FullScreen) {
        iFrame.style.top = "0px";
        iFrame.style.bottom = "0px";
        iFrame.style.left = "0px";
        iFrame.style.marginLeft = "0px;";
        iFrame.style.width = "100%";
        iFrame.style.height = "100%";
        iFrame.style.minHeight = "100%";
        iFrame.style.WebkitTransform = "translate3d(0,0,0)";
        iFrame.style.transform = "translate3d(0, 0, 0)";
        var metaTag = document.createElement("meta");
        metaTag.name = "viewport";
        metaTag.content =
            "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0";
        document.getElementsByTagName("head")[0].appendChild(metaTag);
    }
    else {
        iFrame.style.top = "40px";
        iFrame.style.left = "50%";
        iFrame.style.marginLeft = "-" + width / 2 + "px";
    }
    iFrame.onload = getIFrameOnloadEventHandler(iFrame, spinner, overlayElement, options);
}


function createCloseButton(options) {
  if (document.getElementById("GlobalPayments-frame-close-" + randomId) !== null) {
      return;
  }
  var closeButton = document.createElement("img");
  closeButton.id = "GlobalPayments-frame-close-" + randomId;
  closeButton.src =
      // tslint:disable-next-line:max-line-length
      "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QUJFRjU1MEIzMUQ3MTFFNThGQjNERjg2NEZCRjFDOTUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QUJFRjU1MEMzMUQ3MTFFNThGQjNERjg2NEZCRjFDOTUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpBQkVGNTUwOTMxRDcxMUU1OEZCM0RGODY0RkJGMUM5NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpBQkVGNTUwQTMxRDcxMUU1OEZCM0RGODY0RkJGMUM5NSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PlHco5QAAAHpSURBVHjafFRdTsJAEF42JaTKn4glGIg++qgX4AAchHAJkiZcwnAQD8AF4NFHCaC2VgWkIQQsfl/jNJUik8Duzs/XmW9mN7Xb7VRc5vP5zWKxaK5Wq8Zmu72FqobfJG0YQ9M0+/l8/qFQKDzGY1JxENd1288vLy1s786KRZXJZCLber1Wn7MZt4PLarVnWdZ9AmQ8Hncc17UvymVdBMB/MgPQm+cFFcuy6/V6lzqDf57ntWGwYdBIVx0TfkBD6I9M35iRJgfIoAVjBLDZbA4CiJ5+9AdQi/EahibqDTkQx6fRSIHcPwA8Uy9A9Gcc47Xv+w2wzhRDYzqdVihLIbsIiCvP1NNOoX/29FQx3vgOgtt4FyRdCgPRarX4+goB9vkyAMh443cOEsIAAcjncuoI4TXWMAmCIGFhCQLAdZ8jym/cRJ+Y5nC5XCYAhINKpZLgSISZgoqh5iiLQrojAFICVwGS7tCfe5DbZzkP56XS4NVxwvTI/vXVVYIDnqmnnX70ZxzjNS8THHooK5hMpxHQIREA+tEfA9djfHR3MHkdx3Hspe9r3B+VzWaj2RESyR2mlCUE4MoGQDdxiwHURq2t94+PO9bMIYyTyDNLwMoM7g8+BfKeYGniyw2MdfSehF3Qmk1IvCc/AgwAaS86Etp38bUAAAAASUVORK5CYII=";
  closeButton.style.transition = "all 0.5s ease-in-out";
  closeButton.style.opacity = "0";
  closeButton.style.float = "left";
  closeButton.style.position = "absolute";
  closeButton.style.left = "50%";
  closeButton.style.zIndex = "99999999";
  closeButton.style.top = "30px";
  var width = dimensionsFromChallengeWindowSize(options).width;
  if (width) {
      closeButton.style.marginLeft = width / 2 - 8 /* half image width */ + "px";
  }
  setTimeout(function () {
      closeButton.style.opacity = "1";
  }, 500);
  if (isMobileIFrame || options.windowSize === ChallengeWindowSize.FullScreen) {
      closeButton.style.float = "right";
      closeButton.style.top = "20px";
      closeButton.style.left = "initial";
      closeButton.style.marginLeft = "0px";
      closeButton.style.right = "20px";
  }
  return closeButton;
}



function getIFrameOnloadEventHandler(iFrame, spinner, overlayElement, options) {
  return function () {
      iFrame.style.opacity = "1";
      iFrame.style.transform = "scale(1)";
      iFrame.style.backgroundColor = "#ffffff";
      if (spinner.parentNode) {
          spinner.parentNode.removeChild(spinner);
      }
      var closeButton;
      closeButton = createCloseButton(options);
      if (closeButton) {
          overlayElement.appendChild(closeButton);
          closeButton.addEventListener("click", function () {
              if (closeButton) {
                  closeModal();
              }
          }, true);
      }
  };
}



function createOverlay() {
  var overlay = document.createElement("div");
  overlay.setAttribute("id", "GlobalPayments-overlay-" + randomId);
  overlay.style.position = "fixed";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.transition = "all 0.3s ease-in-out";
  overlay.style.zIndex = "100";
  if (isMobileIFrame) {
      overlay.style.position = "absolute !important";
      overlay.style.WebkitOverflowScrolling = "touch";
      overlay.style.overflowX = "hidden";
      overlay.style.overflowY = "scroll";
  }
  document.body.appendChild(overlay);
  setTimeout(function () {
      overlay.style.background = "rgba(0, 0, 0, 0.7)";
  }, 1);
  return overlay;
}

function createForm(action, target, fields) {
  var form = document.createElement("form");
  form.setAttribute("method", "POST");
  form.setAttribute("action", action);
  form.setAttribute("target", target);
  for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
      var field = fields_1[_i];
      var input = document.createElement("input");
      input.setAttribute("type", "hidden");
      input.setAttribute("name", field.name);
      input.setAttribute("value", field.value);
      form.appendChild(input);
  }
  return form;
}
// most of this module is pulled from the legacy Realex Payments JavaScript library
var isWindowsMobileOs = /Windows Phone|IEMobile/.test(navigator.userAgent);
var isAndroidOrIOs = /Android|iPad|iPhone|iPod/.test(navigator.userAgent);
var isMobileXS = ((window.innerWidth > 0 ? window.innerWidth : screen.width) <= 360
    ? true
    : false) ||
    ((window.innerHeight > 0 ? window.innerHeight : screen.height) <= 360
        ? true
        : false);
// For IOs/Android and small screen devices always open in new tab/window
// TODO: Confirm/implement once sandbox support is in place
var isMobileNewTab = !isWindowsMobileOs && (isAndroidOrIOs || isMobileXS);
var isMobileIFrame = isWindowsMobileOs || isMobileNewTab;
var randomId = Math.random()
.toString(16)
.substr(2, 8);
  function postToIframe(endpoint, fields, options) {
    return new Promise(function (resolve, reject) {
        var timeout;
        if (options.timeout) {
            timeout = setTimeout(function () {
                ensureIframeClosed(timeout);
                reject(new Error("timeout reached"));
            }, options.timeout);
        }
        var iframe = document.createElement("iframe");
        iframe.id = iframe.name = "GlobalPayments-3DSecure-" + randomId;
        iframe.style.display = options.hide ? "none" : "inherit";
        var form = createForm(endpoint, iframe.id, fields);
        switch (options.displayMode) {
            case "redirect":
                // TODO: Add redirect support once sandbox environment respects configured
                // challengeNotificationUrl instead of hardcoded value
                ensureIframeClosed(timeout);
                reject(new Error("Not implemented"));
                return;
            case "lightbox":
                createLightbox(iframe, options);
                break;
            case "embedded":
            default:
                if (!handleEmbeddedIframe(reject, { iframe: iframe, timeout: timeout }, options)) {
                    // rejected
                    return;
                }
                break;
        }
        window.addEventListener("message", getWindowMessageEventHandler(resolve, {
            origin: options.origin,
            timeout: timeout,
        }));
        document.body.appendChild(form);
        form.submit();
    });
}


    $.fn.checkout = function () { // eslint-disable-line
      var plugin = this;
// console.log('testing....');
        //
        // Collect form data from user input
        //
      var formData = {
            // Customer Data
        customer: {},

            // Shipping Address
        shipping: {},

            // Billing Address
        billing: {},

            // Payment
        payment: {},

            // Gift Codes
        giftCode: {}
      };

        //
        // The different states/stages of checkout
        //
      var checkoutStages = [
        'customer',
        'shipping',
        'payment',
        'placeOrder',
        'submitted'
      ];

        /**
         * Updates the URL to determine stage
         * @param {number} currentStage - The current stage the user is currently on in the checkout
         */
      function updateUrl(currentStage) {
        history.pushState(
                checkoutStages[currentStage],
                document.title,
                location.pathname
                + '?stage='
                + checkoutStages[currentStage]
                + '#'
                + checkoutStages[currentStage]
            );
      }

        //
        // Local member methods of the Checkout plugin
        //
      var members = {

            // initialize the currentStage variable for the first time
        currentStage: 0,

            /**
             * Set or update the checkout stage (AKA the shipping, billing, payment, etc... steps)
             * @returns {Object} a promise
             */
        updateStage: function () {
          var stage = checkoutStages[members.currentStage];
                var defer = $.Deferred(); // eslint-disable-line

          if (stage === 'customer') {
                    //
                    // Clear Previous Errors
                    //
            customerHelpers.methods.clearErrors();
                    //
                    // Submit the Customer Form
                    //
            var customerFormSelector = customerHelpers.methods.isGuestFormActive() ? customerHelpers.vars.GUEST_FORM : customerHelpers.vars.REGISTERED_FORM;
            var customerForm = $(customerFormSelector);
            $.ajax({
              url: customerForm.attr('action'),
              type: 'post',
              data: customerForm.serialize(),
              success: function (data) {
                if (data.redirectUrl) {
                  window.location.href = data.redirectUrl;
                } else {
                  customerHelpers.methods.customerFormResponse(defer, data);
                }
              },
              error: function (err) {
                if (err.responseJSON && err.responseJSON.redirectUrl) {
                  window.location.href = err.responseJSON.redirectUrl;
                }
                            // Server error submitting form
                defer.reject(err.responseJSON);
              }
            });
            return defer;
          } else if (stage === 'shipping') {
                    //
                    // Clear Previous Errors
                    //
            formHelpers.clearPreviousErrors('.shipping-form');

                    //
                    // Submit the Shipping Address Form
                    //
            var isMultiShip = $('#checkout-main').hasClass('multi-ship');
            var formSelector = isMultiShip ?
                        '.multi-shipping .active form' : '.single-shipping .shipping-form';
            var form = $(formSelector);

            if (isMultiShip && form.length === 0) {
                        // disable the next:Payment button here
              $('body').trigger('checkout:disableButton', '.next-step-button button');
                        // in case the multi ship form is already submitted
              var url = $('#checkout-main').attr('data-checkout-get-url');
              $.ajax({
                url: url,
                method: 'GET',
                success: function (data) {
                                // enable the next:Payment button here
                  $('body').trigger('checkout:enableButton', '.next-step-button button');
                  if (!data.error) {
                    $('body').trigger('checkout:updateCheckoutView',
                                        { order: data.order, customer: data.customer });
                    defer.resolve();
                  } else if (data.message && $('.shipping-error .alert-danger').length < 1) {
                    var errorMsg = data.message;
                    var errorHtml = '<div class="alert alert-danger alert-dismissible valid-cart-error ' +
                                        'fade show" role="alert">' +
                                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
                                        '<span aria-hidden="true">&times;</span>' +
                                        '</button>' + errorMsg + '</div>';
                    $('.shipping-error').append(errorHtml);
                    scrollAnimate($('.shipping-error'));
                    defer.reject();
                  } else if (data.redirectUrl) {
                    window.location.href = data.redirectUrl;
                  }
                },
                error: function () {
                                // enable the next:Payment button here
                  $('body').trigger('checkout:enableButton', '.next-step-button button');
                                // Server error submitting form
                  defer.reject();
                }
              });
            } else {
              var shippingFormData = form.serialize();

              $('body').trigger('checkout:serializeShipping', {
                form: form,
                data: shippingFormData,
                callback: function (data) {
                  shippingFormData = data;
                }
              });
                        // disable the next:Payment button here
              $('body').trigger('checkout:disableButton', '.next-step-button button');
              $.ajax({
                url: form.attr('action'),
                type: 'post',
                data: shippingFormData,
                success: function (data) {
                                 // enable the next:Payment button here
                  $('body').trigger('checkout:enableButton', '.next-step-button button');
                  shippingHelpers.methods.shippingFormResponse(defer, data);
                },
                error: function (err) {
                                // enable the next:Payment button here
                  $('body').trigger('checkout:enableButton', '.next-step-button button');
                  if (err.responseJSON && err.responseJSON.redirectUrl) {
                    window.location.href = err.responseJSON.redirectUrl;
                  }
                                // Server error submitting form
                  defer.reject(err.responseJSON);
                }
              });
            }
            return defer;
          } else if (stage === 'payment') {
                    //
                    // Submit the Billing Address Form
            formHelpers.clearPreviousErrors('.payment-form');

            var billingAddressForm = $('#dwfrm_billing .billing-address-block :input').serialize();

            $('body').trigger('checkout:serializeBilling', {
              form: $('#dwfrm_billing .billing-address-block'),
              data: billingAddressForm,
              callback: function (data) {
                if (data) {
                  billingAddressForm = data;
                }
              }
            });

            var contactInfoForm = $('#dwfrm_billing .contact-info-block :input').serialize();

            $('body').trigger('checkout:serializeBilling', {
              form: $('#dwfrm_billing .contact-info-block'),
              data: contactInfoForm,
              callback: function (data) {
                if (data) {
                  contactInfoForm = data;
                }
              }
            });

            var activeTabId = $('.tab-pane.active').attr('id');
            var paymentInfoSelector = '#dwfrm_billing .' + activeTabId + ' .payment-form-fields :input';
            var paymentInfoForm = $(paymentInfoSelector).serialize();

            $('body').trigger('checkout:serializeBilling', {
              form: $(paymentInfoSelector),
              data: paymentInfoForm,
              callback: function (data) {
                if (data) {
                  paymentInfoForm = data;
                }
              }
            });

            var paymentForm = billingAddressForm + '&' + contactInfoForm + '&' + paymentInfoForm;

            if ($('.data-checkout-stage').data('customer-type') === 'registered') {
                        // if payment method is credit card
              if ($('.payment-information').data('payment-method-id') === 'CREDIT_CARD') {
                if (!($('.payment-information').data('is-new-payment'))) {
                  var cvvCode = $('.saved-payment-instrument.' +
                                    'selected-payment .saved-payment-security-code').val();

                  if (cvvCode === '') {
                    var cvvElement = $('.saved-payment-instrument.' +
                                        'selected-payment ' +
                                        '.form-control');
                    cvvElement.addClass('is-invalid');
                    scrollAnimate(cvvElement);
                    defer.reject();
                    return defer;
                  }

                  var $savedPaymentInstrument = $('.saved-payment-instrument' +
                                    '.selected-payment'
                                );

                  paymentForm += '&storedPaymentUUID=' +
                                    $savedPaymentInstrument.data('uuid');

                  paymentForm += '&securityCode=' + cvvCode;
                }
              }
            }
                     // disable the next:Place Order button here
            $('body').trigger('checkout:disableButton', '.next-step-button button');
            var javaEnabled = navigator.javaEnabled();
            var browserLanguage = navigator.language;
            var screenHeight = screen.height;
            var screenWidth = screen.width;
            var userAgent = navigator.userAgent;
            var browserTime = new Date();
            var browserTimezoneZoneOffset = browserTime.getTimezoneOffset();
            var clientData = new Object();
            clientData.colorDepth = screen.colorDepth;
            clientData.javaEnabled = navigator.javaEnabled();
            clientData.browserLanguage = navigator.language; // en_US
            clientData.screenHeight = screen.height; // 1080
            clientData.screenWidth = screen.width; // 1920
            clientData.userAgent = navigator.userAgent;
            clientData.browserTime = browserTime.getTimezoneOffset();// 0

            $("#threedsdata").val(JSON.stringify(clientData));
            $.ajax({
              url: $('#dwfrm_billing').attr('action'),
              method: 'POST',
              data: paymentForm,
              success: function (data) {
                             // enable the next:Place Order button here
                $('body').trigger('checkout:enableButton', '.next-step-button button');
                            // look for field validation errors
                if (data.error) {
                  $('a.nav-link.credit-card-tab').removeClass('disabled');
                  $('a.nav-link.google-pay-tab').removeClass('disabled');
                  $('a.nav-link.apple-pay-tab').removeClass('disabled');
                  if (data.fieldErrors.length) {
                    data.fieldErrors.forEach(function (error) {
                      if (Object.keys(error).length) {
                        formHelpers.loadFormErrors('.payment-form', error);
                      }
                    });
                  }

                  if (data.serverErrors.length) {
                    data.serverErrors.forEach(function (error) {
                      $('.error-message').show();
                      $('.error-message-text').text(error);
                      scrollAnimate($('.error-message'));
                    });
                  }

                  if (data.cartError) {
                    window.location.href = data.redirectUrl;
                  }

                  defer.reject();
                } else {

                  console.log(':::::::::'+JSON.stringify(data.threeDsStepOneResp));
                    // 3ds start here
                 
                    var options = {};
                        options.timeout= 30000;
                        options.displayMode = 'lightbox';
                    if('threeDsStepOneResp' in data){
                      postToIframe(data.threeDsStepOneResp.challenge.requestUrl,
                        { name: "creq", value: data.threeDsStepOneResp.challenge.encodedChallengeRequest },
                        options);
                    }
                     
                  //}

                  if ($('.tab-pane.active').attr('id') == 'paypal-content') {
                     window.location.href = data.paypalresp.paymentMethod.apm.provider_redirect_url;
                    }   //
                      // Populate the Address Summary
                      //
                      if($('.tab-pane.active').attr('id') == 'google-pay-content'||$('.tab-pane.active').attr('id') =='apple-pay-content')
                      {
                          placeOrderSuccess(data);//populate order details
                          defer.resolve(data);
                      }
                      else{
                      $('body').trigger('checkout:updateCheckoutView',
                          { order: data.order, customer: data.customer });

                    if (data.renderedPaymentInstruments) {
                      $('.stored-payments').empty().html(
                            data.renderedPaymentInstruments
                        );
                    }

                    if (data.customer.registeredUser
                         && data.customer.customerPaymentInstruments.length
                         ) {
                      $('.cancel-new-payment').removeClass('checkout-hidden');
                    }
                    if ($('.tab-pane.active').attr('id') !== 'paypal-content')
                    scrollAnimate(); 

                    defer.resolve(data);
                  }
                }
              },
              error: function (err) {
                            // enable the next:Place Order button here
                $('body').trigger('checkout:enableButton', '.next-step-button button');
                if (err.responseJSON && err.responseJSON.redirectUrl) {
                  window.location.href = err.responseJSON.redirectUrl;
                }
              }
            });

            return defer;
          } else if (stage === 'placeOrder') {

             // disable the placeOrder button here
            $('body').trigger('checkout:disableButton', '.next-step-button button');
            $.ajax({
              url: $('.place-order').data('action'),
              method: 'POST',
              success: function (data) {
                            // enable the placeOrder button here
                $('body').trigger('checkout:enableButton', '.next-step-button button');

                if (data.error) {
                  if (data.cartError) {
                    window.location.href = data.redirectUrl;
                    defer.reject();
                  } else {
                    // go to appropriate stage and display error message
                    defer.reject(data);
                  }
                } else {
                  placeOrderSuccess(data);// populate order details
                  defer.resolve(data);
                }
              },
              error: function () {
                            // enable the placeOrder button here
                $('body').trigger('checkout:enableButton', $('.next-step-button button'));
              }
            });

            return defer;
          }
          function placeOrderSuccess(data) {
            var redirect = $('<form>')
                    .appendTo(document.body)
                    .attr({
                      method: 'POST',
                      action: data.continueUrl
                    });

            $('<input>')
                    .appendTo(redirect)
                    .attr({
                      name: 'orderID',
                      value: data.orderID
                    });

            $('<input>')
                    .appendTo(redirect)
                    .attr({
                      name: 'orderToken',
                      value: data.orderToken
                    });

            redirect.submit();
          }
                var p = $('<div>').promise(); // eslint-disable-line
          setTimeout(function () {
                    p.done(); // eslint-disable-line
          }, 500);
                return p; // eslint-disable-line
        },

            /**
             * Initialize the checkout stage.
             *
             * TODO: update this to allow stage to be set from server?
             */
        initialize: function () {
                // set the initial state of checkout
          members.currentStage = checkoutStages
                    .indexOf($('.data-checkout-stage').data('checkout-stage'));
          $(plugin).attr('data-checkout-stage', checkoutStages[members.currentStage]);
          $('.save-credit-card.custom-control.custom-checkbox').find('#saveCreditCard').attr('checked',false)

          if ($('.data-checkout-stage').data('customer-type') === 'registered') {
                    // if payment method is credit card
            if ($('.payment-information').data('payment-method-id') === 'CREDIT_CARD') {
                        // if saved cards section is shown
              if (!($('.payment-information').data('is-new-payment'))) {
                $('.next-step-button .submit-payment').removeClass('d-none');
              }
            }
          }
          $('body').on('click', '.payment-options .nav-item', function (e) {
            e.preventDefault();
            if (e.target.classList[1] == 'google-pay-tab' || e.target.classList[1] == 'paypal-tab' || e.target.classList[1] == 'apple-pay-tab') {
              $('.next-step-button .submit-payment').hide();
            } else { $('.next-step-button .submit-payment').show(); }
          });

          $('body').on('click', '.submit-customer-login', function (e) {
            e.preventDefault();
            members.nextStage();
          });

          $('body').on('click', '.submit-customer', function (e) {
            e.preventDefault();
            members.nextStage();
          });

                //
                // Handle Payment option selection
                //
          $('input[name$="paymentMethod"]', plugin).on('change', function () {
            $('.credit-card-form').toggle($(this).val() === 'CREDIT_CARD');
          });

                //
                // Handle Next State button click
                //
          $(plugin).on('click', '.next-step-button button', function () {
            members.nextStage();
          });

                //
                // Handle Edit buttons on shipping and payment summary cards
                //
          $('.customer-summary .edit-button', plugin).on('click', function () {
            members.gotoStage('customer');
          });

          $('.cancel-new-payment', plugin).on('click', function () {
            $('.next-step-button .submit-payment').removeClass('d-none');
            $('.save-credit-card.custom-control.custom-checkbox').find('#saveCreditCard').attr('checked',false)
          });
          $('.add-payment', plugin).on('click', function () {
            $('.next-step-button .submit-payment').addClass('d-none');
            $('.save-credit-card.custom-control.custom-checkbox').find('#saveCreditCard').attr('checked',true)
          });
          $('.shipping-summary .edit-button', plugin).on('click', function () {
            if (!$('#checkout-main').hasClass('multi-ship')) {
              $('body').trigger('shipping:selectSingleShipping');
            }

            members.gotoStage('shipping');
          });

                $('.payment-summary .edit-button', plugin).on('click', function () {
                    members.gotoStage('payment');
                });
                $('.btn-paypal-button',plugin).on('click',function() {
                    $('a.nav-link.credit-card-tab').addClass("disabled");
                    $('a.nav-link.google-pay-tab').addClass("disabled");
                    $('a.nav-link.apple-pay-tab').addClass("disabled");
                    members.nextStage();
                });
                $('body').on('submit:googlepay',function(e,data)
                {
                    console.log(data);
                    $('#paymentToken').val(data.paymentToken);
                    members.nextStage();
                });
                $('.apple-pay-content #apple-pay-button', plugin).on('click', function () {
                    members.nextStage();
                });
                //
                // remember stage (e.g. shipping)
                //
          updateUrl(members.currentStage);

                //
                // Listen for foward/back button press and move to correct checkout-stage
                //
          $(window).on('popstate', function (e) {
                    //
                    // Back button when event state less than current state in ordered
                    // checkoutStages array.
                    //
            if (e.state === null ||
                        checkoutStages.indexOf(e.state) < members.currentStage) {
              members.handlePrevStage(false);
            } else if (checkoutStages.indexOf(e.state) > members.currentStage) {
                        // Forward button  pressed
              members.handleNextStage(false);
            }
          });

                //
                // Set the form data
                //
          plugin.data('formData', formData);
        },

            /**
             * The next checkout state step updates the css for showing correct buttons etc...
             */
        nextStage: function () {
          var promise = members.updateStage();

          promise.done(function () {
                    // Update UI with new stage
            $('.error-message').hide();
            members.handleNextStage(true);
          });

          promise.fail(function (data) {
                    // show errors
            if (data) {
              if (data.errorStage) {
                members.gotoStage(data.errorStage.stage);

                if (data.errorStage.step === 'billingAddress') {
                  var $billingAddressSameAsShipping = $(
                                    'input[name$="_shippingAddressUseAsBillingAddress"]'
                                );
                  if ($billingAddressSameAsShipping.is(':checked')) {
                    $billingAddressSameAsShipping.prop('checked', false);
                  }
                }
              }

              if (data.errorMessage) {
                $('.error-message').show();
                $('.error-message-text').text(data.errorMessage);
              }
            }
          });
        },

            /**
             * The next checkout state step updates the css for showing correct buttons etc...
             *
             * @param {boolean} bPushState - boolean when true pushes state using the history api.
             */
        handleNextStage: function (bPushState) {
          if (members.currentStage < checkoutStages.length - 1) {
                    // move stage forward
            members.currentStage++;

                    //
                    // show new stage in url (e.g.payment)
                    //
            if (bPushState) {
              updateUrl(members.currentStage);
            }
          }

                // Set the next stage on the DOM
          $(plugin).attr('data-checkout-stage', checkoutStages[members.currentStage]);
        },

            /**
             * Previous State
             */
        handlePrevStage: function () {
          if (members.currentStage > 0) {
                    // move state back
            members.currentStage--;
            updateUrl(members.currentStage);
          }

          $(plugin).attr('data-checkout-stage', checkoutStages[members.currentStage]);
        },

            /**
             * Use window history to go to a checkout stage
             * @param {string} stageName - the checkout state to goto
             */
        gotoStage: function (stageName) {
          members.currentStage = checkoutStages.indexOf(stageName);
          updateUrl(members.currentStage);
          $(plugin).attr('data-checkout-stage', checkoutStages[members.currentStage]);
        }
      };

        //
        // Initialize the checkout
        //
      members.initialize();

      return this;
    };
}(jQuery));


var exports = {
  initialize: function () {
    $('#checkout-main').checkout();
  },

  updateCheckoutView: function () {
    $('body').on('checkout:updateCheckoutView', function (e, data) {
      if (data.csrfToken) {
        $("input[name*='csrf_token']").val(data.csrfToken);
      }
      customerHelpers.methods.updateCustomerInformation(data.customer, data.order);
      shippingHelpers.methods.updateMultiShipInformation(data.order);
      summaryHelpers.updateTotals(data.order.totals);
      data.order.shipping.forEach(function (shipping) {
        shippingHelpers.methods.updateShippingInformation(
                    shipping,
                    data.order,
                    data.customer,
                    data.options
                );
      });
      billingHelpers.methods.updateBillingInformation(
                data.order,
                data.customer,
                data.options
            );
      billingHelpers.methods.updatePaymentInformation(data.order, data.options);
      summaryHelpers.updateOrderProductSummaryInformation(data.order, data.options);
    });
  },

  disableButton: function () {
    $('body').on('checkout:disableButton', function (e, button) {
      $(button).prop('disabled', true);
    });
  },

  enableButton: function () {
    $('body').on('checkout:enableButton', function (e, button) {
      $(button).prop('disabled', false);
    });
  }


};

[customerHelpers, billingHelpers, shippingHelpers, addressHelpers].forEach(function (library) {
  Object.keys(library).forEach(function (item) {
    if (typeof library[item] === 'object') {
      exports[item] = $.extend({}, exports[item], library[item]);
    } else {
      exports[item] = library[item];
    }
  });
});

module.exports = exports;
