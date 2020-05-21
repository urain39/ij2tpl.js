let tpl = IJ2TPL.parse('Hello');

assert.deepStrictEqual(tpl.render({names: ['uzilla', 'urain39']}), 'Hello');
