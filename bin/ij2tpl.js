#!/bin/env node

const fs = require('fs'),
	IJ2TPL = require('../dist/ij2tpl.min'),
	PACKAGE = require('../package');

function help() {
	process.stdout.write(`\
Usage:
	${PACKAGE.name || 'ij2tpl'} <infile> <datafile>

Version:
	${PACKAGE.version}
`);
}

function die() {
	help();
	process.exit(1);
}

if (process.argv.length != 4) die();

var infile = process.argv[2],
	datafile = process.argv[3];

try{
	process.stdout.write(IJ2TPL.parse(
		fs.readFileSync(infile).toString()
	).render(JSON.parse(
		fs.readFileSync(datafile).toString()
	)));
} catch (error) {
	console.error(error);
}
