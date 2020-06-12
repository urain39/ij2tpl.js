var fs = require('fs');

var IJ2TPL = require('./dist/ij2tpl.min');
var CHANGES = require('./changes');

var template = fs.readFileSync('./_templates/CHANGELOG.md.ij2', 'utf-8');

template = IJ2TPL.parse(template);

fs.writeFileSync('./CHANGELOG.md', template.render(CHANGES));
