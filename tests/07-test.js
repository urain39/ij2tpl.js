let source = `{
? .
}#T{

* .

}\r\n#F{	/.\n\r
}`;

let tpl = IJ2TPL.parse(source);

assert.deepStrictEqual(tpl.render([]), '#F')
assert.deepStrictEqual(tpl.render([0]), '#T')
