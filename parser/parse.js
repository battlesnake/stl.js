'use strict';

var getFormat = require('./get-format');
var engines = require('./engines');

module.exports = parse;

function parse(stl) {
	if (typeof stl === 'string') {
		stl = new Buffer(stl);
	}
	var format = getFormat(stl);
	if (!format) {
		throw new Error('Could not determine format of STL');
	}
	var engine = new engines[format]();
	engine.write(stl);
	if (format === 'ascii') {
		engine.write(new Buffer('\n'));
	}
	stl = null;
	var header = engine.readHeader();
	if (!header) {
		throw new Error('Failed to read header of STL');
	}
	var triangles = [];
	var triangle;
	while ((triangle = engine.readTriangle())) {
		if (triangle === true) {
			continue;
		}
		triangles.push(triangle);
	}
	if (!engine.done) {
		throw new Error('Unexpected end of STL');
	}
	return {
		format: format,
		header: header,
		triangles: triangles
	};
}

