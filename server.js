// Set up Express
var express = require('express');
var server = express();

// Set up asset management for Express
var igneous = require('igneous');
var igneous_middleware = igneous({
	root: __dirname +'/assets',
	minify: true,
	flows: [
		{
			route: 'styles.css',
			type: 'css',
			base: '/styles',
			paths: [
				'/'
			]
		},
		{
			route: 'irc.js',
			type: 'js',
			base: '/scripts',
			paths: [
				'/vendor/jquery',
				'/vendor/underscore',
				'/vendor/backbone',
				'/vendor/glenoid',
				'/vendor/handlebars',
				'irc.js'
			]
		}
	]
});

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
var irc_client = new irc.Client( 'irc.freenode.net', 'fauntlebot', {
	channels: ['#irchub']
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

irc_client.addListener( 'names', function( channel, names ){
	console.log( '>>> NAMES.', names );
});

irc_client.addListener( 'join', function( channel, nick, message ){
	console.log( '>>> JOIN.', channel, nick, message );
});

irc_client.addListener( 'message', function( from, to, message ){
	console.log( '>>> MESSAGE, from: '+ from +', to: '+ to +', message: '+ message );
});

// Routes
server.get( '/', function( req, res ){

	res.render( 'index.tpl', {

	});

});