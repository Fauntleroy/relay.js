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

// Set up Socket.io
var socketio = require('socket.io');
var io = socketio.listen( http_server );

// Set up IRC
var irc = require('irc');
var clients = {};
var Client = function( parameters ){

	if( clients[parameters.server +'/'+ parameters.user] ) return clients[parameters.server +'/'+ parameters.user];

	var irc_client = new irc.Client( parameters.server, parameters.user, {
		channels: parameters.channels
	});

	irc_client.addListener( 'registered', function( message ){
		console.log( '>>> REGISTERED.', message );
	});

	irc_client.addListener( 'motd', function( motd ){
		console.log( '>>> MOTD.', motd );
	});

	irc_client.addListener( 'topic', function( channel, topic, nick, message ){
		console.log( '>>> TOPIC.', channel, topic, nick, message );
	});

	io.of( '/'+ parameters.server +'/'+ parameters.user ).on( 'connection', function( client ){

		console.log( '>>> SOCKET CONNECTED!!!' );

		irc_client.addListener( 'join', function( channel, nick, message ){
			console.log( '>>> JOIN.', channel, nick, message );
			client.emit( 'join', channel, nick, message );
		});

		irc_client.addListener( 'part', function( channel, nick, reason, message ){
			client.emit( 'part', channel, nick, reason, message );
		});

		irc_client.addListener( 'names', function( channel, nicks ){
			console.log( '>>> NAMES.', nicks );
			client.emit( 'names', channel, nicks );
		});

		irc_client.addListener( 'message', function( from, to, message ){
			console.log( '>>> MESSAGE, from: '+ from +', to: '+ to +', message: '+ message );
			client.emit( 'message', from, to, message );
		});

		client.on( 'join', function( channel ){
			irc_client.join( channel );
		});

		client.on( 'part', function( channel ){
			irc_client.part( channel );
		});

		client.on( 'say', function( target, message ){
			console.log('say:',target,message);
			irc_client.say( target, message );
			client.emit( 'message', parameters.user, target, message );
		});

		client.emit( 'chans', _(irc_client.chans).keys() );
		
	});

	clients[parameters.server +'/'+ parameters.user] = this;

};

// Routes
server.get( '/', function( req, res ){

	var client = new Client({
		server: 'irc.freenode.net',
		user: 'irchub',
		channels: ['#irchub']
	});

	res.render( 'index.tpl', {

	});

});