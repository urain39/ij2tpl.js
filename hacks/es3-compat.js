const fs = require('fs'),
	pkg = require('../package'),
	umd = './dist/ij2tpl.umd.js';


let source = fs.readFileSync(umd, 'utf-8');

source = source.replace(`Object.defineProperty(exports, '__esModule', { value: true });`, `exports.__esModule = true;`);

fs.writeFileSync(umd, source);
