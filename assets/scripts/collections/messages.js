irc.Collections.Messages = Backbone.Collection.extend({

	model: irc.Models.Message,

	initialize: function( models, parameters ){

		this.channel = parameters.channel;
		this.socket = irc.socket;

		_( this ).bindAll( 'say', 'doMessage' );

		this.socket.on( 'message', this.doMessage );

	},

	say: function( message ){

		this.socket.emit( 'say', this.channel, message );

	},

	doMessage: function( from, to, message ){

		if( to === this.channel ){
			console.log( message );
			this.add({
				user: from,
				contents: message
			});

		}

	}

});