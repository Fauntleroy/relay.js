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

	// Sort by name and rank
	comparator: function( a, b ){

		var ranks = [ '~', '&', '@', '%', '+', '' ];
		var a_rank_index = _( ranks ).indexOf( a.get('rank') );
		var b_rank_index = _( ranks ).indexOf( b.get('rank') );
		var a_nick = a.get('nick').toLowerCase();
		var b_nick = b.get('nick').toLowerCase();

		if( a_rank_index > b_rank_index ) return 1;
		else if( b_rank_index > a_rank_index ) return -1;
		else if( a_nick > b_nick ) return 1;
		else if( b_nick > a_nick ) return -1;
		else return 0;

	},

	doNames: function( channel, nicks ){

		if( channel === this.channel.get('name') ){

			for( var nick in nicks ){
				this.add({
					nick: nick,
					rank: nicks[nick]
				});
			}

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