'use strict';

/*
    This line has to be updated to reference checkoutHelpers.js from the site cartridge's checkoutHelpers.js
*/

var base = module.superModule; 

/**
 * This function is to handle the post payment authorization customizations
 * @param {Object} result - Authorization Result
 */
function postAuthorization(result) { // eslint-disable-line no-unused-vars
   var serviceResult = result;
    if('error' in result && result.error){
    return result;
   } else 
    return;
}


var output = {};
Object.keys(base).forEach(function (key) {
    output[key] = base[key];
});

output.postAuthorization = postAuthorization;

module.exports = output;
