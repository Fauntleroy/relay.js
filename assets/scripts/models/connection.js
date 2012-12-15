irc.Models.Connection = Backbone.Model.extend({

	initialize: function( attributes ){

		this.socket = io.connect( attributes.namespace );
console.log( this.socket, attributes );
		this.channels = new irc.Collections.Channels( null, { connection: this });

	}

});