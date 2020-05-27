let tpl = IJ2TPL.parse('Hello');

expected(tpl.render({names: ['uzilla', 'urain39']}), 'Hello');
