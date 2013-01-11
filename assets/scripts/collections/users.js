irc.Collections.Users = Backbone.Collection.extend({

	model: irc.Models.User,

	initialize: function( models, parameters ){

		this.channel = parameters.channel;
		this.connection = parameters.connection;
		this.socket = this.connection.socket;

		_( this ).bindAll( 'doNames', 'doPart', 'doQuit', 'doJoin' );

		this.socket.on( 'names', this.doNames );
		this.socket.on( 'part', this.doPart );
		this.socket.on( 'quit', this.doQuit );
		this.socket.on( 'join', this.doJoin );

	},

	doNames: function( channel, nicks ){

		if( channel === this.channel.get('name') ){

			var nicks_array = [];
			for( var nick in nicks ) nicks_array.push({ nick: nick });

			this.add( nicks_array );

		}

	},

	doPart: function( channel, nick, reason, message ){

		if( channel === this.channel.get('name') && nick !== this.connection.get('nick') ){

			var parting_users = this.where({ nick: nick });
			this.remove( parting_users );

		}

	},

	doQuit: function( nick, reason, channels ){

		if( _( channels ).indexOf( this.channel.get('name') ) >= 0 ){

			var parting_users = this.where({ nick: nick });
			this.remove( parting_users );

		}

	},

	doJoin: function( channel, nick, message ){

		if( channel === this.channel.get('name') && nick !== this.connection.get('nick') ){

			this.add({
				nick: nick
			});
			
		}

	}

});