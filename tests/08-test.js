var { IJ2TPL } = require('../dist/ij2tpl.min');

let source = `\
{?names}
	{?valid}{user.name}(length: {user.name.length}){*valid}NO{/valid}
{/names}\
`;

let tpl = IJ2TPL.parse(source);

if (tpl.render({names: [{valid: true, user: {name: 'uzilla'}}, {valid: false, name: 'urain39'}]}) === '\n\tuzilla(length: 6)\n\n\tNO\n')
	console.log(`${__filename}: PASS`);
else
	console.log(`${__filename}: FAIL`);
