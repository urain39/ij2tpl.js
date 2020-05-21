let source = `{!messages}{content}{/messages}`;

let tpl = IJ2TPL.parse(source);

assert.deepStrictEqual(tpl.render({messages: [], content: `<script>alert('XSS Test');</script>`}), `&lt;script&gt;alert(&#39;XSS Test&#39;);&lt;&#x2F;script&gt;`);
