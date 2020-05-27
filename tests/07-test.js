let source = `{
? .
}#T{

* .

}\r\n#F{	/.\n\r
}`;

let tpl = IJ2TPL.parse(source);

expected(tpl.render([]), '#F')
expected(tpl.render([0]), '#T')
