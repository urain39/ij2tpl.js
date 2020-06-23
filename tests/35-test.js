const IJ2TPL2 = Object.assign({}, IJ2TPL);

IJ2TPL.setFilterMap({
	alwaysFalse: () => false
});

let source1 = `{do | alwaysFalse}`;

let tpl1 = IJ2TPL.parse(source1);

expected(tpl1.render({do: 0}), 'false');
expected(tpl1.render({do: 1}), 'false');
expected(tpl1.render({do: 2}), 'false');


let source2 = `{do}`;

let tpl2 = IJ2TPL2.parse(source2);

expected(tpl2.render({do: 0}), '0');
expected(tpl2.render({do: 1}), '1');
expected(tpl2.render({do: 2}), '2');
