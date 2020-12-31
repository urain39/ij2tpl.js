/**
 * @file IJ2TPL.js - A Lightweight Template Engine.
 * @version v0.1.2
 * @author urain39 <urain39@qq.com>
 * @copyright (c) 2018-2020 IJ2TPL.js / IJ2TPL.ts Authors.
 */
var _a, _b;
/* eslint-disable prefer-const */
export var version = '0.1.2';
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
// NOTE: If we use `IndentedTestRe` with capture-group directly, the `<string>.replace` method
//     will always generate a new string. So we need test it before replace it ;)
var IndentedTestRe = /(?:^|[\n\r])[\t \xA0\uFEFF]+$/, IndentedWhiteSpaceRe = /[\t \xA0\uFEFF]+$/, stripIndentation = function (token, tokens) {
    var value, result, indentation = '';
    // Remove token's indentation if exists
    if (token[0 /* TYPE */] === 4 /* TEXT */) {
        token = token;
        value = token[1 /* VALUE */];
        // eslint-disable-next-line no-cond-assign
        if (result = value.match(IndentedTestRe))
            indentation = result[0],
                value = value.replace(IndentedWhiteSpaceRe, '');
        if (value)
            token[1 /* VALUE */] = value;
        else
            tokens.pop(); // Don't save text that has become empty
    }
    return indentation;
}
// We strip all white spaces to make check section easy(for `buildTree`)
, WhiteSpaceRe = /[\s\xA0\uFEFF]+/g, stripWhiteSpace = function (string_) { return string_.replace(WhiteSpaceRe, ''); };
export function tokenize(source, prefix, suffix) {
    var type_, value, indentation, token = [7 /* COMMENT */, ''] // Initialized for first backward check
    , tokens = [];
    for (var i = 0, j = 0, l = source.length, pl = prefix.length, sl = suffix.length; i < l;) {
        // Match '{'
        j = source.indexOf(prefix, i);
        // Not found the '{'
        if (j === -1) {
            // Eat the rest of the source
            value = source.slice(i);
            // Don't save the empty text ''
            if (value)
                token = [4 /* TEXT */, value], tokens.push(token);
            break; // Done
        }
        // Eat the left side of a token
        value = source.slice(i, j);
        j += pl; // Skip the '{'
        if (value)
            token = [4 /* TEXT */, value], tokens.push(token);
        // Match the '}'
        i = source.indexOf(suffix, j);
        // Not found the '}'
        if (i === -1)
            throw new Error("No matching prefix '" + prefix + "'");
        // We don't want to call `source.slice` for comments
        if (source.charAt(j) === "-" /* COMMENT */) {
            stripIndentation(token, tokens);
            i += sl; // Skip the '}' for comments
            continue; // Tokenize next one
        }
        // Eat the text between the '{' and '}'
        value = source.slice(j, i);
        i += sl; // Skip the '}' for tokens
        value = stripWhiteSpace(value);
        if (!value)
            continue; // Skip the empty token, such as '{}'
        type_ = value.charAt(0);
        switch (type_) {
            case "?" /* IF */:
            case "!" /* NOT */:
            case "*" /* ELSE */:
            case "/" /* END */:
            case "@" /* PARTIAL */:
                indentation = stripIndentation(token, tokens);
                // Skip section's newline if exists
                if (i < l) {
                    switch (source.charAt(i)) {
                        case '\n':
                            i += 1; // LF
                            break;
                        case '\r':
                            // Have next character?
                            i += (j = i + 1) < l ?
                                // Yes, next character is LF?
                                source.charAt(j) === '\n' ?
                                    2 // Yes, then newline is CRLF
                                    :
                                        1 // No, then newline is CR
                                :
                                    1 // No, then newline is CR
                            ;
                            break;
                    }
                }
                token = [TokenTypeMap[type_], value.slice(1), indentation],
                    tokens.push(token);
                break;
            case "#" /* RAW */:
                token = [TokenTypeMap[type_], value.slice(1)],
                    tokens.push(token);
                break;
            default:
                token = [6 /* FORMAT */, value],
                    tokens.push(token);
                break;
        }
    }
    return tokens;
}
var hasOwnProperty = {}.hasOwnProperty
// See https://github.com/janl/mustache.js/pull/530
, htmlSpecialRe = /["&'\/<=>`]/g // eslint-disable-line no-useless-escape
, htmlSpecialEntityMap = {
    '"': '&quot;',
    '&': '&amp;',
    "'": '&#39;' // eslint-disable-line quotes
    ,
    '/': '&#x2F;',
    '<': '&lt;',
    '=': '&#x3D;',
    '>': '&gt;',
    '`': '&#x60;'
}, escapeHTML = function (value) { return String(value).replace(htmlSpecialRe, function (special) { return htmlSpecialEntityMap[special]; }); };
var escapeFunction = escapeHTML; // Escape for HTML by default
export function escape(value) {
    return escapeFunction(value);
}
export function setEscapeFunction(escapeFunction_) {
    escapeFunction = escapeFunction_;
}
var Context = /** @class */ (function () {
    function Context(data, parent) {
        this.data = data;
        this.cache = { '.': this.data };
        this.parent = parent;
    }
    Context.prototype.resolve = function (name) {
        var data, cache, name_, name__, names, filters, value = null, context = this, hasProperties = false;
        if (!name[3 /* IS_ACTION */]) {
            cache = context.cache;
            name_ = name[0 /* NAME */];
            // Cached in context?
            if (hasOwnProperty.call(cache, name_)) {
                value = cache[name_];
            }
            else { // No cached records found
                // eslint-disable-next-line no-cond-assign
                if (names = name[1 /* NAMES */]) {
                    name__ = names[0];
                    hasProperties = true;
                }
                else {
                    name__ = name_;
                }
                // Try to look up the name in data
                do {
                    data = context.data;
                    // Find out which context contains name
                    if (data && hasOwnProperty.call(data, name__)) {
                        value = data[name__];
                        // Resolve properties if exists
                        if (hasProperties) {
                            for (var i = 1, l = names.length; i < l; i++) {
                                name__ = names[i];
                                if (value && hasOwnProperty.call(value, name__)) {
                                    value = value[name__];
                                }
                                else {
                                    value = null; // Reset
                                    break;
                                }
                            }
                        }
                        break;
                    }
                    context = context.parent;
                } while (context);
                // Support for function
                if (typeof value === 'function')
                    value = value(context);
                // Cache the name
                cache[name_] = value;
            }
        }
        // eslint-disable-next-line no-cond-assign
        if (filters = name[2 /* FILTERS */]) {
            for (var i = 0, l = filters.length, filterName = void 0; i < l;) {
                filterName = filters[i++];
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
    // XXX: Fix a possible issue
    isArray = function (value) {
        return toString_1.call(value) === '[object Array]';
    };
}
var Renderer = /** @class */ (function () {
    function Renderer(treeRoot) {
        this.treeRoot = treeRoot;
    }
    /**
     * Do NOT invoke it directly, you should just call `render`
     */
    Renderer.prototype.renderTree = function (treeRoot, context, partialMap) {
        var BEGINNING_RE = /^/gm;
        var value, valueLength, section, indentation, buffer = '', isArray_ = false;
        for (var i = 0, l = treeRoot.length, token = void 0; i < l;) {
            token = treeRoot[i++];
            switch (token[0 /* TYPE */]) {
                case 0 /* IF */:
                    section = token;
                    value = context.resolve(section[1 /* VALUE */]);
                    isArray_ = isArray(value);
                    // We can only know true or false after we sure it is array or not
                    if (isArray_ ? valueLength = value.length : value) {
                        if (isArray_)
                            for (var i_1 = 0, l_1 = valueLength, value_ = void 0; i_1 < l_1;) {
                                value_ = value[i_1++];
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
                // FIXME: It may be slower than If-Section + Not-Section(about 1 ops/sec)
                case 2 /* ELSE */:
                    section = token;
                    value = context.resolve(section[1 /* VALUE */]);
                    isArray_ = isArray(value);
                    if (isArray_ ? valueLength = value.length : value) {
                        if (isArray_)
                            for (var i_2 = 0, l_2 = valueLength, value_ = void 0; i_2 < l_2;) {
                                value_ = value[i_2++];
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
                        buffer += escapeFunction === escapeHTML && typeof value === 'number' ?
                            value // Numbers are absolutely safe for HTML
                            :
                                escapeFunction(value);
                    break;
                case 8 /* PARTIAL */:
                    token = token;
                    value = token[1 /* VALUE */];
                    indentation = token[2 /* INDENTATION */];
                    // TODO: Simpify it
                    if (value === '&') { // Recursive render with parents
                        buffer += this.renderTree(this.treeRoot, context, partialMap)
                            .replace(BEGINNING_RE, indentation);
                    }
                    else if (value === '^') { // Recursive render without parents
                        buffer += this.renderTree(this.treeRoot, new Context(context.data, null), partialMap)
                            .replace(BEGINNING_RE, indentation);
                    }
                    else if (partialMap && hasOwnProperty.call(partialMap, value))
                        buffer += this.renderTree(partialMap[value].treeRoot, context, partialMap)
                            .replace(BEGINNING_RE, indentation);
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
var processToken = function (token_) {
    var name, names, filters, isAction, token;
    names = null;
    filters = null;
    isAction = false;
    name = token_[1 /* VALUE */];
    // NOTE: Name can be empty
    if (name.indexOf('|') !== -1) {
        filters = name.split('|');
        name = filters[0];
        filters = filters.slice(1);
        if (!name)
            isAction = true;
    }
    // One '.' means current data
    if (name.indexOf('.') > 0)
        names = name.split('.');
    // NOTE: Filters are just additional part of Token
    token = [token_[0 /* TYPE */], [name, names, filters, isAction]];
    return token;
};
function buildTree(tokens) {
    var type_, value, token, collector, elseBlock, section, sections = [], sectionsLength, treeRoot = [];
    collector = treeRoot;
    for (var i = 0, l = tokens.length, token_ = void 0; i < l;) {
        token_ = tokens[i++];
        type_ = token_[0 /* TYPE */];
        switch (type_) {
            // Enter a section
            case 0 /* IF */:
            case 1 /* NOT */:
                token = processToken(token_); // Make `_Token` -> `Token`
                collector.push(token); // Current block saves token
                section = token;
                sections.push(section); // Stack saves section
                // Initialize and switch to section's block
                collector = section[2 /* BLOCK */] = [];
                section[3 /* ELSE_BLOCK */] = null; // Padding?
                break;
            // Switch to section's else-block
            case 2 /* ELSE */:
                // Get entered section
                // eslint-disable-next-line no-cond-assign
                section = (sectionsLength = sections.length) ?
                    sections[sectionsLength - 1]
                    :
                        void 0x95E2 // Reset
                ;
                value = token_[1 /* VALUE */];
                if (!section ||
                    // `ELSE` are valid for `IF`, invalid for `NOT`
                    section[0 /* TYPE */] !== 0 /* IF */ ||
                    value !== section[1 /* VALUE */][0 /* NAME */])
                    throw new Error("Unexpected token '<type=" + TokenTypeReverseMap[type_] + ", value=" + value + ">'");
                // Initialize and switch to section's else-block
                collector = section[3 /* ELSE_BLOCK */] = [];
                break;
            // Leave a section
            case 3 /* END */:
                section = sections.pop();
                value = token_[1 /* VALUE */];
                if (!section ||
                    value !== section[1 /* VALUE */][0 /* NAME */])
                    throw new Error("Unexpected token '<type=" + TokenTypeReverseMap[type_] + ", value=" + value + ">'");
                // Change type for which section contains initialized else-block
                if (section[3 /* ELSE_BLOCK */])
                    section[0 /* TYPE */] = 2 /* ELSE */;
                // Re-bind block to parent block
                // eslint-disable-next-line no-cond-assign
                collector = (sectionsLength = sections.length) ?
                    // Is parent section has initialized else-block?
                    (section = sections[sectionsLength - 1]
                        , elseBlock = section[3 /* ELSE_BLOCK */]) ?
                        // Yes, then parent block is else-block
                        elseBlock
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
