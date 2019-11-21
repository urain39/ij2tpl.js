module.exports = {
	mode: 'development',
	entry: __dirname + '/index.js',
	output: {
		path: __dirname + '/dist',
		filename: 'ij2tpl.js',
		libraryTarget: 'umd',
		globalObject: 'this'
	}
}
