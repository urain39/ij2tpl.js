let fs = require('fs');

let IJ2TPL = require('./dist/ij2tpl.min');

// Changelog
let CHANGES = require('./_datas/changes');

let CHANGELOG_TEMPLATE = fs.readFileSync('./_templates/CHANGELOG.md.ij2', 'utf-8');

CHANGELOG_TEMPLATE = IJ2TPL.parse(CHANGELOG_TEMPLATE);

fs.writeFileSync('./CHANGELOG.md', CHANGELOG_TEMPLATE.render(CHANGES));

// Authors
let AUTHORS = require('./_datas/authors');

let AUTHORS_TEMPLATE = fs.readFileSync('./_templates/AUTHORS.md.ij2', 'utf-8');

AUTHORS_TEMPLATE = IJ2TPL.parse(AUTHORS_TEMPLATE);

fs.writeFileSync('./AUTHORS.md', AUTHORS_TEMPLATE.render(AUTHORS));
