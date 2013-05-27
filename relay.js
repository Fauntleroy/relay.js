var fs = require('fs');
var _ = require('lodash');
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

// Pull in configuration data
var config = {
	presets: {}, // mandatory options
	defaults: {
		server: {}
	} // optional options
};
try { _( config ).extend( require('./config.js') ); } catch( err ){}
if( config.presets.server ) config.max_connections = config.max_connections || 1;

// Start webserver
var server = require('./lib/server.js');

server( config );
