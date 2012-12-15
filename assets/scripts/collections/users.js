irc.Collections.Users = Backbone.Collection.extend({

	model: irc.Models.User,

	initialize: function( models, parameters ){

		this.channel = parameters.channel;

	}

});