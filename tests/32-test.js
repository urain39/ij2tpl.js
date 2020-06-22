let i = 0;

IJ2TPL.setFilterMap({
	action: () => i++,
});

let source1 = `{\r	|\r\n	 action }`;

let tpl1 = IJ2TPL.parse(source1);

expected(tpl1.render(), '0');
expected(tpl1.render(), '1');
expected(tpl1.render(), '2');
