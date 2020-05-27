let source = ` 	{-- Comment test --}
{a.b.c.d.e.f}`;

let tpl = IJ2TPL.parse(source);

expected(tpl.render({a: { b: { c: { d: { e: { f: 9 }}}}}}), '\n9');
