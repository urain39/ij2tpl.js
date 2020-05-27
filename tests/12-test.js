let source = `{a}{?a}{a}{/a}`;

let tpl = IJ2TPL.parse(source);

expected(tpl.render({a: { a: 9 }}), `[object Object]9`);
