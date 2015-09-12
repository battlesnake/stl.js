Simple STL utils
================

Currently, just an STL parser.  It handles the most popular ASCII and binary
formats.  It can process an entire buffer synchronously, or process a stream
on-the-fly.

Synchronous immediate
---------------------

	var data = fs.readFileSync('gear.stl');
	var stl = STLParser.parse(data);

	stl = {
		format: ...,
		header: { ... },
		triangles: [{ normal: vector, vertices: [vector, ...] }, ...]
	};

Pseudo-asynchronous steam
-------------------------

	fs.createReadStream('gear.stl')
		.pipe(new STLParser.ParseStream())
		.on('format', function (format) {
		})
		.on('header', function (header) {
		})
		.on('data', function (triangle) {
		})
		.on('error', ...)
		.on('finish', ...);

I called this "pseudo" asynchronous because the actual parsing is done by JS
code, so is blocking and synchronous.  The stream wrapper provides an
asynchronous transform-stream interface around the parser, allowing sockets and
files to be easily streamed through the parser.

Result formats
--------------

 * `format` is either `binary` or `ascii`.

 * `header` is either:

   * ascii format: `{ name: 'solid name' }`

   * binary format: `{ data: <80-byte buffer>, count: number }`

 * `triangles` is an array of `triangle`.

 * `triangle` is:

		{
		    normal: [nx, ny, nz],
		    vertices: [
		        [v1x, v1y, v1z],
		        [v2x, v2y, v2z],
		        [v3x, v3y, v3z]
		    ]
		}

   For binary format, each triangle also contains an `attr` property containing
   a 16-bit integer value which has no standardized meaning.

Notes
-----

The parser strictly enforces syntax, and disallows unfamiliar tokens.  It does
*not* however perform any validation on the geometry data, including:

 * Winding direction of vertices

 * Normal agreeing with direction implied by vertices

 * Positive values only for vector entries
