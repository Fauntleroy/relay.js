irc.Models.Connection = Backbone.Model.extend({

	initialize: function( attributes ){

		_( this ).bindAll( 'quit', 'doQuit', 'doNick' );

		this.socket = io.connect( attributes.namespace );

		this.channels = new irc.Collections.Channels( null, { connection: this });

		this.socket.on( 'quit', this.doQuit );
		this.socket.on( 'nick', this.doNick );

	},

	quit: function(){

		this.socket.emit('quit');

	},

	doQuit: function( nick, reason, channels ){

		if( nick === this.get('nick') ){

			this.collection.remove( this );

		}

	},

	doNick: function( old_nick, new_nick, channels ){

		if( old_nick === this.get('nick') ){
			
			this.set( 'nick', new_nick );

		}

	}

});