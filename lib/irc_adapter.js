var irc = require('irc');
var _ = require('underscore');
var uuid = require('node-uuid');
var winston = require('winston');
var logger = winston.loggers.get('development');

module.exports = function( io ){

	var Adapter = function( parameters ){

		var adapter = this;
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
			userName: parameters.nick,
			realName: 'relay.js client',
			password: parameters.password || null,
			port: parameters.port || ( parameters.secure ? 6697 : 6667 ),
			channels: channels,
			floodProtection: true,
			floodProtectionDelay: 1000,
			autoRejoin: false,
			secure: parameters.secure,
			selfSigned: true
		});

		io.of( this.namespace ).on( 'connection', function( client ){

			logger.info( 'client socket connected' );
			if( adapter.disconnect_timeout ){
				clearTimeout( adapter.disconnect_timeout );
				adapter.disconnect_timeout = null;
			}

			// Send IRC events to our client-side script
			irc_client.addListener( 'registered', function( message ){

				client.emit( 'registered', message );

				// Store the username we get back from the server
				// This might be different than what we expect if it's already in use
				adapter.nick = message.args[0];

				// Auto-identify when possible
				if( parameters.nick_password ){
					irc_client.say( 'NickServ', 'IDENTIFY '+ parameters.nick_password );
				}

			});

			irc_client.addListener( 'join', function( channel, nick, message ){
				var timestamp = Date.now();
				client.emit( 'join', channel, nick, timestamp );
			});

			irc_client.addListener( 'part', function( channel, nick, reason, message ){
				var timestamp = Date.now();
				client.emit( 'part', channel, nick, reason, timestamp );
			});

			irc_client.addListener( 'quit', function( nick, reason, channels, message ){
				var timestamp = Date.now();
				client.emit( 'quit', nick, reason, channels, timestamp );
			});

			irc_client.addListener( 'kick', function( channel, nick, by, reason, message ){
				var timestamp = Date.now();
				client.emit( 'kick', channel, nick, by, reason, timestamp );
			});

			irc_client.addListener( 'motd', function( motd ){
				var timestamp = Date.now();
				client.emit( 'motd', motd, timestamp );
			});

			irc_client.addListener( 'names', function( channel, nicks ){
				client.emit( 'names', channel, nicks );
			});

			irc_client.addListener( 'topic', function( channel, topic, nick, message ){
				var timestamp = Date.now();
				client.emit( 'topic', channel, topic, nick, timestamp );
			});

			irc_client.addListener( 'message', function( from, to, message ){
				var timestamp = Date.now();
				client.emit( 'message', from, to, message, timestamp );
			});

			irc_client.addListener( 'notice', function( nick, to, text, message ){
				var timestamp = Date.now();
				client.emit( 'notice', nick, to, text, timestamp );
			});

			irc_client.addListener( 'nick', function( old_nick, new_nick, channels, message ){
				if( old_nick === adapter.nick ) adapter.nick = new_nick;
				var timestamp = Date.now();
				client.emit( 'nick', old_nick, new_nick, channels, timestamp );
			});

			irc_client.addListener( 'invite', function( channel, from, message ){
				client.emit( 'invite', channel, from );
			});

			irc_client.addListener( '+mode', function( channel, by, mode, argument, message ){
				var timestamp = Date.now();
				client.emit( '+mode', channel, by, mode, argument, timestamp );
			});

			irc_client.addListener( '-mode', function( channel, by, mode, argument, message ){
				var timestamp = Date.now();
				client.emit( '-mode', channel, by, mode, argument, timestamp );
			});

			irc_client.addListener( 'ctcp', function( from, to, text, type ){
				var text_bits = text.split(' ');
				var command = text_bits.shift();
				if( command === 'ACTION' ){
					var timestamp = Date.now();
					client.emit( 'action', from, to, text_bits.join(' '), timestamp );
				}
			});

			irc_client.addListener( 'raw', function( message ){
				logger.debug( JSON.stringify(message).replace( /,/g, ',\n' ) );
				var timestamp = Date.now();
				switch( message.command ){

				case 'rpl_away':
					client.emit( 'rpl_away', message.args[1], message.args[0], message.args[2], timestamp );
					break;

				case 'rpl_nowaway':
					// nick, now away response
					client.emit( 'rpl_nowaway', message.args[0], message.args[1], timestamp );
					break;

				}
			});

			irc_client.addListener( 'pm', function( nick, text, message ){
			});

			irc_client.addListener( 'whois', function( info ){
				var timestamp = Date.now();
				client.emit( 'whois', info, timestamp );
			});

			irc_client.addListener( 'error', function( error ){
				var timestamp = Date.now();
				var message = error.args.pop();
				logger.error( '>>> ERROR', message );
				client.emit( 'error', message, timestamp );
			});


// Client Commands
////////////////////////////////////////////////////////////////////////////////

			var interpretCommand = function( command_string, channel ){

				var command_regex = /^\/([A-Za-z]*)/;
				var bits = command_string.split(' ').splice(1);
				var command = command_regex.exec( command_string );
				command = ( command )? command[1].toLowerCase(): null;
				var message, timestamp, target;

				switch( command ){

				case 'notice':
					target = bits.shift() || '';
					message = bits.join(' ');
					irc_client.notice( target, message );
					// IRC doesn't send us our own notices
					timestamp = Date.now();
					client.emit( 'notice', adapter.nick, target, message, timestamp );
					break;

				case 'me':
				case 'action':
					message = bits.join(' ');
					irc_client.action( channel, message );
					// IRC doesn't send us our own actions
					timestamp = Date.now();
					client.emit( 'action', adapter.nick, channel, message, timestamp );
					break;

				case 'away':
					message = bits.join(' ');
					irc_client.send( 'away', message );
					break;

				case 'topic':
					irc_client.send( 'topic', channel, bits.join(' ') );
					break;

				case 'mode':
					var user_channel = bits.shift() || '';
					var modes = bits.shift() || '';
					var mode_args = bits.shift() || '';
					irc_client.send( 'mode', user_channel, modes, mode_args );
					break;

				case 'whois':
					var nick = bits.shift() || '';
					irc_client.whois( nick );
					break;

				case 'join':
					var channel_to_join = bits.shift() || '';
					if( channel_to_join.charAt(0) !== '#' ) channel_to_join = '#'+ channel_to_join;
					irc_client.send( 'join', channel_to_join );
					break;

				case 'authserv':
				case 'as':
					irc_client.send( 'AuthServ', bits.join(' ') );
					break;

				case 'part':
					irc_client.send( 'part', channel, bits.join(' ') );
					break;

				case 'quit':
					message = bits.join(' ');
					irc_client.send( 'quit', message );
					// IRC doesn't send us our own quits
					irc_client.disconnect( message, function(){
						client.emit( 'quit', adapter.nick, message, _(irc_client.chans).keys() );
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

				default:
					if( command === 'msg' || !command ){
						target = ( command )? bits.shift(): channel;
						message = ( command )? bits.join(' '): command_string;
						irc_client.say( target, message );
						// IRC doesn't send us our own messages
						timestamp = Date.now();
						if( target && message ) client.emit( 'message', adapter.nick, target, message, timestamp );
					}
					break;

				}

			};

			client.on( 'command', interpretCommand );

			client.emit( 'chans', _( irc_client.chans ).map( function( channel_data ){
				return channel_data.serverName;
			}) );
			
			client.on( 'disconnect', function(){

				logger.info( 'client socket disconnected' );
				adapter.disconnect_timeout = setTimeout( function(){
					logger.info( 'killing irc connection' );
					irc_client.disconnect();
				}, 60 * 1000 );
				
			});

		});

	};

	return Adapter;

};
