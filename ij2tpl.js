// Copyright (c) 2018-2020 urain39 <urain39[AT]qq[DOT]com>
var _a;
export var version = '0.1.0-dev';
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^[\s\xA0\uFEFF]+|[\s\xA0\uFEFF]+$/g, '');
    };
}
var TokenTypeMap = {
    '?': 0 /* IF */,
    '!': 1 /* NOT */,
    '*': 2 /* ELSE */,
    '/': 3 /* END */,
    '#': 5 /* RAW */
};
export function tokenize(source, prefix, suffix) {
    var type_, value, token = [7 /* INVALID */, '^'], tokens = [];
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
        // Match '}'
        i = source.indexOf(suffix, j);
        // Not found the '}'
        if (i === -1)
            throw new SyntaxError("No matching prefix '" + prefix + "'");
        // Eat the text between the '{' and '}'
        value = source.slice(j, i);
        i += sl; // Skip the '}'
        // Skip the empty token, such as '{}'
        if (!value)
            continue;
        value = value.trim();
        type_ = value[0];
        switch (type_) {
            case '?':
            case '!':
            case '*':
            case '/':
                // Remove section's indentations if exists
                if (token[0 /* TYPE */] === 4 /* TEXT */) {
                    if (/(?:^|[\n\r])[\t \xA0\uFEFF]+$/.test(token[1 /* VALUE */]))
                        token[1 /* VALUE */] = token[1 /* VALUE */].replace(/[\t \xA0\uFEFF]+$/g, '');
                    if (!token[1 /* VALUE */])
                        tokens.pop(); // Drop the empty text ''
                }
                // Skip section's newline if exists
                if (i < l) {
                    switch (source[i]) {
                        case '\n':
                            i += 1; // LF
                            break;
                        case '\r':
                            // Safe way for access a character in a string
                            i += source.charAt(i + 1) === '\n' ?
                                2 // CRLF
                                :
                                    1 // CR
                            ;
                            break;
                    }
                }
            // eslint-disable-line no-fallthrough
            case '#':
                value = value.slice(1).trim();
                token = [TokenTypeMap[type_], value], tokens.push(token);
                break;
            case '-': // comment
                break;
            default:
                token = [6 /* FORMAT */, value], tokens.push(token);
                break;
        }
    }
    return tokens;
}
var htmlEntityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#x60;',
    '=': '&#x3D;',
    '/': '&#x2F;'
};
function escapeHTML(value) {
    // eslint-disable-next-line no-useless-escape
    return String(value).replace(/[&<>"'`=\/]/g, function (key) {
        return htmlEntityMap[key];
    });
}
export var escape = escapeHTML; // We don't wanna user use a long name to call function
var hasOwnProperty = {}.hasOwnProperty;
var Context = /** @class */ (function () {
    function Context(data, parent) {
        this.data = data;
        this.parent = parent;
        this.cache = { '.': this.data };
    }
    Context.prototype.resolve = function (name) {
        var data, cache, value = null, context = this;
        cache = context.cache;
        // Cached in context?
        if (hasOwnProperty.call(cache, name)) {
            value = cache[name];
        }
        else {
            // No cached record found
            if (name.indexOf('.') > 0) {
                var name_ = void 0, names = name.split('.');
                name_ = names[0];
                // Try to look up the (first)name in data
                for (; context; context = context.parent) {
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
                                value = null; // Reset value
                                break;
                            }
                        }
                        break;
                    }
                }
            }
            else {
                // Try to look up the name in data
                for (; context; context = context.parent) {
                    data = context.data;
                    // Find out which context contains name
                    if (data && hasOwnProperty.call(data, name)) {
                        value = data[name];
                        break;
                    }
                }
            }
            // Support for function
            if (typeof value === 'function')
                value = value(context);
            // Cache the name
            cache[name] = value;
        }
        return value;
    };
    return Context;
}());
export { Context };
var toString = {}.toString, isArray = Array.isArray || function (value) {
    return toString.call(value) === '[object Array]';
};
var Renderer = /** @class */ (function () {
    function Renderer(treeRoot) {
        this.treeRoot = treeRoot;
    }
    Renderer.prototype.renderTree = function (treeRoot, context) {
        var value, buffer = '';
        for (var _i = 0, treeRoot_1 = treeRoot; _i < treeRoot_1.length; _i++) {
            var token = treeRoot_1[_i];
            switch (token[0 /* TYPE */]) {
                case 0 /* IF */:
                    value = context.resolve(token[1 /* VALUE */]);
                    if (value) {
                        if (isArray(value))
                            for (var _a = 0, value_1 = value; _a < value_1.length; _a++) {
                                var value_ = value_1[_a];
                                buffer += this.renderTree(token[2 /* BLOCK */], new Context(value_, context));
                            }
                        else
                            buffer += this.renderTree(token[2 /* BLOCK */], new Context(value, context));
                    }
                    break;
                case 1 /* NOT */:
                    value = context.resolve(token[1 /* VALUE */]);
                    if (!value || isArray(value) && value.length < 1)
                        buffer += this.renderTree(token[2 /* BLOCK */], context);
                    break;
                case 2 /* ELSE */:
                    value = context.resolve(token[1 /* VALUE */]);
                    if (value) {
                        if (isArray(value))
                            for (var _b = 0, value_2 = value; _b < value_2.length; _b++) {
                                var value_ = value_2[_b];
                                buffer += this.renderTree(token[2 /* BLOCK */], new Context(value_, context));
                            }
                        else
                            buffer += this.renderTree(token[2 /* BLOCK */], new Context(value, context));
                    }
                    else {
                        buffer += this.renderTree(token[3 /* ELSE_BLOCK */], context);
                    }
                    break;
                case 4 /* TEXT */:
                    buffer += token[1 /* VALUE */];
                    break;
                case 5 /* RAW */:
                    value = context.resolve(token[1 /* VALUE */]);
                    // Check if it is non-values(null and undefined)
                    if (value != null)
                        buffer += value;
                    break;
                case 6 /* FORMAT */:
                    value = context.resolve(token[1 /* VALUE */]);
                    if (value != null)
                        // NOTE: `<object>.toString` will be called when we try to
                        // append a stringified object to buffer, it is not safe!
                        buffer += typeof value === 'number' ?
                            value
                            :
                                escapeHTML(value);
                    break;
            }
        }
        return buffer;
    };
    Renderer.prototype.render = function (data) {
        return this.renderTree(this.treeRoot, new Context(data, null));
    };
    return Renderer;
}());
export { Renderer };
// See https://github.com/microsoft/TypeScript/issues/14682
var TokenTypeReverseMap = (_a = {},
    _a[0 /* IF */] = '?',
    _a[1 /* NOT */] = '!',
    _a[2 /* ELSE */] = '*',
    _a[3 /* END */] = '/',
    _a[5 /* RAW */] = '#',
    _a);
