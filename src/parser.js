"use strict";
// Copyright (c) 2018-2019 urain39 <urain39[AT]qq[DOT]com>
exports.__esModule = true;
var tokenizer_1 = require("./tokenizer");
var renderer_1 = require("./renderer");
function buildTree(tokens) {
    var token, type, value, section, sections = [], treeRoot = [], collector = treeRoot;
    for (var i = 0; i < tokens.length; i++) {
        token = tokens[i];
        type = token[0 /* TYPE */];
        value = token[1 /* VALUE */];
        switch (type) {
            case 0 /* IF */:
            case 1 /* NOT */:
                collector.push(token);
                section = token;
                sections.push(section);
                section[3 /* ELSE_BLOCK */] = null;
                collector = section[2 /* BLOCK */] = [];
                break;
            case 2 /* ELSE */:
                section = sections[sections.length - 1];
                if (!section || section[0 /* TYPE */] !== 0 /* IF */ || value !== section[1 /* VALUE */])
                    throw new SyntaxError("Unexpected token '<type=" + type + ", value=" + value + ">'");
                collector = section[3 /* ELSE_BLOCK */] = [];
                break;
            case 3 /* END */:
                section = sections.pop();
                if (!section || value !== section[1 /* VALUE */])
                    throw new SyntaxError("Unexpected token '<type=" + type + ", value=" + value + ">'");
                if (section[3 /* ELSE_BLOCK */] instanceof Array && sections.length > 0)
                    section[0 /* TYPE */] = 2 /* ELSE */;
                if (sections.length > 0)
                    collector = (section = sections[sections.length - 1], section[3 /* ELSE_BLOCK */] instanceof Array) ?
                        section[3 /* ELSE_BLOCK */] : section[2 /* BLOCK */];
                else
                    collector = treeRoot;
                break;
            default:
                collector.push(token);
        }
    }
    if (sections.length > 0) {
        section = sections.pop();
        type = section[0 /* TYPE */];
        value = section[1 /* VALUE */];
        throw new SyntaxError("No match section '<type=" + type + ", value=" + value + ">'");
    }
    return treeRoot;
}
function parse(source, prefix, suffix) {
    if (prefix === void 0) { prefix = '{'; }
    if (suffix === void 0) { suffix = '}'; }
    var treeRoot = buildTree(tokenizer_1.tokenize(source, prefix, suffix));
    return new renderer_1.Renderer(treeRoot);
}
exports.parse = parse;
