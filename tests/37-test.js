IJ2TPL.setFilterMap({
	noTail: (array) => array.slice(0, array.length - 1),
	tail: (array) => array[array.length - 1]
});

let source1 = `var {{?. | noTail}}{{.}}, {{/.}}{{. | tail}};`;

let tpl1 = IJ2TPL.parse(source1, '{{', '}}');

expected(tpl1.render(["i", "j", "k"]), 'var i, j, k;');
