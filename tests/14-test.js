// INFO: test for #808e99f55f277ee2d04e736195a897b3ae60225a

var IJ2TPL = require('../dist/ij2tpl.min');

let source = `{a}{?a}{a}{/a}`;

let tpl = IJ2TPL.parse(source);

if (tpl.render({a: { a: function(context) {
	return context.resolve('b')
}}, b: 9}) === `[object Object]9`)
	console.log(`${__filename}: PASS`);
else
	console.log(`${__filename}: FAIL`);
