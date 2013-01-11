irc.Collections.Messages = Backbone.Collection.extend({

	model: irc.Models.Message,

	initialize: function( models, parameters ){

		this.channel = parameters.channel;
		this.connection = parameters.connection;
		this.socket = this.connection.socket;

		_( this ).bindAll( 'say', 'doMessage', 'doNotice', 'doAction', 'doJoin', 'doPart', 'doQuit', 'doTopic', 'doMOTD' );

		this.socket.on( 'message', this.doMessage );
		this.socket.on( 'notice', this.doNotice );
		this.socket.on( 'action', this.doAction );
		this.socket.on( 'join', this.doJoin );
		this.socket.on( 'part', this.doPart );
		this.socket.on( 'quit', this.doQuit );
		this.socket.on( 'topic', this.doTopic );

		this.socket.on( 'motd', this.doMOTD );

	},

	say: function( target, message ){

		if( arguments.length === 1 ){
			message = target;
			target = this.channel.get('name');
		}

		this.socket.emit( 'say', target, message );

	},

	doMessage: function( from, to, message ){

		if( from === this.connection.get('nick') && to === this.channel.get('name') ){

			this.add({
				message: true,
				nick: from,
				contents: message
			});

		}
		else if( to === this.channel.get('name') || ( from === this.channel.get('name') && to === this.connection.get('nick') ) ){

			this.add({
				message: true,
				nick: from,
				contents: message
			});

		}

	},

	doNotice: function( from, to, text ){

		// How do I know which channel this is in?!?!
		if( !from && !this.channel.get('name') ){

			this.add({
				notice: true,
				from: this.connection.get('server'),
				to: to,
				text: text
			});

		}

	},

	doAction: function( from, to, text ){

		if( to === this.channel.get('name') ){

			this.add({
				action: true,
				nick: from,
				contents: text
			});

		}

	},

	doJoin: function( channel, nick ){

		if( channel === this.channel.get('name') ){

			this.add({
				join: true,
				nick: nick
			});

		}

	},

	doPart: function( channel, nick, reason ){

		if( channel === this.channel.get('name') ){

			this.add({
				part: true,
				nick: nick,
				reason: reason
			});

		}

	},

	doQuit: function( nick, reason, channels ){

		if( _( channels ).indexOf( this.channel.get('name') ) >= 0 ){

			this.add({
				part: true,
				nick: nick,
				reason: reason
			});

		}

	},

	doTopic: function( channel, topic, nick ){

		if( channel === this.channel.get('name') ){

			this.add({
				topic: true,
				nick: nick,
				topic_text: topic
			});

		}

	},

	doMOTD: function( text ){

		if( !this.channel.get('name') ){

			this.add({
				motd: true,
				text: text
			});

		}

	}

});