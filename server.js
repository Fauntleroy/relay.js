// We want _
var _ = require('lodash');

// Set up Express
var express = require('express');
var server = express();

// Set up asset management for Express
var igneous = require('igneous');
var igneous_middleware = igneous({
	root: __dirname +'/assets',
	minify: false,
	flows: [
		{
			route: '/styles/irc.css',
			type: 'css',
			base: '/styles',
			paths: [
				'/vendor/bootstrap',
				'/irc.styl',
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
				'/vendor/jquery.serializeObject',
				'/vendor/bootstrap',
				'/vendor/underscore',
				'/vendor/backbone',
				'/vendor/glenoid',
				'/vendor/handlebars',
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

// Set up templates for Express
var hogy = require('hogy');
var hogy_engine = hogy.init();
server.set( 'view engine', 'tpl' );
server.set( 'views', __dirname +'/templates' );
server.engine( 'tpl', hogy_engine );

// Set up HTTP server to be used with Socket.io/Express
var http = require('http');
var http_server = http.createServer( server );
http_server.listen( 8080 );

// Routes
server.get( '/', function( req, res ){

	res.render( 'index.tpl', {});

});

// Set up Socket.io
var socketio = require('socket.io');
var io = socketio.listen( http_server );

io.configure( function(){
	io.set( 'close timeout', 30 );
});

var Client = require('./irc_client.js')( io );

io.sockets.on( 'connection', function( client ){

	console.log( '>> CLIENT CONNECT' );

	client.on( 'new_irc_connection', function( parameters ){

		console.log( '>> CLIENT CONNECT TO SERVER:', parameters );

		var irc_client = new Client({
			server: parameters.server,
			nick: parameters.nick,
			channels: parameters.channels.split(',')
		});

		client.emit( 'irc_connection', {
			id: irc_client.id,
			server: irc_client.server,
			nick: irc_client.nick,
			namespace: irc_client.namespace
		});

	});

	client.on( 'disconnect', function(){

		console.log( '>> CLIENT DISCONNECT FROM SERVER' );

	});

});