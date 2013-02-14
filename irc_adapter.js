var irc = require('irc');
var _ = require('lodash');
var uuid = require('node-uuid');
var winston = require('winston');
var logger = new (winston.Logger)({
	transports: [
		new ( winston.transports.File )({ filename: 'irc.log' })
	]
});

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
			floodProtectionDelay: 1000,
			autoRejoin: false
		});

		io.of( this.namespace ).on( 'connection', function( client ){

			console.log( '>>> SOCKET CONNECTED!!!' );
			if( irchub_client.disconnect_timeout ){
				clearTimeout( irchub_client.disconnect_timeout );
				irchub_client.disconnect_timeout = null;
			}

			// Send IRC events to our client-side script
			irc_client.addListener( 'registered', function( message ){

				client.emit( 'registered', message );
				console.log( '>>> REGISTERED.', message );

				// Store the username we get back from the server
				// This might be different than what we expect if it's already in use
				irchub_client.nick = message.args[0];

				// Auto-identify when possible
				if( parameters.nick_password ){
					irc_client.say( 'NickServ', 'IDENTIFY '+ parameters.nick_password );
				}

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
			});

			irc_client.addListener( 'kick', function( channel, nick, by, reason, message ){
				var timestamp = Date.now();
				console.log( '>>> KICK', channel, nick, by, reason, timestamp );
				client.emit( 'kick', channel, nick, by, reason, timestamp );
			});

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
				if( old_nick === irchub_client.nick ) irchub_client.nick = new_nick;
				var timestamp = Date.now();
				console.log( '>>> NICK', old_nick, new_nick, channels, timestamp );
				client.emit( 'nick', old_nick, new_nick, channels, timestamp );
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
				logger.log( 'info', 'raw', message );
			});

			irc_client.addListener( 'pm', function( nick, text, message ){
				console.log( '>>> PM', nick, text );
			});

			irc_client.addListener( 'whois', function( info ){
				var timestamp = Date.now();
				console.log( '>>> WHOIS', info, timestamp );
				client.emit( 'whois', info, timestamp );
			});

			irc_client.addListener( 'error', function( error ){
				var timestamp = Date.now();
				var message = error.args.pop();
				console.log( '>>> ERROR', error, message, timestamp );
				client.emit( 'error', message, timestamp );
			});


// Client Commands
////////////////////////////////////////////////////////////////////////////////

			var interpretCommand = function( command_string, channel ){

				var command_regex = /^\/([A-Za-z]*)/;
				var bits = command_string.split(' ').splice(1);
				var command = command_regex.exec( command_string );
				command = ( command )? command[1].toLowerCase(): null;

				switch( command ){

				case 'notice':
					var target = bits.shift();
					var message = bits.join(' ');
					irc_client.notice( target, message );
					// IRC doesn't send us our own notices
					var timestamp = Date.now();
					client.emit( 'notice', irchub_client.nick, target, message, timestamp );
					break;

				case 'me':
				case 'action':
					var message = bits.join(' ');
					irc_client.action( channel, message );
					// IRC doesn't send us our own actions
					var timestamp = Date.now();
					client.emit( 'action', irchub_client.nick, channel, message, timestamp );
					break;

				case 'topic':
					irc_client.send( 'topic', channel, bits.join(' ') );
					break;

				case 'mode':
					var user_channel = bits.shift();
					var modes = bits.shift();
					var mode_args = bits.shift();
					irc_client.send( 'mode', user_channel, modes, mode_args );
					break;

				case 'whois':
					var nick = bits.shift();
					irc_client.whois( nick );
					break;

				case 'join':
					var channel_to_join = bits[0];
					if( channel_to_join.charAt(0) !== '#' ) channel_to_join = '#'+ channel_to_join;
					irc_client.send( 'join', channel_to_join );
					break;

				case 'part':
					irc_client.send( 'part', channel, bits.join(' ') );
					break;

				case 'quit':
					var message = bits.join(' ');
					irc_client.send( 'quit', message );
					// IRC doesn't send us our own quits
					irc_client.disconnect( message, function(){
						client.emit( 'quit', irchub_client.nick, message, _(irc_client.chans).keys() );
						client.disconnect();
					});
					break;

				case 'nick':
					irc_client.send( 'nick', bits[0] );
					break;

// Channel Ops Commands
////////////////////////////////////////////////////////////////////////////////

				case 'kick':
					irc_client.send( 'kick', channel, bits[0] );
					break;

// Server Ops Commands
////////////////////////////////////////////////////////////////////////////////

				case 'kill':
					irc_client.send( 'kill', bits.shift(), bits.join(' ') );
					break;

// Say
////////////////////////////////////////////////////////////////////////////////

				case 'msg':
				default:
					if( command === 'msg' || !command ){
						var target = ( command )? bits.shift(): channel;
						var message = ( command )? bits.join(' '): command_string;
						irc_client.say( target, message );
						// IRC doesn't send us our own messages
						var timestamp = Date.now();
						client.emit( 'message', irchub_client.nick, target, message, timestamp );
					}
					break;

				}

			};

			client.on( 'command', interpretCommand );

			client.emit( 'chans', _(irc_client.chans).keys() );
			
			client.on( 'disconnect', function(){

				console.log( '>>> SOCKET DISCONNECTED!!!' );
				irchub_client.disconnect_timeout = setTimeout( function(){
					console.log( '>>> DISCONNECTING IRC CLIENT' );
					irc_client.disconnect();
				}, 60 * 1000 );
				
			});

		});

	};

	return Adapter;

};