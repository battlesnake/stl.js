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
		header: { name: 'gear' },
		triangles: [
			{
				normal: [0, 0, 0],
				vertices: [[0, 0, 0], [1, 0, 0], [1, 2.125, 3e+4]]
			},
		]
	};

	it('Parses gear file', function () {
		var data = fs.readFileSync(path.join(__dirname, 'gear.stl'));
		expect(function () { STLParser.parse(data); }).to.not.throw();
	});

	it('Parses gear via stream', function (done) {
		fs.createReadStream(path.join(__dirname, 'gear.stl'))
			.pipe(new STLParser.Transform())
			.on('data', function (b) {})
			.on('error', done)
			.on('finish', done);
	});

});
