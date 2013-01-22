irc.Collections.Messages = Backbone.Collection.extend({

	model: irc.Models.Message,

	initialize: function( models, parameters ){

		this.channel = parameters.channel;
		this.connection = parameters.connection;
		this.socket = this.connection.socket;

		_( this ).bindAll( 'doMessage', 'doNotice', 'doAction', 'doNick', 'doJoin', 'doPart', 'doQuit', 'doTopic', 'doMOTD', 'doError' );

		this.socket.on( 'message', this.doMessage );
		this.socket.on( 'notice', this.doNotice );
		this.socket.on( 'action', this.doAction );
		this.socket.on( 'nick', this.doNick );
		this.socket.on( 'join', this.doJoin );
		this.socket.on( 'part', this.doPart );
		this.socket.on( 'quit', this.doQuit );
		this.socket.on( 'topic', this.doTopic );
		this.socket.on( 'motd', this.doMOTD );
		this.socket.on( 'error', this.doError );

	},

	doMessage: function( from, to, message, timestamp ){

		var from_self_to_channel = ( from === this.connection.get('nick') && to === this.channel.get('name') );
		var from_user_to_self = ( from === this.channel.get('name') && to === this.connection.get('nick') );
	
		if( from_self_to_channel || to === this.channel.get('name') || from_user_to_self ){

			this.add({
				message: true,
				nick: from,
				contents: message,
				timestamp: timestamp
			});

		}

	},

	doNotice: function( from, to, text, timestamp ){

		// How do I know which channel this is in?!?!
		if( !from && !this.channel.get('name') ){

			this.add({
				notice: true,
				from: this.connection.get('server'),
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

		if( channel === this.channel.get('name') ){

			this.add({
				part: true,
				nick: nick,
				reason: reason,
				timestamp: timestamp
			});

		}

	},

	doQuit: function( nick, reason, channels, timestamp ){

		if( _( channels ).indexOf( this.channel.get('name') ) >= 0 ){

			this.add({
				part: true,
				nick: nick,
				reason: reason,
				timestamp: timestamp
			});

		}

	},

	doTopic: function( channel, topic, nick, timestamp ){

		if( channel === this.channel.get('name') ){

			// Raw names look like 'ptard!uid6724@gateway/web/irccloud.com/x-gipmkavsanmekmde'
			nick = nick.split('!')[0];

			this.add({
				topic: true,
				nick: nick,
				topic_text: topic,
				timestamp: timestamp
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

	doError: function( text, timestamp ){

		if( this.channel.get('active') ){

			this.add({
				error: true,
				text: text,
				timestamp: timestamp
			});

		}

	}

});