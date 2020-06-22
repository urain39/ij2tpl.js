/**
 * @module IJ2TPL
 * @version v0.1.0-dev
 * @author urain39 <urain39@qq.com>
 * @copyright (c) 2018-2020 IJ2TPL.js / IJ2TPL.ts Authors.
 */
var _a, _b;
export var version = '0.1.0-dev';
var filterMap = {};
export function setFilterMap(filterMap_) {
    filterMap = filterMap_;
}
// See https://github.com/microsoft/TypeScript/issues/14682
var TokenTypeMap = (_a = {},
    _a["?" /* IF */] = 0 /* IF */,
    _a["!" /* NOT */] = 1 /* NOT */,
    _a["*" /* ELSE */] = 2 /* ELSE */,
    _a["/" /* END */] = 3 /* END */,
    _a["#" /* RAW */] = 5 /* RAW */,
    _a["@" /* PARTIAL */] = 8 /* PARTIAL */,
    _a);
// We strip all white spaces to make check section easy(for `buildTree`)
var WhiteSpaceRe = /[\s\xA0\uFEFF]+/g, stripWhiteSpace = function (string_) { return string_.replace(WhiteSpaceRe, ''); }, 
// NOTE: if we use `IndentedTestRe` with capture-group directly, the `<string>.replace` method
//     will always generate a new string. So we need test it before replace it ;)
IndentedTestRe = /(?:^|[\n\r])[\t \xA0\uFEFF]+$/, IndentedWhiteSpaceRe = /[\t \xA0\uFEFF]+$/, 
// To compress the source, we extracted some of the same code
stripIndentation = function (token, tokens) {
    // Remove token's indentation if exists
    if (token[0 /* TYPE */] === 4 /* TEXT */) {
        token = token;
        if (IndentedTestRe.test(token[1 /* VALUE */]))
            token[1 /* VALUE */] = token[1 /* VALUE */].replace(IndentedWhiteSpaceRe, '');
        if (!token[1 /* VALUE */])
            tokens.pop(); // Drop the empty text ''
    }
};
export function tokenize(source, prefix, suffix) {
    var type_, value, token = [7 /* COMMENT */, ''], // Initialized for first backward check
    tokens = [];
    for (var i = 0, j = 0, l = source.length, pl = prefix.length, sl = suffix.length; i < l;) {
        // Match '{'
        j = source.indexOf(prefix, i);
        // Not found the '{'
        if (j === -1) {
            // Eat the rest of the source
            value = source.slice(i);
            if (value)
                token = [4 /* TEXT */, value], tokens.push(token);
            break; // Done
        }
        // Eat the left side of a token
        value = source.slice(i, j);
        j += pl; // Skip the '{'
        // Don't eat the empty text ''
        if (value)
            token = [4 /* TEXT */, value], tokens.push(token);
        // Match the '}'
        i = source.indexOf(suffix, j);
        // Not found the '}'
        if (i === -1)
            throw new Error("No matching prefix '" + prefix + "'");
        // We don't want to call `source.slice` for comments
        if (source[j] === "-" /* COMMENT */) {
            stripIndentation(token, tokens);
            i += sl; // Skip the '}'
            continue; // Skip the comment
        }
        // Eat the text between the '{' and '}'
        value = source.slice(j, i);
        i += sl;
        value = stripWhiteSpace(value);
        if (!value)
            continue; // Skip the empty token, such as '{}'
        type_ = value[0];
        switch (type_) {
            case "?" /* IF */:
            case "!" /* NOT */:
            case "*" /* ELSE */:
            case "/" /* END */:
            case "@" /* PARTIAL */:
                stripIndentation(token, tokens);
                // Skip section's newline if exists
                if (i < l) {
                    switch (source[i]) {
                        case '\n':
                            i += 1; // LF
                            break;
                        case '\r':
                            // Have next character?
                            i += i + 1 < l ?
                                // Yes, next character is LF?
                                source[i + 1] === '\n' ?
                                    2 // Yes, then newline is CRLF
                                    :
                                        1 // No, then newline is CR
                                :
                                    1 // No, then newline is CR
                            ;
                            break;
                    }
                }
            // eslint-disable-line no-fallthrough
            case "#" /* RAW */:
                value = stripWhiteSpace(value.slice(1)); // Left trim
                token = [TokenTypeMap[type_], value], tokens.push(token);
                break;
            default:
                token = [6 /* FORMAT */, value], tokens.push(token);
                break;
        }
    }
    return tokens;
}
// See https://github.com/janl/mustache.js/pull/530
var htmlSpecialRe = /["&'\/<=>`]/g, // eslint-disable-line no-useless-escape
htmlSpecialEntityMap = {
    '"': '&quot;',
    '&': '&amp;',
    "'": '&#39;',
    '/': '&#x2F;',
    '<': '&lt;',
    '=': '&#x3D;',
    '>': '&gt;',
    '`': '&#x60;'
}, escapeHTML = function (value) { return String(value).replace(htmlSpecialRe, function (key) { return htmlSpecialEntityMap[key]; }); };
export var escape = escapeHTML; // Escape for HTML by default
var hasOwnProperty = {}.hasOwnProperty;
// Action name means we just want run filters :)
var actionNames = { '': true, 'do': true };
var Context = /** @class */ (function () {
    function Context(data, parent) {
        this.data = data;
        this.parent = parent;
        this.cache = { '.': this.data };
    }
    Context.prototype.resolve = function (name) {
        var data, cache, name_, names, filters, value = null, context = this;
        cache = context.cache;
        name_ = name[0 /* NAME */];
        if (!name[3 /* IS_ACTION */]) {
            // Cached in context?
            if (hasOwnProperty.call(cache, name_)) {
                value = cache[name_];
            }
            else {
                // No cached record found. Have properties?
                if (name[1 /* NAMES */]) {
                    names = name[1 /* NAMES */];
                    name_ = names[0];
                    // Try to look up the (first)name in data
                    do {
                        data = context.data;
                        // Find out which context contains name
                        if (data && hasOwnProperty.call(data, name_)) {
                            value = data[name_];
                            // Resolve sub-names
                            for (var i = 1, l = names.length; i < l; i++) {
                                name_ = names[i];
                                if (value && hasOwnProperty.call(value, name_)) {
                                    value = value[name_];
                                }
                                else {
                                    value = null; // Reset
                                    break;
                                }
                            }
                            break;
                        }
                        context = context.parent;
                    } while (context);
                }
                else {
                    // Try to look up the name in data
                    do {
                        data = context.data;
                        // Find out which context contains name
                        if (data && hasOwnProperty.call(data, name_)) {
                            value = data[name_];
                            break;
                        }
                        context = context.parent;
                    } while (context);
                }
                // Support for function
                if (typeof value === 'function')
                    value = value(context);
                // Cache the name
                cache[name_] = value;
            }
        }
        // Apply filters if exists
        if (name[2 /* FILTERS */]) {
            filters = name[2 /* FILTERS */];
            for (var _i = 0, filters_1 = filters; _i < filters_1.length; _i++) {
                var filterName = filters_1[_i];
                if (hasOwnProperty.call(filterMap, filterName))
                    value = filterMap[filterName](value);
                else
                    throw new Error("Cannot resolve filter '" + filterName + "'");
            }
        }
        return value;
    };
    return Context;
}());
export { Context };
var isArray = Array.isArray;
if (!isArray) {
    var toString_1 = {}.toString;
    isArray = function (value) {
        return toString_1.call(value) === '[object Array]';
    };
}
var Renderer = /** @class */ (function () {
    function Renderer(treeRoot) {
        this.treeRoot = treeRoot;
    }
    Renderer.prototype.renderTree = function (treeRoot, context, partialMap) {
        var value, section, buffer = '', isArray_ = false;
        for (var _i = 0, treeRoot_1 = treeRoot; _i < treeRoot_1.length; _i++) {
            var token = treeRoot_1[_i];
            switch (token[0 /* TYPE */]) {
                case 0 /* IF */:
                    section = token;
                    value = context.resolve(section[1 /* VALUE */]);
                    isArray_ = isArray(value);
                    // We can only know true or false after we sure it is array or not
                    if (isArray_ ? value.length : value) {
                        if (isArray_)
                            for (var _a = 0, value_1 = value; _a < value_1.length; _a++) {
                                var value_ = value_1[_a];
                                buffer += this.renderTree(section[2 /* BLOCK */], new Context(value_, context), partialMap);
                            }
                        else
                            buffer += this.renderTree(section[2 /* BLOCK */], new Context(value, context), partialMap);
                    }
                    break;
                case 1 /* NOT */:
                    section = token;
                    value = context.resolve(section[1 /* VALUE */]);
                    isArray_ = isArray(value);
                    if (!(isArray_ ? value.length : value))
                        buffer += this.renderTree(section[2 /* BLOCK */], context, partialMap);
                    break;
                // XXX: it may be slower than If-Section + Not-Section(about 1 ops/sec)
                case 2 /* ELSE */:
                    section = token;
                    value = context.resolve(section[1 /* VALUE */]);
                    isArray_ = isArray(value);
                    if (isArray_ ? value.length : value) {
                        if (isArray_)
                            for (var _b = 0, value_2 = value; _b < value_2.length; _b++) {
                                var value_ = value_2[_b];
                                buffer += this.renderTree(section[2 /* BLOCK */], new Context(value_, context), partialMap);
                            }
                        else
                            buffer += this.renderTree(section[2 /* BLOCK */], new Context(value, context), partialMap);
                    }
                    else {
                        buffer += this.renderTree(section[3 /* ELSE_BLOCK */], context, partialMap);
                    }
                    break;
                case 4 /* TEXT */:
                    token = token;
                    value = token[1 /* VALUE */];
                    // Empty text has been skipped when tokenizing
                    buffer += value;
                    break;
                case 5 /* RAW */:
                    token = token;
                    value = context.resolve(token[1 /* VALUE */]);
                    // Check if it is non-values(null and undefined)
                    if (value != null)
                        buffer += value;
                    break;
                case 6 /* FORMAT */:
                    token = token;
                    value = context.resolve(token[1 /* VALUE */]);
                    if (value != null)
                        buffer += typeof value === 'number' ?
                            value
                            :
                                // NOTE: `<object>.toString` will be called when we try to
                                //     append a stringified object to buffer, it is not safe!
                                escapeHTML(value);
                    break;
                case 8 /* PARTIAL */:
                    token = token;
                    value = token[1 /* VALUE */];
                    if (partialMap && hasOwnProperty.call(partialMap, value))
                        buffer += this.renderTree(partialMap[value].treeRoot, context, partialMap);
                    else
                        throw new Error("Cannot resolve partial '" + value + "'");
                    break;
            }
        }
        return buffer;
    };
    Renderer.prototype.render = function (data, partialMap) {
        return this.renderTree(this.treeRoot, new Context(data, null), partialMap);
    };
    return Renderer;
}());
export { Renderer };
var TokenTypeReverseMap = (_b = {},
    _b[0 /* IF */] = "?" /* IF */,
    _b[1 /* NOT */] = "!" /* NOT */,
    _b[2 /* ELSE */] = "*" /* ELSE */,
    _b[3 /* END */] = "/" /* END */,
    _b);
var processToken = function (token) {
    var name, names = null, filters = null, isAction = false, token_;
    name = token[1 /* VALUE */];
    // Name can be empty, see `actionNames`
    if (name.indexOf('|') !== -1) {
        filters = name.split('|');
        name = filters[0];
        filters = filters.slice(1);
        // Action name is a variant of name + filters
        if (actionNames[name])
            isAction = true;
    }
    // One '.' means current data
    if (name.indexOf('.') > 0)
        names = name.split('.');
    // NOTE: filters are just additional part of Token
    token_ = [token[0 /* TYPE */], [name, names, filters, isAction]];
    return token_;
};
function buildTree(tokens) {
    var token, section, sections = [], treeRoot = [], collector = treeRoot;
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token_ = tokens_1[_i];
        switch (token_[0 /* TYPE */]) {
            // Enter a section
            case 0 /* IF */:
            case 1 /* NOT */:
                // Make `_Token` -> `Token`
                token = processToken(token_);
                // Current block saves token
                collector.push(token);
                section = token;
                // Stack saves section
                sections.push(section);
                // Initialize and switch to section's block
                collector = section[2 /* BLOCK */] = [];
                section[3 /* ELSE_BLOCK */] = null; // Padding?
                break;
            // Switch to section's else-block
            case 2 /* ELSE */:
                // Get entered section
                section = sections.length ?
                    sections[sections.length - 1]
                    :
                        void 0x95E2 // Reset
                ;
                // `ELSE` are valid for `IF`, invalid for `NOT`
                if (!section || section[0 /* TYPE */] !== 0 /* IF */ || token_[1 /* VALUE */] !== section[1 /* VALUE */][0 /* NAME */])
                    throw new Error("Unexpected token '<type=" + TokenTypeReverseMap[token_[0 /* TYPE */]] + ", value=" + token_[1 /* VALUE */][0 /* NAME */] + ">'");
                // Initialize and switch to section's else-block
                collector = section[3 /* ELSE_BLOCK */] = [];
                break;
            // Leave a section
            case 3 /* END */:
                section = sections.pop();
                if (!section || token_[1 /* VALUE */] !== section[1 /* VALUE */][0 /* NAME */])
                    throw new Error("Unexpected token '<type=" + TokenTypeReverseMap[token_[0 /* TYPE */]] + ", value=" + token_[1 /* VALUE */][0 /* NAME */] + ">'");
                // Change type for which section contains non-empty else-block
                if (isArray(section[3 /* ELSE_BLOCK */]) && section[3 /* ELSE_BLOCK */].length)
                    section[0 /* TYPE */] = 2 /* ELSE */;
                // Re-bind block to parent block
                collector = sections.length ?
                    // Is parent section has initialized else-block?
                    (section = sections[sections.length - 1], isArray(section[3 /* ELSE_BLOCK */])) ?
                        // Yes, then parent block is else-block
                        section[3 /* ELSE_BLOCK */]
                        :
                            // No, then parent block is (if-)block
                            section[2 /* BLOCK */]
                    :
                        treeRoot;
                break;
            // Formatter
            case 5 /* RAW */:
            case 6 /* FORMAT */:
                token = processToken(token_);
                collector.push(token);
                break;
            // Text or Partial
            default:
                collector.push(token_);
                break;
        }
    }
    if (sections.length) {
        section = sections.pop();
        throw new Error("No matching section '<type=" + TokenTypeReverseMap[section[0 /* TYPE */]] + ", value=" + section[1 /* VALUE */][0 /* NAME */] + ">'");
    }
    return treeRoot;
}
export function parse(source, prefix, suffix) {
    if (prefix === void 0) { prefix = '{'; }
    if (suffix === void 0) { suffix = '}'; }
    var treeRoot = buildTree(tokenize(source, prefix, suffix));
    return new Renderer(treeRoot);
}
// Support for ES3(Optional)
if (!Object.defineProperty)
    Object.defineProperty = function () { };
