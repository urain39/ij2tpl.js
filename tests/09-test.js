let source = `{a.content}`;

let tpl = IJ2TPL.parse(source);

expected(tpl.render({a: {content: `&<>"'\`=/`}}), '&amp;&lt;&gt;&quot;&#39;&#x60;&#x3D;&#x2F;')
