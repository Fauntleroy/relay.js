irc.Views.Connection = Backbone.View.extend({

	template: templates.connection,

	events: {
		'click div.info a[href="#quit"]': 'clickQuit'
	},

	initialize: function(){

		_( this ).bindAll( 'render', 'clickQuit', 'destroy' );

		this.listenTo( this.model, 'remove', this.destroy );

	},

	render: function(){

		var html = this.template( this.model.toJSON() );
		this.setElement( html );

		this.$info = this.$el.children('.info');
		this.$channels = this.$el.children('.channels');

		this.channels = new irc.Views.Channels({ collection: this.model.channels, $el: this.$channels });
		var $channels = this.channels.render().$el;console.log( this.$channels.length, $channels.length );
		this.$channels.html( $channels );

		return this;

	},

	clickQuit: function( e ){

		e.preventDefault();

		this.model.quit();

	},

	destroy: function(){

		this.off();
		this.remove();

	}

});