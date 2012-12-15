irc.Collections.Channels = Backbone.Collection.extend({

	model: irc.Models.Channel,

	initialize: function( models, parameters ){

		_(this).bindAll( 'join', 'part', 'doChans', 'doJoin', 'doPart' );

		this.connection = parameters.connection;
		this.socket = this.connection.socket;

		this.socket.on( 'chans', this.doChans );
		this.socket.on( 'join', this.doJoin );
		this.socket.on( 'part', this.doPart );

	},

	join: function( name ){

		this.socket.emit( 'join', name );

	},

	part: function( name ){

		this.socket.emit( 'part', name );

	},

	doChans: function( channels ){

		var channels_to_join = [];
		for( var i in channels ) channels_to_join.push({ name: channels[i] });

		this.add( channels_to_join );
		if( this.last() ) this.last().active();

	},

	doJoin: function( channel, nick, message ){

		if( nick === this.connection.get('nick') ){

			this.add({ name: channel });

		}

	},

	doPart: function( channel, nick, reason, message ){

		if( nick === this.connection.get('nick') ){

			var parted_channels = this.where({ name: channel });
			this.remove( parted_channels );

		}

	}

});