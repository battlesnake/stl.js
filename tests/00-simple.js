'use strict';

var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

describe('ASCII engine', function () {
	var fs = require('fs');
	var path = require('path');
	var STLParser = require('../');

	var expected = {
		format: 'ascii',
		header: { name: 'simple' },
		triangles: [
			{
				normal: [0, 1, 0],
				vertices: [[1, 5, 1], [3, 6, 3.625e-2], [1, 2.0375, 3e+4]]
			},
		]
	};

	it('Parses simple file correctly', function () {
		var data = fs.readFileSync(path.join(__dirname, 'simple.stl'));
		var stl = STLParser.parse(data);
		expect(stl).to.deep.equal(expected);
	});

	it('Parses simple file via stream correctly', function (done) {
		var stl = { triangles: [] };
		fs.createReadStream(path.join(__dirname, 'simple.stl'))
			.pipe(new STLParser.ParseStream())
			.on('format', function (format) {
				stl.format = format;
			})
			.on('header', function (header) {
				stl.header = header;
			})
			.on('data', function (triangle) {
				stl.triangles.push(triangle);
			})
			.on('finish', function () {
				expect(stl).to.deep.equal(expected);
				done();
			});
	});

});
