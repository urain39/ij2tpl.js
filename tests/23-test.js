// CRLF
let source = `{?name}\r
\r\n{#name}
{/name}
`;

let tpl = IJ2TPL.parse(source);

assert.deepStrictEqual(tpl.render({name: '<b>urain39</b>'}), '\r\n<b>urain39</b>\n');
