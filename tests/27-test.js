let source = `{? \r\n\t}`;

let tpl = IJ2TPL.parse(source);

expected(tpl.treeRoot.length, 0);
