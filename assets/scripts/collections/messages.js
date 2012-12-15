irc.Collections.Messages = Backbone.Collection.extend({

	model: irc.Models.Message,

	initialize: function( models, parameters ){

		this.channel = parameters.channel;
		this.connection = parameters.connection;
		this.socket = this.connection.socket;

		_( this ).bindAll( 'say', 'doMessage' );

		this.socket.on( 'message', this.doMessage );

	},

	say: function( message ){

		this.socket.emit( 'say', this.channel, message );

	},

	doMessage: function( from, to, message ){

		if( to === this.channel ){
			console.log( from, to, message );
			this.add({
				user: from,
				contents: message
			});

		}

	}

});