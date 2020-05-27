let source = `{content}`;

let tpl = IJ2TPL.parse(source);

expected(tpl.render({content: `&<>"'\`=/`}), '&amp;&lt;&gt;&quot;&#39;&#x60;&#x3D;&#x2F;')
