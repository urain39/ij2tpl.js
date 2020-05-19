var IJ2TPL = require('../dist/ij2tpl.min');

// CR
let source = `    {?name}\r\
{#name}
{/name}
`;

let tpl = IJ2TPL.parse(source);

var exists = false;

for (const token of tpl.treeRoot)
	if (token[1] === '') exists = true;

if (!exists)
	console.log(`${__filename}: PASS`);
else
	console.log(`${__filename}: FAIL`);

