expected(IJ2TPL.escape(996), "996");
IJ2TPL.setEscapeFunction((value) => `'${value}'`);
expected(IJ2TPL.escape(996), "'996'");

// TODO: Reset
IJ2TPL.setEscapeFunction(v => v);
