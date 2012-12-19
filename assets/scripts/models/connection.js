irc.Models.Connection = Backbone.Model.extend({

	initialize: function( attributes ){

		_( this ).bindAll( 'quit', 'doQuit' );

		this.socket = io.connect( attributes.namespace );

		this.channels = new irc.Collections.Channels( null, { connection: this });

		this.socket.on( 'quit', this.doQuit );

	},

	quit: function(){

		this.socket.emit('quit');

	},

	doQuit: function( nick, reason, channels ){

		if( nick === this.get('nick') ){

			this.collection.remove( this );

		}

	}

});