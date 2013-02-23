irc.Views.Connection = Backbone.View.extend({

	template: templates.connection,

	events: {
		'click div.info a[href="#quit"]': 'clickQuit'
	},

	initialize: function(){

		_( this ).bindAll( 'render', 'clickQuit', 'renderNick', 'destroy' );

		this.listenTo( this.model, 'remove', this.destroy );
		this.listenTo( this.model, 'change:nick', this.renderNick );

	},

	render: function(){

		var html = this.template( this.model.toJSON() );
		var $connection = $.parseHTML( html );
		this.setElement( $connection );

		this.$info = this.$el.children('.info');
		this.$nick = this.$info.find('.nick');
		this.$channels = this.$el.children('.channels');

		this.channels = new irc.Views.Channels({ collection: this.model.channels, $el: this.$channels });
		var $channels = this.channels.render().$el;
		this.$channels.html( $channels );

		return this;

	},

	renderNick: function( connection, nick ){

		this.$nick.text( nick );

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