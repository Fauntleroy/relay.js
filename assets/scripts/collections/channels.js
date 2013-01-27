irc.Collections.Channels = Backbone.Collection.extend({

	model: irc.Models.Channel,

	initialize: function( models, parameters ){

		_(this).bindAll( 'join', 'part', 'doChans', 'doJoin', 'doPart', 'doMessage', 'updateActive' );

		this.connection = parameters.connection;
		this.socket = this.connection.socket;

		this.add({
			status: true,
			display_name: 'status'
		});

		this.socket.on( 'chans', this.doChans );
		this.socket.on( 'join', this.doJoin );
		this.socket.on( 'part', this.doPart );
		this.socket.on( 'message', this.doMessage );
		this.on( 'remove', this.updateActive );

	},

	join: function( name ){

		this.socket.emit( 'join', name );

	},

	part: function( name ){

		this.socket.emit( 'part', name );

	},

	doChans: function( channels ){

		var channels_to_join = [];
		for( var i in channels ) channels_to_join.push({
			channel: true,
			name: channels[i],
			display_name: channels[i]
		});

		this.add( channels_to_join );
		if( this.last() ) this.last().active();

	},

	doJoin: function( channel, nick, message ){

		if( nick === this.connection.get('nick') ){

			this.add({
				channel: true,
				name: channel,
				display_name: channel
			});

		}

	},

	doPart: function( channel, nick, reason, message ){

		if( nick === this.connection.get('nick') ){

			var parted_channel = this.where({ name: channel })[0];

			this.remove( parted_channel );

		}

	},

	doMessage: function( from, to, text, timestamp ){

		var nick = this.connection.get('nick');		
		var channel = ( to === nick )? from: to;
		var existing_channels = this.where({ name: channel });

		if( existing_channels.length === 0 ){

			this.add({
				private_channel: true,
				name: channel,
				display_name: channel
			});

			var private_channel = this.last();

			// pass the new channel the message event, since it missed it
			private_channel.messages.doMessage.apply( private_channel.messages, arguments );

		}

	},

	updateActive: function( channel, channels, options ){

		if( channel.get('active') ){
			var parted_index = options.index;
			var next_channel = this.at( parted_index );
			var previous_channel = this.at( parted_index - 1 );
			var next_active_channel = next_channel || previous_channel;
			
			if( next_active_channel ){
				next_active_channel.active();
				console.log('activate next active channel');
			}
			else {
				irc.trigger( 'channels:active', null );
				console.log('say, we have no active channels');
			}
		}

	}

});