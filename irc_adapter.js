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
			password: parameters.password || null,
			port: parameters.port || 6667,
			channels: channels,
			floodProtection: false,
			floodProtectionDelay: 1000
		});

		if( parameters.nick_password ) irc_client.say( 'NickServ', 'IDENTIFY '+ parameters.nick_password );

		io.of( this.namespace ).on( 'connection', function( client ){

			console.log( '>>> SOCKET CONNECTED!!!' );

			// Send IRC events to our client-side script
			irc_client.addListener( 'registered', function( message ){
				client.emit( 'registered', message );
				console.log( '>>> REGISTERED.', message );
			});

			irc_client.addListener( 'join', function( channel, nick, message ){
				var timestamp = Date.now();
				console.log( '>>> JOIN', channel, nick, timestamp );
				client.emit( 'join', channel, nick, timestamp );
			});

			irc_client.addListener( 'part', function( channel, nick, reason, message ){
				var timestamp = Date.now();
				console.log( '>>> PART', channel, nick, reason, timestamp );
				client.emit( 'part', channel, nick, reason, timestamp );
			});

			irc_client.addListener( 'quit', function( nick, reason, channels, message ){
				var timestamp = Date.now();
				console.log( '>>> QUIT', nick, reason, channels, timestamp );
				client.emit( 'quit', nick, reason, channels, timestamp );
			})

			irc_client.addListener( 'motd', function( motd ){
				var timestamp = Date.now();
				client.emit( 'motd', motd, timestamp );
				console.log( '>>> MOTD.', motd, timestamp );
			});

			irc_client.addListener( 'names', function( channel, nicks ){
				console.log( '>>> NAMES.', nicks );
				client.emit( 'names', channel, nicks );
			});

			irc_client.addListener( 'topic', function( channel, topic, nick, message ){
				var timestamp = Date.now();
				console.log( '>>> TOPIC.', channel, topic, nick, timestamp );
				client.emit( 'topic', channel, topic, nick, timestamp );
			});

			irc_client.addListener( 'message', function( from, to, message ){
				var timestamp = Date.now();
				console.log( '>>> MESSAGE', from, to, message, timestamp );
				client.emit( 'message', from, to, message, timestamp );
			});

			irc_client.addListener( 'notice', function( nick, to, text, message ){
				var timestamp = Date.now();
				console.log( '>>> NOTICE', nick, to, text, timestamp );
				client.emit( 'notice', nick, to, text, timestamp );
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
					var timestamp = Date.now();
					client.emit( 'action', from, to, text_bits.join(' '), timestamp );
				}
			});

			irc_client.addListener( 'raw', function( message ){
				console.log( message );
			});

			irc_client.addListener( 'pm', function( nick, text, message ){
				console.log( ' >>> PM', nick, text );
			});

			irc_client.addListener( 'error', function( error ){
				var timestamp = Date.now();
				var message = error.args.pop();
				console.log( '>>> ERROR', error, message, timestamp );
				client.emit( 'error', message, timestamp );
			});

			// Listen for commands by our client-side script
			client.on( 'say', function( target, message ){
				irc_client.say( target, message );
				// IRC doesn't send us our own messages
				var timestamp = Date.now();
				client.emit( 'message', irchub_client.nick, target, message, timestamp );
			});

			client.on( 'notice', function( target, message ){
				irc_client.send( 'NOTICE', target, message );
				// IRC doesn't send us our own notices
				var timestamp = Date.now();
				client.emit( 'notice', irchub_client.nick, target, message, timestamp );
			});

			client.on( 'action', function( target, message ){
				irc_client.action( target, message );
				// IRC doesn't send us our own actions
				var timestamp = Date.now();
				client.emit( 'action', irchub_client.nick, target, message, timestamp );
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