let source = `\
{?names}
	{.}
{/names}\
`;

let tpl = IJ2TPL.parse(source);

expected(tpl.render({names: ['uzilla', 'urain39']}), '\tuzilla\n\turain39\n');
