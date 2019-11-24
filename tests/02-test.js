var IJ2TPL = require('../dist/ij2tpl.min');

let source = `\
{?names}
	{.}
{*names}
{/names}\
`;

let tpl = IJ2TPL.parse(source);

if (tpl.render({names: null}) === '\n')
	console.log(`${__filename}: PASS`);
else
	console.log(`${__filename}: FAIL`);
