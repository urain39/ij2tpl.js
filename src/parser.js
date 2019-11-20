"use strict";
exports.__esModule = true;
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
                    throw new SyntaxError("No match token '<type=" + type + ", value=" + value + ">'");
                collector = section[3 /* ELSE_BLOCK */] = [];
                break;
            case 3 /* END */:
                section = sections.pop();
                if (!section || value !== section[1 /* VALUE */])
                    throw new SyntaxError("No match token '<type=" + type + ", value=" + value + ">'");
                if (section[3 /* ELSE_BLOCK */] instanceof Array && sections.length > 0)
                    section[0 /* TYPE */] = 2 /* ELSE */;
                if (sections.length > 0)
                    collector = (section = sections[sections.length - 1], section[3 /* ELSE_BLOCK */] instanceof Array) ?
                        section[3 /* ELSE_BLOCK */] : section[2 /* BLOCK */];
                else
                    collector = treeRoot;
        }
    }
    return treeRoot;
}
exports.buildTree = buildTree;
