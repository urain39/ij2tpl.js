"use strict";
// Copyright (c) 2018-2019 urain39 <urain39[AT]qq[DOT]com>
exports.__esModule = true;
var TokenTypeMap = {
    '?': 0 /* IF */,
    '!': 1 /* NOT */,
    '/': 2 /* END */,
    '#': 4 /* RAW */
};
function tokenize(source, prefix, suffix) {
    var type_, value, tokens = [];
    for (var i = 0, j = 0, l = source.length, pl = prefix.length, sl = suffix.length; i < l;) {
        // Match '{'
        j = source.indexOf(prefix, i);
        // Not found the '{'
        if (j === -1) {
            // Eat the rest of the source
            value = source.slice(i);
            if (value.length > 0)
                tokens.push([3 /* TEXT */, value]);
            break; // Done
        }
        // Eat the left side of a token
        value = source.slice(i, j);
        j += pl; // Skip the '{'
        // Don't eat the empty text ''
        if (value.length > 0)
            tokens.push([3 /* TEXT */, value]);
        // Match '}'
        i = source.indexOf(suffix, j);
        // Not found the '}'
        if (i === -1)
            throw new SyntaxError("No match prefix '" + prefix + "'");
        // Eat the text between the '{' and '}'
        value = source.slice(j, i);
        i += sl; // Skip the '}'
        // Skip the empty token, such as '{}'
        if (value.length < 1)
            continue;
        type_ = value[0];
        switch (type_) {
            case '?':
            case '!':
            case '/':
            case '#':
                value = value.slice(1);
                tokens.push([TokenTypeMap[type_], value]);
                break;
            case '-': // comment
                break;
            default:
                tokens.push([5 /* FORMAT */, value]);
        }
    }
    return tokens;
}
exports.tokenize = tokenize;
function escapeHTML(value) {
    return String(value).replace(/[&<>"'`=\/]/g, function (key) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '`': '&#x60;',
            '=': '&#x3D;',
            '/': '&#x2F;'
        }[key];
    });
}
var Context = /** @class */ (function () {
    function Context(data, parent) {
        this.data = data;
        this.parent = parent;
        this.cache = { '.': this.data };
    }
    Context.prototype.resolve = function (name) {
        var value = null, context = this;
        // Cached in context?
        if (context.cache.hasOwnProperty(name)) {
            value = context.cache[name];
        }
        else {
            // No cached record found
            if (name.indexOf('.') > 0) {
                var name_ = void 0, names = name.split('.');
                name_ = names[0];
                // Try to look up the (first)name in data
                for (; context; context = context.parent) {
                    // Find out which context contains name
                    if (context.data && context.data.hasOwnProperty && context.data.hasOwnProperty(name_)) {
                        value = context.data[name_];
                        // Resolve sub-names
                        for (var i = 1, l = names.length; i < l; i++) {
                            name_ = names[i];
                            if (value && value.hasOwnProperty && value.hasOwnProperty(name_)) {
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
                    // Find out which context contains name
                    if (context.data && context.data.hasOwnProperty && context.data.hasOwnProperty(name)) {
                        value = context.data[name];
                        break;
                    }
                }
            }
            // Cache the name          vvvvv NOTE: value may be undefined
            this.cache[name] = value = value ? value : null;
        }
        return value;
    };
    return Context;
}());
exports.Context = Context;
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
                    if (!value)
                        continue;
                    if (value instanceof Array)
                        for (var _a = 0, value_1 = value; _a < value_1.length; _a++) {
                            var value_ = value_1[_a];
                            buffer += this.renderTree(token[2 /* BLOCK */], new Context(value_, context));
                        }
                    else
                        buffer += this.renderTree(token[2 /* BLOCK */], new Context(value, context));
                    break;
                case 1 /* NOT */:
                    value = context.resolve(token[1 /* VALUE */]);
                    if (!value || value instanceof Array && value.length < 1)
                        buffer += this.renderTree(token[2 /* BLOCK */], context);
                    break;
                case 3 /* TEXT */:
                    buffer += token[1 /* VALUE */];
                    break;
                case 4 /* RAW */:
                    buffer += context.resolve(token[1 /* VALUE */]);
                    break;
                case 5 /* FORMAT */:
                    buffer += escapeHTML(context.resolve(token[1 /* VALUE */]));
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
exports.Renderer = Renderer;
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
            // Leave a section
            case 2 /* END */:
                section = sections.pop();
                // Check if section is not match
                if (!section || token[1 /* VALUE */] !== section[1 /* VALUE */])
                    throw new SyntaxError("Unexpected token '<type=" + token[0 /* TYPE */] + ", value=" + token[1 /* VALUE */] + ">'");
                // Re-bind block to parent block
                sections.length > 0 ?
                    collector = sections[sections.length - 1][2 /* BLOCK */]
                    :
                        collector = treeRoot;
                break;
            // Text or Formatter
            default:
                collector.push(token);
        }
    }
    if (sections.length > 0) {
        section = sections.pop();
        throw new SyntaxError("No match section '<type=" + section[0 /* TYPE */] + ", value=" + section[1 /* VALUE */] + ">'");
    }
    return treeRoot;
}
function parse(source, prefix, suffix) {
    if (prefix === void 0) { prefix = '{'; }
    if (suffix === void 0) { suffix = '}'; }
    var treeRoot = buildTree(tokenize(source, prefix, suffix));
    return new Renderer(treeRoot);
}
exports.parse = parse;
