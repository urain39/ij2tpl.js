let source = `\
{?names}
	{?valid}{name}{/valid}
{/names}\
`;

let tpl = IJ2TPL.parse(source);

assert.deepStrictEqual(tpl.render({names: [{valid: true, name: 'uzilla'}, {valid: false, name: 'urain39'}]}), 'uzilla');
