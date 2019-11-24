var IJ2TPL = require('../dist/ij2tpl.min');

let source = `Hello`;

let tpl = IJ2TPL.parse(source);

if (tpl.render({names: ['uzilla', 'urain39']}) === 'Hello')
	console.log(`${__filename}: PASS`);
else
	console.log(`${__filename}: FAIL`);

