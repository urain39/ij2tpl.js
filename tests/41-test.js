let source1 = `  {@sub-tpl}`,
	source2 = `{# \r\na\t}`;


let tpl1 = IJ2TPL.parse(source1),
	tpl2 = IJ2TPL.parse(source2);

expected(tpl1.render({a: '95e2'}, {'sub-tpl': tpl2}), '  95e2');