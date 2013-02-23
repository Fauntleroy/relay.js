irc.Collections.Users = Backbone.Collection.extend({

	presence_id: 1, // Used for user color
	model: irc.Models.User,

	initialize: function( models, parameters ){

		this.channel = parameters.channel;
		this.connection = parameters.connection;
		this.socket = this.connection.socket;

		_( this ).bindAll( 'doNames', 'doMessage', 'doModeAdd', 'doModeRemove', 'doAction', 'doPart', 'doQuit', 'doKick', 'doJoin', 'doNick', 'doChangeActive' );

		this.socket.on( 'names', this.doNames );
		this.socket.on( 'message', this.doMessage );
		this.socket.on( '+mode', this.doModeAdd );
		this.socket.on( '-mode', this.doModeRemove );
		this.socket.on( 'action', this.doAction );
		this.socket.on( 'part', this.doPart );
		this.socket.on( 'quit', this.doQuit );
		this.socket.on( 'kick', this.doKick );
		this.socket.on( 'join', this.doJoin );
		this.socket.on( 'nick', this.doNick );
		this.on( 'change:active', this.doChangeActive );

	},

	// Sort by name and rank
	comparator: function( a, b ){

		var ranks = [ '~', '&', '@', '%', '+', null ];
		var a_rank_index = _( ranks ).indexOf( a.get('rank') );
		var b_rank_index = _( ranks ).indexOf( b.get('rank') );
		var a_nick = a.get('nick').toLowerCase();
		var b_nick = b.get('nick').toLowerCase();
		var a_active = a.get('active');
		var b_active = b.get('active');

		if( a_rank_index > b_rank_index ) return 1;
		else if( b_rank_index > a_rank_index ) return -1;
		else if( a_active && !b_active ) return -1;
		else if( !a_active && b_active ) return 1;
		else if( a_nick > b_nick ) return 1;
		else if( b_nick > a_nick ) return -1;
		else return 0;

	},

	doNames: function( channel, nicks ){

		if( channel === this.channel.get('name') ){

			var users = [];
			for( var nick in nicks ){
				users.push({
					nick: nick,
					rank: nicks[nick] || null,
					presence_id: this.presence_id
				});
				this.presence_id = ( this.presence_id < 30 )? this.presence_id + 1: 1;
			}

			this.reset( users );

		}

	},

	doMessage: function( nick ){

		var user = this.where({ nick: nick })[0];
		if( user ) user.active();

	},

	doModeAdd: function( channel, by, mode, argument ){

		if( channel === this.channel.get('name') ){
			var user = this.findWhere({ nick: argument });
			if( user ){
				if( mode === 'o' ) user.set( 'rank', '@' );
				else if( mode === 'v' ) user.set( 'rank', '+' );
			}
		}

	},

	doModeRemove: function( channel, by, mode, argument ){

		if( channel === this.channel.get('name') ){
			var user = this.findWhere({ nick: argument });
			if( user ){
				var rank = user.get('rank');
				if( mode === 'o' && rank === '@' ) user.set( 'rank', null );
				if( mode === 'v' && rank === '+' ) user.set( 'rank', null );
			}
		}

	},

	doAction: function( nick ){

		var user = this.findWhere({ nick: nick });
		if( user ) user.active();

	},

	doPart: function( channel, nick, reason, message ){

		if( channel === this.channel.get('name') && nick !== this.connection.get('nick') ){

			var parting_users = this.where({ nick: nick });
			this.remove( parting_users );

		}

	},

	doQuit: function( nick, reason, channels ){

		if( _( channels ).indexOf( this.channel.get('name') ) >= 0 ){

			var parting_user = this.where({ nick: nick });
			this.remove( parting_user );

		}

	},

	doKick: function( channel, nick, by, reason, timestamp ){

		if( channel === this.channel.get('name') && nick !== this.connection.get('nick') ){

			var kicked_user = this.where({ nick: nick });
			this.remove( kicked_user );

		}

		var by_user = this.findWhere({ nick: nick });
		if( by_user ) by_user.active();

	},

	doJoin: function( channel, nick, message ){

		if( channel === this.channel.get('name') && nick !== this.connection.get('nick') ){

			var existing = this.where({ nick: nick });

			if( !existing.length ){
				this.add({
					nick: nick,
					presence_id: this.presence_id
				});
				this.presence_id = ( this.presence_id < 30 )? this.presence_id + 1: 1;
			}
			
		}

	},

	doNick: function( old_nick, new_nick, channels ){

		if( _( channels ).indexOf( this.channel.get('name') ) >= 0 ){

			var changing_user = this.findWhere({ nick: old_nick });
			changing_user.set( 'nick', new_nick );

			this.sort();

		}

		var user = this.findWhere({ nick: new_nick });
		if( user ) user.active();

	},

	doChangeActive: function(){

		this.sort();

	}

});