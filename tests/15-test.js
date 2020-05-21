let source = 'Hello {#name}{name}';

let tpl = IJ2TPL.parse(source);

assert.deepStrictEqual(tpl.render({name: '<b>urain39</b>'}), 'Hello <b>urain39</b>&lt;b&gt;urain39&lt;&#x2F;b&gt;');
