var IJ2TPL = require('../dist/ij2tpl.min');

let source = `\
{?names}
	{?valid}{name}{/valid}
{/names}\
`;

let tpl = IJ2TPL.parse(source);

if (tpl.render({names: [{valid: true, name: 'uzilla'}, {valid: false, name: 'urain39'}]}) === 'uzilla')
	console.log(`${__filename}: PASS`);
else
	console.log(`${__filename}: FAIL`);
