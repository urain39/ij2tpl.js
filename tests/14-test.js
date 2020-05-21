let source = `{a}{?a}{a}{/a}`;

let tpl = IJ2TPL.parse(source);

assert.deepStrictEqual(tpl.render({a: { a: function(context) {
	return context.resolve('b') + 1;
}}, b: 9}), '[object Object]10');
