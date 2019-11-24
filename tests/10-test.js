var IJ2TPL = require('../dist/ij2tpl.min');

let source = `{content}`;

let tpl = IJ2TPL.parse(source);

if (tpl.render({content: `<script>alert('XSS Test');</script>`}) === `&lt;script&gt;alert(&#39;XSS Test&#39;);&lt;&#x2F;script&gt;`)
	console.log(`${__filename}: PASS`);
else
	console.log(`${__filename}: FAIL`);
