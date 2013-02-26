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

var config_exists = fs.existsSync('config.json');
var config = ( config_exists )
	? JSON.parse( fs.readFileSync( 'config.json', DEFAULT_ENCODING ) )
	: {};
if( config.preset_server ) config.max_connections = config.max_connections || 1;

// Start webserver
var server = require('./lib/server.js');

server({
	home_dir: __dirname,
	preset_server: config.preset_server,
	max_connections: config.max_connections
});