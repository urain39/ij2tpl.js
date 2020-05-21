let source = `{   #   content


		

}`;

let tpl = IJ2TPL.parse(source);

assert.deepStrictEqual(tpl.render({content: `<script>alert('XSS Test');</script>`}), `<script>alert('XSS Test');</script>`);
