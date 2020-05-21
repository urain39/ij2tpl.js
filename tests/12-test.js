let source = `{a}{?a}{a}{/a}`;

let tpl = IJ2TPL.parse(source);

assert.deepStrictEqual(tpl.render({a: { a: 9 }}), `[object Object]9`);
