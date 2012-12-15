irc.Models.Channel = Backbone.Model.extend({

	initialize: function(){

		_(this).bindAll( 'active' );

		this.messages = new irc.Collections.Messages( null, { channel: this.get('name') });
		this.users = new irc.Collections.Users( null, { channel: this.get('name') })

	},

	active: function(){

		irc.trigger( 'channels:active', this );

	}

});