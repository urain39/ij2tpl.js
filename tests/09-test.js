var { IJ2TPL } = require('../dist/ij2tpl.min');

let source = `\
{IJ2TPL.info.version.0}
{?names}
	{?valid}{user.name}(length: {user.name.length}){*valid}NO{/valid}
{/names}\
`;

let tpl = IJ2TPL.parse(source);

if (tpl.render({IJ2TPL: {info: {version: [1,0,0]}}, names: [{valid: true, user: {name: 'uzilla'}}, {valid: false, name: 'urain39'}]}) === '1\n\n\tuzilla(length: 6)\n\n\tNO\n')
	console.log(`${__filename}: PASS`);
else
	console.log(`${__filename}: FAIL`);
