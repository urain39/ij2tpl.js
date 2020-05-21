var IJ2TPL = require('../dist/ij2tpl.min');

// CR
let source = `{?name}\r\
{#name}
{/name}
`;

let tpl = IJ2TPL.parse(source);

if (tpl.render({name: '<b>urain39</b>'}) === '<b>urain39</b>\n')
	console.log(`${__filename}: PASS`);
else
	console.log(`${__filename}: FAIL`),
	process.exit(1);
