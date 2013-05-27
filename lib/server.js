var PORT = process.env.PORT || 8080;

var optimist = require('optimist');
var argv = optimist.argv;
var winston = require('winston');
var logger = winston.loggers.get('development');

module.exports = function( params ){

	// We want _
	var _ = require('lodash');

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
	server.set( 'view engine', 'hbs' );
	server.set( 'views', params.home_dir +'/templates' );
	server.engine( 'hbs', hogy_engine );

	// Routes
	server.get( '/', function( req, res ){

		res.expose({
			preset_server: params.preset_server,
			max_connections: params.max_connections,
			suggested_channels: params.suggested_channels
		}, 'irc.config' );
		res.render( 'index.hbs', {} );

	});

	var irc_adapters = [];

	server.post( '/connect', function( req, res ){

		var irc_adapter;
		var parameters = req.body;

		logger.info( 'client requesting irc connection' );

		try {

			var preset_server = params.preset_server || {};

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
