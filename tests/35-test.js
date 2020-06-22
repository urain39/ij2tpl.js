let source2 = `{do}`;

let tpl2 = IJ2TPL.parse(source2);

expected(tpl2.render({do: 0}), '0');
expected(tpl2.render({do: 1}), '1');
expected(tpl2.render({do: 2}), '2');
