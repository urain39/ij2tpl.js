let source = `{?.}#T{*.}#F{/.}`;

let tpl = IJ2TPL.parse(source);

assert.deepStrictEqual(tpl.render([]), '#F')
assert.deepStrictEqual(tpl.render([0]), '#T')
