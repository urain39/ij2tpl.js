// CR
let source = `    {?name}\r\
{#name}
{/name}
`;

let tpl = IJ2TPL.parse(source);

var exists = false;

for (const token of tpl.root)
	if (token[1] === '') exists = true;

expected(exists, false);
