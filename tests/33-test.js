IJ2TPL.setFilterMap({
	toUpper: string_ => string_.toUpperCase(),
	not: value => !value
});

let source1 = `{name | toUpper}`,
	source2 = `{? true_ | not}#T{* true_ | not}#F{/ true_ | not}`;

let tpl1 = IJ2TPL.parse(source1),
	tpl2 = IJ2TPL.parse(source2);

expected(tpl1.render({name: "uzilla"}), 'UZILLA');
expected(tpl2.render({true_: true}), '#F');
expected(tpl2.render({true_: false}), '#T');

