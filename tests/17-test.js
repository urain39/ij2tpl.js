let source = `{      content


		

}`;

let tpl = IJ2TPL.parse(source);

expected(tpl.render({content: `<script>alert('XSS Test');</script>`}), `&lt;script&gt;alert(&#39;XSS Test&#39;);&lt;&#x2F;script&gt;`);
