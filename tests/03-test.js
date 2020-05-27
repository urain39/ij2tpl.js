let source = `{!.}#F{/.}`;

let tpl = IJ2TPL.parse(source);

expected(tpl.render([]), '#F')
expected(tpl.render([0]), '')
