import { tokenize } from './tokenizer';
import { Renderer } from './renderer';
function buildTree(tokens) {
    var token, type, value, section, sections = [], treeRoot = [], collector = treeRoot;
    for (var i = 0; i < tokens.length; i++) {
        token = tokens[i];
        type = token[0];
        value = token[1];
        switch (type) {
            case 0:
            case 1:
                collector.push(token);
                section = token;
                sections.push(section);
                section[3] = null;
                collector = section[2] = [];
                break;
            case 2:
                section = sections[sections.length - 1];
                if (!section || section[0] !== 0 || value !== section[1])
                    throw new SyntaxError("Unexpected token '<type=" + type + ", value=" + value + ">'");
                collector = section[3] = [];
                break;
            case 3:
                section = sections.pop();
                if (!section || value !== section[1])
                    throw new SyntaxError("Unexpected token '<type=" + type + ", value=" + value + ">'");
                if (section[3] instanceof Array && sections.length > 0)
                    section[0] = 2;
                if (sections.length > 0)
                    collector = (section = sections[sections.length - 1], section[3] instanceof Array) ?
                        section[3] : section[2];
                else
                    collector = treeRoot;
                break;
            default:
                collector.push(token);
        }
    }
    if (sections.length > 0) {
        section = sections.pop();
        type = section[0];
        value = section[1];
        throw new SyntaxError("No match section '<type=" + type + ", value=" + value + ">'");
    }
    return treeRoot;
}
export function parse(source, prefix, suffix) {
    if (prefix === void 0) { prefix = '{'; }
    if (suffix === void 0) { suffix = '}'; }
    var treeRoot = buildTree(tokenize(source, prefix, suffix));
    return new Renderer(treeRoot);
}
