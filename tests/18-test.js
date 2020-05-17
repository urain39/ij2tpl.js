var IJ2TPL = require('../dist/ij2tpl.min');

let source = `{   #   content


		

}`;

let tpl = IJ2TPL.parse(source);

if (tpl.render({content: `<script>alert('XSS Test');</script>`}) === `<script>alert('XSS Test');</script>`)
	console.log(`${__filename}: PASS`);
else
	console.log(`${__filename}: FAIL`);
