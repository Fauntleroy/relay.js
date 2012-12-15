irc.Collections.Users = Backbone.Collection.extend({

	model: irc.Models.User,

	initialize: function( models, parameters ){

		this.channel = parameters.channel;
		this.socket = irc.socket;

		_( this ).bindAll( 'doNames', 'doPart', 'doJoin' );

		this.socket.on( 'names', this.doNames );
		this.socket.on( 'part', this.doPart );
		this.socket.on( 'join', this.doJoin );

	},

	doNames: function( channel, nicks ){

		if( this.channel === channel ){

			var nicks_array = [];
			for( var nick in nicks ) nicks_array.push({ nick: nick });

			this.add( nicks_array );

		}

	},

	doPart: function( channel, nick, reason, message ){

		if( this.channel === channel && irc.user.nick !== nick ){

			var parting_users = this.where({ nick: nick });
			this.remove( parting_users );

		}

	},

	doJoin: function( channel, nick, message ){

		if( this.channel === channel && irc.user.nick !== nick ){

			this.add({
				nick: nick
			});
			
		}

	}

});