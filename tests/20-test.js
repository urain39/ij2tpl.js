// CRLF
let source = `{?name}\r
{#name}
{/name}
`;

let tpl = IJ2TPL.parse(source);

assert.deepStrictEqual(tpl.render({name: '<b>urain39</b>'}), '<b>urain39</b>\n');
