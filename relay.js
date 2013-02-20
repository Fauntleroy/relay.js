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

// Start webserver
var server = require('./lib/server.js');

server({
	home_dir: __dirname
});