irc.Models.Channel = Backbone.Model.extend({

	initialize: function(){

		_(this).bindAll( 'active' );

	},

	active: function(){

		irc.trigger( 'channels:active', this );

	}

});