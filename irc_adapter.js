var irc = require('irc');
var _ = require('lodash');
var uuid = require('node-uuid');

module.exports = function( io ){

	var Adapter = function( parameters ){

		var irchub_client = this;
		this.id = uuid.v1();
		this.server = parameters.server;
		this.nick = parameters.nick;
		this.namespace = '/connections/'+ this.id;
		var channels = ( _(parameters.channels).isArray() )? parameters.channels: [];
		channels = channels.map( function( channel ){
			if( channel.charAt(0) !== '#' ) channel = '#'+ channel;
			return channel;
		});

		var irc_client = this.client = new irc.Client( parameters.server, parameters.nick, {
			channels: channels,
			floodProtection: false,
			floodProtectionDelay: 1000
		});

		io.of( this.namespace ).on( 'connection', function( client ){

			console.log( '>>> SOCKET CONNECTED!!!' );

			// Send IRC events to our client-side script
			irc_client.addListener( 'registered', function( message ){
				client.emit( 'registered', message );
				console.log( '>>> REGISTERED.', message );
			});

			irc_client.addListener( 'join', function( channel, nick, message ){
				console.log( '>>> JOIN', channel, nick );
				client.emit( 'join', channel, nick );
			});

			irc_client.addListener( 'part', function( channel, nick, reason, message ){
				console.log( '>>> PART', channel, nick, reason );
				client.emit( 'part', channel, nick, reason );
			});

			irc_client.addListener( 'quit', function( nick, reason, channels, message ){
				console.log( '>>> QUIT', nick, reason, channels );
				client.emit( 'quit', nick, reason, channels );
			})

			irc_client.addListener( 'motd', function( motd ){
				client.emit( 'motd', motd );
				console.log( '>>> MOTD.', motd );
			});

			irc_client.addListener( 'names', function( channel, nicks ){
				console.log( '>>> NAMES.', nicks );
				client.emit( 'names', channel, nicks );
			});

			irc_client.addListener( 'topic', function( channel, topic, nick, message ){
				console.log( '>>> TOPIC.', channel, topic, nick );
				client.emit( 'topic', channel, topic, nick );
			});

			irc_client.addListener( 'message', function( from, to, message ){
				console.log( '>>> MESSAGE', from, to, message );
				client.emit( 'message', from, to, message );
			});

			irc_client.addListener( 'notice', function( nick, to, text, message ){
				console.log( '>>> NOTICE', nick, to, text );
				client.emit( 'notice', nick, to, text );
			});

			irc_client.addListener( 'nick', function( old_nick, new_nick, channels, message ){
				console.log( '>>> NICK', old_nick, new_nick, channels );
				client.emit( 'nick', old_nick, new_nick, channels );
			});

			irc_client.addListener( 'invite', function( channel, from, message ){
				console.log( '>>> INVITE', channel, from );
				client.emit( 'invite', channel, from );
			});

			irc_client.addListener( '+mode', function( channel, by, mode, argument, message ){
				console.log( '>>> +MODE', channel, by, mode, argument );
				client.emit( '+mode', channel, by, mode, argument );
			});

			irc_client.addListener( '-mode', function( channel, by, mode, argument, message ){
				console.log( '>>> -MODE', channel, by, mode, argument );
				client.emit( '-mode', channel, by, mode, argument );
			});

			irc_client.addListener( 'ctcp', function( from, to, text, type ){
				console.log( '>>> CTCP', from, to, text, type );
				var text_bits = text.split(' ');
				var command = text_bits.shift();
				if( command === 'ACTION' ){
					client.emit( 'action', from, to, text_bits.join(' ') );
				}
			});

			irc_client.addListener( 'raw', function( message ){
				console.log( message );
			});

			irc_client.addListener( 'pm', function( nick, text, message ){
				console.log( ' >>> PM', nick, text );
			});

			irc_client.addListener( 'error', function( message ){
				console.log( '>>> ERROR', message );
			});

			// Listen for commands by our client-side script
			client.on( 'say', function( target, message ){
				irc_client.say( target, message );
				// IRC doesn't send us our own messages
				client.emit( 'message', irchub_client.nick, target, message );
			});

			client.on( 'notice', function( target, message ){
				irc_client.send( 'NOTICE', target, message );
				// IRC doesn't send us our own notices
				client.emit( 'notice', irchub_client.nick, target, message );
			});

			client.on( 'action', function( target, message ){
				irc_client.action( target, message );
				// IRC doesn't send us our own actions
				client.emit( 'action', irchub_client.nick, target, message );
			});

			client.on( 'topic', function( channel, topic ){
				irc_client.send( 'TOPIC', channel, topic );
			});

			client.on( 'join', function( channel ){
				if( channel.charAt(0) !== '#' ) channel = '#'+ channel;
				irc_client.join( channel );
			});

			client.on( 'part', function( channel ){
				irc_client.part( channel );
			});

			client.on( 'quit', function( message ){
				irc_client.disconnect( message );
				// IRC doesn't send us our own quits
				client.emit( 'quit', irchub_client.nick, message, _(irc_client.chans).keys() );
			});

			client.emit( 'chans', _(irc_client.chans).keys() );
			
			client.on( 'disconnect', function(){

				console.log( '>>> SOCKET DISCONNECTED!!!' );

				irc_client.disconnect();

			});

		});

	};

	return Adapter;

};