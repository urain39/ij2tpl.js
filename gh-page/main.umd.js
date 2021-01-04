(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}((function () { 'use strict';

    /**
     * @file IJ2TPL.js - A Lightweight Template Engine.
     * @version v0.1.3
     * @author urain39 <urain39@qq.com>
     * @copyright (c) 2018-2020 IJ2TPL.js / IJ2TPL.ts Authors.
     */
    var _a, _b;
    var filterMap = {};
    function setFilterMap(filterMap_) {
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
    var IndentedTestRe = /(^|[\n\r])([\t \xA0\uFEFF]+)$/
    //                    ^^^ To support IE6, we cannot use empty groups
    , IndentedWhiteSpaceRe = /[\t \xA0\uFEFF]+$/, stripIndentation = function (token, tokens) {
        var value, result, indentation = '';
        // Remove token's indentation if exists
        if (token[0 /* TYPE */] === 4 /* TEXT */) {
            token = token;
            value = token[1 /* VALUE */];
            // eslint-disable-next-line no-cond-assign
            if (result = value.match(IndentedTestRe))
                indentation = result[2],
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
    function tokenize(source, prefix, suffix) {
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
            var BEGINNING_RE = /^(.+)$/gm; // We don't want to indent empty lines
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
                        if (value === '&') { // Recursive render with parents
                            buffer += this.renderTree(this.treeRoot, context, partialMap)
                                .replace(BEGINNING_RE, indentation + "$&");
                        }
                        else if (value === '^') { // Recursive render without parents
                            buffer += this.renderTree(this.treeRoot, new Context(context.data, null), partialMap)
                                .replace(BEGINNING_RE, indentation + "$&");
                        }
                        else if (partialMap && hasOwnProperty.call(partialMap, value))
                            buffer += this.renderTree(partialMap[value].treeRoot, context, partialMap)
                                .replace(BEGINNING_RE, indentation + "$&");
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
    function parse(source, prefix, suffix) {
        if (prefix === void 0) { prefix = '{'; }
        if (suffix === void 0) { suffix = '}'; }
        var treeRoot = buildTree(tokenize(source, prefix, suffix));
        return new Renderer(treeRoot);
    }

    setFilterMap({
        toClass: function (type_) {
            var class_ = 'unknown';
            if (type_ == 'directory')
                class_ = 'dir';
            else if (type_ == 'file')
                class_ = 'file';
            return class_;
        }
    });
    var template = parse("{{?contents.length}}\n<ul>\n    {{?contents}} {{- Is directory? }}\n        {{-}}<li><a class=\"icon {{type | toClass}}\">{{name}}</a></li>\n        {{-}}{{@^}}\n    {{/contents}}\n</ul>\n{{/contents.length}}\n", '{{', '}}');
    var elem = document.getElementById('content');
    /**
     * Generated from `tree -J` Mozilla Javascript 1.5 Source.
     */
    var data = { 'contents': [
            { 'type': 'directory', 'name': 'js', 'contents': [
                    { 'type': 'directory', 'name': 'CVS', 'contents': [
                            { 'type': 'file', 'name': 'Entries' },
                            { 'type': 'file', 'name': 'Entries.Static' },
                            { 'type': 'file', 'name': 'Repository' },
                            { 'type': 'file', 'name': 'Root' },
                            { 'type': 'file', 'name': 'Tag' }
                        ] },
                    { 'type': 'directory', 'name': 'jsd', 'contents': [
                            { 'type': 'directory', 'name': 'CVS', 'contents': [
                                    { 'type': 'file', 'name': 'Entries' },
                                    { 'type': 'file', 'name': 'Entries.Log' },
                                    { 'type': 'file', 'name': 'Repository' },
                                    { 'type': 'file', 'name': 'Root' },
                                    { 'type': 'file', 'name': 'Tag' }
                                ] },
                            { 'type': 'file', 'name': 'Makefile.in' },
                            { 'type': 'file', 'name': 'README' },
                            { 'type': 'directory', 'name': 'idl', 'contents': [
                                    { 'type': 'directory', 'name': 'CVS', 'contents': [
                                            { 'type': 'file', 'name': 'Entries' },
                                            { 'type': 'file', 'name': 'Repository' },
                                            { 'type': 'file', 'name': 'Root' },
                                            { 'type': 'file', 'name': 'Tag' }
                                        ] },
                                    { 'type': 'file', 'name': 'Makefile.in' },
                                    { 'type': 'file', 'name': 'jsdIDebuggerService.idl' }
                                ] },
                            { 'type': 'file', 'name': 'jsd.h' },
                            { 'type': 'file', 'name': 'jsd.mak' },
                            { 'type': 'file', 'name': 'jsd.pkg' },
                            { 'type': 'file', 'name': 'jsd1640.def' },
                            { 'type': 'file', 'name': 'jsd1640.rc' },
                            { 'type': 'file', 'name': 'jsd3240.rc' },
                            { 'type': 'file', 'name': 'jsd_atom.c' },
                            { 'type': 'file', 'name': 'jsd_high.c' },
                            { 'type': 'file', 'name': 'jsd_hook.c' },
                            { 'type': 'file', 'name': 'jsd_java.c' },
                            { 'type': 'file', 'name': 'jsd_lock.c' },
                            { 'type': 'file', 'name': 'jsd_lock.h' },
                            { 'type': 'file', 'name': 'jsd_obj.c' },
                            { 'type': 'file', 'name': 'jsd_scpt.c' },
                            { 'type': 'file', 'name': 'jsd_stak.c' },
                            { 'type': 'file', 'name': 'jsd_step.c' },
                            { 'type': 'file', 'name': 'jsd_text.c' },
                            { 'type': 'file', 'name': 'jsd_val.c' },
                            { 'type': 'file', 'name': 'jsd_xpc.cpp' },
                            { 'type': 'file', 'name': 'jsd_xpc.h' },
                            { 'type': 'file', 'name': 'jsdebug.c' },
                            { 'type': 'file', 'name': 'jsdebug.h' },
                            { 'type': 'file', 'name': 'jsdshell.mak' },
                            { 'type': 'file', 'name': 'jsdstubs.c' },
                            { 'type': 'file', 'name': 'mkshell.bat' },
                            { 'type': 'file', 'name': 'resource.h' }
                        ] },
                    { 'type': 'directory', 'name': 'src', 'contents': [
                            { 'type': 'directory', 'name': 'CVS', 'contents': [
                                    { 'type': 'file', 'name': 'Entries' },
                                    { 'type': 'file', 'name': 'Repository' },
                                    { 'type': 'file', 'name': 'Root' },
                                    { 'type': 'file', 'name': 'Tag' }
                                ] },
                            { 'type': 'file', 'name': 'Makefile.in' },
                            { 'type': 'file', 'name': 'Makefile.ref' },
                            { 'type': 'file', 'name': 'README.html' },
                            { 'type': 'file', 'name': 'SpiderMonkey.rsp' },
                            { 'type': 'directory', 'name': 'config', 'contents': [
                                    { 'type': 'file', 'name': 'AIX4.1.mk' },
                                    { 'type': 'file', 'name': 'AIX4.2.mk' },
                                    { 'type': 'file', 'name': 'AIX4.3.mk' },
                                    { 'type': 'directory', 'name': 'CVS', 'contents': [
                                            { 'type': 'file', 'name': 'Entries' },
                                            { 'type': 'file', 'name': 'Repository' },
                                            { 'type': 'file', 'name': 'Root' },
                                            { 'type': 'file', 'name': 'Tag' }
                                        ] },
                                    { 'type': 'file', 'name': 'Darwin.mk' },
                                    { 'type': 'file', 'name': 'Darwin1.3.mk' },
                                    { 'type': 'file', 'name': 'Darwin1.4.mk' },
                                    { 'type': 'file', 'name': 'Darwin5.2.mk' },
                                    { 'type': 'file', 'name': 'Darwin5.3.mk' },
                                    { 'type': 'file', 'name': 'HP-UXB.10.10.mk' },
                                    { 'type': 'file', 'name': 'HP-UXB.10.20.mk' },
                                    { 'type': 'file', 'name': 'HP-UXB.11.00.mk' },
                                    { 'type': 'file', 'name': 'IRIX.mk' },
                                    { 'type': 'file', 'name': 'IRIX5.3.mk' },
                                    { 'type': 'file', 'name': 'IRIX6.1.mk' },
                                    { 'type': 'file', 'name': 'IRIX6.2.mk' },
                                    { 'type': 'file', 'name': 'IRIX6.3.mk' },
                                    { 'type': 'file', 'name': 'IRIX6.5.mk' },
                                    { 'type': 'file', 'name': 'Linux_All.mk' },
                                    { 'type': 'file', 'name': 'Mac_OS10.0.mk' },
                                    { 'type': 'file', 'name': 'OSF1V4.0.mk' },
                                    { 'type': 'file', 'name': 'OSF1V5.0.mk' },
                                    { 'type': 'file', 'name': 'SunOS4.1.4.mk' },
                                    { 'type': 'file', 'name': 'SunOS5.3.mk' },
                                    { 'type': 'file', 'name': 'SunOS5.4.mk' },
                                    { 'type': 'file', 'name': 'SunOS5.5.1.mk' },
                                    { 'type': 'file', 'name': 'SunOS5.5.mk' },
                                    { 'type': 'file', 'name': 'SunOS5.6.mk' },
                                    { 'type': 'file', 'name': 'SunOS5.7.mk' },
                                    { 'type': 'file', 'name': 'SunOS5.8.mk' },
                                    { 'type': 'file', 'name': 'SunOS5.9.mk' },
                                    { 'type': 'file', 'name': 'WINNT4.0.mk' },
                                    { 'type': 'file', 'name': 'WINNT5.0.mk' },
                                    { 'type': 'file', 'name': 'WINNT5.1.mk' },
                                    { 'type': 'file', 'name': 'WINNT5.2.mk' },
                                    { 'type': 'file', 'name': 'dgux.mk' }
                                ] },
                            { 'type': 'file', 'name': 'config.mk' },
                            { 'type': 'directory', 'name': 'editline', 'contents': [
                                    { 'type': 'directory', 'name': 'CVS', 'contents': [
                                            { 'type': 'file', 'name': 'Entries' },
                                            { 'type': 'file', 'name': 'Repository' },
                                            { 'type': 'file', 'name': 'Root' },
                                            { 'type': 'file', 'name': 'Tag' }
                                        ] },
                                    { 'type': 'file', 'name': 'Makefile.ref' },
                                    { 'type': 'file', 'name': 'README' },
                                    { 'type': 'file', 'name': 'editline.3' },
                                    { 'type': 'file', 'name': 'editline.c' },
                                    { 'type': 'file', 'name': 'editline.h' },
                                    { 'type': 'file', 'name': 'sysunix.c' },
                                    { 'type': 'file', 'name': 'unix.h' }
                                ] },
                            { 'type': 'directory', 'name': 'fdlibm', 'contents': [
                                    { 'type': 'directory', 'name': 'CVS', 'contents': [
                                            { 'type': 'file', 'name': 'Entries' },
                                            { 'type': 'file', 'name': 'Repository' },
                                            { 'type': 'file', 'name': 'Root' },
                                            { 'type': 'file', 'name': 'Tag' }
                                        ] },
                                    { 'type': 'file', 'name': 'Makefile.in' },
                                    { 'type': 'file', 'name': 'Makefile.ref' },
                                    { 'type': 'file', 'name': 'e_acos.c' },
                                    { 'type': 'file', 'name': 'e_acosh.c' },
                                    { 'type': 'file', 'name': 'e_asin.c' },
                                    { 'type': 'file', 'name': 'e_atan2.c' },
                                    { 'type': 'file', 'name': 'e_atanh.c' },
                                    { 'type': 'file', 'name': 'e_cosh.c' },
                                    { 'type': 'file', 'name': 'e_exp.c' },
                                    { 'type': 'file', 'name': 'e_fmod.c' },
                                    { 'type': 'file', 'name': 'e_gamma.c' },
                                    { 'type': 'file', 'name': 'e_gamma_r.c' },
                                    { 'type': 'file', 'name': 'e_hypot.c' },
                                    { 'type': 'file', 'name': 'e_j0.c' },
                                    { 'type': 'file', 'name': 'e_j1.c' },
                                    { 'type': 'file', 'name': 'e_jn.c' },
                                    { 'type': 'file', 'name': 'e_lgamma.c' },
                                    { 'type': 'file', 'name': 'e_lgamma_r.c' },
                                    { 'type': 'file', 'name': 'e_log.c' },
                                    { 'type': 'file', 'name': 'e_log10.c' },
                                    { 'type': 'file', 'name': 'e_pow.c' },
                                    { 'type': 'file', 'name': 'e_rem_pio2.c' },
                                    { 'type': 'file', 'name': 'e_remainder.c' },
                                    { 'type': 'file', 'name': 'e_scalb.c' },
                                    { 'type': 'file', 'name': 'e_sinh.c' },
                                    { 'type': 'file', 'name': 'e_sqrt.c' },
                                    { 'type': 'file', 'name': 'fdlibm.h' },
                                    { 'type': 'file', 'name': 'fdlibm.mak' },
                                    { 'type': 'file', 'name': 'fdlibm.mdp' },
                                    { 'type': 'file', 'name': 'k_cos.c' },
                                    { 'type': 'file', 'name': 'k_rem_pio2.c' },
                                    { 'type': 'file', 'name': 'k_sin.c' },
                                    { 'type': 'file', 'name': 'k_standard.c' },
                                    { 'type': 'file', 'name': 'k_tan.c' },
                                    { 'type': 'file', 'name': 's_asinh.c' },
                                    { 'type': 'file', 'name': 's_atan.c' },
                                    { 'type': 'file', 'name': 's_cbrt.c' },
                                    { 'type': 'file', 'name': 's_ceil.c' },
                                    { 'type': 'file', 'name': 's_copysign.c' },
                                    { 'type': 'file', 'name': 's_cos.c' },
                                    { 'type': 'file', 'name': 's_erf.c' },
                                    { 'type': 'file', 'name': 's_expm1.c' },
                                    { 'type': 'file', 'name': 's_fabs.c' },
                                    { 'type': 'file', 'name': 's_finite.c' },
                                    { 'type': 'file', 'name': 's_floor.c' },
                                    { 'type': 'file', 'name': 's_frexp.c' },
                                    { 'type': 'file', 'name': 's_ilogb.c' },
                                    { 'type': 'file', 'name': 's_isnan.c' },
                                    { 'type': 'file', 'name': 's_ldexp.c' },
                                    { 'type': 'file', 'name': 's_lib_version.c' },
                                    { 'type': 'file', 'name': 's_log1p.c' },
                                    { 'type': 'file', 'name': 's_logb.c' },
                                    { 'type': 'file', 'name': 's_matherr.c' },
                                    { 'type': 'file', 'name': 's_modf.c' },
                                    { 'type': 'file', 'name': 's_nextafter.c' },
                                    { 'type': 'file', 'name': 's_rint.c' },
                                    { 'type': 'file', 'name': 's_scalbn.c' },
                                    { 'type': 'file', 'name': 's_signgam.c' },
                                    { 'type': 'file', 'name': 's_significand.c' },
                                    { 'type': 'file', 'name': 's_sin.c' },
                                    { 'type': 'file', 'name': 's_tan.c' },
                                    { 'type': 'file', 'name': 's_tanh.c' },
                                    { 'type': 'file', 'name': 'w_acos.c' },
                                    { 'type': 'file', 'name': 'w_acosh.c' },
                                    { 'type': 'file', 'name': 'w_asin.c' },
                                    { 'type': 'file', 'name': 'w_atan2.c' },
                                    { 'type': 'file', 'name': 'w_atanh.c' },
                                    { 'type': 'file', 'name': 'w_cosh.c' },
                                    { 'type': 'file', 'name': 'w_exp.c' },
                                    { 'type': 'file', 'name': 'w_fmod.c' },
                                    { 'type': 'file', 'name': 'w_gamma.c' },
                                    { 'type': 'file', 'name': 'w_gamma_r.c' },
                                    { 'type': 'file', 'name': 'w_hypot.c' },
                                    { 'type': 'file', 'name': 'w_j0.c' },
                                    { 'type': 'file', 'name': 'w_j1.c' },
                                    { 'type': 'file', 'name': 'w_jn.c' },
                                    { 'type': 'file', 'name': 'w_lgamma.c' },
                                    { 'type': 'file', 'name': 'w_lgamma_r.c' },
                                    { 'type': 'file', 'name': 'w_log.c' },
                                    { 'type': 'file', 'name': 'w_log10.c' },
                                    { 'type': 'file', 'name': 'w_pow.c' },
                                    { 'type': 'file', 'name': 'w_remainder.c' },
                                    { 'type': 'file', 'name': 'w_scalb.c' },
                                    { 'type': 'file', 'name': 'w_sinh.c' },
                                    { 'type': 'file', 'name': 'w_sqrt.c' }
                                ] },
                            { 'type': 'file', 'name': 'js.c' },
                            { 'type': 'file', 'name': 'js.mak' },
                            { 'type': 'file', 'name': 'js.mdp' },
                            { 'type': 'file', 'name': 'js.msg' },
                            { 'type': 'file', 'name': 'js.pkg' },
                            { 'type': 'file', 'name': 'js3240.rc' },
                            { 'type': 'file', 'name': 'jsOS240.def' },
                            { 'type': 'file', 'name': 'jsapi.c' },
                            { 'type': 'file', 'name': 'jsapi.h' },
                            { 'type': 'file', 'name': 'jsarena.c' },
                            { 'type': 'file', 'name': 'jsarena.h' },
                            { 'type': 'file', 'name': 'jsarray.c' },
                            { 'type': 'file', 'name': 'jsarray.h' },
                            { 'type': 'file', 'name': 'jsatom.c' },
                            { 'type': 'file', 'name': 'jsatom.h' },
                            { 'type': 'file', 'name': 'jsbit.h' },
                            { 'type': 'file', 'name': 'jsbool.c' },
                            { 'type': 'file', 'name': 'jsbool.h' },
                            { 'type': 'file', 'name': 'jsclist.h' },
                            { 'type': 'file', 'name': 'jscntxt.c' },
                            { 'type': 'file', 'name': 'jscntxt.h' },
                            { 'type': 'file', 'name': 'jscompat.h' },
                            { 'type': 'file', 'name': 'jsconfig.h' },
                            { 'type': 'file', 'name': 'jsconfig.mk' },
                            { 'type': 'file', 'name': 'jscpucfg.c' },
                            { 'type': 'file', 'name': 'jscpucfg.h' },
                            { 'type': 'file', 'name': 'jsdate.c' },
                            { 'type': 'file', 'name': 'jsdate.h' },
                            { 'type': 'file', 'name': 'jsdbgapi.c' },
                            { 'type': 'file', 'name': 'jsdbgapi.h' },
                            { 'type': 'file', 'name': 'jsdhash.c' },
                            { 'type': 'file', 'name': 'jsdhash.h' },
                            { 'type': 'file', 'name': 'jsdtoa.c' },
                            { 'type': 'file', 'name': 'jsdtoa.h' },
                            { 'type': 'file', 'name': 'jsemit.c' },
                            { 'type': 'file', 'name': 'jsemit.h' },
                            { 'type': 'file', 'name': 'jsexn.c' },
                            { 'type': 'file', 'name': 'jsexn.h' },
                            { 'type': 'file', 'name': 'jsfile.c' },
                            { 'type': 'file', 'name': 'jsfile.h' },
                            { 'type': 'file', 'name': 'jsfile.msg' },
                            { 'type': 'file', 'name': 'jsfun.c' },
                            { 'type': 'file', 'name': 'jsfun.h' },
                            { 'type': 'file', 'name': 'jsgc.c' },
                            { 'type': 'file', 'name': 'jsgc.h' },
                            { 'type': 'file', 'name': 'jshash.c' },
                            { 'type': 'file', 'name': 'jshash.h' },
                            { 'type': 'file', 'name': 'jsify.pl' },
                            { 'type': 'file', 'name': 'jsinterp.c' },
                            { 'type': 'file', 'name': 'jsinterp.h' },
                            { 'type': 'file', 'name': 'jslibmath.h' },
                            { 'type': 'file', 'name': 'jslock.c' },
                            { 'type': 'file', 'name': 'jslock.h' },
                            { 'type': 'file', 'name': 'jslocko.asm' },
                            { 'type': 'file', 'name': 'jslog2.c' },
                            { 'type': 'file', 'name': 'jslong.c' },
                            { 'type': 'file', 'name': 'jslong.h' },
                            { 'type': 'file', 'name': 'jsmath.c' },
                            { 'type': 'file', 'name': 'jsmath.h' },
                            { 'type': 'file', 'name': 'jsnum.c' },
                            { 'type': 'file', 'name': 'jsnum.h' },
                            { 'type': 'file', 'name': 'jsobj.c' },
                            { 'type': 'file', 'name': 'jsobj.h' },
                            { 'type': 'file', 'name': 'jsopcode.c' },
                            { 'type': 'file', 'name': 'jsopcode.h' },
                            { 'type': 'file', 'name': 'jsopcode.tbl' },
                            { 'type': 'file', 'name': 'jsosdep.h' },
                            { 'type': 'file', 'name': 'jsotypes.h' },
                            { 'type': 'file', 'name': 'jsparse.c' },
                            { 'type': 'file', 'name': 'jsparse.h' },
                            { 'type': 'file', 'name': 'jsprf.c' },
                            { 'type': 'file', 'name': 'jsprf.h' },
                            { 'type': 'file', 'name': 'jsprvtd.h' },
                            { 'type': 'file', 'name': 'jspubtd.h' },
                            { 'type': 'file', 'name': 'jsregexp.c' },
                            { 'type': 'file', 'name': 'jsregexp.h' },
                            { 'type': 'file', 'name': 'jsscan.c' },
                            { 'type': 'file', 'name': 'jsscan.h' },
                            { 'type': 'file', 'name': 'jsscope.c' },
                            { 'type': 'file', 'name': 'jsscope.h' },
                            { 'type': 'file', 'name': 'jsscript.c' },
                            { 'type': 'file', 'name': 'jsscript.h' },
                            { 'type': 'file', 'name': 'jsshell.msg' },
                            { 'type': 'file', 'name': 'jsstddef.h' },
                            { 'type': 'file', 'name': 'jsstr.c' },
                            { 'type': 'file', 'name': 'jsstr.h' },
                            { 'type': 'file', 'name': 'jstypes.h' },
                            { 'type': 'file', 'name': 'jsutil.c' },
                            { 'type': 'file', 'name': 'jsutil.h' },
                            { 'type': 'file', 'name': 'jsxdrapi.c' },
                            { 'type': 'file', 'name': 'jsxdrapi.h' },
                            { 'type': 'directory', 'name': 'liveconnect', 'contents': [
                                    { 'type': 'directory', 'name': 'CVS', 'contents': [
                                            { 'type': 'file', 'name': 'Entries' },
                                            { 'type': 'file', 'name': 'Entries.Log' },
                                            { 'type': 'file', 'name': 'Repository' },
                                            { 'type': 'file', 'name': 'Root' },
                                            { 'type': 'file', 'name': 'Tag' }
                                        ] },
                                    { 'type': 'file', 'name': 'LiveConnect.dsp' },
                                    { 'type': 'file', 'name': 'LiveConnectShell.dsp' },
                                    { 'type': 'file', 'name': 'LiveConnectShell.dsw' },
                                    { 'type': 'file', 'name': 'Makefile.in' },
                                    { 'type': 'file', 'name': 'Makefile.ref' },
                                    { 'type': 'file', 'name': 'README.html' },
                                    { 'type': 'directory', 'name': '_jni', 'contents': [
                                            { 'type': 'directory', 'name': 'CVS', 'contents': [
                                                    { 'type': 'file', 'name': 'Entries' },
                                                    { 'type': 'file', 'name': 'Repository' },
                                                    { 'type': 'file', 'name': 'Root' },
                                                    { 'type': 'file', 'name': 'Tag' }
                                                ] },
                                            { 'type': 'file', 'name': 'netscape_javascript_JSException.h' },
                                            { 'type': 'file', 'name': 'netscape_javascript_JSObject.h' }
                                        ] },
                                    { 'type': 'directory', 'name': 'classes', 'contents': [
                                            { 'type': 'directory', 'name': 'CVS', 'contents': [
                                                    { 'type': 'file', 'name': 'Entries' },
                                                    { 'type': 'file', 'name': 'Entries.Log' },
                                                    { 'type': 'file', 'name': 'Repository' },
                                                    { 'type': 'file', 'name': 'Root' },
                                                    { 'type': 'file', 'name': 'Tag' }
                                                ] },
                                            { 'type': 'file', 'name': 'Makefile.in' },
                                            { 'type': 'file', 'name': 'Makefile.ref' },
                                            { 'type': 'directory', 'name': 'netscape', 'contents': [
                                                    { 'type': 'directory', 'name': 'CVS', 'contents': [
                                                            { 'type': 'file', 'name': 'Entries' },
                                                            { 'type': 'file', 'name': 'Repository' },
                                                            { 'type': 'file', 'name': 'Root' },
                                                            { 'type': 'file', 'name': 'Tag' }
                                                        ] },
                                                    { 'type': 'file', 'name': 'Makefile.ref' },
                                                    { 'type': 'directory', 'name': 'javascript', 'contents': [
                                                            { 'type': 'directory', 'name': 'CVS', 'contents': [
                                                                    { 'type': 'file', 'name': 'Entries' },
                                                                    { 'type': 'file', 'name': 'Repository' },
                                                                    { 'type': 'file', 'name': 'Root' },
                                                                    { 'type': 'file', 'name': 'Tag' }
                                                                ] },
                                                            { 'type': 'file', 'name': 'JSException.java' },
                                                            { 'type': 'file', 'name': 'JSObject.java' },
                                                            { 'type': 'file', 'name': 'JSProxy.java' },
                                                            { 'type': 'file', 'name': 'JSRunnable.java' },
                                                            { 'type': 'file', 'name': 'JSUtil.java' },
                                                            { 'type': 'file', 'name': 'Makefile.ref' }
                                                        ] }
                                                ] }
                                        ] },
                                    { 'type': 'directory', 'name': 'config', 'contents': [
                                            { 'type': 'file', 'name': 'AIX4.1.mk' },
                                            { 'type': 'file', 'name': 'AIX4.2.mk' },
                                            { 'type': 'file', 'name': 'AIX4.3.mk' },
                                            { 'type': 'directory', 'name': 'CVS', 'contents': [
                                                    { 'type': 'file', 'name': 'Entries' },
                                                    { 'type': 'file', 'name': 'Repository' },
                                                    { 'type': 'file', 'name': 'Root' },
                                                    { 'type': 'file', 'name': 'Tag' }
                                                ] },
                                            { 'type': 'file', 'name': 'HP-UXB.10.10.mk' },
                                            { 'type': 'file', 'name': 'HP-UXB.10.20.mk' },
                                            { 'type': 'file', 'name': 'HP-UXB.11.00.mk' },
                                            { 'type': 'file', 'name': 'IRIX6.2.mk' },
                                            { 'type': 'file', 'name': 'IRIX6.3.mk' },
                                            { 'type': 'file', 'name': 'IRIX6.5.mk' },
                                            { 'type': 'file', 'name': 'Linux_All.mk' },
                                            { 'type': 'file', 'name': 'OSF1V4.0.mk' },
                                            { 'type': 'file', 'name': 'OSF1V5.0.mk' },
                                            { 'type': 'file', 'name': 'SunOS5.5.1.mk' },
                                            { 'type': 'file', 'name': 'SunOS5.6.mk' },
                                            { 'type': 'file', 'name': 'SunOS5.7.mk' },
                                            { 'type': 'file', 'name': 'SunOS5.8.mk' },
                                            { 'type': 'file', 'name': 'WINNT4.0.mk' }
                                        ] },
                                    { 'type': 'file', 'name': 'jsj.c' },
                                    { 'type': 'file', 'name': 'jsj.msg' },
                                    { 'type': 'file', 'name': 'jsj_JSObject.c' },
                                    { 'type': 'file', 'name': 'jsj_JavaArray.c' },
                                    { 'type': 'file', 'name': 'jsj_JavaClass.c' },
                                    { 'type': 'file', 'name': 'jsj_JavaMember.c' },
                                    { 'type': 'file', 'name': 'jsj_JavaObject.c' },
                                    { 'type': 'file', 'name': 'jsj_JavaPackage.c' },
                                    { 'type': 'file', 'name': 'jsj_array.c' },
                                    { 'type': 'file', 'name': 'jsj_class.c' },
                                    { 'type': 'file', 'name': 'jsj_convert.c' },
                                    { 'type': 'file', 'name': 'jsj_field.c' },
                                    { 'type': 'file', 'name': 'jsj_hash.c' },
                                    { 'type': 'file', 'name': 'jsj_hash.h' },
                                    { 'type': 'file', 'name': 'jsj_method.c' },
                                    { 'type': 'file', 'name': 'jsj_nodl.c' },
                                    { 'type': 'file', 'name': 'jsj_private.h' },
                                    { 'type': 'file', 'name': 'jsj_simpleapi.c' },
                                    { 'type': 'file', 'name': 'jsj_utils.c' },
                                    { 'type': 'file', 'name': 'jsjava.h' },
                                    { 'type': 'file', 'name': 'liveconnect.pkg' },
                                    { 'type': 'file', 'name': 'netscape_javascript_JSObject.h' },
                                    { 'type': 'file', 'name': 'nsCLiveconnect.cpp' },
                                    { 'type': 'file', 'name': 'nsCLiveconnect.h' },
                                    { 'type': 'file', 'name': 'nsCLiveconnectFactory.cpp' },
                                    { 'type': 'file', 'name': 'nsCLiveconnectFactory.h' },
                                    { 'type': 'file', 'name': 'nsILiveconnect.h' },
                                    { 'type': 'file', 'name': 'nsISecureLiveconnect.h' },
                                    { 'type': 'file', 'name': 'nsISecurityContext.h' },
                                    { 'type': 'file', 'name': 'win32.order' }
                                ] },
                            { 'type': 'file', 'name': 'lock_SunOS.s' },
                            { 'type': 'file', 'name': 'perfect.js' },
                            { 'type': 'directory', 'name': 'perlconnect', 'contents': [
                                    { 'type': 'directory', 'name': 'CVS', 'contents': [
                                            { 'type': 'file', 'name': 'Entries' },
                                            { 'type': 'file', 'name': 'Repository' },
                                            { 'type': 'file', 'name': 'Root' },
                                            { 'type': 'file', 'name': 'Tag' }
                                        ] },
                                    { 'type': 'file', 'name': 'JS.def' },
                                    { 'type': 'file', 'name': 'JS.dsp' },
                                    { 'type': 'file', 'name': 'JS.pm' },
                                    { 'type': 'file', 'name': 'JS.xs' },
                                    { 'type': 'file', 'name': 'Makefile.PL' },
                                    { 'type': 'file', 'name': 'Makefile.ref' },
                                    { 'type': 'file', 'name': 'PerlConnect.dsp' },
                                    { 'type': 'file', 'name': 'PerlConnect.dsw' },
                                    { 'type': 'file', 'name': 'PerlConnect.pm' },
                                    { 'type': 'file', 'name': 'PerlConnectShell.dsp' },
                                    { 'type': 'file', 'name': 'README.html' },
                                    { 'type': 'file', 'name': 'bg.jpg' },
                                    { 'type': 'file', 'name': 'jsperl.c' },
                                    { 'type': 'file', 'name': 'jsperl.h' },
                                    { 'type': 'file', 'name': 'jsperlbuild.pl' },
                                    { 'type': 'file', 'name': 'jsperlpvt.h' },
                                    { 'type': 'file', 'name': 'test.js' },
                                    { 'type': 'file', 'name': 'test.pl' },
                                    { 'type': 'file', 'name': 'typemap' }
                                ] },
                            { 'type': 'file', 'name': 'plify_jsdhash.sed' },
                            { 'type': 'file', 'name': 'prmjtime.c' },
                            { 'type': 'file', 'name': 'prmjtime.h' },
                            { 'type': 'file', 'name': 'resource.h' },
                            { 'type': 'file', 'name': 'rules.mk' },
                            { 'type': 'file', 'name': 'win32.order' }
                        ] }
                ] }
        ] };
    elem.innerHTML = template.render(data);

})));
