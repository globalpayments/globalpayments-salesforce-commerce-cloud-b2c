(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.GlobalPayments = factory());
}(this, (function () { 'use strict';

	function createCommonjsModule(fn, basedir, module) {
		return module = {
			path: basedir,
			exports: {},
			require: function (path, base) {
				return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
			}
		}, fn(module, module.exports), module.exports;
	}

	function getAugmentedNamespace(n) {
		if (n.__esModule) return n;
		var a = Object.defineProperty({}, '__esModule', {value: true});
		Object.keys(n).forEach(function (k) {
			var d = Object.getOwnPropertyDescriptor(n, k);
			Object.defineProperty(a, k, d.get ? d : {
				enumerable: true,
				get: function () {
					return n[k];
				}
			});
		});
		return a;
	}

	function commonjsRequire () {
		throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
	}

	self.fetch||(self.fetch=function(e,n){return n=n||{},new Promise(function(t,s){var r=new XMLHttpRequest,o=[],u=[],i={},a=function(){return {ok:2==(r.status/100|0),statusText:r.statusText,status:r.status,url:r.responseURL,text:function(){return Promise.resolve(r.responseText)},json:function(){return Promise.resolve(r.responseText).then(JSON.parse)},blob:function(){return Promise.resolve(new Blob([r.response]))},clone:a,headers:{keys:function(){return o},entries:function(){return u},get:function(e){return i[e.toLowerCase()]},has:function(e){return e.toLowerCase()in i}}}};for(var c in r.open(n.method||"get",e,!0),r.onload=function(){r.getAllResponseHeaders().replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm,function(e,n,t){o.push(n=n.toLowerCase()),u.push([n,t]),i[n]=i[n]?i[n]+","+t:t;}),t(a());},r.onerror=s,r.withCredentials="include"==n.credentials,n.headers)r.setRequestHeader(c,n.headers[c]);r.send(n.body||null);})});

	if (!Array.prototype.forEach) {
	    Array.prototype.forEach = function (fn) {
	        for (var i = 0; i < this.length; i++) {
	            fn(this[i], i, this);
	        }
	    };
	}

	var byteLength_1 = byteLength;
	var toByteArray_1 = toByteArray;
	var fromByteArray_1 = fromByteArray;

	var lookup = [];
	var revLookup = [];
	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

	var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	for (var i = 0, len = code.length; i < len; ++i) {
	  lookup[i] = code[i];
	  revLookup[code.charCodeAt(i)] = i;
	}

	// Support decoding URL-safe base64 strings, as Node.js does.
	// See: https://en.wikipedia.org/wiki/Base64#URL_applications
	revLookup['-'.charCodeAt(0)] = 62;
	revLookup['_'.charCodeAt(0)] = 63;

	function getLens (b64) {
	  var len = b64.length;

	  if (len % 4 > 0) {
	    throw new Error('Invalid string. Length must be a multiple of 4')
	  }

	  // Trim off extra bytes after placeholder bytes are found
	  // See: https://github.com/beatgammit/base64-js/issues/42
	  var validLen = b64.indexOf('=');
	  if (validLen === -1) validLen = len;

	  var placeHoldersLen = validLen === len
	    ? 0
	    : 4 - (validLen % 4);

	  return [validLen, placeHoldersLen]
	}

	// base64 is 4/3 + up to two characters of the original data
	function byteLength (b64) {
	  var lens = getLens(b64);
	  var validLen = lens[0];
	  var placeHoldersLen = lens[1];
	  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
	}

	function _byteLength (b64, validLen, placeHoldersLen) {
	  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
	}

	function toByteArray (b64) {
	  var tmp;
	  var lens = getLens(b64);
	  var validLen = lens[0];
	  var placeHoldersLen = lens[1];

	  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));

	  var curByte = 0;

	  // if there are placeholders, only get up to the last complete 4 chars
	  var len = placeHoldersLen > 0
	    ? validLen - 4
	    : validLen;

	  var i;
	  for (i = 0; i < len; i += 4) {
	    tmp =
	      (revLookup[b64.charCodeAt(i)] << 18) |
	      (revLookup[b64.charCodeAt(i + 1)] << 12) |
	      (revLookup[b64.charCodeAt(i + 2)] << 6) |
	      revLookup[b64.charCodeAt(i + 3)];
	    arr[curByte++] = (tmp >> 16) & 0xFF;
	    arr[curByte++] = (tmp >> 8) & 0xFF;
	    arr[curByte++] = tmp & 0xFF;
	  }

	  if (placeHoldersLen === 2) {
	    tmp =
	      (revLookup[b64.charCodeAt(i)] << 2) |
	      (revLookup[b64.charCodeAt(i + 1)] >> 4);
	    arr[curByte++] = tmp & 0xFF;
	  }

	  if (placeHoldersLen === 1) {
	    tmp =
	      (revLookup[b64.charCodeAt(i)] << 10) |
	      (revLookup[b64.charCodeAt(i + 1)] << 4) |
	      (revLookup[b64.charCodeAt(i + 2)] >> 2);
	    arr[curByte++] = (tmp >> 8) & 0xFF;
	    arr[curByte++] = tmp & 0xFF;
	  }

	  return arr
	}

	function tripletToBase64 (num) {
	  return lookup[num >> 18 & 0x3F] +
	    lookup[num >> 12 & 0x3F] +
	    lookup[num >> 6 & 0x3F] +
	    lookup[num & 0x3F]
	}

	function encodeChunk (uint8, start, end) {
	  var tmp;
	  var output = [];
	  for (var i = start; i < end; i += 3) {
	    tmp =
	      ((uint8[i] << 16) & 0xFF0000) +
	      ((uint8[i + 1] << 8) & 0xFF00) +
	      (uint8[i + 2] & 0xFF);
	    output.push(tripletToBase64(tmp));
	  }
	  return output.join('')
	}

	function fromByteArray (uint8) {
	  var tmp;
	  var len = uint8.length;
	  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
	  var parts = [];
	  var maxChunkLength = 16383; // must be multiple of 3

	  // go through the array every three bytes, we'll deal with trailing stuff later
	  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
	    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
	  }

	  // pad the end with zeros, but make sure to not forget the extra bytes
	  if (extraBytes === 1) {
	    tmp = uint8[len - 1];
	    parts.push(
	      lookup[tmp >> 2] +
	      lookup[(tmp << 4) & 0x3F] +
	      '=='
	    );
	  } else if (extraBytes === 2) {
	    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
	    parts.push(
	      lookup[tmp >> 10] +
	      lookup[(tmp >> 4) & 0x3F] +
	      lookup[(tmp << 2) & 0x3F] +
	      '='
	    );
	  }

	  return parts.join('')
	}

	var base64Js = {
		byteLength: byteLength_1,
		toByteArray: toByteArray_1,
		fromByteArray: fromByteArray_1
	};

	var base64 = createCommonjsModule(function (module, exports) {
	exports.__esModule = true;
	exports.base64decode = exports.base64encode = void 0;

	function base64encode(text) {
	    var i;
	    var len = text.length;
	    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
	    var u8array = new Arr(len);
	    for (i = 0; i < len; i++) {
	        u8array[i] = text.charCodeAt(i);
	    }
	    return base64Js.fromByteArray(u8array);
	}
	exports.base64encode = base64encode;
	function base64decode(text) {
	    var u8Array = base64Js.toByteArray(text);
	    var i;
	    var len = u8Array.length;
	    var bStr = "";
	    for (i = 0; i < len; i++) {
	        bStr += String.fromCharCode(u8Array[i]);
	    }
	    return bStr;
	}
	exports.base64decode = base64decode;
	window.btoa = window.btoa || base64encode;
	window.atob = window.atob || base64decode;

	});

	var json2 = createCommonjsModule(function (module, exports) {
	/* -----------------------------------------------------------------------------
	This file is based on or incorporates material from the projects listed below
	(collectively, "Third Party Code"). Microsoft is not the original author of the
	Third Party Code. The original copyright notice and the license, under which
	Microsoft received such Third Party Code, are set forth below. Such licenses
	and notices are provided for informational purposes only. Microsoft, not the
	third party, licenses the Third Party Code to you under the terms of the
	Apache License, Version 2.0. See License.txt in the project root for complete
	license information. Microsoft reserves all rights not expressly granted under
	the Apache 2.0 License, whether by implication, estoppel or otherwise.
	----------------------------------------------------------------------------- */
	exports.__esModule = true;
	exports.JSON = void 0;
	/*
	    json2.js
	    2011-10-19

	    Public Domain.

	    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

	    See http://www.JSON.org/js.html

	    This code should be minified before deployment.
	    See http://javascript.crockford.com/jsmin.html

	    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
	    NOT CONTROL.

	    This file creates a global JSON object containing two methods: stringify
	    and parse.

	        JSON.stringify(value, replacer, space)
	            value       any JavaScript value, usually an object or array.

	            replacer    an optional parameter that determines how object
	                        values are stringified for objects. It can be a
	                        function or an array of strings.

	            space       an optional parameter that specifies the indentation
	                        of nested structures. If it is omitted, the text will
	                        be packed without extra whitespace. If it is a number,
	                        it will specify the number of spaces to indent at each
	                        level. If it is a string (such as "\t" or "&nbsp;"),
	                        it contains the characters used to indent at each level.

	            This method produces a JSON text from a JavaScript value.

	            When an object value is found, if the object contains a toJSON
	            method, its toJSON method will be called and the result will be
	            stringified. A toJSON method does not serialize: it returns the
	            value represented by the name/value pair that should be serialized,
	            or undefined if nothing should be serialized. The toJSON method
	            will be passed the key associated with the value, and this will be
	            bound to the value

	            For example, this would serialize Dates as ISO strings.

	                Date.prototype.toJSON = function (key) {
	                    function f(n) {
	                        // Format integers to have at least two digits.
	                        return n < 10 ? "0" + n : n;
	                    }

	                    return this.getUTCFullYear()   + "-" +
	                         f(this.getUTCMonth() + 1) + "-" +
	                         f(this.getUTCDate())      + "T" +
	                         f(this.getUTCHours())     + ":" +
	                         f(this.getUTCMinutes())   + ":" +
	                         f(this.getUTCSeconds())   + "Z";
	                };

	            You can provide an optional replacer method. It will be passed the
	            key and value of each member, with this bound to the containing
	            object. The value that is returned from your method will be
	            serialized. If your method returns undefined, then the member will
	            be excluded from the serialization.

	            If the replacer parameter is an array of strings, then it will be
	            used to select the members to be serialized. It filters the results
	            such that only members with keys listed in the replacer array are
	            stringified.

	            Values that do not have JSON representations, such as undefined or
	            functions, will not be serialized. Such values in objects will be
	            dropped; in arrays they will be replaced with null. You can use
	            a replacer function to replace those with JSON values.
	            JSON.stringify(undefined) returns undefined.

	            The optional space parameter produces a stringification of the
	            value that is filled with line breaks and indentation to make it
	            easier to read.

	            If the space parameter is a non-empty string, then that string will
	            be used for indentation. If the space parameter is a number, then
	            the indentation will be that many spaces.

	            Example:

	            text = JSON.stringify(["e", {pluribus: "unum"}]);
	            // text is "["e",{"pluribus":"unum"}]"

	            text = JSON.stringify(["e", {pluribus: "unum"}], null, "\t");
	            // text is "[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]"

	            text = JSON.stringify([new Date()], function (key, value) {
	                return this[key] instanceof Date ?
	                    "Date(" + this[key] + ")" : value;
	            });
	            // text is "["Date(---current time---)"]"

	        JSON.parse(text, reviver)
	            This method parses a JSON text to produce an object or array.
	            It can throw a SyntaxError exception.

	            The optional reviver parameter is a function that can filter and
	            transform the results. It receives each of the keys and values,
	            and its return value is used instead of the original value.
	            If it returns what it received, then the structure is not modified.
	            If it returns undefined then the member is deleted.

	            Example:

	            // Parse the text. Values that look like ISO date strings will
	            // be converted to Date objects.

	            myData = JSON.parse(text, function (key, value) {
	                let a;
	                if (typeof value === "string") {
	                    a =
	/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
	                    if (a) {
	                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
	                            +a[5], +a[6]));
	                    }
	                }
	                return value;
	            });

	            myData = JSON.parse("["Date(09/09/2001)"]", function (key, value) {
	                let d;
	                if (typeof value === "string" &&
	                        value.slice(0, 5) === "Date(" &&
	                        value.slice(-1) === ")") {
	                    d = new Date(value.slice(5, -1));
	                    if (d) {
	                        return d;
	                    }
	                }
	                return value;
	            });

	    This is a reference implementation. You are free to copy, modify, or
	    redistribute.
	*/
	/*jslint evil: true, regexp: true */
	/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
	    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
	    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
	    lastIndex, length, parse, prototype, push, replace, slice, stringify,
	    test, toJSON, toString, valueOf
	*/
	// create a JSON object only if one does not already exist. We create the
	// methods in a closure to avoid creating global variables.
	exports.JSON = {};
	(function () {
	    function f(n) {
	        // format integers to have at least two digits.
	        return n < 10 ? "0" + n : n;
	    }
	    if (typeof Date.prototype.toJSON !== "function") {
	        Date.prototype.toJSON = function (_KEY) {
	            return isFinite(this.valueOf())
	                ? this.getUTCFullYear() +
	                    "-" +
	                    f(this.getUTCMonth() + 1) +
	                    "-" +
	                    f(this.getUTCDate()) +
	                    "T" +
	                    f(this.getUTCHours()) +
	                    ":" +
	                    f(this.getUTCMinutes()) +
	                    ":" +
	                    f(this.getUTCSeconds()) +
	                    "Z"
	                : "";
	        };
	        var strProto = String.prototype;
	        var numProto = Number.prototype;
	        numProto.JSON = strProto.JSON = Boolean.prototype.toJSON = function (_KEY) {
	            return this.valueOf();
	        };
	    }
	    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	    // tslint:disable-next-line
	    var esc = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	    var gap;
	    var indent;
	    var meta = {
	        // table of character substitutions
	        "\b": "\\b",
	        "\t": "\\t",
	        "\n": "\\n",
	        "\f": "\\f",
	        "\r": "\\r",
	        '"': '\\"',
	        "\\": "\\\\"
	    };
	    var rep;
	    function quote(quoteStr) {
	        // if the string contains no control characters, no quote characters, and no
	        // backslash characters, then we can safely slap some quotes around it.
	        // otherwise we must also replace the offending characters with safe escape
	        // sequences.
	        esc.lastIndex = 0;
	        return esc.test(quoteStr)
	            ? '"' +
	                quoteStr.replace(esc, function (a) {
	                    var c = meta[a];
	                    return typeof c === "string"
	                        ? c
	                        : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
	                }) +
	                '"'
	            : '"' + quoteStr + '"';
	    }
	    function str(key, holder) {
	        // produce a string from holder[key].
	        var i; // the loop counter.
	        var k; // the member key.
	        var v; // the member value.
	        var length;
	        var mind = gap;
	        var partial;
	        var value = holder[key];
	        // if the value has a toJSON method, call it to obtain a replacement value.
	        if (value &&
	            typeof value === "object" &&
	            typeof value.toJSON === "function") {
	            value = value.toJSON(key);
	        }
	        // if we were called with a replacer function, then call the replacer to
	        // obtain a replacement value.
	        if (typeof rep === "function") {
	            value = rep.call(holder, key, value);
	        }
	        // what happens next depends on the value"s type.
	        switch (typeof value) {
	            case "string":
	                return quote(value);
	            case "number":
	                // json numbers must be finite. Encode non-finite numbers as null.
	                return isFinite(value) ? String(value) : "null";
	            case "boolean":
	            case "null":
	                // if the value is a boolean or null, convert it to a string. Note:
	                // typeof null does not produce "null". The case is included here in
	                // the remote chance that this gets fixed someday.
	                return String(value);
	            // if the type is "object", we might be dealing with an object or an array or
	            // null.
	            case "object":
	                // due to a specification blunder in ECMAScript, typeof null is "object",
	                // so watch out for that case.
	                if (!value) {
	                    return "null";
	                }
	                // make an array to hold the partial: string[] results of stringifying this object value.
	                gap += indent;
	                partial = [];
	                // is the value an array?
	                if (Object.prototype.toString.apply(value, []) === "[object Array]") {
	                    // the value is an array. Stringify every element. Use null as a placeholder
	                    // for non-JSON values.
	                    length = value.length;
	                    for (i = 0; i < length; i += 1) {
	                        partial[i] = str(i.toString(), value) || "null";
	                    }
	                    // join all of the elements together, separated with commas, and wrap them in
	                    // brackets.
	                    v =
	                        partial.length === 0
	                            ? "[]"
	                            : gap
	                                ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]"
	                                : "[" + partial.join(",") + "]";
	                    gap = mind;
	                    return v;
	                }
	                // if the replacer is an array, use it to select the members to be stringified.
	                if (rep && typeof rep === "object") {
	                    length = rep.length;
	                    for (i = 0; i < length; i += 1) {
	                        if (typeof rep[i] === "string") {
	                            k = rep[i];
	                            v = str(k, value);
	                            if (v) {
	                                partial.push(quote(k) + (gap ? ": " : ":") + v);
	                            }
	                        }
	                    }
	                }
	                else {
	                    // otherwise, iterate through all of the keys in the object.
	                    for (k in value) {
	                        if (Object.prototype.hasOwnProperty.call(value, k)) {
	                            v = str(k, value);
	                            if (v) {
	                                partial.push(quote(k) + (gap ? ": " : ":") + v);
	                            }
	                        }
	                    }
	                }
	                // join all of the member texts together, separated with commas,
	                // and wrap them in braces.
	                v =
	                    partial.length === 0
	                        ? "{}"
	                        : gap
	                            ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
	                            : "{" + partial.join(",") + "}";
	                gap = mind;
	                return v;
	        }
	        return undefined;
	    }
	    // if the JSON object does not yet have a stringify method, give it one.
	    if (typeof exports.JSON.stringify !== "function") {
	        exports.JSON.stringify = function (value, replacer, space) {
	            // the stringify method takes a value and an optional replacer, and an optional
	            // space parameter, and returns a JSON text. The replacer can be a function
	            // that can replace values, or an array of strings that will select the keys.
	            // a default replacer method can be provided. Use of the space parameter can
	            // produce text that is more easily readable.
	            var i;
	            gap = "";
	            indent = "";
	            // if the space parameter is a number, make an indent string containing that
	            // many spaces.
	            if (typeof space === "number") {
	                for (i = 0; i < space; i += 1) {
	                    indent += " ";
	                }
	                // if the space parameter is a string, it will be used as the indent string.
	            }
	            else if (typeof space === "string") {
	                indent = space;
	            }
	            // if there is a replacer, it must be a function or an array.
	            // otherwise, throw an error.
	            rep = replacer;
	            if (replacer &&
	                typeof replacer !== "function" &&
	                (typeof replacer !== "object" || typeof replacer.length !== "number")) {
	                throw new Error("JSON.stringify");
	            }
	            // make a fake root object containing our value under the key of "".
	            // return the result of stringifying the value.
	            return str("", { "": value });
	        };
	    }
	    // if the JSON object does not yet have a parse method, give it one.
	    if (typeof exports.JSON.parse !== "function") {
	        exports.JSON.parse = function (text, reviver) {
	            // the parse method takes a text and an optional reviver function, and returns
	            // a JavaScript value if the text is a valid JSON text.
	            var j;
	            function walk(holder, key) {
	                // the walk method is used to recursively walk the resulting structure so
	                // that modifications can be made.
	                var k;
	                var v;
	                var value = holder[key];
	                if (value && typeof value === "object") {
	                    for (k in value) {
	                        if (Object.prototype.hasOwnProperty.call(value, k)) {
	                            v = walk(value, k);
	                            value[k] = v;
	                        }
	                    }
	                }
	                return reviver.call(holder, key, value);
	            }
	            // parsing happens in four stages. In the first stage, we replace certain
	            // unicode characters with escape sequences. JavaScript handles many characters
	            // incorrectly, either silently deleting them, or treating them as line endings.
	            text = String(text);
	            cx.lastIndex = 0;
	            if (cx.test(text)) {
	                text = text.replace(cx, function (a) {
	                    return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
	                });
	            }
	            // in the second stage, we run the text against regular expressions that look
	            // for non-JSON patterns. We are especially concerned with "()" and "new"
	            // because they can cause invocation, and "=" because it can cause mutation.
	            // but just to be safe, we want to reject all unexpected forms.
	            // we split the second stage into 4 regexp operations in order to work around
	            // crippling inefficiencies in IE"s and Safari"s regexp engines. First we
	            // replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
	            // replace all simple value tokens with "]" characters. Third, we delete all
	            // open brackets that follow a colon or comma or that begin the text. Finally,
	            // we look to see that the remaining characters are only whitespace or "]" or
	            // "," or ":" or "{" or "}". If that is so, then the text is safe for eval.
	            if (/^[\],:{}\s]*$/.test(text
	                .replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
	                .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
	                .replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
	                // in the third stage we use the eval function to compile the text into a
	                // javascript structure. The "{" operator is subject to a syntactic ambiguity
	                // in JavaScript: it can begin a block or an object literal. We wrap the text
	                // in parens to eliminate the ambiguity.
	                // tslint:disable-next-line:function-constructor
	                j = new Function("return (" + text + ")")();
	                // in the optional fourth stage, we recursively walk the new structure, passing
	                // each name/value pair to a reviver function for possible transformation.
	                return typeof reviver === "function" ? walk({ "": j }, "") : j;
	            }
	            // if the text is not JSON parseable, then a SyntaxError is thrown.
	            throw new SyntaxError("JSON.parse");
	        };
	    }
	})();

	});

	var json = createCommonjsModule(function (module, exports) {
	exports.__esModule = true;

	window.JSON = window.JSON || json2.JSON;

	});

	// ES5 15.2.3.9
	// http://es5.github.com/#x15.2.3.9
	if (!Object.freeze) {
	    Object.freeze = function (object) {
	        if (Object(object) !== object) {
	            throw new TypeError("Object.freeze can only be called on Objects.");
	        }
	        // this is misleading and breaks feature-detection, but
	        // allows "securable" code to "gracefully" degrade to working
	        // but insecure code.
	        return object;
	    };
	}
	// detect a Rhino bug and patch it
	try {
	    Object.freeze(function () { return undefined; });
	}
	catch (exception) {
	    Object.freeze = (function (freezeObject) {
	        return function (object) {
	            if (typeof object === "function") {
	                return object;
	            }
	            else {
	                return freezeObject(object);
	            }
	        };
	    })(Object.freeze);
	}

	if (!Object.prototype.hasOwnProperty) {
	    Object.prototype.hasOwnProperty = function (prop) {
	        return typeof this[prop] !== "undefined";
	    };
	}
	if (!Object.getOwnPropertyNames) {
	    Object.getOwnPropertyNames = function (obj) {
	        var keys = [];
	        for (var key in obj) {
	            if (typeof obj.hasOwnProperty !== "undefined" &&
	                obj.hasOwnProperty(key)) {
	                keys.push(key);
	            }
	        }
	        return keys;
	    };
	}

	/**
	 * @this {Promise}
	 */
	function finallyConstructor(callback) {
	  var constructor = this.constructor;
	  return this.then(
	    function(value) {
	      // @ts-ignore
	      return constructor.resolve(callback()).then(function() {
	        return value;
	      });
	    },
	    function(reason) {
	      // @ts-ignore
	      return constructor.resolve(callback()).then(function() {
	        // @ts-ignore
	        return constructor.reject(reason);
	      });
	    }
	  );
	}

	function allSettled(arr) {
	  var P = this;
	  return new P(function(resolve, reject) {
	    if (!(arr && typeof arr.length !== 'undefined')) {
	      return reject(
	        new TypeError(
	          typeof arr +
	            ' ' +
	            arr +
	            ' is not iterable(cannot read property Symbol(Symbol.iterator))'
	        )
	      );
	    }
	    var args = Array.prototype.slice.call(arr);
	    if (args.length === 0) return resolve([]);
	    var remaining = args.length;

	    function res(i, val) {
	      if (val && (typeof val === 'object' || typeof val === 'function')) {
	        var then = val.then;
	        if (typeof then === 'function') {
	          then.call(
	            val,
	            function(val) {
	              res(i, val);
	            },
	            function(e) {
	              args[i] = { status: 'rejected', reason: e };
	              if (--remaining === 0) {
	                resolve(args);
	              }
	            }
	          );
	          return;
	        }
	      }
	      args[i] = { status: 'fulfilled', value: val };
	      if (--remaining === 0) {
	        resolve(args);
	      }
	    }

	    for (var i = 0; i < args.length; i++) {
	      res(i, args[i]);
	    }
	  });
	}

	// Store setTimeout reference so promise-polyfill will be unaffected by
	// other code modifying setTimeout (like sinon.useFakeTimers())
	var setTimeoutFunc = setTimeout;

	function isArray(x) {
	  return Boolean(x && typeof x.length !== 'undefined');
	}

	function noop() {}

	// Polyfill for Function.prototype.bind
	function bind(fn, thisArg) {
	  return function() {
	    fn.apply(thisArg, arguments);
	  };
	}

	/**
	 * @constructor
	 * @param {Function} fn
	 */
	function Promise$1(fn) {
	  if (!(this instanceof Promise$1))
	    throw new TypeError('Promises must be constructed via new');
	  if (typeof fn !== 'function') throw new TypeError('not a function');
	  /** @type {!number} */
	  this._state = 0;
	  /** @type {!boolean} */
	  this._handled = false;
	  /** @type {Promise|undefined} */
	  this._value = undefined;
	  /** @type {!Array<!Function>} */
	  this._deferreds = [];

	  doResolve(fn, this);
	}

	function handle(self, deferred) {
	  while (self._state === 3) {
	    self = self._value;
	  }
	  if (self._state === 0) {
	    self._deferreds.push(deferred);
	    return;
	  }
	  self._handled = true;
	  Promise$1._immediateFn(function() {
	    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
	    if (cb === null) {
	      (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
	      return;
	    }
	    var ret;
	    try {
	      ret = cb(self._value);
	    } catch (e) {
	      reject(deferred.promise, e);
	      return;
	    }
	    resolve(deferred.promise, ret);
	  });
	}

	function resolve(self, newValue) {
	  try {
	    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
	    if (newValue === self)
	      throw new TypeError('A promise cannot be resolved with itself.');
	    if (
	      newValue &&
	      (typeof newValue === 'object' || typeof newValue === 'function')
	    ) {
	      var then = newValue.then;
	      if (newValue instanceof Promise$1) {
	        self._state = 3;
	        self._value = newValue;
	        finale(self);
	        return;
	      } else if (typeof then === 'function') {
	        doResolve(bind(then, newValue), self);
	        return;
	      }
	    }
	    self._state = 1;
	    self._value = newValue;
	    finale(self);
	  } catch (e) {
	    reject(self, e);
	  }
	}

	function reject(self, newValue) {
	  self._state = 2;
	  self._value = newValue;
	  finale(self);
	}

	function finale(self) {
	  if (self._state === 2 && self._deferreds.length === 0) {
	    Promise$1._immediateFn(function() {
	      if (!self._handled) {
	        Promise$1._unhandledRejectionFn(self._value);
	      }
	    });
	  }

	  for (var i = 0, len = self._deferreds.length; i < len; i++) {
	    handle(self, self._deferreds[i]);
	  }
	  self._deferreds = null;
	}

	/**
	 * @constructor
	 */
	function Handler(onFulfilled, onRejected, promise) {
	  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
	  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
	  this.promise = promise;
	}

	/**
	 * Take a potentially misbehaving resolver function and make sure
	 * onFulfilled and onRejected are only called once.
	 *
	 * Makes no guarantees about asynchrony.
	 */
	function doResolve(fn, self) {
	  var done = false;
	  try {
	    fn(
	      function(value) {
	        if (done) return;
	        done = true;
	        resolve(self, value);
	      },
	      function(reason) {
	        if (done) return;
	        done = true;
	        reject(self, reason);
	      }
	    );
	  } catch (ex) {
	    if (done) return;
	    done = true;
	    reject(self, ex);
	  }
	}

	Promise$1.prototype['catch'] = function(onRejected) {
	  return this.then(null, onRejected);
	};

	Promise$1.prototype.then = function(onFulfilled, onRejected) {
	  // @ts-ignore
	  var prom = new this.constructor(noop);

	  handle(this, new Handler(onFulfilled, onRejected, prom));
	  return prom;
	};

	Promise$1.prototype['finally'] = finallyConstructor;

	Promise$1.all = function(arr) {
	  return new Promise$1(function(resolve, reject) {
	    if (!isArray(arr)) {
	      return reject(new TypeError('Promise.all accepts an array'));
	    }

	    var args = Array.prototype.slice.call(arr);
	    if (args.length === 0) return resolve([]);
	    var remaining = args.length;

	    function res(i, val) {
	      try {
	        if (val && (typeof val === 'object' || typeof val === 'function')) {
	          var then = val.then;
	          if (typeof then === 'function') {
	            then.call(
	              val,
	              function(val) {
	                res(i, val);
	              },
	              reject
	            );
	            return;
	          }
	        }
	        args[i] = val;
	        if (--remaining === 0) {
	          resolve(args);
	        }
	      } catch (ex) {
	        reject(ex);
	      }
	    }

	    for (var i = 0; i < args.length; i++) {
	      res(i, args[i]);
	    }
	  });
	};

	Promise$1.allSettled = allSettled;

	Promise$1.resolve = function(value) {
	  if (value && typeof value === 'object' && value.constructor === Promise$1) {
	    return value;
	  }

	  return new Promise$1(function(resolve) {
	    resolve(value);
	  });
	};

	Promise$1.reject = function(value) {
	  return new Promise$1(function(resolve, reject) {
	    reject(value);
	  });
	};

	Promise$1.race = function(arr) {
	  return new Promise$1(function(resolve, reject) {
	    if (!isArray(arr)) {
	      return reject(new TypeError('Promise.race accepts an array'));
	    }

	    for (var i = 0, len = arr.length; i < len; i++) {
	      Promise$1.resolve(arr[i]).then(resolve, reject);
	    }
	  });
	};

	// Use polyfill for setImmediate for performance gains
	Promise$1._immediateFn =
	  // @ts-ignore
	  (typeof setImmediate === 'function' &&
	    function(fn) {
	      // @ts-ignore
	      setImmediate(fn);
	    }) ||
	  function(fn) {
	    setTimeoutFunc(fn, 0);
	  };

	Promise$1._unhandledRejectionFn = function _unhandledRejectionFn(err) {
	  if (typeof console !== 'undefined' && console) {
	    console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
	  }
	};

	var src = /*#__PURE__*/Object.freeze({
		__proto__: null,
		'default': Promise$1
	});

	var Promise$2 = /*@__PURE__*/getAugmentedNamespace(src);

	var promise = createCommonjsModule(function (module, exports) {
	exports.__esModule = true;

	window.Promise =
	    window.Promise || Promise$2["default"] || Promise$2;

	});

	if (!String.prototype.repeat) {
	    String.prototype.repeat = function (length) {
	        var result = "";
	        for (var i = 0; i < length; i++) {
	            result += this;
	        }
	        return result;
	    };
	}

	var polyfills = createCommonjsModule(function (module, exports) {
	exports.__esModule = true;









	});

	/**
	 * Adds an alert letting the user know they're in sandbox mode
	 *
	 * @param target
	 *
	 */
	function addSandboxAlert(target, insertBefore) {
	    var el = document.createElement("div");
	    var text = document.createTextNode("This page is currently in sandbox/test mode. Do not use real/active card numbers.");
	    el.appendChild(text);
	    el.className = "sandbox-warning";
	    el.style.display = "block";
	    el.style.width = "100%";
	    el.style.marginBottom = "5px";
	    el.style.color = "#fff";
	    el.style.backgroundColor = "#770000";
	    el.style.padding = "8px 5px";
	    el.style.fontFamily = "Verdana";
	    el.style.fontWeight = "100";
	    el.style.fontSize = "12px";
	    el.style.textAlign = "center";
	    el.style.boxSizing = "border-box";
	    if (typeof target === "string") {
	        var element = document.querySelector(target);
	        if (!element) {
	            throw new Error("Credit card form target does not exist");
	        }
	        target = element;
	    }
	    if (!target) {
	        return;
	    }
	    if (insertBefore) {
	        target.insertBefore(el, insertBefore);
	    }
	    else {
	        target.insertBefore(el, target.firstChild);
	    }
	}

	var options = {};

	var actionNormalizeResponse = (function (data) {
	    if (data.error && data.reasons) {
	        return {
	            error: data.error,
	            reasons: data.reasons,
	        };
	    }
	    if (!data.GetTokenResult || !data.GetTokenResult.IsSuccessful) {
	        var message = (data.GetTokenResult || {}).ErrorMessage || "Unexpected error";
	        var reasons = [{ code: "INVALID_REQUEST", message: message }];
	        return {
	            error: true,
	            reasons: reasons,
	        };
	    }
	    var response = {
	        details: {},
	        paymentReference: data.GetTokenResult.Token,
	    };
	    return response;
	});

	/*! *****************************************************************************
	Copyright (c) Microsoft Corporation.

	Permission to use, copy, modify, and/or distribute this software for any
	purpose with or without fee is hereby granted.

	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
	REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
	AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
	INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
	LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
	OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
	PERFORMANCE OF THIS SOFTWARE.
	***************************************************************************** */
	/* global Reflect, Promise */

	var extendStatics = function(d, b) {
	    extendStatics = Object.setPrototypeOf ||
	        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
	    return extendStatics(d, b);
	};

	function __extends(d, b) {
	    extendStatics(d, b);
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	}

	var __assign = function() {
	    __assign = Object.assign || function __assign(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign.apply(this, arguments);
	};

	function __rest(s, e) {
	    var t = {};
	    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
	        t[p] = s[p];
	    if (s != null && typeof Object.getOwnPropertySymbols === "function")
	        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
	            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
	                t[p[i]] = s[p[i]];
	        }
	    return t;
	}

	function __decorate(decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	}

	function __param(paramIndex, decorator) {
	    return function (target, key) { decorator(target, key, paramIndex); }
	}

	function __metadata(metadataKey, metadataValue) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
	}

	function __awaiter(thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	}

	function __generator(thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
	    function verb(n) { return function (v) { return step([n, v]); }; }
	    function step(op) {
	        if (f) throw new TypeError("Generator is already executing.");
	        while (_) try {
	            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	            if (y = 0, t) op = [op[0] & 2, t.value];
	            switch (op[0]) {
	                case 0: case 1: t = op; break;
	                case 4: _.label++; return { value: op[1], done: false };
	                case 5: _.label++; y = op[1]; op = [0]; continue;
	                case 7: op = _.ops.pop(); _.trys.pop(); continue;
	                default:
	                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
	                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
	                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
	                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
	                    if (t[2]) _.ops.pop();
	                    _.trys.pop(); continue;
	            }
	            op = body.call(thisArg, _);
	        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
	        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
	    }
	}

	function __createBinding(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}

	function __exportStar(m, exports) {
	    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) exports[p] = m[p];
	}

	function __values(o) {
	    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
	    if (m) return m.call(o);
	    if (o && typeof o.length === "number") return {
	        next: function () {
	            if (o && i >= o.length) o = void 0;
	            return { value: o && o[i++], done: !o };
	        }
	    };
	    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
	}

	function __read(o, n) {
	    var m = typeof Symbol === "function" && o[Symbol.iterator];
	    if (!m) return o;
	    var i = m.call(o), r, ar = [], e;
	    try {
	        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
	    }
	    catch (error) { e = { error: error }; }
	    finally {
	        try {
	            if (r && !r.done && (m = i["return"])) m.call(i);
	        }
	        finally { if (e) throw e.error; }
	    }
	    return ar;
	}

	function __spread() {
	    for (var ar = [], i = 0; i < arguments.length; i++)
	        ar = ar.concat(__read(arguments[i]));
	    return ar;
	}

	function __spreadArrays() {
	    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
	    for (var r = Array(s), k = 0, i = 0; i < il; i++)
	        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
	            r[k] = a[j];
	    return r;
	}
	function __await(v) {
	    return this instanceof __await ? (this.v = v, this) : new __await(v);
	}

	function __asyncGenerator(thisArg, _arguments, generator) {
	    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
	    var g = generator.apply(thisArg, _arguments || []), i, q = [];
	    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
	    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
	    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
	    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
	    function fulfill(value) { resume("next", value); }
	    function reject(value) { resume("throw", value); }
	    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
	}

	function __asyncDelegator(o) {
	    var i, p;
	    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
	    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
	}

	function __asyncValues(o) {
	    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
	    var m = o[Symbol.asyncIterator], i;
	    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
	    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
	    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
	}

	function __makeTemplateObject(cooked, raw) {
	    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
	    return cooked;
	}
	function __importStar(mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
	    result.default = mod;
	    return result;
	}

	function __importDefault(mod) {
	    return (mod && mod.__esModule) ? mod : { default: mod };
	}

	function __classPrivateFieldGet(receiver, privateMap) {
	    if (!privateMap.has(receiver)) {
	        throw new TypeError("attempted to get private field on non-instance");
	    }
	    return privateMap.get(receiver);
	}

	function __classPrivateFieldSet(receiver, privateMap, value) {
	    if (!privateMap.has(receiver)) {
	        throw new TypeError("attempted to set private field on non-instance");
	    }
	    privateMap.set(receiver, value);
	    return value;
	}

	var tslib_es6 = /*#__PURE__*/Object.freeze({
		__proto__: null,
		__extends: __extends,
		get __assign () { return __assign; },
		__rest: __rest,
		__decorate: __decorate,
		__param: __param,
		__metadata: __metadata,
		__awaiter: __awaiter,
		__generator: __generator,
		__createBinding: __createBinding,
		__exportStar: __exportStar,
		__values: __values,
		__read: __read,
		__spread: __spread,
		__spreadArrays: __spreadArrays,
		__await: __await,
		__asyncGenerator: __asyncGenerator,
		__asyncDelegator: __asyncDelegator,
		__asyncValues: __asyncValues,
		__makeTemplateObject: __makeTemplateObject,
		__importStar: __importStar,
		__importDefault: __importDefault,
		__classPrivateFieldGet: __classPrivateFieldGet,
		__classPrivateFieldSet: __classPrivateFieldSet
	});

	var tokenTypes = {
	    check: "2",
	    credit: "1",
	};
	var actionTokenize = (function (url, env, data) { return __awaiter(void 0, void 0, void 0, function () {
	    var request, headers, resp, e_1;
	    return __generator(this, function (_a) {
	        switch (_a.label) {
	            case 0:
	                request = {
	                    merchantName: options.merchantName,
	                };
	                if (data["card-number"]) {
	                    request.tokenData = data["card-number"].replace(/\s/g, "");
	                    request.type = tokenTypes.credit;
	                }
	                else if (data["account-number"]) {
	                    request.tokenData = data["account-number"] + "|" + data["routing-number"];
	                    request.type = tokenTypes.check;
	                }
	                _a.label = 1;
	            case 1:
	                _a.trys.push([1, 3, , 4]);
	                headers = {
	                    "Content-Type": "application/json",
	                };
	                return [4 /*yield*/, fetch(url, {
	                        body: JSON.stringify(request),
	                        credentials: "omit",
	                        headers: typeof Headers !== "undefined" ? new Headers(headers) : headers,
	                        method: "POST",
	                    })];
	            case 2:
	                resp = _a.sent();
	                return [2 /*return*/, resp.json()];
	            case 3:
	                e_1 = _a.sent();
	                return [2 /*return*/, {
	                        error: true,
	                        reasons: [{ code: e_1.name, message: e_1.message }],
	                    }];
	            case 4: return [2 /*return*/];
	        }
	    });
	}); });

	var actionValidateData = (function (data) {
	    var errors = [];
	    if (!data["card-number"] && !data["card-track"] && !data["account-number"]) {
	        if (!data["card-number"]) {
	            errors.push({
	                code: "INVALID_CARD_NUMBER",
	                message: "The card number is invalid.",
	            });
	        }
	        else if (!data["account-number"]) {
	            errors.push({
	                code: "INVALID_ACCOUNT_NUMBER",
	                message: "The account number is invalid",
	            });
	        }
	    }
	    if (data["account-number"] && !data["routing-number"]) {
	        errors.push({
	            code: "INVALID_ROUTING_NUMBER",
	            message: "The routing number is invalid",
	        });
	    }
	    return errors;
	});

	var supports = {
	    tokenization: {
	        cardNotPresent: true,
	        eCheck: true,
	    },
	};
	var domains = {
	    production: "https://heartlandpaymentservices.net",
	    sandbox: "https://staging.heartlandpaymentservices.net",
	};
	var urls = {
	    tokenization: function (prod) {
	        return (prod ? domains.production : domains.sandbox) + "/QuickPayService/QuickPayService.svc/GetToken";
	    },
	};
	var actions = {
	    normalizeResponse: actionNormalizeResponse,
	    tokenize: actionTokenize,
	    validateData: actionValidateData,
	};
	var requiredSettings = ["merchantName"];
	var getEnv = function () {
	    return options.env || "production";
	};

	var billpay = /*#__PURE__*/Object.freeze({
		__proto__: null,
		supports: supports,
		urls: urls,
		actions: actions,
		requiredSettings: requiredSettings,
		getEnv: getEnv
	});

	var actionNormalizeResponse$1 = (function (data) {
	    if (data.error && data.reasons) {
	        return {
	            error: data.error,
	            reasons: data.reasons,
	        };
	    }
	    // TODO: parse these properly
	    if (data.errors) {
	        var reasons = [];
	        for (var i in data.errors) {
	            if (!data.errors.hasOwnProperty(i)) {
	                continue;
	            }
	            var reason = data.errors[i];
	            var serverErrorType = reason.code === "SERVER_REQUIRED" ? "missing" : "invalid";
	            var code = "ERROR";
	            var message = "An unknown error has occurred. Details: " + reason.error_Code + " - " + reason.reason;
	            if (reason.reason === "cardnumber") {
	                code = "INVALID_CARD_NUMBER";
	                message = "The card number is " + serverErrorType;
	            }
	            else if (reason.reason === "expirationdate") {
	                code = "INVALID_CARD_EXPIRATION";
	                message = "The card expiration date is " + serverErrorType;
	            }
	            else if (reason.reason === "cvv") {
	                code = "INVALID_CARD_SECURITY_CODE";
	                message = "The card security code is " + serverErrorType;
	            }
	            reasons.push({
	                code: code,
	                message: message,
	            });
	        }
	        return {
	            error: true,
	            reasons: reasons,
	        };
	    }
	    var response = {
	        paymentReference: data.token,
	    };
	    return response;
	});

	var actionTokenize$1 = (function (url, env, data) { return __awaiter(void 0, void 0, void 0, function () {
	    var request, exp, headers, resp, e_1;
	    return __generator(this, function (_a) {
	        switch (_a.label) {
	            case 0:
	                request = {
	                    merchantApiKey: data.webApiKey,
	                };
	                if (data["card-number"]) {
	                    request.cardnumber = data["card-number"].replace(/\s/g, "");
	                }
	                if (data["card-cvv"]) {
	                    request.cvv = data["card-cvv"];
	                }
	                if (data["card-expiration"] &&
	                    data["card-expiration"].indexOf(" / ") !== -1) {
	                    exp = data["card-expiration"].split(" / ");
	                    request.expirationmonth = exp[0] || "";
	                    request.expirationyear = (exp[1] || "").substr(2, 2);
	                }
	                if (data["card-holder-name"]) {
	                    request.cardholder = data["card-holder-name"];
	                }
	                _a.label = 1;
	            case 1:
	                _a.trys.push([1, 3, , 4]);
	                headers = {
	                    "Content-Type": "application/json",
	                };
	                return [4 /*yield*/, fetch(url, {
	                        body: JSON.stringify(request),
	                        credentials: "omit",
	                        headers: typeof Headers !== "undefined" ? new Headers(headers) : headers,
	                        method: "POST",
	                    })];
	            case 2:
	                resp = _a.sent();
	                return [2 /*return*/, resp.json()];
	            case 3:
	                e_1 = _a.sent();
	                return [2 /*return*/, {
	                        error: true,
	                        reasons: [{ code: e_1.name, message: e_1.message }],
	                    }];
	            case 4: return [2 /*return*/];
	        }
	    });
	}); });

	var actionValidateData$1 = (function (data) {
	    var errors = [];
	    if (!data["card-number"]) {
	        errors.push({
	            code: "INVALID_CARD_NUMBER",
	            message: "The card number is invalid.",
	        });
	    }
	    if (!data["card-cvv"]) {
	        errors.push({
	            code: "INVALID_CARD_SECURITY_CODE",
	            message: "The card security code is invalid.",
	        });
	    }
	    if (!data["card-expiration"]) {
	        errors.push({
	            code: "INVALID_CARD_EXPIRATION",
	            message: "The card expiration is invalid.",
	        });
	    }
	    return errors;
	});

	var supports$1 = {
	    apm: {
	        applePay: false,
	        googlePay: false,
	    },
	    consumerAuthentication: false,
	    tokenization: {
	        cardNotPresent: true,
	        cardPresent: false,
	        eCheck: false,
	        gift: false,
	    },
	};
	var domains$1 = {
	    // Genius Checkout has an automatic sandbox feature for developer / partner accounts
	    production: "https://ecommerce.merchantware.net",
	    sandbox: "https://ecommerce.merchantware.net",
	};
	var urls$1 = {
	    tokenization: function (prod) {
	        return (prod ? domains$1.production : domains$1.sandbox) + "/v1/api/tokens";
	    },
	};
	var actions$1 = {
	    normalizeResponse: actionNormalizeResponse$1,
	    tokenize: actionTokenize$1,
	    validateData: actionValidateData$1,
	};
	var requiredSettings$1 = ["webApiKey"];
	var getEnv$1 = function () {
	    return options.env || "production";
	};

	var genius = /*#__PURE__*/Object.freeze({
		__proto__: null,
		supports: supports$1,
		urls: urls$1,
		actions: actions$1,
		requiredSettings: requiredSettings$1,
		getEnv: getEnv$1
	});

	var actionNormalizeResponse$2 = (function (data) {
	    if (data.error && data.reasons) {
	        return {
	            error: data.error,
	            reasons: data.reasons,
	        };
	    }
	    if (data.action) {
	        var reasons = [];
	        switch (data.action) {
	            case "action-error":
	                reasons.push({
	                    code: "INVALID_REQUEST",
	                    message: data.payload,
	                });
	                break;
	            case "hpp-api-timeout-error":
	                reasons.push({
	                    code: "API_ERROR",
	                    message: data.payload,
	                });
	                break;
	            default:
	                for (var i in data.payload) {
	                    if (!data.payload.hasOwnProperty(i)) {
	                        continue;
	                    }
	                    var reason = data.payload[i];
	                    var code = "";
	                    switch (reason.errorCode) {
	                        case "INVALID_CARDNUMBER":
	                            code = "INVALID_CARD_NUMBER";
	                            break;
	                        case "INVALID_EXPIRY_DATE":
	                            code = "INVALID_CARD_EXPIRATION";
	                            break;
	                        case "INVALID_SECURITY_CODE":
	                            code = "INVALID_CARD_SECURITY_CODE";
	                            break;
	                        case "INVALID_CARDHOLDER_NAME":
	                            code = "INVALID_CARD_HOLDER_NAME";
	                            break;
	                    }
	                    reasons.push({
	                        code: code,
	                        message: reason.errorMessage,
	                    });
	                }
	                break;
	        }
	        return {
	            error: true,
	            reasons: reasons,
	        };
	    }
	    return {
	        customerReference: atob(data.SAVED_PAYER_REF),
	        details: {
	            cardholderName: atob(data.SAVED_PMT_NAME),
	            orderId: atob(data.ORDER_ID),
	        },
	        paymentReference: atob(data.SAVED_PMT_REF),
	        requestId: atob(data.PASREF),
	    };
	});

	var loadedFrames = {};

	var PostMessage = /** @class */ (function () {
	    function PostMessage() {
	    }
	    PostMessage.prototype.post = function (data, target) {
	        data.source = data.source || {};
	        data.source.name = window.name || "parent";
	        if (!loadedFrames) {
	            return;
	        }
	        var frame = loadedFrames[target];
	        if (!frame) {
	            return;
	        }
	        var targetNode = frame.frame;
	        var targetUrl = frame.url;
	        try {
	            if (typeof frame.targetNode !== "undefined") {
	                targetNode = frame.targetNode;
	            }
	        }
	        catch (e) {
	            /* */
	        }
	        var win = target === "parent" ? parent : targetNode.contentWindow || targetNode;
	        if (typeof win.postMessage === "undefined") {
	            return;
	        }
	        win.postMessage(JSON.stringify(data), targetUrl);
	    };
	    PostMessage.prototype.receive = function (callback) {
	        return new Promise(function (resolve) {
	            var cb = function (m) {
	                try {
	                    var d = JSON.parse(m.data);
	                    if (callback) {
	                        callback.call(callback, d);
	                    }
	                    else {
	                        resolve(d);
	                    }
	                }
	                catch (e) {
	                    /* */
	                }
	            };
	            if (window.addEventListener) {
	                window.addEventListener("message", cb, false);
	            }
	            else {
	                window.attachEvent("onmessage", cb);
	            }
	        });
	    };
	    return PostMessage;
	}());
	var postMessage = new PostMessage();

	var setup = false;
	var actionSetup = (function () { return __awaiter(void 0, void 0, void 0, function () {
	    return __generator(this, function (_a) {
	        if (setup) {
	            return [2 /*return*/];
	        }
	        setup = true;
	        // keep `pm.receive` call in callback version to ensure we receive the
	        // hash request
	        postMessage.receive(function (data) { return __awaiter(void 0, void 0, void 0, function () {
	            var hashed;
	            return __generator(this, function (_a) {
	                switch (_a.label) {
	                    case 0:
	                        if (!(data.type === "gateway:globalpayments:hash" && options.hash)) return [3 /*break*/, 2];
	                        return [4 /*yield*/, options.hash(data.data)];
	                    case 1:
	                        hashed = _a.sent();
	                        postMessage.post({
	                            data: hashed,
	                            id: data.id,
	                            type: "gateway:globalpayments:hash-result",
	                        }, data.id);
	                        _a.label = 2;
	                    case 2: return [2 /*return*/];
	                }
	            });
	        }); });
	        return [2 /*return*/];
	    });
	}); });

	var eventEmitter = createCommonjsModule(function (module, exports) {
	/// see https://gist.github.com/mudge/5830382
	exports.__esModule = true;
	exports.EventEmitter = void 0;
	/* Polyfill indexOf. */
	var indexOf;
	if (typeof Array.prototype.indexOf === "function") {
	    indexOf = function (haystack, needle) { return haystack.indexOf(needle); };
	}
	else {
	    indexOf = function (haystack, needle) {
	        var length = haystack.length;
	        var i = 0;
	        var idx = -1;
	        var found = false;
	        while (i < length && !found) {
	            if (haystack[i] === needle) {
	                idx = i;
	                found = true;
	            }
	            i++;
	        }
	        return idx;
	    };
	}
	var EventEmitter = /** @class */ (function () {
	    function EventEmitter() {
	        this.events = {};
	    }
	    EventEmitter.prototype.on = function (event, listener) {
	        if (typeof this.events[event] !== "object") {
	            this.events[event] = [];
	        }
	        this.events[event].push(listener);
	    };
	    EventEmitter.prototype.off = function (event, listener) {
	        var idx;
	        if (typeof this.events[event] === "object") {
	            idx = indexOf(this.events[event], listener);
	            if (idx > -1) {
	                this.events[event].splice(idx, 1);
	            }
	        }
	    };
	    EventEmitter.prototype.emit = function (event) {
	        var args = [];
	        for (var _i = 1; _i < arguments.length; _i++) {
	            args[_i - 1] = arguments[_i];
	        }
	        var i;
	        var listeners;
	        var length;
	        if (typeof this.events[event] === "object") {
	            listeners = this.events[event].slice();
	            length = listeners.length;
	            for (i = 0; i < length; i++) {
	                listeners[i].apply(this, args);
	            }
	        }
	    };
	    EventEmitter.prototype.once = function (event, listener) {
	        var that = this;
	        // tslint:disable-next-line:only-arrow-functions
	        this.on(event, function g() {
	            that.off(event, g);
	            listener.apply(that, arguments);
	        });
	    };
	    return EventEmitter;
	}());
	exports.EventEmitter = EventEmitter;

	});

	var generateGuid_1 = createCommonjsModule(function (module, exports) {
	exports.__esModule = true;
	exports.generateGuid = void 0;
	function generateGuid() {
	    var S4 = function () {
	        // tslint:disable-next-line:no-bitwise
	        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	    };
	    return "" + S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
	}
	exports.generateGuid = generateGuid;

	});

	var tslib_1 = /*@__PURE__*/getAugmentedNamespace(tslib_es6);

	var lib = createCommonjsModule(function (module, exports) {
	exports.__esModule = true;

	tslib_1.__exportStar(eventEmitter, exports);
	tslib_1.__exportStar(generateGuid_1, exports);

	});

	var paymentFieldId = "secure-payment-field";

	var actionOnload = (function (url) {
	    // build request
	    var orderId = btoa(lib.generateGuid()).substring(0, 22);
	    var date = new Date();
	    var month = date.getUTCMonth() + 1;
	    var day = date.getUTCDate();
	    var hours = date.getUTCHours();
	    var mins = date.getUTCMinutes();
	    var secs = date.getUTCSeconds();
	    var timestamp = date.getUTCFullYear().toString() +
	        (month < 10 ? "0" + month.toString() : month.toString()).toString() +
	        (day < 10 ? "0" + day.toString() : day.toString()) +
	        (hours < 10 ? "0" + hours.toString() : hours.toString()) +
	        (mins < 10 ? "0" + mins.toString() : mins.toString()) +
	        (secs < 10 ? "0" + secs.toString() : secs.toString());
	    var href = window.location.protocol + "//" + window.location.host;
	    var data = {
	        ACCOUNT: options.account || "",
	        AUTO_SETTLE_FLAG: "0",
	        CARD_STORAGE_ENABLE: "1",
	        CURRENCY: "EUR",
	        HPP_LISTENER_URL: href,
	        HPP_POST_DIMENSIONS: href,
	        HPP_POST_RESPONSE: href,
	        HPP_VERSION: "2",
	        MERCHANT_ID: options.merchantId || "",
	        MERCHANT_RESPONSE_URL: href,
	        ORDER_ID: orderId,
	        PAYER_EXIST: (options.customerExists === true && "1") || "0",
	        TIMESTAMP: timestamp,
	        VALIDATE_CARD_ONLY: (options.validateOnly === false && "0") || "1",
	    };
	    if (options.customerExists) {
	        data.PAYER_REF = options.customerReference; // opt config
	    }
	    return getHashResult(data)
	        .then(function (request) {
	        submitHppRequest(url, request);
	        return getHppReadyState(orderId);
	    })
	        .then(function () { return orderId; });
	});
	var createIframe = function (orderId) {
	    var frame = document.createElement("iframe");
	    frame.setAttribute("name", "global-payments-rxp-" + orderId);
	    frame.setAttribute("id", "global-payments-rxp-" + orderId);
	    frame.setAttribute("height", "0");
	    frame.setAttribute("width", "0");
	    frame.style.display = "none";
	    frame.style.opacity = "0";
	    return frame;
	};
	var getHashResult = function (data) {
	    var field = document.getElementById(paymentFieldId);
	    if (!field) {
	        return Promise.reject({
	            error: true,
	            reasons: [{ code: "ERROR", message: "Missing field" }],
	        });
	    }
	    postMessage.post({
	        data: data,
	        id: field.getAttribute("data-id"),
	        type: "gateway:globalpayments:hash",
	    }, "parent");
	    // keep `pm.receive` call in callback version to ensure we receive the
	    // hash request
	    return new Promise(function (resolve) {
	        postMessage.receive(function (d) {
	            if (d.type === "gateway:globalpayments:hash-result") {
	                resolve(d.data);
	            }
	        });
	    });
	};
	var submitHppRequest = function (url, request) {
	    var iframe = createIframe(request.ORDER_ID);
	    var form = document.createElement("form");
	    form.method = "POST";
	    form.action = url;
	    for (var prop in request) {
	        if (Object.prototype.hasOwnProperty.call(request, prop)) {
	            var el = document.createElement("input");
	            el.type = "hidden";
	            el.name = prop;
	            el.value = request[prop];
	            form.appendChild(el);
	        }
	    }
	    // add to dom + submit
	    document.body.appendChild(iframe);
	    if (!iframe.contentWindow) {
	        throw new Error("Source iframe loaded incorrectly");
	    }
	    if (typeof iframe.contentWindow.document.body !== "undefined") {
	        iframe.contentWindow.document.body.appendChild(form);
	    }
	    else {
	        iframe.contentWindow.document.appendChild(form);
	    }
	    form.submit();
	};
	var getHppReadyState = function (orderId) {
	    return new Promise(function (resolve, reject) {
	        var timeout = setTimeout(function () {
	            reject({
	                error: true,
	                reasons: [{ code: "TIMEOUT", message: "HPP setup timeout" }],
	            });
	        }, 30000);
	        postMessage.receive(function (message) {
	            clearTimeout(timeout);
	            var action = message.action || "";
	            if (action === "hpp-listener-loaded") {
	                if (message.payload) {
	                    resolve(orderId);
	                }
	                else {
	                    reject({
	                        error: true,
	                        reasons: [{ code: "ERROR", message: "HPP setup failure" }],
	                    });
	                }
	            }
	        });
	    });
	};

	var actionTokenize$2 = (function (url, env, data) { return __awaiter(void 0, void 0, void 0, function () {
	    var orderId, e_1, iframe, win, month, year, exp, request;
	    return __generator(this, function (_a) {
	        switch (_a.label) {
	            case 0:
	                _a.trys.push([0, 2, , 3]);
	                return [4 /*yield*/, actionOnload(url)];
	            case 1:
	                orderId = _a.sent();
	                return [3 /*break*/, 3];
	            case 2:
	                e_1 = _a.sent();
	                return [2 /*return*/, Promise.reject(e_1)];
	            case 3:
	                iframe = document.getElementById("global-payments-rxp-" + orderId);
	                if (!iframe) {
	                    return [2 /*return*/, Promise.reject("Source iframe missing")];
	                }
	                win = iframe.contentWindow;
	                if (!win) {
	                    return [2 /*return*/, Promise.reject("Source iframe loaded incorrectly")];
	                }
	                month = "";
	                year = "";
	                if (data["card-expiration"] &&
	                    data["card-expiration"].indexOf(" / ") !== -1) {
	                    exp = data["card-expiration"].split(" / ");
	                    month = exp[0] || "";
	                    year = (exp[1] || "").substr(2, 2);
	                }
	                request = {
	                    action: "populate-form-fields",
	                    payload: {
	                        pas_cccvc: data["card-cvv"],
	                        pas_ccmonth: month,
	                        pas_ccname: data["card-holder-name"],
	                        pas_ccnum: data["card-number"].replace(/\s/g, ""),
	                        pas_ccyear: year,
	                    },
	                };
	                // todo: fix postMessage origin
	                win.postMessage(JSON.stringify(request), "*");
	                // keep `pm.receive` call in callback version to ensure we receive the
	                // hash request
	                return [2 /*return*/, new Promise(function (resolve) {
	                        postMessage.receive(function (payload) {
	                            if (typeof payload.action !== "undefined" ||
	                                (typeof payload.SHA1HASH !== "undefined" &&
	                                    payload.ORDER_ID === btoa(orderId))) {
	                                resolve(payload);
	                            }
	                        });
	                    })];
	        }
	    });
	}); });

	var actionValidateData$2 = (function (data) {
	    var errors = [];
	    if (!data["card-number"]) {
	        errors.push({
	            code: "INVALID_CARD_NUMBER",
	            message: "The card number is invalid.",
	        });
	    }
	    if (!data["card-cvv"]) {
	        errors.push({
	            code: "INVALID_CARD_SECURITY_CODE",
	            message: "The card security code is invalid.",
	        });
	    }
	    if (!data["card-expiration"]) {
	        errors.push({
	            code: "INVALID_CARD_EXPIRATION",
	            message: "The card expiration is invalid.",
	        });
	    }
	    if (!data["card-holder-name"]) {
	        errors.push({
	            code: "INVALID_CARD_HOLDER_NAME",
	            message: "The card holder name is invalid.",
	        });
	    }
	    return errors;
	});

	var supports$2 = {
	    apm: {
	        applePay: true,
	        googlePay: false,
	    },
	    consumerAuthentication: true,
	    tokenization: {
	        cardNotPresent: true,
	        cardPresent: false,
	        eCheck: false,
	        gift: false,
	    },
	};
	var domains$2 = {
	    production: "https://pay.realexpayments.com",
	    sandbox: "https://pay.sandbox.realexpayments.com",
	};
	var urls$2 = {
	    tokenization: function (prod) {
	        return (prod ? domains$2.production : domains$2.sandbox) + "/pay";
	    },
	};
	var getEnv$2 = function () {
	    var def = "production";
	    return options.env || def;
	};
	var actions$2 = {
	    normalizeResponse: actionNormalizeResponse$2,
	    setup: actionSetup,
	    tokenize: actionTokenize$2,
	    validateData: actionValidateData$2,
	};
	var requiredSettings$2 = [
	    "merchantId",
	    "account",
	    // "hash",
	    "env",
	];

	var globalpayments = /*#__PURE__*/Object.freeze({
		__proto__: null,
		supports: supports$2,
		urls: urls$2,
		getEnv: getEnv$2,
		actions: actions$2,
		requiredSettings: requiredSettings$2
	});

	/**
	 * typeByNumber
	 *
	 * Helper function to grab the ICardType for a given card number.
	 *
	 * @param cardNumber - The card number
	 */
	function typeByNumber(cardNumber) {
	    var cardType;
	    if (!cardNumber) {
	        return undefined;
	    }
	    if (cardNumber.replace(/^\s+|\s+$/gm, "").length < 4) {
	        return undefined;
	    }
	    for (var i in cardTypes) {
	        if (!cardTypes.hasOwnProperty(i)) {
	            continue;
	        }
	        cardType = cardTypes[i];
	        if (cardType && cardType.regex && cardType.regex.test(cardNumber)) {
	            break;
	        }
	    }
	    return cardType;
	}
	/**
	 * typeByTrack
	 *
	 * @param data - track data
	 * @param isEncrypted - (default: false)
	 * @param trackNumber
	 */
	function typeByTrack(data, isEncrypted, trackNumber) {
	    if (isEncrypted === void 0) { isEncrypted = false; }
	    var cardNumber = "";
	    if (isEncrypted && trackNumber && trackNumber === "02") {
	        cardNumber = data.split("=")[0];
	    }
	    else {
	        var temp = data.split("%");
	        if (temp[1]) {
	            temp = temp[1].split("^");
	            if (temp[0]) {
	                cardNumber = temp[0].toString().substr(1);
	            }
	        }
	    }
	    return typeByNumber(cardNumber);
	}
	/**
	 * luhnCheck
	 *
	 * Runs a mod 10 check on a given card number.
	 *
	 * @param cardNumber - The card number
	 */
	function luhnCheck(cardNumber) {
	    var odd = true;
	    var i = 0;
	    var sum = 0;
	    var digit;
	    if (!cardNumber) {
	        return false;
	    }
	    var digits = cardNumber.split("").reverse();
	    var length = digits.length;
	    for (i; i < length; i++) {
	        digit = parseInt(digits[i], 10);
	        odd = !odd;
	        if (odd) {
	            digit *= 2;
	        }
	        if (digit > 9) {
	            digit -= 9;
	        }
	        sum += digit;
	    }
	    return sum % 10 === 0;
	}
	var cardTypes = [
	    {
	        code: "visa",
	        format: /(\d{1,4})/g,
	        lengths: [16, 18, 19],
	        regex: /^4/,
	    },
	    {
	        code: "mastercard",
	        format: /(\d{1,4})/g,
	        lengths: [16],
	        regex: /^(5[1-5]|2[2-7])/,
	    },
	    {
	        code: "amex",
	        format: /(\d{1,4})(\d{1,6})?(\d{1,5})?/,
	        lengths: [15],
	        regex: /^3[47]/,
	    },
	    {
	        code: "diners",
	        format: /(\d{1,4})(\d{1,6})?(\d{1,4})?/,
	        lengths: [14, 16, 19],
	        regex: /^3[0689]/,
	    },
	    {
	        code: "discover",
	        format: /(\d{1,4})/g,
	        lengths: [16, 19],
	        regex: /^6([045]|22)/,
	    },
	    {
	        code: "jcb",
	        format: /(\d{1,4})/g,
	        lengths: [16, 17, 18, 19],
	        regex: /^35/,
	    },
	    {
	        code: "unknown",
	        format: /(\d{1,4})/g,
	        lengths: [19],
	        regex: /^[0-9]/,
	    },
	];

	var actionNormalizeResponse$3 = (function (data) {
	    if (data.error && data.reasons) {
	        return {
	            error: data.error,
	            reasons: data.reasons,
	        };
	    }
	    if (data.error_code) {
	        var reasons = [{
	                code: data.error_code,
	                message: data.detailed_error_description,
	            }];
	        return {
	            error: true,
	            reasons: reasons,
	        };
	    }
	    var response = {
	        details: {
	            accountId: data.account_id,
	            accountName: data.account_name,
	            merchantId: data.merchant_id,
	            merchantName: data.merchant_name,
	            reference: data.reference,
	        },
	        paymentReference: data.id,
	    };
	    if (data.card && data.card.masked_number_last4) {
	        response.details.cardNumber = data.card.masked_number_last4;
	    }
	    if (data.card && data.card.brand) {
	        response.details.cardType = cardTypeOfGpApiBrand(data.card.brand);
	    }
	    return response;
	});
	var cardTypeOfGpApiBrand = function (brand) {
	    if (cardTypes.map(function (ct) { return ct.code; }).indexOf(brand.toLocaleLowerCase())) {
	        return brand.toLocaleLowerCase();
	    }
	    return brand;
	};

	var actionTokenize$3 = (function (url, env, data) { return __awaiter(void 0, void 0, void 0, function () {
	    var request, exp, headers, resp, e_1;
	    return __generator(this, function (_a) {
	        switch (_a.label) {
	            case 0:
	                request = {
	                    reference: options.reference || lib.generateGuid(),
	                    usage_mode: "SINGLE",
	                };
	                if (options.accountName) {
	                    request.account_name = options.accountName;
	                }
	                if (data["card-number"]) {
	                    request.card = request.card || {};
	                    request.card.number = data["card-number"].replace(/\s/g, "");
	                }
	                if (data["card-cvv"]) {
	                    request.card = request.card || {};
	                    request.card.cvv = data["card-cvv"];
	                }
	                if (data["card-expiration"] &&
	                    data["card-expiration"].indexOf(" / ") !== -1) {
	                    exp = data["card-expiration"].split(" / ");
	                    request.card = request.card || {};
	                    request.card.expiry_month = exp[0] || "";
	                    request.card.expiry_year = (exp[1] || "").substr(2, 2);
	                }
	                _a.label = 1;
	            case 1:
	                _a.trys.push([1, 3, , 4]);
	                headers = {
	                    "Accept": "application/json",
	                    "Authorization": "Bearer " + (options.accessToken || ""),
	                    "Content-Type": "application/json",
	                    "X-GP-Version": options.apiVersion || "2020-10-22",
	                };
	                return [4 /*yield*/, fetch(url, {
	                        body: JSON.stringify(request),
	                        credentials: "omit",
	                        headers: typeof Headers !== "undefined" ? new Headers(headers) : headers,
	                        method: "POST",
	                    })];
	            case 2:
	                resp = _a.sent();
	                return [2 /*return*/, resp.json()];
	            case 3:
	                e_1 = _a.sent();
	                return [2 /*return*/, {
	                        error: true,
	                        reasons: [{ code: e_1.name, message: e_1.message }],
	                    }];
	            case 4: return [2 /*return*/];
	        }
	    });
	}); });

	var actionValidateData$3 = (function (data) {
	    var errors = [];
	    if (!data["card-number"]) {
	        errors.push({
	            code: "INVALID_CARD_NUMBER",
	            message: "The card number is invalid.",
	        });
	    }
	    return errors;
	});

	var version = "1.8.1";

	var getEnv$3 = (function () {
	    return options.env || "production";
	});

	var getAssetBaseUrl = (function (result) {
	    var majorVersion = version.split(".")[0] || version[0];
	    switch (getEnv$3()) {
	        case "local":
	            return "http://localhost:7777/dist/";
	        case "qa":
	            return "https://js-qa.np-hpp.globalpay.com/v" + majorVersion + "/";
	        case "sandbox":
	            return "https://js-cert.globalpay.com/v" + majorVersion + "/";
	        case "production":
	            return "https://js.globalpay.com/v" + majorVersion + "/";
	        default:
	            return result;
	    }
	});

	var supports$3 = {
	    apm: {
	        applePay: false,
	        googlePay: false,
	    },
	    binCheck: {
	        hsaFsa: false,
	        surcharge: false,
	    },
	    consumerAuthentication: false,
	    tokenization: {
	        cardNotPresent: true,
	        cardPresent: true,
	        eCheck: false,
	        gift: false,
	    },
	};
	var domains$3 = {
	    production: "https://apis.globalpay.com",
	    qa: "https://apis-qa.globalpay.com",
	    sandbox: "https://apis.sandbox.globalpay.com",
	};
	var urls$3 = {
	    assetBaseUrl: getAssetBaseUrl,
	    tokenization: function (prod) {
	        if (options.env && options.env === "qa") {
	            return domains$3.qa + "/ucp/payment-methods";
	        }
	        return (prod ? domains$3.production : domains$3.sandbox) + "/ucp/payment-methods";
	    },
	};
	var actions$3 = {
	    normalizeResponse: actionNormalizeResponse$3,
	    tokenize: actionTokenize$3,
	    validateData: actionValidateData$3,
	};
	var requiredSettings$3 = ["accessToken"];

	var gpApi = /*#__PURE__*/Object.freeze({
		__proto__: null,
		supports: supports$3,
		urls: urls$3,
		actions: actions$3,
		requiredSettings: requiredSettings$3,
		getEnv: getEnv$3
	});

	var actionNormalizeResponse$4 = (function (data) {
	    if (data.error && data.reasons) {
	        return {
	            error: data.error,
	            reasons: data.reasons,
	        };
	    }
	    if (data.error) {
	        var reasons = [];
	        switch (data.error.param) {
	            case "card.number":
	                reasons.push({
	                    code: "INVALID_CARD_NUMBER",
	                    message: data.error.message,
	                });
	                break;
	            case "card.exp_month":
	            case "card.exp_year":
	                reasons.push({
	                    code: "INVALID_CARD_EXPIRATION_DATE",
	                    message: data.error.message,
	                });
	                break;
	        }
	        return {
	            error: true,
	            reasons: reasons,
	        };
	    }
	    var response = {
	        details: {},
	        paymentReference: data.token_value,
	    };
	    if (data.card && data.card.number) {
	        response.details.cardNumber = data.card.number;
	    }
	    if (data.is_fsahsa) {
	        response.details.isHsaFsa = data.is_fsahsa === "Y";
	    }
	    if (data.surcharge_allowed) {
	        response.details.canSurcharge = data.surcharge_allowed === "Y";
	    }
	    return response;
	});

	var actionTokenize$4 = (function (url, env, data) { return __awaiter(void 0, void 0, void 0, function () {
	    var request, exp, headers, resp, e_1;
	    return __generator(this, function (_a) {
	        switch (_a.label) {
	            case 0:
	                request = {
	                    object: "token",
	                    token_type: "supt",
	                };
	                if (data["card-number"]) {
	                    request.card = request.card || {};
	                    request.card.number = data["card-number"].replace(/\s/g, "");
	                }
	                if (data["card-cvv"]) {
	                    request.card = request.card || {};
	                    request.card.cvc = data["card-cvv"];
	                }
	                if (data["card-expiration"] &&
	                    data["card-expiration"].indexOf(" / ") !== -1) {
	                    exp = data["card-expiration"].split(" / ");
	                    request.card = request.card || {};
	                    request.card.exp_month = exp[0] || "";
	                    request.card.exp_year = exp[1] || "";
	                }
	                // TODO: Properly accept encrypted track data
	                if (data["card-track"]) {
	                    request.card = request.card || {};
	                    request.card.track_method = "swipe";
	                    request.card.track = data["card-track"];
	                }
	                if (data["account-number"]) {
	                    request.ach = request.ach || {};
	                    request.ach.account_number = data["account-number"];
	                }
	                if (data["routing-number"]) {
	                    request.ach = request.ach || {};
	                    request.ach.routing_number = data["routing-number"];
	                }
	                if (data["bin-check-hsafsa"]) {
	                    request.fsahsa_req = "Y";
	                }
	                if (data["bin-check-surcharge"]) {
	                    request.surchargeable_req = "Y";
	                }
	                _a.label = 1;
	            case 1:
	                _a.trys.push([1, 3, , 4]);
	                headers = {
	                    "Content-Type": "application/json",
	                };
	                return [4 /*yield*/, fetch(url, {
	                        body: JSON.stringify(request),
	                        credentials: "omit",
	                        headers: typeof Headers !== "undefined" ? new Headers(headers) : headers,
	                        method: "POST",
	                    })];
	            case 2:
	                resp = _a.sent();
	                return [2 /*return*/, resp.json()];
	            case 3:
	                e_1 = _a.sent();
	                return [2 /*return*/, {
	                        error: true,
	                        reasons: [{ code: e_1.name, message: e_1.message }],
	                    }];
	            case 4: return [2 /*return*/];
	        }
	    });
	}); });

	var actionValidateData$4 = (function (data) {
	    var errors = [];
	    if (!data["card-number"] && !data["card-track"] && !data["account-number"]) {
	        if (!data["card-number"]) {
	            errors.push({
	                code: "INVALID_CARD_NUMBER",
	                message: "The card number is invalid.",
	            });
	        }
	        else if (!data["account-number"]) {
	            errors.push({
	                code: "INVALID_ACCOUNT_NUMBER",
	                message: "The account number is invalid",
	            });
	        }
	    }
	    if (data["account-number"] && !data["routing-number"]) {
	        errors.push({
	            code: "INVALID_ROUTING_NUMBER",
	            message: "The routing number is invalid",
	        });
	    }
	    return errors;
	});

	var supports$4 = {
	    apm: {
	        applePay: true,
	        googlePay: false,
	    },
	    binCheck: {
	        hsaFsa: true,
	        surcharge: true,
	    },
	    consumerAuthentication: true,
	    tokenization: {
	        cardNotPresent: true,
	        cardPresent: true,
	        eCheck: true,
	        gift: true,
	    },
	};
	var domains$4 = {
	    production: "https://api.heartlandportico.com",
	    sandbox: "https://cert.api2.heartlandportico.com",
	};
	var urls$4 = {
	    tokenization: function (prod) {
	        return prod
	            ? domains$4.production + "/SecureSubmit.v1/api/token"
	            : domains$4.sandbox + "/Hps.Exchange.PosGateway.Hpf.v1/api/token";
	    },
	};
	var actions$4 = {
	    normalizeResponse: actionNormalizeResponse$4,
	    tokenize: actionTokenize$4,
	    validateData: actionValidateData$4,
	};
	var requiredSettings$4 = ["publicApiKey"];
	var getEnv$4 = function () {
	    var key = options.publicApiKey || "";
	    var def = "production";
	    if (options.env && options.env === "local") {
	        return options.env;
	    }
	    if (!key) {
	        return def;
	    }
	    var parts = key.split("_");
	    if (!parts[1]) {
	        return def;
	    }
	    switch (parts[1]) {
	        case "cert":
	            return "sandbox";
	        case "prod":
	        default:
	            return def;
	    }
	};

	var heartland = /*#__PURE__*/Object.freeze({
		__proto__: null,
		supports: supports$4,
		urls: urls$4,
		actions: actions$4,
		requiredSettings: requiredSettings$4,
		getEnv: getEnv$4
	});

	var actionNormalizeResponse$5 = (function (data) {
	    return data;
	});

	var actionTokenize$5 = (function (url, env, data) { return __awaiter(void 0, void 0, void 0, function () {
	    var request, exp, environment, headers, resp, e_1;
	    return __generator(this, function (_a) {
	        switch (_a.label) {
	            case 0:
	                request = {};
	                if (data["card-number"]) {
	                    request.card = request.card || {};
	                    request.card.card_number = data["card-number"].replace(/\s+/g, "");
	                }
	                if (data["card-cvv"]) {
	                    request.card = request.card || {};
	                    request.card.card_security_code = data["card-cvv"];
	                }
	                if (data["card-expiration"] &&
	                    data["card-expiration"].indexOf(" / ") !== -1) {
	                    exp = data["card-expiration"].split(" / ");
	                    request.card = request.card || {};
	                    request.card.expiry_month = exp[0] || "";
	                    request.card.expiry_year = exp[1].slice(-2) || "";
	                }
	                // TODO: Properly accept encrypted track data
	                if (data["card-track"]) {
	                    request.card = request.card || {};
	                    request.card.track_method = "swipe";
	                    request.card.track = data["card-track"];
	                }
	                if (data["account-number"]) {
	                    request.ach = request.ach || {};
	                    request.ach.account_number = data["account-number"];
	                }
	                if (data["routing-number"]) {
	                    request.ach = request.ach || {};
	                    request.ach.routing_number = data["routing-number"];
	                }
	                _a.label = 1;
	            case 1:
	                _a.trys.push([1, 3, , 4]);
	                environment = env !== "local" ? env : "dev";
	                headers = {
	                    "Content-Type": "application/json",
	                    "X-GP-Api-Key": options["X-GP-Api-Key"],
	                    "X-GP-Environment": "" + environment,
	                    /* tslint:disable:no-bitwise */
	                    "X-GP-Request-Id": "PFC-" + "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (character) {
	                        var random = Math.floor(Math.random() * 16);
	                        var value = character === "x" ? random : (random & 0x3 | 0x8);
	                        return value.toString(16);
	                    }),
	                    /* tslint:enable:no-bitwise */
	                    "X-GP-Version": "2019-08-22",
	                };
	                return [4 /*yield*/, fetch(url, {
	                        body: JSON.stringify(request),
	                        credentials: "omit",
	                        headers: typeof Headers !== "undefined" ? new Headers(headers) : headers,
	                        method: "POST",
	                    })];
	            case 2:
	                resp = _a.sent();
	                return [2 /*return*/, resp.json()];
	            case 3:
	                e_1 = _a.sent();
	                return [2 /*return*/, {
	                        error: true,
	                        reasons: [{ code: e_1.name, message: e_1.message }],
	                    }];
	            case 4: return [2 /*return*/];
	        }
	    });
	}); });

	var actionValidateData$5 = (function (data) {
	    var errors = [];
	    var cardNumber = data["card-number"].replace(/\s+/g, "");
	    // The error message here is irrelevant - actual 'invalid_input' error is generated in tokenize.ts.
	    // For type compatibility reason, this code is preserved here.
	    // if (!data["card-number"] && !data["card-track"] && !data["account-number"]) {
	    if (cardNumber.length < 13 || cardNumber.length > 19) {
	        errors.push({
	            code: "invalid_input",
	            // @ts-ignore
	            detail: [{
	                    data_path: "/card/card_number",
	                    description: "Invalid data",
	                }],
	            message: "Invalid input data.",
	        });
	    }
	    return errors;
	});

	var getEnv$5 = (function () {
	    return options["X-GP-Environment"] || "local";
	});

	var getAssetBaseUrl$1 = (function (result) {
	    var majorVersion = version.split(".")[0] || version[0];
	    switch (getEnv$5()) {
	        case "local":
	            return "http://localhost:8080/v" + majorVersion + "/";
	        case "dev":
	            return "https://js.dev.paygateway.com/secure_payment/v" + majorVersion + "/";
	        case "pqa":
	            return "https://js.pqa.paygateway.com/secure_payment/v" + majorVersion + "/";
	        case "qa":
	            return "https://js.qa.paygateway.com/secure_payment/v" + majorVersion + "/";
	        case "test":
	            return "https://js.test.paygateway.com/secure_payment/v" + majorVersion + "/";
	        case "prod":
	            return "https://js.paygateway.com/secure_payment/v" + majorVersion + "/";
	        case "GP":
	            return result;
	        default:
	            return result;
	    }
	});

	var supports$5 = {
	    apm: {
	        applePay: true,
	        googlePay: false,
	    },
	    consumerAuthentication: true,
	    tokenization: {
	        cardNotPresent: true,
	        cardPresent: true,
	        eCheck: true,
	        gift: true,
	    },
	};
	/* tslint:disable:object-literal-sort-keys */
	var domains$5 = {
	    local: "https://api-sandbox.dev.paygateway.com",
	    dev: "https://api.dev.paygateway.com",
	    pqa: "https://api.dev.paygateway.com",
	    qa: "https://api.qa.paygateway.com",
	    test: "https://api.pit.paygateway.com",
	    prod: "https://api.paygateway.com",
	};
	/* tslint:enable:object-literal-sort-keys */
	var urls$5 = {
	    assetBaseUrl: getAssetBaseUrl$1,
	    tokenization: function (prod) {
	        return domains$5[getEnv$5()] + "/tokenization/temporary_tokens";
	    },
	};
	var actions$5 = {
	    normalizeResponse: actionNormalizeResponse$5,
	    tokenize: actionTokenize$5,
	    validateData: actionValidateData$5,
	};
	var requiredSettings$5 = ["X-GP-Api-Key", "X-GP-Environment"];

	var openedge = /*#__PURE__*/Object.freeze({
		__proto__: null,
		supports: supports$5,
		urls: urls$5,
		actions: actions$5,
		requiredSettings: requiredSettings$5,
		getEnv: getEnv$5
	});

	var actionNormalizeResponse$6 = (function (data) {
	    if (data.error && data.reasons) {
	        return {
	            error: data.error,
	            reasons: data.reasons,
	        };
	    }
	    // TODO: parse these properly
	    if (["FAIL", "FAILURE"].indexOf(data.status) !== -1) {
	        return {
	            error: true,
	            reasons: [{
	                    code: "ERROR",
	                    message: data.responseCode + ": " + data.message,
	                }],
	        };
	    }
	    var response = {
	        paymentReference: data.tsepToken,
	        requestId: data.transactionId,
	    };
	    return response;
	});

	var actionTokenize$6 = (function (url, enbv, data) {
	    var getRequest = function () {
	        var request = {
	            cvv2: data["card-cvv"],
	            deviceID: window.getDeviceId(),
	            manifest: window.getManifest(),
	            uniqueKeyIdentifier: window.getKeyId(),
	        };
	        if (data["card-number"]) {
	            request.encCardNumber = window.encryptTsepCard(data["card-number"].replace(/\s/g, ""));
	        }
	        if (data["card-expiration"] &&
	            data["card-expiration"].indexOf(" / ") !== -1) {
	            request.expirationDate = data["card-expiration"].replace(" / ", "/");
	        }
	        return request;
	    };
	    return new Promise(function (resolve, reject) {
	        var scriptId = "tsep-entry-script";
	        var cardId = "tsep-cardNumDiv";
	        var timeout = setTimeout(function () {
	            reject({
	                error: true,
	                reasons: [{ code: "TIMEOUT", message: "TransIT setup timeout" }],
	            });
	        }, 30000);
	        var cleanup = function () {
	            clearTimeout(timeout);
	            [cardId, scriptId].forEach(function (id) {
	                var el = document.getElementById(id);
	                if (!el || !el.parentNode) {
	                    return;
	                }
	                el.parentNode.removeChild(el);
	            });
	        };
	        try {
	            // handle tsep response
	            window.tsepHandler = function (eventType, eventData) {
	                // tsep's input fields aren't being used, so this should
	                // be the only event to capture in order to handle load errors
	                if (eventType === "ErrorEvent") {
	                    cleanup();
	                    reject({ error: true, reasons: [{
	                                code: "ERROR",
	                                message: eventData.responseCode + ": " + eventData.message,
	                            }] });
	                }
	            };
	            // add holder for tsep card number input
	            var card = document.createElement("div");
	            card.hidden = true;
	            card.style.display = "none";
	            card.id = cardId;
	            document.body.appendChild(card);
	            // add new script on page
	            var script = document.createElement("script");
	            script.id = scriptId;
	            script.src = url;
	            script.defer = true;
	            script.onload = function (e) {
	                if (!window.onload) {
	                    return;
	                }
	                window.onload(e);
	            };
	            document.body.appendChild(script);
	            // tsep doesn't expose a way to hook into the library's load event,
	            // so we create an interval to check manually
	            var interval_1 = setInterval(function () {
	                var cardEl = document.getElementById(cardId.substr(0, cardId.length - 3));
	                // presence of the card element ensures tsep.js is loaded
	                // presence of `cryptTsep` ensures jsencrypt.js is loaded
	                if (!cardEl || !window.cryptTsep) {
	                    return;
	                }
	                // tsep has loaded, so continue on after stopping the interval
	                clearInterval(interval_1);
	                var headers = {
	                    "Content-Type": "application/json",
	                };
	                fetch(options.tsepHost + "/transit-tsep-web/generateTsepToken", {
	                    body: JSON.stringify(getRequest()),
	                    credentials: "omit",
	                    headers: typeof Headers !== "undefined" ? new Headers(headers) : headers,
	                    method: "POST",
	                })
	                    .then(function (resp) {
	                    cleanup();
	                    resolve(resp.json());
	                })["catch"](function (e) {
	                    cleanup();
	                    reject(e);
	                });
	            }, 100);
	        }
	        catch (e) {
	            return reject({
	                error: true,
	                reasons: [{ code: e.name, message: e.message }],
	            });
	        }
	    });
	});

	var actionValidateData$6 = (function (data) {
	    var errors = [];
	    if (!data["card-number"]) {
	        errors.push({
	            code: "INVALID_CARD_NUMBER",
	            message: "The card number is invalid.",
	        });
	    }
	    if (!data["card-cvv"]) {
	        errors.push({
	            code: "INVALID_CARD_SECURITY_CODE",
	            message: "The card security code is invalid.",
	        });
	    }
	    if (!data["card-expiration"]) {
	        errors.push({
	            code: "INVALID_CARD_EXPIRATION",
	            message: "The card expiration is invalid.",
	        });
	    }
	    return errors;
	});

	var supports$6 = {
	    apm: {
	        applePay: false,
	        googlePay: false,
	    },
	    consumerAuthentication: false,
	    tokenization: {
	        cardNotPresent: true,
	        cardPresent: false,
	        eCheck: false,
	        gift: false,
	    },
	};
	var domains$6 = {
	    // Genius Checkout has an automatic sandbox feature for developer / partner accounts
	    production: "https://gateway.transit-pass.com",
	    sandbox: "https://stagegw.transnox.com",
	};
	var urls$6 = {
	    tokenization: function (prod) {
	        options.tsepHost = prod ? domains$6.production : domains$6.sandbox;
	        return options.tsepHost + "/transit-tsep-web/jsView/" + options.deviceId + "?" + options.manifest;
	    },
	};
	var actions$6 = {
	    normalizeResponse: actionNormalizeResponse$6,
	    tokenize: actionTokenize$6,
	    validateData: actionValidateData$6,
	};
	var requiredSettings$6 = ["deviceId", "manifest"];
	var getEnv$6 = function () {
	    return options.env || "production";
	};

	var transit = /*#__PURE__*/Object.freeze({
		__proto__: null,
		supports: supports$6,
		urls: urls$6,
		actions: actions$6,
		requiredSettings: requiredSettings$6,
		getEnv: getEnv$6
	});

	var availableGateways = {
	    billpay: billpay,
	    genius: genius,
	    globalpayments: globalpayments,
	    gpApi: gpApi,
	    heartland: heartland,
	    openedge: openedge,
	    transit: transit,
	};

	var configHasAllRequiredSettings = function (settings) {
	    var totalSettings = settings.length;
	    var count = 0;
	    for (var i = 0; i < totalSettings; i++) {
	        var setting = settings[i];
	        if (options.hasOwnProperty(setting) && options[setting] !== undefined) {
	            count++;
	        }
	    }
	    return count === totalSettings;
	};
	var getGateway = (function () {
	    for (var key in availableGateways) {
	        if (!availableGateways.hasOwnProperty(key)) {
	            continue;
	        }
	        var gateway = availableGateways[key];
	        if (configHasAllRequiredSettings(gateway.requiredSettings)) {
	            return gateway;
	        }
	    }
	    return undefined;
	});

	/**
	 * Creates a single object by merging a `source` (default) and `properties`
	 * obtained elsewhere. Any properties in `properties` will overwrite
	 * matching properties in `source`.
	 *
	 * @param source
	 * @param properties
	 */
	function objectAssign(source, properties) {
	    var destination = {};
	    if (!source) {
	        source = {};
	    }
	    for (var property in source) {
	        if (source.hasOwnProperty(property)) {
	            destination[property] = source[property];
	        }
	    }
	    for (var property in properties) {
	        if (properties.hasOwnProperty(property)) {
	            destination[property] = properties[property];
	        }
	    }
	    return destination;
	}

	/**
	 * addStylesheet
	 *
	 * Creates a `style` node in the DOM with the given `css`.
	 *
	 * @param css
	 * @param id
	 */
	function addStylesheet(css, id) {
	    var el = document.createElement("style");
	    var elements = document.getElementsByTagName("head");
	    if (id) {
	        if (document.getElementById(id)) {
	            return;
	        }
	        el.id = id;
	    }
	    el.type = "text/css";
	    if (el.styleSheet) {
	        // for IE
	        el.styleSheet.cssText = css;
	    }
	    else {
	        el.appendChild(document.createTextNode(css));
	    }
	    if (elements && elements[0]) {
	        elements[0].appendChild(el);
	    }
	}
	/**
	 * json2css
	 *
	 * Converts a JSON node to text representing CSS.
	 *
	 * @param json
	 */
	function json2css(json) {
	    var css = "";
	    var attributes = jsonAttributes(json);
	    var children = jsonChildren(json);
	    var i;
	    var j;
	    var key;
	    var value;
	    if (attributes) {
	        var attributesLength = attributes.length;
	        for (i = 0; i < attributesLength; i++) {
	            key = attributes[i];
	            value = json[key];
	            if (isArray$1(value)) {
	                var arrLength = value.length;
	                for (j = 0; j < arrLength; j++) {
	                    css += key + ":" + value[j] + ";";
	                }
	            }
	            else {
	                css += key + ":" + value + ";";
	            }
	        }
	    }
	    if (children) {
	        var childrenLength = children.length;
	        for (i = 0; i < childrenLength; i++) {
	            key = children[i];
	            value = json[key];
	            css += key + "{" + json2css(value) + "}";
	        }
	    }
	    return css;
	}
	function isArray$1(obj) {
	    return Object.prototype.toString.call(obj) === "[object Array]";
	}
	function jsonAttributes(json) {
	    var keys = [];
	    for (var key in json) {
	        if (json.hasOwnProperty(key) &&
	            (typeof json[key] === "string" || isArray$1(json[key]))) {
	            keys.push(key);
	        }
	    }
	    return keys;
	}
	function jsonChildren(json) {
	    var keys = [];
	    for (var key in json) {
	        if (json.hasOwnProperty(key) &&
	            !(typeof json[key] === "string" || isArray$1(json[key]))) {
	            keys.push(key);
	        }
	    }
	    return keys;
	}

	var assetBaseUrl = (function () {
	    var majorVersion = version.split(".")[0] || version[0];
	    var result = "https://js.globalpay.com/v" + majorVersion + "/";
	    var gateway = getGateway();
	    if (gateway && gateway.urls.assetBaseUrl) {
	        return gateway.urls.assetBaseUrl(result);
	    }
	    switch (options.env) {
	        case "local":
	            return "http://localhost:7777/dist/";
	        case "qa":
	            return "https://js-qa.np-hpp.globalpay.com/v" + majorVersion + "/";
	        case "sandbox":
	            return "https://js-cert.globalpay.com/v" + majorVersion + "/";
	        case "production":
	            return "https://js.globalpay.com/v" + majorVersion + "/";
	        default:
	            return result;
	    }
	});

	// tslint:disable:object-literal-key-quotes
	// tslint:disable:object-literal-sort-keys
	var fieldStyles = function (assetBaseUrl) {
	    var imageBase = assetBaseUrl + "images/";
	    return {
	        "#secure-payment-field": {
	            "-o-transition": "border-color ease-in-out .15s,box-shadow ease-in-out .15s",
	            "-webkit-box-shadow": "inset 0 1px 1px rgba(0,0,0,.075)",
	            "-webkit-transition": "border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s",
	            "background-color": "#fff",
	            border: "1px solid #ccc",
	            "border-radius": "0px",
	            "box-shadow": "inset 0 1px 1px rgba(0,0,0,.075)",
	            "box-sizing": "border-box",
	            color: "#555",
	            display: "block",
	            "font-family": "sans-serif",
	            "font-size": "14px",
	            height: "50px",
	            "line-height": "1.42857143",
	            margin: "0 .5em 0 0",
	            "max-width": "100%",
	            outline: "0",
	            padding: "6px 12px",
	            transition: "border-color ease-in-out .15s,box-shadow ease-in-out .15s",
	            "vertical-align": "baseline",
	            width: "100% ",
	        },
	        "#secure-payment-field:focus": {
	            border: "1px solid #3989e3",
	            "box-shadow": "none",
	            height: "50px",
	            outline: "none",
	        },
	        "#secure-payment-field[type=button]": {
	            "-moz-user-select": "none",
	            "-ms-touch-action": "manipulation",
	            "-ms-user-select": "none",
	            "-webkit-user-select": "none",
	            "background-color": "#36b46e",
	            "background-image": "none",
	            border: "0px solid transparent",
	            "box-sizing": "border-box",
	            color: "#fff",
	            cursor: "pointer",
	            display: "inline-block",
	            "font-family": "sans-serif",
	            "font-size": "14px",
	            "font-weight": "400",
	            "line-height": "1.42857143",
	            "margin-bottom": "0",
	            padding: "6px 12px",
	            "text-align": "center",
	            "text-transform": "uppercase",
	            "touch-action": "manipulation",
	            "user-select": "none",
	            "vertical-align": "middle",
	            "white-space": "nowrap",
	        },
	        "#secure-payment-field[type=button]:focus": {
	            "background-color": "#258851",
	            color: "#ffffff",
	            outline: "none",
	        },
	        "#secure-payment-field[type=button]:hover": {
	            "background-color": "#258851",
	        },
	        ".card-cvv": {
	            background: "transparent url(" + imageBase + "cvv.png) no-repeat right",
	            "background-size": "63px 40px",
	        },
	        ".card-cvv.card-type-amex": {
	            background: "transparent url(" + imageBase + "cvv-amex.png) no-repeat right",
	            "background-size": "63px 40px",
	        },
	        ".card-number": {
	            background: "transparent url(" + imageBase + "logo-unknown@2x.png) no-repeat right",
	            "background-size": "55px 35px",
	        },
	        ".card-number.invalid.card-type-amex": {
	            background: "transparent url(" + imageBase + "logo-amex@2x.png) no-repeat right",
	            "background-position-y": "-44px",
	            "background-size": "50px 90px",
	        },
	        ".card-number.invalid.card-type-discover": {
	            background: "transparent url(" + imageBase + "logo-discover@2x.png) no-repeat right",
	            "background-position-y": "-44px",
	            "background-size": "85px 90px",
	        },
	        ".card-number.invalid.card-type-jcb": {
	            background: "transparent url(" + imageBase + "logo-jcb@2x.png) no-repeat right",
	            "background-position-y": "-44px",
	            "background-size": "55px 94px",
	        },
	        ".card-number.invalid.card-type-mastercard": {
	            background: "transparent url(" + imageBase + "logo-mastercard@2x.png) no-repeat right",
	            "background-position-y": "-52px",
	            "background-size": "62px 105px",
	        },
	        ".card-number.invalid.card-type-visa": {
	            background: "transparent url(" + imageBase + "logo-visa@2x.png) no-repeat right",
	            "background-position-y": "-44px",
	            "background-size": "83px 88px",
	        },
	        ".card-number.valid.card-type-amex": {
	            background: "transparent url(" + imageBase + "logo-amex@2x.png) no-repeat right top",
	            "background-size": "50px 90px",
	        },
	        ".card-number.valid.card-type-discover": {
	            background: "transparent url(" + imageBase + "logo-discover@2x.png) no-repeat right",
	            "background-position-y": "1px",
	            "background-size": "85px 90px",
	        },
	        ".card-number.valid.card-type-jcb": {
	            background: "transparent url(" + imageBase + "logo-jcb@2x.png) no-repeat right top",
	            "background-position-y": "2px",
	            "background-size": "55px 94px",
	        },
	        ".card-number.valid.card-type-mastercard": {
	            background: "transparent url(" + imageBase + "logo-mastercard@2x.png) no-repeat right",
	            "background-position-y": "-1px",
	            "background-size": "62px 105px",
	        },
	        ".card-number.valid.card-type-visa": {
	            background: "transparent url(" + imageBase + "logo-visa@2x.png) no-repeat right top",
	            "background-size": "82px 86px",
	        },
	        ".card-number::-ms-clear": {
	            display: "none",
	        },
	        "input[placeholder]": {
	            "letter-spacing": "3px",
	        },
	    };
	};
	var parentStyles = function (assetBaseUrl) {
	    var imageBase = assetBaseUrl + "images/";
	    return {
	        ".secure-payment-form": {
	            "font-family": "sans-serif",
	        },
	        ".secure-payment-form label": {
	            color: "#555",
	            "font-size": "13px",
	            "font-weight": "bold",
	            "line-height": "1.5",
	            "text-transform": "uppercase",
	        },
	        ".secure-payment-form #ss-banner": {
	            background: "transparent url(" + imageBase + "shield-and-logos@2x.png) no-repeat left center",
	            "background-size": "280px 34px",
	            height: "40px",
	            "margin-bottom": "7px",
	        },
	        ".secure-payment-form div": {
	            display: "block",
	        },
	        ".secure-payment-form iframe": {
	            width: "300px",
	        },
	        ".secure-payment-form .form-row": {
	            "margin-top": "10px",
	        },
	        ".secure-payment-form .form-wrapper": {
	            display: "block",
	            margin: "10px auto",
	            width: "300px",
	        },
	        ".secure-payment-form .tooltip, .secure-payment-form .tooltip-content": {
	            display: "none",
	        },
	    };
	};

	// tslint:disable:object-literal-key-quotes
	// tslint:disable:object-literal-sort-keys
	var fieldStyles$1 = function (assetBaseUrl) {
	    var imageBase = assetBaseUrl + "images/";
	    return {
	        "*": {
	            "box-sizing": "border-box",
	        },
	        "::-webkit-input-placeholder": {
	            color: "#9296A5",
	        },
	        "::-ms-input-placeholder": {
	            color: "#9296A5",
	        },
	        "::-moz-input-placeholder": {
	            color: "#9296A5",
	            opacity: 1,
	        },
	        ":-moz-input-placeholder": {
	            color: "#9296A5",
	            opacity: 1,
	        },
	        "#secure-payment-field": {
	            width: "100%",
	            height: "40px",
	            padding: "12px",
	            border: "1px solid #BCBFC8",
	            "border-radius": "0",
	            "font-size": "0.89em",
	            "font-weight": "400",
	            color: "#394046",
	        },
	        "#secure-payment-field:focus": {
	            border: "1px solid #2B9AEC",
	            outline: "none",
	        },
	        "#secure-payment-field[type=button]": {
	            "background-color": "#0074C7",
	            color: "white",
	            padding: "8px",
	            border: "none",
	            width: "100%",
	            "border-radius": "2px",
	            cursor: "pointer",
	            "font-size": "1.125em",
	            "font-weight": "500",
	            height: "48px",
	            "text-align": "center",
	            "vertical-align": "middle",
	        },
	        "#secure-payment-field[type=button]:focus": {
	            border: "1px solid #2B9AEC",
	            outline: "none",
	        },
	        "#secure-payment-field[type=button]:hover": {
	            "background-color": "#148EE6",
	        },
	        "#secure-payment-field[type=button]::before": {
	            content: "url(\"" + imageBase + "gp-lock.svg\")",
	            "margin-right": "5px",
	        },
	        ".card-cvv": {
	            background: "transparent url(" + imageBase + "cvv.png) no-repeat right 10px center",
	            "background-size": "20px",
	        },
	        ".card-cvv.card-type-amex": {
	            "background-image": "url(" + imageBase + "cvv-amex.png)",
	        },
	        ".card-number": {
	            background: "transparent url(" + imageBase + "gp-cc-generic.svg) no-repeat right 10px center",
	            "background-size": "20px",
	        },
	        ".card-number.card-type-amex": {
	            "background-image": "url(" + imageBase + "gp-cc-amex.svg)",
	        },
	        ".card-number.card-type-discover": {
	            "background-image": "url(" + imageBase + "gp-cc-discover.svg)",
	        },
	        ".card-number.card-type-jcb": {
	            "background-image": "url(" + imageBase + "gp-cc-jcb.svg)",
	        },
	        ".card-number.card-type-mastercard": {
	            "background-image": "url(" + imageBase + "gp-cc-mastercard.svg)",
	        },
	        ".card-number.card-type-visa": {
	            "background-image": "url(" + imageBase + "gp-cc-visa.svg)",
	        },
	        ".card-number::-ms-clear": {
	            display: "none",
	        },
	    };
	};
	var parentStyles$1 = function (assetBaseUrl) {
	    var imageBase = assetBaseUrl + "images/";
	    return {
	        ".secure-payment-form": {
	            display: "flex",
	            "-ms-flex-wrap": "wrap",
	            "flex-wrap": "wrap",
	        },
	        ".secure-payment-form *": {
	            "box-sizing": "border-box",
	        },
	        ".secure-payment-form label": {
	            "margin": "16px 0",
	            "display": "block",
	            "font-size": "0.79em",
	            "font-weight": "500"
	        },
	        ".secure-payment-form > div": {
	            "flex": "100%",
	        },
	        ".secure-payment-form .credit-card-card-cvv iframe": {
	            "width": "100%",
	            "float": "left",
	        },
	        ".secure-payment-form .credit-card-shield": {
	            "flex": "1 1 auto",
	            "margin-right": "16px",
	            "background": "url(" + imageBase + "gp-secure-ssl-logo.svg) no-repeat left",
	            "width": "88px",
	            "height": "26px",
	        },
	        ".secure-payment-form .credit-card-logo": {
	            "flex": "1 1 auto",
	            "margin-left": "16px",
	            "background": "url(" + imageBase + "gp-secure-logo.svg) no-repeat right",
	            "width": "100px",
	            "height": "23px",
	        },
	        ".secure-payment-form .credit-card-submit": {
	            "margin": "32px 0 16px 0",
	        },
	        ".secure-payment-form iframe": {
	            "min-height": "40px",
	            "width": "100%",
	        },
	        ".secure-payment-form .tooltip": {
	            "position": "relative",
	            "width": "10%",
	            "height": "6px",
	            "border": "1px solid #BCBFC8",
	            "border-left": "none",
	            "color": "#474B57",
	            "overflow": "hidden",
	            "background-size": "20px",
	            "background": "transparent url(" + imageBase + "gp-fa-question-circle.svg) no-repeat center center",
	        },
	        ".secure-payment-form .tooltip-content": {
	            "visibility": "hidden",
	            "width": "200px",
	            "background-color": "#fff",
	            "color": "#474B57",
	            "text-align": "left",
	            "border-radius": "3px",
	            "border": "solid 1px #BCBFC8",
	            "padding": "8px 8px",
	            "position": "absolute",
	            "z-index": "99999999",
	            "right": "10%",
	            "opacity": "0",
	            "transition": "opacity 0.3s",
	            "font-size": "0.79em",
	            "font-weight": "400",
	            "margin-top": "-12px",
	            "overflow": "hidden",
	            "box-shadow": "0 3px 6px rgba(0, 0, 0, 0.1)",
	        },
	        ".secure-payment-form .tooltip:hover + .tooltip-content": {
	            "visibility": "visible",
	            "opacity": "1",
	        },
	        "@media(min-width: 800px)": {
	            ".secure-payment-form .credit-card-card-expiration": {
	                "flex": "1 1 auto",
	                //"margin-right": "16px",
	            },
	            ".secure-payment-form .credit-card-card-cvv": {
	                "flex": "1 1 auto",
	                //"margin-left": "16px",
	            },
	            ".secure-payment-form .tooltip-content": {
	                "right": "5%",
	            },
	        },
	    };
	};

	// tslint:disable:object-literal-key-quotes
	// tslint:disable:object-literal-sort-keys
	// @TODO: confirm styles with enterprise repo
	var fieldStyles$2 = function (assetBaseUrl) {
	    var imageBase = assetBaseUrl + "images/";
	    return {
	        "html": {
	            "font-size": "62.5%",
	        },
	        "body": {
	            "font-size": "1.4rem",
	        },
	        "#secure-payment-field-wrapper": {
	            "postition": "relative",
	        },
	        "#secure-payment-field": {
	            "-o-transition": "border-color ease-in-out .15s,box-shadow ease-in-out .15s",
	            "-webkit-box-shadow": "inset 0 1px 1px rgba(0,0,0,.075)",
	            "-webkit-transition": "border-color ease-in-out .15s,-webkit-box-shadow ease-in-out .15s",
	            "background-color": "#fff",
	            "border": "1px solid #cecece",
	            "border-radius": "2px",
	            "box-shadow": "none",
	            "box-sizing": "border-box",
	            "display": "block",
	            "font-family": "Roboto, sans-serif",
	            "font-size": "11px",
	            "font-smoothing": "antialiased",
	            "height": "35px",
	            "margin": "5px 0 10px 0",
	            "max-width": "100%",
	            "outline": "0",
	            "padding": "0 10px",
	            "transition": "border-color ease-in-out .15s,box-shadow ease-in-out .15s",
	            "vertical-align": "baseline",
	            "width": "100%",
	        },
	        "#secure-payment-field:focus": {
	            "border": "1px solid lightblue",
	            "box-shadow": "0 1px 3px 0 #cecece",
	            "outline": "none",
	        },
	        "#secure-payment-field[type=button]": {
	            "text-align": "center",
	            "text-transform": "none",
	            "white-space": "nowrap",
	        },
	        "#secure-payment-field[type=button]:focus": {
	            "outline": "none",
	        },
	        ".card-cvv": {
	            "background": "transparent url(" + imageBase + "/cvv.png) no-repeat right",
	            "background-size": "60px",
	        },
	        ".card-cvv.card-type-amex": {
	            "background": "transparent url(" + imageBase + "/cvv-amex.png) no-repeat right",
	            "background-size": "60px",
	        },
	        ".card-number": {
	            "background": "transparent url(" + imageBase + "/logo-unknown@2x.png) no-repeat right",
	            "background-size": "52px",
	        },
	        ".card-number.invalid.card-type-amex": {
	            "background": "transparent url(" + imageBase + "/amex-invalid.svg) no-repeat right center",
	            "background-position-x": "98%",
	            "background-size": "38px",
	        },
	        ".card-number.invalid.card-type-discover": {
	            "background": "transparent url(" + imageBase + "/discover-invalid.svg) no-repeat right center",
	            "background-position-x": "98%",
	            "background-size": "60px",
	        },
	        ".card-number.invalid.card-type-jcb": {
	            "background": "transparent url(" + imageBase + "/jcb-invalid.svg) no-repeat right center",
	            "background-position-x": "98%",
	            "background-size": "38px",
	        },
	        ".card-number.invalid.card-type-mastercard": {
	            "background": "transparent url(" + imageBase + "/mastercard-invalid.svg) no-repeat right center",
	            "background-position-x": "98%",
	            "background-size": "40px",
	        },
	        ".card-number.invalid.card-type-visa": {
	            "background": "transparent url(" + imageBase + "/visa-invalid.svg) no-repeat center",
	            "background-position-x": "98%",
	            "background-size": "50px",
	        },
	        ".card-number.valid.card-type-amex": {
	            "background": "transparent url(" + imageBase + "/amex.svg) no-repeat right center",
	            "background-position-x": "98%",
	            "background-size": "38px",
	        },
	        ".card-number.valid.card-type-discover": {
	            "background": "transparent url(" + imageBase + "/discover.svg) no-repeat right center",
	            "background-position-x": "98%",
	            "background-size": "60px",
	        },
	        ".card-number.valid.card-type-jcb": {
	            "background": "transparent url(" + imageBase + "/jcb.svg) no-repeat right center",
	            "background-position-x": "98%",
	            "background-size": "38px",
	        },
	        ".card-number.valid.card-type-mastercard": {
	            "background": "transparent url(" + imageBase + "/mastercard.svg) no-repeat center",
	            "background-position-x": "98%",
	            "background-size": "40px",
	        },
	        ".card-number.valid.card-type-visa": {
	            "background": "transparent url(" + imageBase + "/visa.svg) no-repeat right center",
	            "background-position-x": "98%",
	            "background-size": "50px",
	        },
	        ".card-number::-ms-clear": {
	            "display": "none",
	        },
	        "input[placeholder]": {
	            "letter-spacing": ".5px",
	        },
	    };
	};
	var parentStyles$2 = function (assetBaseUrl) {
	    var imageBase = assetBaseUrl + "images/";
	    return {
	        ".secure-payment-form": {
	            "font-family": "sans-serif",
	            width: "300px",
	        },
	        ".secure-payment-form label": {
	            color: "#555",
	            "font-size": "13px",
	            "font-weight": "bold",
	            "line-height": "1.5",
	            "text-transform": "uppercase",
	        },
	        ".secure-payment-form #ss-banner": {
	            background: "transparent url(" + imageBase + "/shield-and-logos@2x.png) no-repeat left center",
	            "background-size": "280px 34px",
	            height: "40px",
	            "margin-bottom": "7px",
	        },
	        ".secure-payment-form div": {
	            display: "block",
	        },
	        ".secure-payment-form iframe": {
	            "min-height": "3.6rem",
	        },
	        ".secure-payment-form .form-row": {
	            "margin-top": "10px",
	        },
	        ".secure-payment-form .form-wrapper": {
	            display: "block",
	            margin: "10px auto",
	        },
	        ".secure-payment-form input": fieldStyles$2(assetBaseUrl)["#secure-payment-field"],
	        ".secure-payment-form input:focus": fieldStyles$2(assetBaseUrl)["#secure-payment-field:focus"],
	        ".secure-payment-form .tooltip, .secure-payment-form .tooltip-content": {
	            display: "none",
	        },
	    };
	};

	var buildUrl = (function (queryString) {
	    var gateway = getGateway();
	    if (!gateway) {
	        return "";
	    }
	    var base = gateway.urls.tokenization(gateway.getEnv(options) === "production");
	    if (!queryString) {
	        return base;
	    }
	    var query = "?";
	    for (var param in queryString) {
	        if (queryString.hasOwnProperty(param) && queryString[param]) {
	            query += param + "=" + encodeURIComponent(queryString[param]) + "&";
	        }
	    }
	    return base + query;
	});

	var tokenize = (function (data) {
	    var gateway = getGateway();
	    if (!gateway) {
	        return Promise.reject({
	            error: true,
	            reasons: [
	                { code: "INVALID_CONFIGURATION", message: "no gateway available" },
	            ],
	        });
	    }
	    var errors = gateway.actions.validateData(data);
	    if (errors.length > 0) {
	        return Promise.reject({ error: true, reasons: errors });
	    }
	    if (options.webApiKey) {
	        data.webApiKey = options.webApiKey;
	    }
	    if (gateway.supports.binCheck &&
	        gateway.supports.binCheck.hsaFsa &&
	        options.binCheck &&
	        options.binCheck.hsaFsa) {
	        data["bin-check-hsafsa"] = true;
	    }
	    if (gateway.supports.binCheck &&
	        gateway.supports.binCheck.surcharge &&
	        options.binCheck &&
	        options.binCheck.surcharge) {
	        data["bin-check-surcharge"] = true;
	    }
	    return new Promise(function (resolve, reject) {
	        var query;
	        if (gateway.requiredSettings.indexOf("publicApiKey") !== -1) {
	            query = {
	                api_key: options.publicApiKey,
	            };
	        }
	        gateway.actions
	            .tokenize(buildUrl(query), options.env || "", data)
	            .then(gateway.actions.normalizeResponse)
	            .then(function (resp) {
	            if (resp.error) {
	                reject(resp);
	                return;
	            }
	            resp = resp;
	            if (gateway.requiredSettings.indexOf("X-GP-Api-Key") !== -1) {
	                resolve(resp);
	                return;
	            }
	            if (data["card-number"]) {
	                var cardNumber = data["card-number"].replace(/\D/g, "");
	                var bin = cardNumber.substr(0, 6);
	                var last4 = cardNumber.substr(-4);
	                var type = typeByNumber(cardNumber);
	                resp.details = resp.details || {};
	                resp.details.cardNumber =
	                    bin + "*".repeat(cardNumber.length - 10) + last4;
	                resp.details.cardBin = bin;
	                resp.details.cardLast4 = last4;
	                resp.details.cardType = type ? type.code : "unknown";
	                resp.details.cardSecurityCode = !!data["card-cvv"];
	            }
	            if (data["card-expiration"] &&
	                data["card-expiration"].indexOf(" / ") !== -1) {
	                var exp = data["card-expiration"].split(" / ");
	                resp.details = resp.details || {};
	                resp.details.expiryMonth = exp[0] || "";
	                resp.details.expiryYear = exp[1] || "";
	            }
	            if (data["card-holder-name"]) {
	                resp.details = resp.details || {};
	                // matches PaymentRequest spec naming for cardholder name
	                resp.details.cardholderName =
	                    resp.details.cardholderName || data["card-holder-name"];
	            }
	            if (data["card-track"]) {
	                var cardTrack = data["card-track"];
	                var type = typeByTrack(cardTrack);
	                resp.details = resp.details || {};
	                resp.details.cardType = type ? type.code : "unknown";
	            }
	            if (data["account-number"]) {
	                var accountNumber = data["account-number"].replace(/\D/g, "");
	                var last4 = accountNumber.substr(-4);
	                resp.details = resp.details || {};
	                resp.details.accountNumber =
	                    "*".repeat(accountNumber.length - 4) + last4;
	                resp.details.accountLast4 = last4;
	            }
	            resolve(resp);
	        })["catch"](reject);
	    });
	});

	var bus = new lib.EventEmitter();

	var internal = /*#__PURE__*/Object.freeze({
		__proto__: null,
		bus: bus,
		tokenize: tokenize,
		loadedFrames: loadedFrames,
		options: options,
		postMessage: postMessage
	});

	var CardNumber = /** @class */ (function () {
	    function CardNumber() {
	    }
	    CardNumber.prototype.format = function (cardNumber) {
	        cardNumber = cardNumber.replace(/\D/g, "");
	        var type = typeByNumber(cardNumber);
	        if (!type) {
	            return cardNumber;
	        }
	        var matches = cardNumber.match(type.format);
	        if (!matches) {
	            return cardNumber;
	        }
	        if (!type.format.global) {
	            matches.shift();
	        }
	        return matches.join(" ").replace(/^\s+|\s+$/gm, "");
	    };
	    return CardNumber;
	}());

	var Expiration = /** @class */ (function () {
	    function Expiration() {
	    }
	    Expiration.prototype.format = function (exp, final) {
	        if (final === void 0) { final = false; }
	        var pat = /^\D*(\d{1,2})(\D+)?(\d{1,4})?/;
	        var groups = exp.match(pat);
	        var month;
	        var del;
	        var year;
	        if (!groups) {
	            return "";
	        }
	        month = groups[1] || "";
	        del = groups[2] || "";
	        year = groups[3] || "";
	        if (year.length > 0) {
	            del = " / ";
	        }
	        else if (month.length === 2 || del.length > 0) {
	            del = " / ";
	        }
	        else if (month.length === 1 && (month !== "0" && month !== "1")) {
	            del = " / ";
	        }
	        if (month.length === 1 && del !== "") {
	            month = "0" + month;
	        }
	        if (final && year.length === 2) {
	            year =
	                new Date()
	                    .getFullYear()
	                    .toString()
	                    .slice(0, 2) + year;
	        }
	        return month + del + year;
	    };
	    return Expiration;
	}());

	var CardNumber$1 = /** @class */ (function () {
	    function CardNumber() {
	    }
	    CardNumber.prototype.validate = function (cardNumber) {
	        if (!cardNumber) {
	            return false;
	        }
	        cardNumber = cardNumber.replace(/[-\s]/g, "");
	        var type = typeByNumber(cardNumber);
	        if (!type) {
	            return false;
	        }
	        return luhnCheck(cardNumber) && type.lengths.indexOf(cardNumber.length) !== -1;
	    };
	    return CardNumber;
	}());

	var Cvv = /** @class */ (function () {
	    function Cvv() {
	    }
	    Cvv.prototype.validate = function (cvv, isAmex) {
	        if (!cvv) {
	            return false;
	        }
	        cvv = cvv.replace(/^\s+|\s+$/g, "");
	        if (!/^\d+$/.test(cvv)) {
	            return false;
	        }
	        if (typeof isAmex !== "undefined" && isAmex === true) {
	            return cvv.length === 4;
	        }
	        if (typeof isAmex !== "undefined" && isAmex === false) {
	            return cvv.length === 3;
	        }
	        return 3 <= cvv.length && cvv.length <= 4;
	    };
	    return Cvv;
	}());

	var Expiration$1 = /** @class */ (function () {
	    function Expiration() {
	    }
	    Expiration.prototype.validate = function (exp) {
	        var m;
	        var y;
	        if (!exp) {
	            return false;
	        }
	        var split = exp.split("/");
	        m = split[0], y = split[1];
	        if (!m || !y) {
	            return false;
	        }
	        m = m.replace(/^\s+|\s+$/g, "");
	        y = y.replace(/^\s+|\s+$/g, "");
	        if (!/^\d+$/.test(m)) {
	            return false;
	        }
	        if (!/^\d+$/.test(y)) {
	            return false;
	        }
	        if (y.length === 2) {
	            y =
	                new Date()
	                    .getFullYear()
	                    .toString()
	                    .slice(0, 2) + y;
	        }
	        var month = parseInt(m, 10);
	        var year = parseInt(y, 10);
	        if (!(1 <= month && month <= 12)) {
	            return false;
	        }
	        // creates date as 1 day past end of
	        // expiration month since JS months
	        // are 0 indexed
	        return new Date(year, month, 1) > new Date();
	    };
	    return Expiration;
	}());

	var Ev = /** @class */ (function () {
	    function Ev() {
	    }
	    Ev.listen = function (node, eventName, callback) {
	        if (document.addEventListener !== undefined) {
	            node.addEventListener(eventName, callback, false);
	        }
	        else {
	            if (node === document) {
	                document.documentElement.attachEvent("onpropertychange", function (e) {
	                    if (e.propertyName === eventName) {
	                        callback(e);
	                    }
	                });
	            }
	            else {
	                node.attachEvent("on" + eventName, callback);
	            }
	        }
	    };
	    Ev.trigger = function (node, eventName) {
	        if (document.createEvent !== undefined) {
	            var event_1 = document.createEvent("Event");
	            event_1.initEvent(eventName, true, true);
	            node.dispatchEvent(event_1);
	        }
	        else {
	            document.documentElement[eventName]++;
	        }
	    };
	    Ev.ignore = function (eventName, callback) {
	        if (document.removeEventListener !== undefined) {
	            document.removeEventListener(eventName, callback, false);
	        }
	        else {
	            document.documentElement.detachEvent("onpropertychange", function (e) {
	                if (e.propertyName === eventName) {
	                    callback(e);
	                }
	            });
	        }
	    };
	    return Ev;
	}());

	var Events = /** @class */ (function () {
	    function Events() {
	    }
	    /**
	     * addHandler
	     *
	     * Adds an `event` handler for a given `target` element.
	     *
	     * @param target
	     * @param event
	     * @param callback
	     */
	    Events.addHandler = function (target, event, callback) {
	        var node;
	        if (typeof target === "string") {
	            node = document.getElementById(target);
	        }
	        else {
	            node = target;
	        }
	        if (!node) {
	            return;
	        }
	        if (document.addEventListener !== undefined) {
	            node.addEventListener(event, callback, false);
	        }
	        else {
	            Ev.listen(node, event, callback);
	        }
	    };
	    /**
	     * removeHandler
	     *
	     * Removes an `event` handler for a given `target` element.
	     *
	     * @param target
	     * @param event
	     * @param callback
	     */
	    Events.removeHandler = function (target, event, callback) {
	        var node;
	        if (typeof target === "string") {
	            node = document.getElementById(target);
	        }
	        else {
	            node = target;
	        }
	        if (!node) {
	            return;
	        }
	        if (document.removeEventListener !== undefined) {
	            node.removeEventListener(event, callback, false);
	        }
	        else {
	            Ev.ignore(event, callback);
	        }
	    };
	    /**
	     * trigger
	     *
	     * Fires off an `event` for a given `target` element.
	     *
	     * @param name
	     * @param target
	     */
	    Events.trigger = function (name, target) {
	        if (document.createEvent) {
	            var event_1 = document.createEvent("Event");
	            event_1.initEvent(name, true, true);
	            target.dispatchEvent(event_1);
	        }
	        else {
	            Ev.trigger(target, name);
	        }
	    };
	    return Events;
	}());

	var Card = /** @class */ (function () {
	    function Card() {
	    }
	    /**
	     * addType
	     *
	     * Adds a class to the target element with the card type
	     * inferred from the target"s current value.
	     *
	     * @param e
	     */
	    Card.addType = function (e) {
	        var target = (e.currentTarget
	            ? e.currentTarget
	            : e.srcElement);
	        var type = typeByNumber(target.value);
	        var classList = target.className.split(" ");
	        var length = classList.length;
	        var i = 0;
	        var c = "";
	        for (i; i < length; i++) {
	            c = classList[i];
	            if (c && c.indexOf("card-type-") !== -1) {
	                delete classList[i];
	            }
	        }
	        if (type) {
	            classList.push("card-type-" + type.code);
	            var id = target.getAttribute("data-id");
	            if (id) {
	                postMessage.post({
	                    data: { cardType: type.code },
	                    id: id,
	                    type: "ui:iframe-field:card-type",
	                }, "parent");
	            }
	        }
	        target.className = classList.join(" ").replace(/^\s+|\s+$/gm, "");
	    };
	    /**
	     * formatNumber
	     *
	     * Formats a target element"s value based on the
	     * inferred card type"s formatting regex.
	     *
	     * @param e
	     */
	    Card.formatNumber = function (e) {
	        var target = (e.currentTarget
	            ? e.currentTarget
	            : e.srcElement);
	        var value = target.value;
	        if (value.length === 0) {
	            return;
	        }
	        var formatted = new CardNumber().format(value);
	        target.value = formatted;
	        if (!target.setSelectionRange) {
	            return;
	        }
	        var cursor = target.selectionStart || 0;
	        // copy and paste, space inserted on formatter
	        if (value.length < formatted.length) {
	            cursor += formatted.length - value.length;
	        }
	        // check if before new inserted digit is a space
	        if (value.charAt(cursor) === " " && formatted.charAt(cursor - 1) === " ") {
	            cursor += 1;
	        }
	        target.setSelectionRange(cursor, cursor);
	    };
	    /**
	     * formatExpiration
	     *
	     * Formats a target element"s value.
	     *
	     * @param e
	     */
	    Card.formatExpiration = function (e) {
	        var target = (e.currentTarget
	            ? e.currentTarget
	            : e.srcElement);
	        var value = target.value;
	        // allow: delete, backspace
	        if ([46, 8].indexOf(e.keyCode) !== -1 ||
	            // allow: home, end, left, right
	            (e.keyCode >= 35 && e.keyCode <= 39)) {
	            return;
	        }
	        target.value = new Expiration().format(value, e.type === "blur");
	    };
	    /**
	     * restrictLength
	     *
	     * Restricts input in a target element to a
	     * certain length data.
	     *
	     * @param length
	     */
	    Card.restrictLength = function (length) {
	        return function (e) {
	            var target = (e.currentTarget
	                ? e.currentTarget
	                : e.srcElement);
	            var value = target.value;
	            // allow: backspace, delete, tab, escape and enter
	            if ([46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !== -1 ||
	                // allow: Ctrl+A
	                (e.keyCode === 65 && e.ctrlKey === true) ||
	                // allow: home, end, left, right
	                (e.keyCode >= 35 && e.keyCode <= 39)) {
	                // let it happen, don"t do anything
	                return;
	            }
	            if (value.length >= length) {
	                e.preventDefault ? e.preventDefault() : (e.returnValue = false);
	            }
	        };
	    };
	    /**
	     * restrictCardNumberLength
	     *
	     * Restricts input in a target element to a
	     * certain length data.
	     *
	     * @param length
	     */
	    Card.restrictCardNumberLength = function (e) {
	        var target = (e.currentTarget
	            ? e.currentTarget
	            : e.srcElement);
	        var value = target.value;
	        var cardType = typeByNumber(value);
	        // allow: backspace, delete, tab, escape and enter
	        if ([46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !== -1 ||
	            // allow: Ctrl+A
	            (e.keyCode === 65 && e.ctrlKey === true) ||
	            // allow: home, end, left, right
	            (e.keyCode >= 35 && e.keyCode <= 39)) {
	            // let it happen, don"t do anything
	            return;
	        }
	        var maxValue = function (max, curr) { return Math.max(max, curr); };
	        if (value.replace(/\D/g, "").length >= (cardType ? cardType.lengths.reduce(maxValue) : 19)) {
	            e.preventDefault ? e.preventDefault() : (e.returnValue = false);
	        }
	    };
	    /**
	     * restrictNumeric
	     *
	     * Restricts input in a target element to only
	     * numeric data.
	     *
	     * @param e
	     */
	    Card.restrictNumeric = function (e) {
	        // allow: backspace, delete, tab, escape and enter
	        if ([46, 8, 9, 27, 13, 110].indexOf(e.keyCode) !== -1 ||
	            // allow: Ctrl+A
	            (e.keyCode === 65 && e.ctrlKey === true) ||
	            // allow: home, end, left, right
	            (e.keyCode >= 35 && e.keyCode <= 39) ||
	            // allow: weird Android/Chrome issue
	            e.keyCode === 229) {
	            // let it happen, don"t do anything
	            return;
	        }
	        // ensure that it is a number and stop the keypress
	        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
	            (e.keyCode < 96 || e.keyCode > 105)) {
	            e.preventDefault ? e.preventDefault() : (e.returnValue = false);
	        }
	    };
	    /**
	     * deleteProperly
	     *
	     * Places cursor on the correct position to
	     * let the browser delete the digit instead
	     * of the space.
	     *
	     * @param e
	     */
	    Card.deleteProperly = function (e) {
	        var target = (e.currentTarget
	            ? e.currentTarget
	            : e.srcElement);
	        var value = target.value;
	        if (!target.setSelectionRange) {
	            return;
	        }
	        var cursor = target.selectionStart || 0;
	        // allow: delete, backspace
	        if ([46, 8].indexOf(e.keyCode) !== -1 &&
	            // if space to be deleted
	            value.charAt(cursor - 1) === " ") {
	            // placing cursor before space to delete digit instead
	            target.setSelectionRange(cursor - 1, cursor - 1);
	        }
	    };
	    /**
	     * validateNumber
	     *
	     * Validates a target element"s value based on the
	     * inferred card type"s validation regex. Adds a
	     * class to the target element to note `valid` or
	     * `invalid`.
	     *
	     * @param e
	     */
	    Card.validateNumber = function (e) {
	        var target = (e.currentTarget
	            ? e.currentTarget
	            : e.srcElement);
	        var value = target.value.replace(/[-\s]/g, "");
	        var cardType = typeByNumber(value);
	        var classList = target.className.split(" ");
	        var length = classList.length;
	        var c = "";
	        for (var i = 0; i < length; i++) {
	            c = classList[i];
	            if (c.indexOf("valid") !== -1) {
	                delete classList[i];
	            }
	        }
	        if (new CardNumber$1().validate(value)) {
	            classList.push("valid");
	            var id = target.getAttribute("data-id");
	            if (id) {
	                postMessage.post({
	                    data: { valid: true },
	                    id: id,
	                    type: "ui:iframe-field:card-number-test",
	                }, "parent");
	            }
	        }
	        else {
	            var maxValue = function (max, curr) { return Math.max(max, curr); };
	            if (cardType && value.length < cardType.lengths.reduce(maxValue)) {
	                classList.push("possibly-valid");
	            }
	            classList.push("invalid");
	            var id = target.getAttribute("data-id");
	            if (id) {
	                postMessage.post({
	                    data: { valid: false },
	                    id: id,
	                    type: "ui:iframe-field:card-number-test",
	                }, "parent");
	            }
	        }
	        target.className = classList.join(" ").replace(/^\s+|\s+$/gm, "");
	    };
	    /**
	     * validateCvv
	     *
	     * Validates a target element"s value based on the
	     * possible CVV lengths. Adds a class to the target
	     * element to note `valid` or `invalid`.
	     *
	     * @param e
	     */
	    Card.validateCvv = function (e) {
	        var target = (e.currentTarget
	            ? e.currentTarget
	            : e.srcElement);
	        var value = target.value;
	        var classList = target.className.split(" ");
	        var length = classList.length;
	        var c = "";
	        var cardType = "unknown";
	        for (var i = 0; i < length; i++) {
	            c = classList[i];
	            if (c.indexOf("valid") !== -1) {
	                delete classList[i];
	            }
	            if (c.indexOf("card-type-") !== -1) {
	                cardType = c.replace("card-type-", "");
	            }
	        }
	        var isAmex = cardType === "amex";
	        var maxLength = isAmex ? 4 : 3;
	        if (value.length < maxLength) {
	            classList.push("possibly-valid");
	        }
	        if (new Cvv().validate(value, cardType === "unknown" ? undefined : isAmex)) {
	            classList.push("valid");
	            var id = target.getAttribute("data-id");
	            if (id) {
	                postMessage.post({
	                    data: { valid: true },
	                    id: id,
	                    type: "ui:iframe-field:card-cvv-test",
	                }, "parent");
	            }
	        }
	        else {
	            classList.push("invalid");
	            var id = target.getAttribute("data-id");
	            if (id) {
	                postMessage.post({
	                    data: { valid: false },
	                    id: id,
	                    type: "ui:iframe-field:card-cvv-test",
	                }, "parent");
	            }
	        }
	        target.className = classList.join(" ").replace(/^\s+|\s+$/gm, "");
	    };
	    /**
	     * validateExpiration
	     *
	     * Validates a target element"s value based on the
	     * current date. Adds a class to the target element
	     * to note `valid` or `invalid`.
	     *
	     * @param e
	     */
	    Card.validateExpiration = function (e) {
	        var target = (e.currentTarget
	            ? e.currentTarget
	            : e.srcElement);
	        var value = target.value;
	        var classList = target.className.split(" ");
	        var length = classList.length;
	        var c = "";
	        for (var i = 0; i < length; i++) {
	            c = classList[i];
	            if (c.indexOf("valid") !== -1) {
	                delete classList[i];
	            }
	        }
	        var _a = value.split(" / "), month = _a[0], year = _a[1];
	        if (!month || !year || month.length < 2 || year.length < 4) {
	            classList.push("possibly-valid");
	        }
	        if (new Expiration$1().validate(value)) {
	            classList.push("valid");
	            var id = target.getAttribute("data-id");
	            if (id) {
	                postMessage.post({
	                    data: { valid: true },
	                    id: id,
	                    type: "ui:iframe-field:card-expiration-test",
	                }, "parent");
	            }
	        }
	        else {
	            classList.push("invalid");
	            var id = target.getAttribute("data-id");
	            if (id) {
	                postMessage.post({
	                    data: { valid: false },
	                    id: id,
	                    type: "ui:iframe-field:card-expiration-test",
	                }, "parent");
	            }
	        }
	        target.className = classList.join(" ").replace(/^\s+|\s+$/gm, "");
	    };
	    /**
	     * attachNumberEvents
	     *
	     * @param selector
	     */
	    Card.attachNumberEvents = function (selector) {
	        var el = document.querySelector(selector);
	        if (!el) {
	            return;
	        }
	        Events.addHandler(el, "keydown", Card.restrictNumeric);
	        Events.addHandler(el, "keydown", Card.restrictCardNumberLength);
	        Events.addHandler(el, "keydown", Card.deleteProperly);
	        Events.addHandler(el, "keyup", Card.formatNumber);
	        Events.addHandler(el, "input", Card.formatNumber);
	        Events.addHandler(el, "input", Card.validateNumber);
	        Events.addHandler(el, "input", Card.addType);
	    };
	    /**
	     * attachExpirationEvents
	     *
	     * @param selector
	     */
	    Card.attachExpirationEvents = function (selector) {
	        var el = document.querySelector(selector);
	        if (!el) {
	            return;
	        }
	        Events.addHandler(el, "keydown", Card.restrictNumeric);
	        Events.addHandler(el, "keydown", Card.restrictLength(9));
	        Events.addHandler(el, "keyup", Card.formatExpiration);
	        Events.addHandler(el, "blur", Card.formatExpiration);
	        Events.addHandler(el, "input", Card.validateExpiration);
	        Events.addHandler(el, "blur", Card.validateExpiration);
	    };
	    /**
	     * attachCvvEvents
	     *
	     * @param selector
	     */
	    Card.attachCvvEvents = function (selector) {
	        var el = document.querySelector(selector);
	        if (!el) {
	            return;
	        }
	        Events.addHandler(el, "keydown", Card.restrictNumeric);
	        Events.addHandler(el, "keydown", Card.restrictLength(4));
	        Events.addHandler(el, "input", Card.validateCvv);
	    };
	    return Card;
	}());
	if (!Array.prototype.indexOf) {
	    Array.prototype.indexOf = function (obj, start) {
	        for (var i = start || 0, j = this.length; i < j; i++) {
	            if (this[i] === obj) {
	                return i;
	            }
	        }
	        return -1;
	    };
	}

	var actionAccumulateDataAndTokenize = (function (id, type, data) {
	    if (type !== "card-number" && type !== "account-number") {
	        return;
	    }
	    var w = window;
	    w.dataContents = w.dataContents || {};
	    w.dataContents[data.data.type] = data.data.value;
	    if (!w.dataReceivedFields) {
	        w.dataReceivedFields = ["submit"];
	    }
	    w.dataReceivedFields.push(data.data.type);
	    if (JSON.stringify(w.dataFields.sort()) ===
	        JSON.stringify(w.dataReceivedFields.sort())) {
	        var field = document.getElementById(paymentFieldId);
	        var value = field && field.value ? field.value : "";
	        tokenize({
	            "account-number": window.name === "account-number" && value,
	            "card-cvv": w.dataContents["card-cvv"] !== undefined && w.dataContents["card-cvv"],
	            "card-expiration": w.dataContents["card-expiration"] !== undefined &&
	                w.dataContents["card-expiration"],
	            "card-holder-name": w.dataContents["card-holder-name"] !== undefined &&
	                w.dataContents["card-holder-name"],
	            "card-number": window.name === "card-number" && value,
	            "routing-number": w.dataContents["routing-number"] !== undefined &&
	                w.dataContents["routing-number"],
	        })
	            .then(function (response) {
	            w.dataContents = undefined;
	            w.dataReceivedFields = undefined;
	            postMessage.post({
	                data: response,
	                id: id,
	                type: "ui:iframe-field:token-success",
	            }, "parent");
	        })["catch"](function (response) {
	            w.dataContents = undefined;
	            w.dataReceivedFields = undefined;
	            postMessage.post({
	                data: response,
	                id: id,
	                type: "ui:iframe-field:token-error",
	            }, "parent");
	        });
	    }
	});

	var actionCardTrackButtonClick = (function (id) {
	    var el = document.getElementById(paymentFieldId + "-data");
	    if (el && el.parentNode) {
	        el.parentNode.removeChild(el);
	    }
	    el = document.createElement("input");
	    el.id = paymentFieldId + "-data";
	    el.type = "text";
	    var container = document.querySelector(".extra-div-2");
	    if (!container) {
	        throw new Error("TODO");
	    }
	    container.style.height = "0px";
	    container.style.width = "0px";
	    container.style.overflow = "hidden";
	    container.appendChild(el);
	    var button = document.getElementById(paymentFieldId);
	    var originalButtonText = button && button.innerText ? button.innerText : "Read Card";
	    if (button && button.firstChild) {
	        button.replaceChild(document.createTextNode("Waiting..."), button.firstChild);
	    }
	    el.focus();
	    postMessage.post({
	        id: id,
	        type: "ui:iframe-field:waiting-for-data",
	    }, "parent");
	    Events.addHandler(el, "keydown", function (e) {
	        if (e.keyCode !== 13) {
	            return;
	        }
	        postMessage.post({
	            id: id,
	            type: "ui:iframe-field:data-received",
	        }, "parent");
	        e.preventDefault();
	        var field = document.getElementById(paymentFieldId + "-data");
	        var value = field && field.value ? field.value : "";
	        tokenize({
	            "card-track": value,
	        })
	            .then(function (response) {
	            if (button && button.firstChild) {
	                button.replaceChild(document.createTextNode(originalButtonText), button.firstChild);
	            }
	            field.blur();
	            postMessage.post({
	                data: response,
	                id: id,
	                type: "ui:iframe-field:token-success",
	            }, "parent");
	        })["catch"](function (response) {
	            if (button && button.firstChild) {
	                button.replaceChild(document.createTextNode(originalButtonText), button.firstChild);
	            }
	            field.blur();
	            postMessage.post({
	                data: response,
	                id: id,
	                type: "ui:iframe-field:token-error",
	            }, "parent");
	        });
	    });
	});

	var actionGetCvv = (function (id, type) {
	    var el = document.getElementById(paymentFieldId);
	    if (!el) {
	        return;
	    }
	    if (type !== "card-cvv") {
	        return;
	    }
	    if (!el.value) {
	        return;
	    }
	    var isTransit = options.deviceId && options.manifest;
	    var isBillPay = options.merchantName;
	    postMessage.post({
	        data: isTransit || isBillPay ? el.value : null,
	        id: id,
	        type: "ui:iframe-field:get-cvv",
	    }, "parent");
	});

	var actionPaymentRequestComplete = (function (id, data) { return __awaiter(void 0, void 0, void 0, function () {
	    return __generator(this, function (_a) {
	        if (!window.globalPaymentResponse) {
	            postMessage.post({
	                data: {
	                    code: "ERROR",
	                    message: "Missing PaymentResponse object",
	                },
	                id: id,
	                type: "ui:iframe-field:error",
	            }, "parent");
	            return [2 /*return*/];
	        }
	        window.globalPaymentResponse
	            .complete(data.data.status)
	            .then(function () {
	            postMessage.post({
	                id: id,
	                type: "ui:iframe-field:payment-request-completed",
	            }, "parent");
	        })["catch"](function (e) {
	            postMessage.post({
	                data: {
	                    code: "ERROR",
	                    message: e.message,
	                },
	                id: id,
	                type: "ui:iframe-field:error",
	            }, "parent");
	        });
	        return [2 /*return*/];
	    });
	}); });

	var actionPaymentRequestStart = (function (id, data) { return __awaiter(void 0, void 0, void 0, function () {
	    var response, request, e_1, code, token, d, cardNumber, bin, last4, type, e_2;
	    return __generator(this, function (_a) {
	        switch (_a.label) {
	            case 0:
	                _a.trys.push([0, 2, , 3]);
	                request = new PaymentRequest(data.data.instruments, data.data.details, data.data.options);
	                return [4 /*yield*/, request.show()];
	            case 1:
	                response = _a.sent();
	                window.globalPaymentResponse = response;
	                return [3 /*break*/, 3];
	            case 2:
	                e_1 = _a.sent();
	                code = "ERROR";
	                if (e_1.name !== "Error") {
	                    code = e_1.name.replace("Error", "_Error").toUpperCase();
	                }
	                postMessage.post({
	                    data: {
	                        code: code,
	                        message: e_1.message,
	                    },
	                    id: id,
	                    type: "ui:iframe-field:token-error",
	                }, "parent");
	                return [2 /*return*/];
	            case 3:
	                _a.trys.push([3, 5, , 6]);
	                return [4 /*yield*/, tokenize({
	                        "card-cvv": response.details.cardSecurityCode || "",
	                        "card-expiration": (response.details.expiryMonth || "") +
	                            " / " +
	                            (response.details.expiryYear || ""),
	                        "card-holder-name": response.details.cardholderName || "",
	                        "card-number": response.details.cardNumber || "",
	                    })];
	            case 4:
	                token = _a.sent();
	                d = response.toJSON();
	                cardNumber = response.details.cardNumber.replace(/\D/g, "");
	                bin = cardNumber.substr(0, 6);
	                last4 = cardNumber.substr(-4);
	                type = typeByNumber(cardNumber);
	                d.details = d.details || {};
	                d.details.cardNumber = bin + "*".repeat(cardNumber.length - 10) + last4;
	                d.details.cardBin = bin;
	                d.details.cardLast4 = last4;
	                d.details.cardType = type ? type.code : "unknown";
	                d.details.cardSecurityCode = !!response.details.cardSecurityCode;
	                token.details = d.details;
	                token.methodName = d.methodName;
	                token.payerEmail = d.payerEmail;
	                token.payerName = d.payerName;
	                token.payerPhone = d.payerPhone;
	                token.requestId = d.requestId;
	                token.shippingAddress = d.shippingAddress;
	                token.shippingOption = d.shippingOption;
	                postMessage.post({
	                    data: token,
	                    id: id,
	                    type: "ui:iframe-field:token-success",
	                }, "parent");
	                return [3 /*break*/, 6];
	            case 5:
	                e_2 = _a.sent();
	                response.complete("fail");
	                postMessage.post({
	                    data: e_2,
	                    id: id,
	                    type: "ui:iframe-field:token-error",
	                }, "parent");
	                return [3 /*break*/, 6];
	            case 6: return [2 /*return*/];
	        }
	    });
	}); });

	var actionRequestData = (function (id, type, data) {
	    if (!window.dataReceivedFields) {
	        window.dataReceivedFields = ["submit"];
	    }
	    var field = document.getElementById(paymentFieldId);
	    var value = field && field.value ? field.value : "";
	    if (type === "card-number" || type === "account-number") {
	        // ignore to prevent these fields from leaking their data
	        // but store expected list of fields
	        window.dataFields = data.data.fields;
	        value = "";
	    }
	    postMessage.post({
	        data: {
	            target: data.data.target,
	            type: type,
	            value: value,
	        },
	        id: id,
	        type: "ui:iframe-field:pass-data",
	    }, "parent");
	});

	var actionSetCardType = (function (cardType) {
	    var el = document.getElementById(paymentFieldId);
	    if (!el) {
	        return;
	    }
	    var classList = el.className.split(" ");
	    var length = classList.length;
	    var i = 0;
	    var c = "";
	    for (i; i < length; i++) {
	        c = classList[i];
	        if (c && c.indexOf("card-type-") !== -1) {
	            delete classList[i];
	        }
	    }
	    if (cardType) {
	        classList.push("card-type-" + cardType);
	    }
	    el.className = classList.join(" ");
	});

	var actionSetFocus = (function () {
	    var el = document.getElementById(paymentFieldId);
	    if (!el) {
	        return;
	    }
	    el.focus();
	});

	/**
	 * Escapes all potentially dangerous characters, so that the
	 * resulting string can be safely inserted into attribute or
	 * element text.
	 *
	 * @param value
	 * @returns escaped text
	 */
	function encodeEntities(value) {
	    return value
	        .replace(/&/g, "&amp;")
	        .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function (v) {
	        var hi = v.charCodeAt(0);
	        var low = v.charCodeAt(1);
	        return "&#" + ((hi - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000) + ";";
	    })
	        .replace(/([^\#-~| |!])/g, function (v) {
	        return "&#" + v.charCodeAt(0) + ";";
	    })
	        .replace(/</g, "&lt;")
	        .replace(/>/g, "&gt;");
	}

	var actionSetLabel = (function (text) {
	    var el = document.getElementById(paymentFieldId);
	    if (!el) {
	        return;
	    }
	    el.setAttribute("aria-label", encodeEntities(text));
	    document.querySelectorAll("main")
	        .forEach(function (e) { return e.setAttribute("aria-label", encodeEntities(text)); });
	    document.querySelectorAll("#" + paymentFieldId + "-label")
	        .forEach(function (e) { return e.textContent = encodeEntities(text); });
	});

	var actionSetPlaceholder = (function (placeholder) {
	    var el = document.getElementById(paymentFieldId);
	    if (!el) {
	        return;
	    }
	    if (placeholder === "•••• •••• •••• ••••" ||
	        placeholder === "•••••••••" ||
	        placeholder === "••••" ||
	        placeholder === "•••" ||
	        placeholder === "···· ···· ···· ····") {
	        el.setAttribute("placeholder", placeholder);
	    }
	    else {
	        el.setAttribute("placeholder", encodeEntities(placeholder));
	    }
	});

	var actionSetText = (function (text) {
	    var el = document.getElementById(paymentFieldId);
	    if (!el) {
	        return;
	    }
	    el.textContent = encodeEntities(text);
	});

	var actionSetValue = (function (text) {
	    var el = document.getElementById(paymentFieldId);
	    if (!el) {
	        return;
	    }
	    el.setAttribute("value", encodeEntities(text));
	    Events.trigger("keyup", el);
	    Events.trigger("input", el);
	});

	var fieldTypeAutocompleteMap = {
	    "card-cvv": "cc-csc",
	    "card-expiration": "cc-exp",
	    "card-number": "cc-number",
	};
	var IframeField = /** @class */ (function (_super) {
	    __extends(IframeField, _super);
	    function IframeField(type, opts, src) {
	        var _this = _super.call(this) || this;
	        var selector = opts.target || "";
	        _this.id = btoa(lib.generateGuid());
	        _this.type = type === "submit" || type === "card-track" ? "button" : "input";
	        _this.url = src;
	        _this.frame = _this.makeFrame(type, _this.id, opts);
	        _this.frame.onload = function () {
	            _this.emit("load");
	        };
	        _this.frame.src =
	            src +
	                "#" +
	                btoa(JSON.stringify({
	                    enableAutocomplete: options.enableAutocomplete,
	                    id: _this.id,
	                    lang: options.language || "en",
	                    targetOrigin: window.location.href,
	                    type: _this.type,
	                }));
	        _this.container = document.querySelector(selector);
	        if (!_this.container) {
	            bus.emit("error", {
	                error: true,
	                reasons: [
	                    {
	                        code: "ERROR",
	                        message: "IframeField: target cannot be found with given selector",
	                    },
	                ],
	            });
	            return _this;
	        }
	        _this.container.prepend(_this.frame);
	        _this.on("dispose", function () {
	            loadedFrames[_this.id] = undefined;
	            if (_this.container) {
	                _this.container.removeChild(_this.frame);
	            }
	        });
	        postMessage.receive(function (data) {
	            if (!data.id || (data.id && data.id !== _this.id)) {
	                return;
	            }
	            var event = data.type.replace("ui:iframe-field:", "");
	            switch (event) {
	                case "register":
	                    postMessage.post({
	                        data: options,
	                        id: _this.id,
	                        type: "ui:iframe-field:update-options",
	                    }, _this.id);
	                    break;
	                case "resize":
	                    _this.frame.style.height = data.data.height + "px";
	                    break;
	                case "pass-data":
	                    postMessage.post({
	                        data: {
	                            type: data.data.type,
	                            value: data.data.value,
	                        },
	                        id: data.data.target,
	                        type: "ui:iframe-field:accumulate-data",
	                    }, data.data.target);
	                    break;
	            }
	            _this.emit(event, data.data);
	        });
	        loadedFrames[_this.id] = _this;
	        return _this;
	    }
	    IframeField.register = function (type) {
	        var query = window.location.hash.replace("#", "");
	        var data = JSON.parse(atob(query));
	        var id = data.id;
	        var enableAutocomplete = data.enableAutocomplete || false;
	        IframeField.setHtmlLang(data.lang);
	        IframeField.createField(id, type, data.type, enableAutocomplete);
	        IframeField.addMessageListener(id, type, data.targetOrigin);
	        postMessage.post({
	            data: { type: type },
	            id: id,
	            type: "ui:iframe-field:register",
	        }, "parent");
	        IframeField.triggerResize(id);
	        // Fix iOS issue with cross-origin iframes
	        Events.addHandler(document.body, "touchstart", function () { });
	    };
	    IframeField.setHtmlLang = function (lang) {
	        var elements = document.querySelectorAll("html");
	        if (!elements) {
	            return;
	        }
	        // tslint:disable-next-line:prefer-for-of
	        for (var i = 0; i < elements.length; i++) {
	            var el = elements[i];
	            el.lang = lang;
	        }
	    };
	    /**
	     * Creates the inner field within the iframe window and sets
	     * any appropriate attributes, properties, and event handlers.
	     * @param id Field ID
	     * @param name Field type
	     * @param type Type of element
	     * @param enableAutocomplete Whether autocomplete should be enabled
	     */
	    IframeField.createField = function (id, name, type, enableAutocomplete) {
	        var input = document.createElement(type === "button" ? "button" : "input");
	        input.setAttribute("type", type === "button" ? "button" : (name === "card-holder-name" ? "text" : "tel"));
	        input.id = paymentFieldId;
	        input.className = name;
	        input.setAttribute("data-id", id);
	        if (enableAutocomplete === true && fieldTypeAutocompleteMap[name]) {
	            input.setAttribute("autocomplete", fieldTypeAutocompleteMap[name]);
	        }
	        if (name === "card-track") {
	            var message = "Read Card";
	            input.appendChild(document.createTextNode(message));
	        }
	        else if (type === "button") {
	            var message = "Submit";
	            input.appendChild(document.createTextNode(message));
	        }
	        var label = document.createElement("label");
	        label.id = paymentFieldId + "-label";
	        label.setAttribute("for", paymentFieldId);
	        label.className = "offscreen";
	        var dest = document.getElementById(paymentFieldId + "-wrapper");
	        if (!dest) {
	            return;
	        }
	        dest.insertBefore(input, dest.firstChild);
	        dest.insertBefore(label, dest.firstChild);
	        IframeField.addFrameFocusEvent();
	        if (enableAutocomplete === true && name === "card-number") {
	            IframeField.createAutocompleteField(dest, id, "card-cvv", "cardCsc", "cc-csc");
	            IframeField.createAutocompleteField(dest, id, "card-expiration", "cardExpiration", "cc-exp");
	            IframeField.createAutocompleteField(dest, id, "card-holder-name", "cardHolderName", "cc-name");
	        }
	        if (name === "card-track") {
	            Events.addHandler(input, "click", function () {
	                actionCardTrackButtonClick(id);
	            });
	        }
	        else if (type === "button") {
	            Events.addHandler(input, "click", function () {
	                postMessage.post({
	                    id: id,
	                    type: "ui:iframe-field:click",
	                }, "parent");
	            });
	        }
	        switch (name) {
	            case "card-number":
	                Card.attachNumberEvents("#" + input.id);
	                input.name = "cardNumber";
	                break;
	            case "card-expiration":
	                Card.attachExpirationEvents("#" + input.id);
	                break;
	            case "card-cvv":
	                Card.attachCvvEvents("#" + input.id);
	                break;
	        }
	    };
	    /**
	     * Appends a hidden input to the given destination to accept
	     * full autocomplete/auto-fill data from the browser. The
	     * parent window is also notified of data changes to these
	     * fields in order display the new data to the end-user.
	     *
	     * @param destination Parent node for new element
	     * @param id Field ID
	     * @param type Field type
	     * @param name Field name to be used
	     * @param autocomplete Value for field's autocomplete attribute
	     */
	    IframeField.createAutocompleteField = function (destination, id, type, name, autocomplete) {
	        var element = document.createElement("input");
	        element.name = name;
	        element.className = "autocomplete-hidden";
	        element.tabIndex = -1;
	        element.autocomplete = autocomplete;
	        Events.addHandler(element, "input", function () {
	            var value = element && element.value ? element.value : "";
	            // this shouldn't happen, but explicitly ignore to prevent
	            // these fields from leaking their data to the parent
	            if (type === "card-number" || type === "account-number") {
	                value = "";
	            }
	            postMessage.post({
	                data: {
	                    type: type,
	                    value: value,
	                },
	                id: id,
	                type: "ui:iframe-field:set-autocomplete-value",
	            }, "parent");
	        });
	        destination.appendChild(element);
	    };
	    /**
	     * addFrameFocusEvent
	     *
	     * Ensures an iframe's document forwards its received focus
	     * to the input field. Helps provide consistent behavior in
	     * all browsers.
	     */
	    IframeField.addFrameFocusEvent = function () {
	        var element = document.getElementById(paymentFieldId);
	        if (!element) {
	            return;
	        }
	        var focusEventName = "focus";
	        var handler = function (e) {
	            if (e.fromElement === element) {
	                return;
	            }
	            if (e.relatedTarget) {
	                return;
	            }
	            element.focus();
	        };
	        if (document["on" + focusEventName + "in"]) {
	            Events.addHandler(document, focusEventName + "in", handler);
	        }
	        else {
	            Events.addHandler(document, focusEventName, handler);
	        }
	    };
	    /**
	     * Sets the iframe window's postMessage handler in order to
	     * react to parent/sibling events.
	     *
	     * @param id Field ID
	     * @param type Field type
	     * @param targetOrigin Parent window's origin
	     */
	    IframeField.addMessageListener = function (id, type, targetOrigin) {
	        // update the global statge with information about the parent window
	        loadedFrames.parent = {
	            frame: parent,
	            url: targetOrigin,
	        };
	        postMessage.receive(function (data) {
	            if (!data.id || (data.id && data.id !== id)) {
	                return;
	            }
	            var event = data.type.replace("ui:iframe-field:", "");
	            switch (event) {
	                case "accumulate-data":
	                    actionAccumulateDataAndTokenize(id, type, data);
	                    break;
	                case "add-stylesheet":
	                    addStylesheet(data.data.css);
	                    IframeField.triggerResize(id);
	                    break;
	                case "get-cvv":
	                    actionGetCvv(id, type);
	                    break;
	                case "payment-request-complete":
	                    actionPaymentRequestComplete(id, data);
	                    break;
	                case "payment-request-start":
	                    actionPaymentRequestStart(id, data);
	                    break;
	                case "request-data":
	                    actionRequestData(id, type, data);
	                    break;
	                case "set-card-type":
	                    actionSetCardType(data.data.cardType);
	                    break;
	                case "set-focus":
	                    actionSetFocus();
	                    break;
	                case "set-placeholder":
	                    actionSetPlaceholder(data.data.placeholder);
	                    IframeField.triggerResize(id);
	                    break;
	                case "set-text":
	                    actionSetText(data.data.text);
	                    IframeField.triggerResize(id);
	                    break;
	                case "set-value":
	                    actionSetValue(data.data.value);
	                    IframeField.triggerResize(id);
	                    break;
	                case "set-label":
	                    actionSetLabel(data.data.label);
	                    IframeField.triggerResize(id);
	                    break;
	                case "update-options":
	                    for (var prop in data.data) {
	                        if (data.data.hasOwnProperty(prop)) {
	                            options[prop] = data.data[prop];
	                        }
	                    }
	                    break;
	            }
	        });
	    };
	    IframeField.triggerResize = function (id) {
	        postMessage.post({
	            data: {
	                height: document.body.offsetHeight + 1,
	            },
	            id: id,
	            type: "ui:iframe-field:resize",
	        }, "parent");
	    };
	    IframeField.prototype.addStylesheet = function (json) {
	        var css = json2css(json);
	        postMessage.post({
	            data: { css: css },
	            id: this.id,
	            type: "ui:iframe-field:add-stylesheet",
	        }, this.id);
	    };
	    IframeField.prototype.getCvv = function () {
	        var _this = this;
	        postMessage.post({
	            id: this.id,
	            type: "ui:iframe-field:get-cvv",
	        }, this.id);
	        return new Promise(function (resolve) {
	            postMessage.receive(function (data) {
	                if (!data.id || (data.id && data.id !== _this.id)) {
	                    return;
	                }
	                var event = data.type.replace("ui:iframe-field:", "");
	                if (event === "get-cvv") {
	                    resolve(data.data);
	                    return;
	                }
	            });
	        });
	    };
	    IframeField.prototype.setFocus = function () {
	        postMessage.post({
	            id: this.id,
	            type: "ui:iframe-field:set-focus",
	        }, this.id);
	    };
	    IframeField.prototype.setPlaceholder = function (placeholder) {
	        postMessage.post({
	            data: { placeholder: placeholder },
	            id: this.id,
	            type: "ui:iframe-field:set-placeholder",
	        }, this.id);
	    };
	    IframeField.prototype.setText = function (text) {
	        postMessage.post({
	            data: { text: text },
	            id: this.id,
	            type: "ui:iframe-field:set-text",
	        }, this.id);
	    };
	    IframeField.prototype.setValue = function (value) {
	        postMessage.post({
	            data: { value: value },
	            id: this.id,
	            type: "ui:iframe-field:set-value",
	        }, this.id);
	    };
	    IframeField.prototype.setLabel = function (label) {
	        postMessage.post({
	            data: { label: label },
	            id: this.id,
	            type: "ui:iframe-field:set-label",
	        }, this.id);
	    };
	    IframeField.prototype.setTitle = function (title) {
	        this.frame.title = title;
	    };
	    IframeField.prototype.makeFrame = function (type, id, opts) {
	        var frame = document.createElement("iframe");
	        frame.id = "secure-payment-field-" + type + "-" + id;
	        frame.name = type;
	        if (opts.title || opts.label) {
	            frame.title = opts.title || opts.label || "";
	        }
	        frame.style.border = "0";
	        frame.style.height = "50px";
	        frame.frameBorder = "0";
	        frame.scrolling = "no";
	        frame.setAttribute("allowtransparency", "true");
	        frame.allowPaymentRequest = true;
	        return frame;
	    };
	    return IframeField;
	}(lib.EventEmitter));

	var fieldStyles$3 = function () { return ({
	    blank: {},
	    "default": fieldStyles(assetBaseUrl()),
	    "local-gp-default": fieldStyles$1(assetBaseUrl()),
	    simple: fieldStyles$2(assetBaseUrl()),
	}); };
	var parentStyles$3 = function () { return ({
	    blank: {},
	    "default": parentStyles(assetBaseUrl()),
	    "local-gp-default": parentStyles$1(assetBaseUrl()),
	    simple: parentStyles$2(assetBaseUrl()),
	}); };
	var frameFieldTypes = [
	    "card-number",
	    "card-expiration",
	    "card-cvv",
	    "card-holder-name",
	    "card-track",
	    "account-number",
	    "routing-number",
	    "submit",
	];
	var UIForm = /** @class */ (function () {
	    function UIForm(fields, styles) {
	        this.totalNumberOfFields = 0;
	        this.frames = {};
	        this.fields = fields;
	        this.styles = styles;
	        this.createFrames();
	    }
	    UIForm.prototype.on = function (type, event, listener) {
	        if (typeof event === "string" && listener) {
	            checkFieldType(this.frames, type);
	            var field = this.frames[type];
	            if (!field) {
	                return;
	            }
	            field.on(event, listener);
	            return this;
	        }
	        for (var i in frameFieldTypes) {
	            if (!frameFieldTypes.hasOwnProperty(i)) {
	                continue;
	            }
	            var fieldType = frameFieldTypes[i];
	            if (!this.frames.hasOwnProperty(fieldType)) {
	                continue;
	            }
	            checkFieldType(this.frames, fieldType);
	            var field = this.frames[fieldType];
	            if (!field) {
	                return;
	            }
	            field.on(type, event);
	        }
	        return this;
	    };
	    UIForm.prototype.addStylesheet = function (json) {
	        for (var i in frameFieldTypes) {
	            if (!frameFieldTypes.hasOwnProperty(i)) {
	                continue;
	            }
	            var type = frameFieldTypes[i];
	            if (!this.frames.hasOwnProperty(type)) {
	                continue;
	            }
	            checkFieldType(this.frames, type);
	            var field = this.frames[type];
	            if (!field) {
	                return;
	            }
	            field.addStylesheet(json);
	        }
	        return this;
	    };
	    UIForm.prototype.ready = function (fn) {
	        var _this = this;
	        var registered = 0;
	        var ready = false;
	        for (var i in frameFieldTypes) {
	            if (!frameFieldTypes.hasOwnProperty(i)) {
	                continue;
	            }
	            var type = frameFieldTypes[i];
	            if (!this.frames.hasOwnProperty(type)) {
	                continue;
	            }
	            checkFieldType(this.frames, type);
	            var field = this.frames[type];
	            if (!field) {
	                return;
	            }
	            field.on("register", function () {
	                ready = ++registered === _this.totalNumberOfFields;
	                if (ready) {
	                    fn(_this.frames);
	                }
	            });
	        }
	    };
	    UIForm.prototype.dispose = function () {
	        for (var i in frameFieldTypes) {
	            if (!frameFieldTypes.hasOwnProperty(i)) {
	                continue;
	            }
	            var type = frameFieldTypes[i];
	            if (!this.frames.hasOwnProperty(type)) {
	                continue;
	            }
	            var field = this.frames[type];
	            if (!field) {
	                return;
	            }
	            field.emit("dispose");
	        }
	    };
	    UIForm.prototype.createFrames = function () {
	        var _this = this;
	        var _loop_1 = function (type) {
	            if (!this_1.fields[type]) {
	                return "continue";
	            }
	            var field = (this_1.frames[type] = new IframeField(type, this_1.fields[type], assetBaseUrl() + "field.html"));
	            this_1.totalNumberOfFields++;
	            if (field === undefined) {
	                return "continue";
	            }
	            field.on("register", function () {
	                if (_this.fields[type].placeholder) {
	                    field.setPlaceholder(_this.fields[type].placeholder || "");
	                }
	                if (_this.fields[type].text) {
	                    field.setText(_this.fields[type].text || "");
	                }
	                if (_this.fields[type].value) {
	                    field.setValue(_this.fields[type].value || "");
	                }
	                if (_this.fields[type].label) {
	                    field.setLabel(_this.fields[type].label || "");
	                }
	                if (_this.fields[type].title) {
	                    field.setTitle(_this.fields[type].title || "");
	                }
	                if (_this.styles) {
	                    field.addStylesheet(_this.styles);
	                }
	            });
	        };
	        var this_1 = this;
	        for (var _i = 0, frameFieldTypes_1 = frameFieldTypes; _i < frameFieldTypes_1.length; _i++) {
	            var type = frameFieldTypes_1[_i];
	            _loop_1(type);
	        }
	        if (this.frames.submit !== undefined) {
	            this.frames.submit.on("click", function () {
	                var target = _this.frames["card-number"] || _this.frames["account-number"];
	                if (target) {
	                    _this.requestDataFromAll(target);
	                }
	            });
	        }
	        var cardNumber = this.frames["card-number"];
	        var cardCvv = this.frames["card-cvv"];
	        if (cardNumber) {
	            cardNumber.on("set-autocomplete-value", function (data) {
	                if (!data) {
	                    return;
	                }
	                var target = _this.frames[data.type];
	                if (data.type && data.value && target) {
	                    target.setValue(data.value);
	                }
	            });
	        }
	        if (cardNumber && cardCvv) {
	            cardNumber.on("card-type", function (data) {
	                postMessage.post({
	                    data: data,
	                    id: cardCvv.id,
	                    type: "ui:iframe-field:set-card-type",
	                }, cardCvv.id);
	            });
	        }
	    };
	    UIForm.prototype.requestDataFromAll = function (target) {
	        var fields = [];
	        for (var _i = 0, frameFieldTypes_2 = frameFieldTypes; _i < frameFieldTypes_2.length; _i++) {
	            var type = frameFieldTypes_2[_i];
	            if (!this.frames[type]) {
	                continue;
	            }
	            fields.push(type);
	        }
	        for (var _a = 0, fields_1 = fields; _a < fields_1.length; _a++) {
	            var type = fields_1[_a];
	            if (type === "submit") {
	                continue;
	            }
	            var field = this.frames[type];
	            if (!field) {
	                continue;
	            }
	            postMessage.post({
	                data: {
	                    fields: fields,
	                    target: target.id,
	                },
	                id: field.id,
	                type: "ui:iframe-field:request-data",
	            }, field.id);
	        }
	    };
	    return UIForm;
	}());
	function checkFieldType(collection, type) {
	    if (frameFieldTypes.indexOf(type) === -1) {
	        throw new Error("Supplied field type is invalid");
	    }
	    if (!collection[type]) {
	        throw new Error("No field with the type `" + type + "` is currently available");
	    }
	}

	var defaultOptions = {
	    labels: {
	        "card-cvv": "Card CVV",
	        "card-expiration": "Card Expiration",
	        "card-holder-name": "Card Holder Name",
	        "card-number": "Card Number",
	        "submit": "Submit",
	    },
	    placeholders: {
	        "card-cvv": "•••",
	        "card-expiration": "MM / YYYY",
	        "card-holder-name": "Jane Smith",
	        "card-number": "•••• •••• •••• ••••",
	    },
	    prefix: "credit-card-",
	    style: "default",
	    titles: {
	        "card-cvv": "Card CVV Input",
	        "card-expiration": "Card Expiration Input",
	        "card-holder-name": "Card Holder Name Input",
	        "card-number": "Card Number Input",
	        "submit": "Form Submit Button Input",
	    },
	    values: {
	        "card-track": "Read Card",
	        "submit": "Submit",
	    },
	};
	function form(target, formOptions) {
	    if (formOptions === void 0) { formOptions = {}; }
	    if (typeof target === "string") {
	        var el = document.querySelector(target);
	        if (!el) {
	            throw new Error("Credit card form target does not exist");
	        }
	        target = el;
	    }
	    target.className = target.className + " secure-payment-form";
	    var gateway = getGateway();
	    if (gateway && gateway.getEnv(options) !== "production") {
	        addSandboxAlert(target);
	    }
	    formOptions = objectAssign(objectAssign({}, defaultOptions), formOptions);
	    // create field targets
	    var fieldTypes = [
	        "card-number",
	        "card-expiration",
	        "card-cvv",
	        "card-holder-name",
	        "submit",
	    ];
	    var fields = {};
	    for (var i in fieldTypes) {
	        if (!fieldTypes.hasOwnProperty(i)) {
	            continue;
	        }
	        var type = fieldTypes[i];
	        var wrapper = document.createElement("div");
	        wrapper.className = formOptions.prefix + type;
	        target.appendChild(wrapper);
	        if (type !== "submit" && formOptions.labels && formOptions.labels[type]) {
	            var label = document.createElement("label");
	            // label.setAttribute("for", formOptions.prefix + type);
	            label.appendChild(document.createTextNode(formOptions.labels[type]));
	            wrapper.appendChild(label);
	        }
	        var el = document.createElement("div");
	        el.className = formOptions.prefix + type + "-target";
	        wrapper.appendChild(el);
	        if (type === "card-cvv" && formOptions.style && formOptions.style !== "blank") {
	            createToolTip(el);
	        }
	        fields[type] = {};
	        fields[type].target = ".secure-payment-form ." + formOptions.prefix + type + "-target";
	        if (formOptions.placeholders && formOptions.placeholders[type]) {
	            fields[type].placeholder = formOptions.placeholders[type];
	        }
	        if (formOptions.values && formOptions.values[type]) {
	            fields[type].value = formOptions.values[type];
	        }
	        if (formOptions.labels && formOptions.labels[type]) {
	            fields[type].label = formOptions.labels[type];
	        }
	        if (formOptions.titles && formOptions.titles[type]) {
	            fields[type].title = formOptions.titles[type];
	        }
	    }
	    // add any styles for the parent window
	    if (formOptions.style) {
	        addStylesheet(json2css(parentStyles$3()[formOptions.style]), "secure-payment-styles-" + formOptions.style);
	    }
	    var shield = document.createElement("div");
	    shield.className = formOptions.prefix + "shield";
	    target.appendChild(shield);
	    var logo = document.createElement("div");
	    logo.className = formOptions.prefix + "logo";
	    target.appendChild(logo);
	    return new UIForm(fields, formOptions.style ? fieldStyles$3()[formOptions.style] : {});
	}
	function trackReaderForm(target, formOptions) {
	    if (formOptions === void 0) { formOptions = {}; }
	    if (typeof target === "string") {
	        var el = document.querySelector(target);
	        if (!el) {
	            throw new Error("Credit card track reader form target does not exist");
	        }
	        target = el;
	    }
	    target.className = target.className + " secure-payment-form";
	    var gateway = getGateway();
	    if (gateway && gateway.getEnv(options) !== "production") {
	        addSandboxAlert(target);
	    }
	    formOptions = objectAssign(objectAssign({}, defaultOptions), formOptions);
	    formOptions.prefix = "track-reader-";
	    // create field targets
	    var fieldTypes = ["card-track"];
	    var fields = {};
	    for (var i in fieldTypes) {
	        if (!fieldTypes.hasOwnProperty(i)) {
	            continue;
	        }
	        var type = fieldTypes[i];
	        if (formOptions.labels && formOptions.labels[type]) {
	            var label = document.createElement("label");
	            label.setAttribute("for", formOptions.prefix + type);
	            label.appendChild(document.createTextNode(formOptions.labels[type]));
	            target.appendChild(label);
	        }
	        var el = document.createElement("div");
	        el.id = formOptions.prefix + type;
	        target.appendChild(el);
	        fields[type] = {};
	        fields[type].target = "#" + formOptions.prefix + type;
	        if (formOptions.placeholders && formOptions.placeholders[type]) {
	            fields[type].placeholder = formOptions.placeholders[type];
	        }
	        if (formOptions.values && formOptions.values[type]) {
	            fields[type].value = formOptions.values[type];
	        }
	    }
	    // add any styles for the parent window
	    if (formOptions.style) {
	        addStylesheet(json2css(parentStyles$3()[formOptions.style]), "secure-payment-styles-" + formOptions.style);
	    }
	    return new UIForm(fields, formOptions.style ? fieldStyles$3()[formOptions.style] : {});
	}
	function createToolTip(target) {
	    var tooltip = document.createElement("div");
	    tooltip.className = "tooltip";
	    var content = document.createElement("div");
	    content.className = "tooltip-content";
	    var title = document.createElement("strong");
	    title.appendChild(document.createTextNode("Security Code"));
	    content.appendChild(title);
	    content.appendChild(document.createElement("br"));
	    content.appendChild(document.createTextNode("The additional 3 digits on the back of your card. For American Express, it is the additional 4 digits on the front of your card."));
	    target.appendChild(tooltip);
	    target.appendChild(content);
	}

	var creditCard = /*#__PURE__*/Object.freeze({
		__proto__: null,
		defaultOptions: defaultOptions,
		form: form,
		trackReaderForm: trackReaderForm
	});

	var defaultOptions$1 = {
	    labels: {
	        "account-number": "Account Number:",
	        "account-type": "Account Type:",
	        "check-type": "Check Type:",
	        "routing-number": "Routing Number:",
	    },
	    placeholders: {
	        "account-number": "•••••••••",
	        "routing-number": "•••••••••",
	    },
	    prefix: "echeck-",
	    style: "default",
	    values: {
	        submit: "Submit",
	    },
	};
	function form$1(target, formOptions) {
	    if (formOptions === void 0) { formOptions = {}; }
	    if (typeof target === "string") {
	        var el = document.querySelector(target);
	        if (!el) {
	            throw new Error("ACH/eCheck form target does not exist");
	        }
	        target = el;
	    }
	    target.className = target.className + " secure-payment-form";
	    var gateway = getGateway();
	    if (gateway && gateway.getEnv(options) !== "production") {
	        addSandboxAlert(target);
	    }
	    formOptions = objectAssign(objectAssign({}, defaultOptions$1), formOptions);
	    // create field targets
	    var fieldTypes = [
	        "account-number",
	        "routing-number",
	        "account-type",
	        "check-type",
	        "submit",
	    ];
	    var fields = {};
	    for (var i in fieldTypes) {
	        if (!fieldTypes.hasOwnProperty(i)) {
	            continue;
	        }
	        var type = fieldTypes[i];
	        if (formOptions.labels && formOptions.labels[type]) {
	            var label = document.createElement("label");
	            label.setAttribute("for", formOptions.prefix + type);
	            label.appendChild(document.createTextNode(formOptions.labels[type]));
	            target.appendChild(label);
	        }
	        var el = document.createElement("div");
	        el.id = formOptions.prefix + type;
	        target.appendChild(el);
	        if (type === "account-type") {
	            var select = document.createElement("select");
	            select.name = "account-type";
	            var defaultOption = document.createElement("option");
	            defaultOption.appendChild(document.createTextNode("-- Account Type --"));
	            defaultOption.disabled = true;
	            defaultOption.selected = true;
	            select.appendChild(defaultOption);
	            var personalOption = document.createElement("option");
	            personalOption.appendChild(document.createTextNode("Personal"));
	            select.appendChild(personalOption);
	            var businessOption = document.createElement("option");
	            businessOption.appendChild(document.createTextNode("Business"));
	            select.appendChild(businessOption);
	            el.appendChild(select);
	            continue;
	        }
	        if (type === "check-type") {
	            var select = document.createElement("select");
	            select.name = "check-type";
	            var defaultOption = document.createElement("option");
	            defaultOption.appendChild(document.createTextNode("-- Check Type --"));
	            defaultOption.disabled = true;
	            defaultOption.selected = true;
	            select.appendChild(defaultOption);
	            var checkingOption = document.createElement("option");
	            checkingOption.appendChild(document.createTextNode("Checking"));
	            select.appendChild(checkingOption);
	            var savingsOption = document.createElement("option");
	            savingsOption.appendChild(document.createTextNode("Savings"));
	            select.appendChild(savingsOption);
	            el.appendChild(select);
	            continue;
	        }
	        fields[type] = {};
	        fields[type].target = "#" + formOptions.prefix + type;
	        if (formOptions.placeholders && formOptions.placeholders[type]) {
	            fields[type].placeholder = formOptions.placeholders[type];
	        }
	        if (formOptions.values && formOptions.values[type]) {
	            fields[type].value = formOptions.values[type];
	        }
	    }
	    // add any styles for the parent window
	    if (formOptions.style) {
	        addStylesheet(json2css(parentStyles$3()[formOptions.style]));
	    }
	    return new UIForm(fields, formOptions.style ? fieldStyles$3()[formOptions.style] : {});
	}

	var eCheck = /*#__PURE__*/Object.freeze({
		__proto__: null,
		defaultOptions: defaultOptions$1,
		form: form$1
	});

	var defaultOptions$2 = {
	    labels: {
	        "card-number": "Card Number:",
	        // tslint:disable-next-line:object-literal-key-quotes
	        pin: "PIN:",
	    },
	    placeholders: {
	        "card-number": "•••• •••• •••• ••••",
	        // tslint:disable-next-line:object-literal-key-quotes
	        pin: "••••",
	    },
	    prefix: "gift-and-loyalty-",
	    style: "default",
	    values: {
	        submit: "Submit",
	    },
	};
	function form$2(target, formOptions) {
	    if (formOptions === void 0) { formOptions = {}; }
	    if (typeof target === "string") {
	        var el = document.querySelector(target);
	        if (!el) {
	            throw new Error("Gift and loyalty form target does not exist");
	        }
	        target = el;
	    }
	    target.className = target.className + " secure-payment-form";
	    var gateway = getGateway();
	    if (gateway && gateway.getEnv(options) !== "production") {
	        addSandboxAlert(target);
	    }
	    formOptions = objectAssign(objectAssign({}, defaultOptions$2), formOptions);
	    // create field targets
	    var fieldTypes = ["card-number", "pin", "submit"];
	    var fields = {};
	    for (var i in fieldTypes) {
	        if (!fieldTypes.hasOwnProperty(i)) {
	            continue;
	        }
	        var type = fieldTypes[i];
	        if (formOptions.labels && formOptions.labels[type]) {
	            var label = document.createElement("label");
	            label.setAttribute("for", formOptions.prefix + type);
	            label.appendChild(document.createTextNode(formOptions.labels[type]));
	            target.appendChild(label);
	        }
	        var el = document.createElement("div");
	        el.id = formOptions.prefix + type;
	        target.appendChild(el);
	        if (type === "pin") {
	            var input = document.createElement("input");
	            input.name = "pin";
	            input.type = "tel";
	            el.appendChild(input);
	            continue;
	        }
	        fields[type] = {};
	        fields[type].target = "#" + formOptions.prefix + type;
	        if (formOptions.placeholders && formOptions.placeholders[type]) {
	            fields[type].placeholder = formOptions.placeholders[type];
	        }
	        if (formOptions.values && formOptions.values[type]) {
	            fields[type].value = formOptions.values[type];
	        }
	    }
	    // add any styles for the parent window
	    if (formOptions.style) {
	        addStylesheet(json2css(parentStyles$3()[formOptions.style]));
	    }
	    return new UIForm(fields, formOptions.style ? fieldStyles$3()[formOptions.style] : {});
	}

	var giftAndLoyalty = /*#__PURE__*/Object.freeze({
		__proto__: null,
		defaultOptions: defaultOptions$2,
		form: form$2
	});

	var complete = (function (status) {
	    var frames = loadedFrames;
	    for (var frameId in frames) {
	        if (!frames.hasOwnProperty(frameId)) {
	            continue;
	        }
	        postMessage.post({
	            data: { status: status },
	            id: frameId,
	            type: "ui:iframe-field:payment-request-complete",
	        }, frameId);
	    }
	});

	function defaultInstruments() {
	    return [{ supportedMethods: ["basic-card"] }];
	}
	function defaultDetails() {
	    return {};
	}
	function defaultOptions$3() {
	    return {};
	}

	var iframeHolderId = "global-pay-payment-request";
	var PaymentRequestEmitter = /** @class */ (function (_super) {
	    __extends(PaymentRequestEmitter, _super);
	    function PaymentRequestEmitter(iframe) {
	        var _this = _super.call(this) || this;
	        _this.iframe = iframe;
	        return _this;
	    }
	    PaymentRequestEmitter.prototype.on = function (event, listener) {
	        this.iframe.on(event, listener);
	    };
	    return PaymentRequestEmitter;
	}(lib.EventEmitter));
	function setup$1 (selector, details, instruments, options, startOnLoad) {
	    if (startOnLoad === void 0) { startOnLoad = false; }
	    var target = document.querySelector(selector);
	    if (!target) {
	        return bus.emit("error", {
	            error: true,
	            reasons: [
	                { code: "INVALID_CONFIGURATION", message: "Invalid target element" },
	            ],
	        });
	    }
	    if (typeof PaymentRequest === "undefined") {
	        return bus.emit("error", {
	            error: true,
	            reasons: [{ code: "ERROR", message: "PaymentRequest API not available" }],
	        });
	    }
	    var holder = document.createElement("div");
	    holder.id = iframeHolderId;
	    holder.style.display = "none";
	    var parent = target.parentElement;
	    if (!parent) {
	        return bus.emit("error", {
	            error: true,
	            reasons: [
	                {
	                    code: "INVALID_CONFIGURATION",
	                    message: "Target element has no parent",
	                },
	            ],
	        });
	    }
	    parent.appendChild(holder);
	    // remove the inline display style to reveal
	    target.style.display = "";
	    var iframe = new IframeField("payment-request", { target: "#" + holder.id }, assetBaseUrl() + "field.html");
	    instruments = instruments || defaultInstruments();
	    details = details || defaultDetails();
	    options = options || defaultOptions$3();
	    var result = new PaymentRequestEmitter(iframe);
	    var start = function () {
	        return postMessage.post({
	            data: {
	                details: details,
	                instruments: instruments,
	                options: options,
	            },
	            id: iframe.id,
	            type: "ui:iframe-field:payment-request-start",
	        }, iframe.id);
	    };
	    if (startOnLoad) {
	        result.on("register", function () {
	            start();
	        });
	    }
	    else {
	        Events.addHandler(target, "click", function (e) {
	            e.preventDefault();
	            start();
	            return false;
	        });
	    }
	    iframe.on("token-success", function (data) {
	        if (startOnLoad) {
	            reset(holder);
	        }
	        result.emit("token-success", data);
	    });
	    iframe.on("token-error", function (data) {
	        if (startOnLoad) {
	            reset(holder);
	        }
	        result.emit("token-error", data);
	    });
	    iframe.on("payment-request-closed", function () {
	        if (startOnLoad) {
	            reset(holder);
	        }
	        result.emit("error", {
	            error: true,
	            reasons: [{ code: "PAYMENT_UI_CLOSED", message: "Payment UI closed" }],
	        });
	    });
	    iframe.on("error", function (e) {
	        if (startOnLoad) {
	            reset(holder);
	        }
	        result.emit("error", {
	            error: true,
	            reasons: [e],
	        });
	    });
	    return result;
	}
	var reset = function (el) {
	    if (el.remove) {
	        el.remove();
	    }
	    else if (el.parentNode && el.parentNode.removeChild) {
	        el.parentNode.removeChild(el);
	    }
	};

	var paymentRequest = /*#__PURE__*/Object.freeze({
		__proto__: null,
		complete: complete,
		setup: setup$1
	});

	var configure = (function (options$1) {
	    for (var prop in options$1) {
	        if (options$1.hasOwnProperty(prop)) {
	            options[prop] = options$1[prop];
	        }
	    }
	    var gateway = getGateway();
	    if (gateway && gateway.actions.setup) {
	        gateway.actions.setup();
	    }
	});

	function form$3(options) {
	    return new UIForm(options.fields, options.styles || {});
	}

	var ui = /*#__PURE__*/Object.freeze({
		__proto__: null,
		form: form$3,
		fieldTypeAutocompleteMap: fieldTypeAutocompleteMap,
		IframeField: IframeField
	});

	var index = {
	    configure: configure,
	    creditCard: creditCard,
	    eCheck: eCheck,
	    events: Events,
	    giftAndLoyalty: giftAndLoyalty,
	    internal: internal,
	    // Don't use Function.prototype bind because it's not available on
	    // IE8 and polyfills use eval :(
	    on: function (ev, listener) { return bus.on(ev, listener); },
	    paymentRequest: paymentRequest,
	    ui: ui,
	};

	return index;

})));
//# sourceMappingURL=globalpayments.js.map
