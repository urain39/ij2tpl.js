var IJ2TPL = require('../dist/ij2tpl.min');

let source = 'Hello {#nmae}';

let tpl = IJ2TPL.parse(source);

if (tpl.render({name: '<b>urain39</b>'}) === 'Hello <b>urain39</b>')
	console.log(`${__filename}: PASS`);
else
	console.log(`${__filename}: FAIL`);

