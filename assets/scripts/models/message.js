irc.Models.Message = Backbone.Model.extend({

	initialize: function(){

		var user = this.collection.channel.users.findWhere({ nick: this.get('nick') }); // bad

		if( user ) this.set( 'presence_id', user.get('presence_id') );

	}

});