var DEFAULT_ENCODING = process.env.DEFAULT_ENCODING || 'UTF8';

var fs = require('fs');

// Shortcut to command line options
var optimist = require('optimist');
var argv = optimist.argv;

// Setup logger
var winston = require('winston');
winston.loggers.add( 'development', {
	console: {
		colorize: true,
		label: 'development',
		level: ( argv.debug )? 'info': 'error'
	}
});

// Gather configuration info from config.json
var getConfig = function( callback ){
	fs.readFile( 'config.json', DEFAULT_ENCODING, function( err, data ){
		if( err ) return callback( err, {} );
		var config = JSON.parse( data );
		if( config.preset_server ) config.max_connections = config.max_connections || 1;
		callback( null, config );
	});
};

getConfig( function( err, config ){

	// Start webserver
	var server = require('./lib/server.js');

	server({
		home_dir: __dirname,
		preset_server: config.preset_server,
		max_connections: config.max_connections,
		suggested_channels: config.suggested_channels || []
	});

});
