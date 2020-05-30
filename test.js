const assert = require('assert').strict,
	fs = require('fs'),
	path = require('path'),
	vm = require('vm');

const IJ2TPL = require('./dist/ij2tpl.min');

const TESTDIR = './tests';

fs.readdirSync(TESTDIR).forEach(function(filename) {
	filename = path.join(TESTDIR, filename);

	let stats = fs.statSync(filename, 'utf-8');

	if (stats.isFile()) {
		try {
			vm.runInNewContext(fs
				.readFileSync(filename)
			, { IJ2TPL, expected: assert.deepStrictEqual });
		} catch (error) {
			console.log(filename + ': Error!');
			console.error(error);
		}
	}
});
