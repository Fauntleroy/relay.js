var PORT = process.env.PORT || 8080;

// We want _
var _ = require('lodash');

// Set up Express
var express = require('express');
var server = express();

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

io.sockets.on( 'connection', function( client ){

	console.log( '>> CLIENT CONNECT' );

	client.on( 'new_irc_connection', function( parameters ){

		console.log( '>> CLIENT CONNECT TO SERVER:', parameters );

		var irc_adapter = new Adapter({
			server: parameters.server,
			port: parameters.port,
			password: parameters.password,
			nick: parameters.nick,
			nick_password: parameters.nick_password,
			channels: parameters.channels,
		});

		client.emit( 'irc_connection', {
			id: irc_adapter.id,
			server: irc_adapter.server,
			nick: irc_adapter.nick,
			namespace: irc_adapter.namespace
		});

		console.log( '>> IRC CLIENT', irc_adapter.client );

	});

});

// Set up asset management for Express
var igneous = require('igneous');
var igneous_middleware = igneous({
	http_server: http_server,
	io: io,
	root: __dirname +'/assets',
	minify: false,
	flows: [
		{
			route: '/styles/irc.css',
			type: 'css',
			base: '/styles',
			paths: [
				'/vendor/bootstrap',
				'/vendor/jquery.sparkartTags',
				'/bootstrap_overrides.styl',
				'/sparkartTags_overrides.styl',
				'/emoji.styl',
				'/irc.styl',
				'/connections.styl',
				'/channels.styl',
				'/channel.styl',
				'/messages.styl',
				'/users.styl'
			]
		},
		{
			route: '/scripts/irc.js',
			type: 'js',
			base: '/scripts',
			paths: [
				'/vendor/jquery',
				'/vendor/jquery.links',
				'/vendor/jquery.emojify',
				'/vendor/jquery.serializeObject',
				'/vendor/jquery.sparkartTags',
				'/vendor/bootstrap',
				'/vendor/underscore',
				'/vendor/backbone',
				'/vendor/glenoid',
				'/vendor/handlebars',
				'/handlebars_helpers.js',
				'/irc.js',
				'/models',
				'/collections',
				'/views',
				'/routers',
				'application.js'
			]
		},
		{
			route: '/templates/irc.js',
			type: 'jst',
			jst_lang: 'handlebars',
			jst_namespace: 'templates',
			base: '/templates',
			paths: ['/']
		}
	]
});
server.use( igneous_middleware );
server.use( express.static('./assets') );

// Set up templates for Express
var hogy = require('hogy');
var hogy_engine = hogy.init();
server.set( 'view engine', 'tpl' );
server.set( 'views', __dirname +'/templates' );
server.engine( 'tpl', hogy_engine );

// Routes
server.get( '/', function( req, res ){

	res.render( 'index.tpl', {});

});