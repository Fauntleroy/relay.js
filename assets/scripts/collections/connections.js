irc.Collections.Connections = Backbone.Collection.extend({

	model: irc.Models.Connection,

	initialize: function(){

		_( this ).bindAll( 'doIRCConnection' );

		irc.socket.on( 'irc_connection', this.doIRCConnection );

	},

	doIRCConnection: function( parameters ){

		this.add( parameters );

	}

});