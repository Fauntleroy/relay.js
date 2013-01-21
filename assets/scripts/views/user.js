irc.Views.User = Backbone.View.extend({

	template: templates.user,

	initialize: function(){

		_( this ).bindAll( 'render', 'destroy' );

		this.listenTo( this.model, 'remove', this.destroy );
		this.listenTo( this.model, 'change', this.render );

	},

	render: function(){

		var html = this.template( this.model.toJSON() );
		var $user = $( html );
		this.$el.replaceWith( $user );
		this.setElement( $user );

		return this;

	},

	destroy: function(){

		this.off();
		this.remove();

	}

});