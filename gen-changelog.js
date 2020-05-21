var fs = require('fs');

var IJ2TPL = require('./dist/ij2tpl.min');
var CHANGES = require('./changes');

var template = fs.readFileSync('./templates/CHANGELOG.md.ij2');

template = IJ2TPL.parse(template.toString());

fs.writeFileSync('./CHANGELOG.md', template.render(CHANGES));
