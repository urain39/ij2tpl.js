let source = `{a.b.c.d.e.f}`;

let tpl = IJ2TPL.parse(source);

expected(tpl.render({a: { b: { c: { d: { e: { f: 9 }}}}}}), '9');
