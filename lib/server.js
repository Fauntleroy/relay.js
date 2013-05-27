const PORT = process.env.PORT || 8080;

var path = require('path');
var optimist = require('optimist');
var argv = optimist.argv;
var _ = require('lodash');
var winston = require('winston');
var logger = winston.loggers.get('development');

module.exports = function( config ){

	// Set up Express
	var express = require('express');
	var expose = require('express-expose');
	var server = express();

	// Pass variables to every view
	server.locals.livereload = argv.livereload;

	// Set up HTTP server to be used with Socket.io/Express
	var http = require('http');
	var http_server = http.createServer( server );
	http_server.listen( PORT );

	// Set up Socket.io
	var socketio = require('socket.io');
	var io = socketio.listen( http_server );

	io.configure( function(){
		io.set( 'close timeout', 30 );
		io.set( 'log level', 1 );
	});

	var Adapter = require('./irc_adapter.js')( io );

	server.use( express.static('./assets') );
	server.use( express.bodyParser() );

	// Set up templates for Express
	var hogy = require('hogy');
	var hogy_engine = hogy.init();
	var templates_path = path.join( process.cwd(), 'templates' );
	server.set( 'view engine', 'hbs' );
	server.set( 'views', templates_path );
	server.engine( 'hbs', hogy_engine );

	// Routes
	server.get( '/', function( req, res ){

		// Pull in default params from URL query params
		config.defaults.server.host = req.query.server;

		var query_defaults = {
			server: {
				host: req.query.server,
				port: req.query.port,
				ssl: req.query.ssl
			},
			nick: req.query.nick,
			channels: req.query.channels
		};
		config.defaults = _( config.defaults ).extend( query_defaults );

		res.expose( config, 'irc.config' );
		res.render( 'index.hbs', {} );

	});

	var irc_adapters = [];

	server.post( '/connect', function( req, res ){

		var irc_adapter;
		var parameters = req.body;

		logger.info( 'client requesting irc connection' );

		try {

			var preset_server = config.presets.server || {};

			irc_adapter = new Adapter({
				server: preset_server.host || parameters.server,
				port: preset_server.port || parameters.port,
				password: preset_server.password || parameters.password,
				nick: parameters.nick,
				nick_password: parameters.nick_password,
				channels: parameters.channels,
				secure: !!parameters.ssl
			});

			logger.info( 'irc connection created' );

			irc_adapters.push( irc_adapter );

		}
		catch( err ){

			res.json({
				error: err.message
			});

		}

		res.json({
			id: irc_adapter.id,
			server: irc_adapter.server,
			nick: irc_adapter.nick,
			namespace: irc_adapter.namespace
		});

	});

};
