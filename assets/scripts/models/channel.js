irc.Models.Channel = Backbone.Model.extend({

	initialize: function(){

		_(this).bindAll( 'active' );

		this.connection = this.collection.connection;
		this.socket = this.connection.socket;

		this.messages = new irc.Collections.Messages( null, { channel: this.get('name'), connection: this.connection });
		this.users = new irc.Collections.Users( null, { channel: this.get('name'), connection: this.connection })

		this.active();

	},

	active: function(){

		irc.trigger( 'channels:active', this );

	}

});