let source = `{   #   content


		

}`;

let tpl = IJ2TPL.parse(source);

expected(tpl.render({content: `<script>alert('XSS Test');</script>`}), `<script>alert('XSS Test');</script>`);
