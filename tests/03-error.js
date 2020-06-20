//IJ2TPL.setFilterMap({
//	toUpper: string_ => string_.toUpperCase(),
//	not: value => !value
//});

let source1 = "{name | toUpper}",
	source2 = "{? true_ | not}#T{* true_}#F{/ true_}";

let tpl1 = IJ2TPL.parse(source1),
	tpl2 = IJ2TPL.parse(source2);

expectedError(() => tpl1.render({name: "uzilla"}), "Cannot resolve filter 'toUpper'");
expectedError(() => tpl2.render({true_: true}), "Cannot resolve filter 'not'");
expectedError(() => tpl2.render({true_: false}), "Cannot resolve filter 'not'");
