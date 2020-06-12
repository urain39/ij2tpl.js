let source = `{}`;

let tpl = IJ2TPL.parse(source);

expected(tpl.root.length, 0);
