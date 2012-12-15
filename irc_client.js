var irc = require('irc');
var _ = require('lodash');
var uuid = require('node-uuid');

module.exports = function( io ){

	var Client = function( parameters ){

		var irchub_client = this;
		this.id = uuid.v1();
		this.server = parameters.server;
		this.nick = parameters.nick;
		this.namespace = '/connections/'+ this.id;

		var irc_client = new irc.Client( parameters.server, parameters.nick, {
			channels: parameters.channels,
			floodProtection: false,
			floodProtectionDelay: 1000
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

		io.of( this.namespace ).on( 'connection', function( client ){

			console.log( '>>> SOCKET CONNECTED!!!' );

			client.on( 'disconnect', function(){

				console.log( '>>> SOCKET DISCONNECTED!!!' );

				irc_client.disconnect();

			});

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
				client.emit( 'message', irchub_client.nick, target, message );
			});

			client.emit( 'chans', _(irc_client.chans).keys() );
			
		});

	};

	return Client;

};