function buildTree(tokens) {
    var section, sections = [], treeRoot = [], collector = treeRoot;
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        switch (token[0 /* TYPE */]) {
            // Enter a section
            case 0 /* IF */:
            case 1 /* NOT */:
                // Current block saves token
                collector.push(token);
                section = token;
                // Stack saves section
                sections.push(section);
                // Initialize section block
                collector = section[2 /* BLOCK */] = [];
                break;
            // Switch section block
            case 2 /* ELSE */:
                section = sections.length > 0 ?
                    sections[sections.length - 1]
                    :
                        void 0 // Reset
                ;
                // Check current(or top) section is valid?
                if (!section || section[0 /* TYPE */] !== 0 /* IF */ || token[1 /* VALUE */] !== section[1 /* VALUE */])
                    throw new SyntaxError("Unexpected token '<type=" + TokenTypeReverseMap[token[0 /* TYPE */]] + ", value=" + token[1 /* VALUE */] + ">'");
                // Switch the block to else-block
                collector = section[3 /* ELSE_BLOCK */] = [];
                break;
            // Leave a section
            case 3 /* END */:
                section = sections.pop();
                // Check if section is not match
                if (!section || token[1 /* VALUE */] !== section[1 /* VALUE */])
                    throw new SyntaxError("Unexpected token '<type=" + TokenTypeReverseMap[token[0 /* TYPE */]] + ", value=" + token[1 /* VALUE */] + ">'");
                // Change type for which section contains non-empty else-block
                if (isArray(section[3 /* ELSE_BLOCK */]) && section[3 /* ELSE_BLOCK */].length > 0)
                    section[0 /* TYPE */] = 2 /* ELSE */;
                // Re-bind block to parent block
                if (sections.length > 0)
                    // Is parent section has initialized else-block?
                    collector = ((section = sections[sections.length - 1], isArray(section[3 /* ELSE_BLOCK */])) ?
                        // Yes, then parent block is else-block.
                        section[3 /* ELSE_BLOCK */]
                        :
                            // No, then parent block is (if-)block.
                            section[2 /* BLOCK */]);
                else
                    collector = treeRoot;
                break;
            // Text or Formatter
            default:
                collector.push(token);
                break;
        }
    }
    if (sections.length > 0) {
        section = sections.pop();
        throw new SyntaxError("No matching section '<type=" + TokenTypeReverseMap[section[0 /* TYPE */]] + ", value=" + section[1 /* VALUE */] + ">'");
    }
    return treeRoot;
}
export function parse(source, prefix, suffix) {
    if (prefix === void 0) { prefix = '{'; }
    if (suffix === void 0) { suffix = '}'; }
    var treeRoot = buildTree(tokenize(source, prefix, suffix));
    return new Renderer(treeRoot);
}
