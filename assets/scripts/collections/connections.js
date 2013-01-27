irc.Collections.Connections = Backbone.Collection.extend({

	model: irc.Models.Connection,

	initialize: function(){

		_( this ).bindAll( 'doIRCConnection', 'updateActiveChannel' );

		irc.socket.on( 'irc_connection', this.doIRCConnection );

		this.on( 'remove', this.updateActiveChannel );

	},

	doIRCConnection: function( parameters ){

		this.add( parameters );

	},

	updateActiveChannel: function( connection, connections, options ){

		var index = options.index;
		var active = connection.channels.where({ active: true });

		if( active ){

			var next_connection = this.at( index );
			var previous_connection = this.at( index - 1 );
			var next_active_connection = next_connection || previous_connection;
			
			if( next_active_connection ){
				next_active_connection.channels.at(0).active();
			}
			else {
				irc.trigger( 'channels:active', null );
			}

		}

	}

});