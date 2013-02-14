irc.Collections.Messages = Backbone.Collection.extend({

	limit: 500,
	model: irc.Models.Message,

	initialize: function( models, parameters ){

		this.channel = parameters.channel;
		this.connection = parameters.connection;
		this.socket = this.connection.socket;

		_( this ).bindAll( 'doMessage', 'doNotice', 'doAction', 'doNick', 'doJoin', 'doPart', 'doQuit', 'doKick', 'doTopic', 'doModeAdd', 'doModeRemove', 'doMOTD', 'doWhois', 'doError', 'trim' );

		this.socket.on( 'message', this.doMessage );
		this.socket.on( 'notice', this.doNotice );
		this.socket.on( 'action', this.doAction );
		this.socket.on( 'nick', this.doNick );
		this.socket.on( 'join', this.doJoin );
		this.socket.on( 'part', this.doPart );
		this.socket.on( 'quit', this.doQuit );
		this.socket.on( 'kick', this.doKick );
		this.socket.on( 'topic', this.doTopic );
		this.socket.on( '+mode', this.doModeAdd );
		this.socket.on( '-mode', this.doModeRemove );
		this.socket.on( 'motd', this.doMOTD );
		this.socket.on( 'whois', this.doWhois );
		this.socket.on( 'error', this.doError );
		this.on( 'add', this.trim );

	},

	doMessage: function( from, to, message, timestamp ){

		var from_self = ( from === this.connection.get('nick') );
		var from_self_to_channel = ( from_self && to === this.channel.get('name') );
		var from_user_to_self = ( from === this.channel.get('name') && to === this.connection.get('nick') );
	
		if( from_self_to_channel || to === this.channel.get('name') || from_user_to_self ){

			this.add({
				message: true,
				nick: from,
				contents: message,
				timestamp: timestamp,
				self: from_self
			});

		}

	},

	doNotice: function( from, to, text, timestamp ){

		// NOTICE usually pertain to the active channel

		if( this.channel.get('active') ){

			this.add({
				notice: true,
				from: from,
				to: to,
				text: text,
				timestamp: timestamp
			});

		}

	},

	doAction: function( from, to, text, timestamp ){

		if( to === this.channel.get('name') ){

			this.add({
				action: true,
				nick: from,
				contents: text,
				timestamp: timestamp
			});

		}

	},

	doNick: function( old_nick, new_nick, channels, timestamp ){

		if( _( channels ).indexOf( this.channel.get('name') ) >= 0 ){

			this.add({
				nick_change: true,
				old_nick: old_nick,
				new_nick: new_nick,
				timestamp: timestamp
			});

		}

	},

	doJoin: function( channel, nick, timestamp ){

		if( channel === this.channel.get('name') ){

			this.add({
				join: true,
				nick: nick,
				timestamp: timestamp
			});

		}

	},

	doPart: function( channel, nick, reason, timestamp ){

		if( channel === this.channel.get('name') && nick !== this.connection.get('nick') ){

			this.add({
				part: true,
				nick: nick,
				reason: reason,
				timestamp: timestamp
			});

		}

	},

	doQuit: function( nick, reason, channels, timestamp ){

		if( _( channels ).indexOf( this.channel.get('name') ) >= 0 && nick !== this.connection.get('nick') ){

			this.add({
				part: true,
				nick: nick,
				reason: reason,
				timestamp: timestamp
			});

		}

	},

	doKick: function( channel, nick, by, reason, timestamp ){

		if( channel === this.channel.get('name') && nick !== this.connection.get('nick') ){

			this.add({
				kick: true,
				nick: nick,
				by: by,
				reason: reason,
				timestamp: timestamp
			});

		}

	},

	doTopic: function( channel, topic, nick, timestamp ){

		if( channel === this.channel.get('name') ){

			// Split nick off raw name
			nick = nick.split('!')[0];

			this.add({
				topic: true,
				nick: nick,
				topic_text: topic,
				timestamp: timestamp
			});

		}

	},

	doModeAdd: function( channel, by, mode, argument ){

		if( channel === this.channel.get('name') ){

			this.add({
				mode_add: true,
				channel: channel,
				by: by,
				mode: mode,
				argument: argument
			});

		}

	},

	doModeRemove: function( channel, by, mode, argument ){

		if( channel === this.channel.get('name') ){

			this.add({
				mode_remove: true,
				channel: channel,
				by: by,
				mode: mode,
				argument: argument
			});

		}

	},

	doMOTD: function( text, timestamp ){

		if( !this.channel.get('name') ){

			this.add({
				motd: true,
				text: text,
				timestamp: timestamp
			});

		}

	},

	doWhois: function( info, timestamp ){

		if( this.channel.get('active') ){

			this.add({
				whois: true,
				info: info,
				timestamp: timestamp
			});

		}

	},

	doError: function( text, timestamp ){

		if( this.channel.get('active') ){

			this.add({
				error: true,
				text: text,
				timestamp: timestamp
			});

		}

	},

	// Ensure we never get *too* many messages
	trim: function(){

		if( this.length > this.limit ){
			var messages = this.last( this.limit - parseInt( this.limit * 0.25 ) );
			this.reset( messages, {
				silent: true
			});
		}

	}

});