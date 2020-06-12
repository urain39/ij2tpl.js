let source1 = `{!0}{\r? \na }{@sub-tpl}{*  a }{\n /\ra}{/0}`,
	source2 = `{# \r\na\t}`;


let tpl1 = IJ2TPL.parse(source1),
	tpl2 = IJ2TPL.parse(source2);

expected(tpl1.render({0: 0, a: {a: '95e2'} }, {'sub-tpl': tpl2}), '95e2');