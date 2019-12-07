var IJ2TPL = require('../dist/ij2tpl.min');

let source = `{a}{?a}{a}{/a}`;

let tpl = IJ2TPL.parse(source);

if (tpl.render({a: { a: 9 }}) === `[object Object]9`)
	console.log(`${__filename}: PASS`);
else
	console.log(`${__filename}: FAIL`);
