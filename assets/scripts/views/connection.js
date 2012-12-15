irc.Views.Connection = Backbone.View.extend({

	template: templates.connection,

	initialize: function(){

		_( this ).bindAll( 'render', 'destroy' );

		this.model.on( 'remove', this.destroy );

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

	destroy: function(){

		this.off();
		this.remove();

	}

});