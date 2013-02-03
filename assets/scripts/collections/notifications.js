irc.Collections.Notifications = Backbone.Collection.extend({

	initialize: function(){

		_( this ).bindAll( 'doAdd' );

		irc.on( 'notifications:add', this.doAdd );

	},

	doAdd: function( data ){

		this.add( data );

	}

});