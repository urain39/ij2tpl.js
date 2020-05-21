let source = `{a}{?a}{a}{/a}`;

let tpl = IJ2TPL.parse(source);

assert.deepStrictEqual(tpl.render({a: { a: 0}}), `[object Object]0`);
