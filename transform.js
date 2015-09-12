'use strict';

var Transform = require('stream').Transform;
var util = require('util');

module.exports = STLParser;

var getFormat = require('./get-format');
var engines = require('./engines');

function STLParser() {
	if (!(this instanceof STLParser)) {
		return new STLParser();
	}
	Transform.call(this, { objectMode: true, highWaterMark: 1024 });
	this.__buffer = null;
	this.__engine = null;
	this.__hasHeader = false;
	this.__doTransform = doTransform;
}

util.inherits(STLParser, Transform);

STLParser.prototype._transform = stlTransform;
STLParser.prototype._flush = stlFlush;

function stlTransform(chunk, encoding, done) {
	this.__doTransform(chunk);
	if (this.__engine.done) {
		this.emit('finish');
	}
	return done();
}

function stlFlush(done) {
	this.__engine.ending();
	this._transform(null, null, flushed.bind(this));
	function flushed () {
		if (!this.__engine || !this.__engine.done) {
			throw new Error('Reached end of stream while parsing STL file');
		}
		return done();
	}
}

/* Synchronous */
function doTransform(chunk) {
	if (this.__engine && this.__engine.done) {
		return;
	}
	/* 1. Identify format (ASCII/Binary) */
	if (this.__engine === null) {
		if (this.__buffer) {
			this.__buffer = Buffer.concat(this.__buffer, chunk);
		} else {
			this.__buffer = chunk;
		}
		var format = getFormat(this.__buffer);
		if (!format) {
			return;
		}
		this.__buffer = null;
		this.__engine = new engines[format]();
		this.emit('format', format);
	}
	var engine = this.__engine;
	engine.write(chunk);
	/* 2. Get binary header or ascii model name */
	if (!this.__hasHeader) {
		var header = engine.readHeader();
		if (!header) {
			return;
		}
		this.__hasHeader = true;
		this.emit('header', header);
	}
	/* 3. Parse triangles */
	var triangle;
	while ((triangle = engine.readTriangle())) {
		if (triangle === true) {
			continue;
		}
		this.push(triangle);
	}
}
