var IJ2TPL = require('../dist/ij2tpl.min');

let source = 'Hello {#name}{name}';

let tpl = IJ2TPL.parse(source);

if (tpl.render({name: '<b>urain39</b>'}) === 'Hello <b>urain39</b>&lt;b&gt;urain39&lt;&#x2F;b&gt;')
	console.log(`${__filename}: PASS`);
else
	console.log(`${__filename}: FAIL`);

