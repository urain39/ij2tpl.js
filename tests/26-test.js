let source = `{ \r\n\t}`;

let tpl = IJ2TPL.parse(source);

expected(tpl.root.length, 0);
