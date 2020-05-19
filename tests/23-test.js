var IJ2TPL = require('../dist/ij2tpl.min');

// CRLF
let source = `{?name}\r
\r\n{#name}
{/name}
`;

let tpl = IJ2TPL.parse(source);

if (tpl.render({name: '<b>urain39</b>'}) === '\r\n<b>urain39</b>\n')
	console.log(`${__filename}: PASS`);
else
	console.log(`${__filename}: FAIL`);

