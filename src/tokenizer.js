"use strict";
// Copyright (c) 2018-2019 urain39 <urain39[AT]qq[DOT]com>
exports.__esModule = true;
exports.TokenTypeMap = {
    '?': 0 /* IF */,
    '!': 1 /* NOT */,
    '*': 2 /* ELSE */,
    '/': 3 /* END */,
    '#': 5 /* FORMAT */
};
function tokenize(source, prefix, suffix) {
    var type_, value, tokens = [];
    for (var i = 0, j = 0; i < source.length;) {
        j = source.indexOf(prefix, i);
        if (j === -1) {
            value = source.slice(i, source.length);
            if (value.length > 0)
                tokens.push([4 /* TEXT */, value]);
            break;
        }
        value = source.slice(i, j);
        j += prefix.length;
        if (value.length > 0)
            tokens.push([4 /* TEXT */, value]);
        i = source.indexOf(suffix, j);
        if (i === -1)
            throw new SyntaxError("No match prefix '" + prefix + "'");
        value = source.slice(j, i);
        i += suffix.length;
        type_ = value[0];
        switch (type_) {
            case '?':
            case '!':
            case '*':
            case '/':
            case '#':
                tokens.push([exports.TokenTypeMap[type_], value.slice(1)]);
                break;
            default:
                tokens.push([6 /* FORMAT_ESCAPE */, value]);
        }
    }
    return tokens;
}
exports.tokenize = tokenize;
