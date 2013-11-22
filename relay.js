var fs = require('fs');
var _ = require('underscore');
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
	defaults: {
		server: {},
		channels: []
	}
};
try { _( config ).extend( require('./config.js') ); } catch( err ){}
if( config.defaults.server.locked ) config.max_connections = config.max_connections || 1;

// Start webserver
var server = require('./lib/server.js');

server( config );
