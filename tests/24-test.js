var IJ2TPL = require('../dist/ij2tpl.min');

let source = `{content}`;

let tpl = IJ2TPL.parse(source);

if (tpl.render({content: `&<>"'\`=/`}) === '&amp;&lt;&gt;&quot;&#39;&#x60;&#x3D;&#x2F;')
	console.log(`${__filename}: PASS`);
else
	console.log(`${__filename}: FAIL`),
	process.exit(1);
