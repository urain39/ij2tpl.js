// CR
let source = `    {?name}\r\
{#name}
{/name}
`;

let tpl = IJ2TPL.parse(source);

var exists = false;

for (const token of tpl.treeRoot)
	if (token[1] === '') exists = true;

assert.deepStrictEqual(exists, false);
