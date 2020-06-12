let source = `{}`;

let tpl = IJ2TPL.parse(source);

expected(tpl.treeRoot.length, 0);
