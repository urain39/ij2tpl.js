export var TokenTypeMap = {
    '?': 0,
    '!': 1,
    '*': 2,
    '/': 3,
    '#': 5
};
export function tokenize(source, prefix, suffix) {
    var type_, value, tokens = [];
    for (var i = 0, j = 0; i < source.length;) {
        j = source.indexOf(prefix, i);
        if (j === -1) {
            value = source.slice(i, source.length);
            if (value.length > 0)
                tokens.push([4, value]);
            break;
        }
        value = source.slice(i, j);
        j += prefix.length;
        if (value.length > 0)
            tokens.push([4, value]);
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
                tokens.push([TokenTypeMap[type_], value.slice(1)]);
                break;
            default:
                tokens.push([6, value]);
        }
    }
    return tokens;
}
