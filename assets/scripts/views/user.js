irc.Views.User = Backbone.View.extend({

	template: templates.user,

	initialize: function(){

		_( this ).bindAll( 'render', 'destroy' );

		this.listenTo( this.model, 'remove', this.destroy );

	},

	render: function(){

		var html = this.template( this.model.toJSON() );
		this.setElement( html );

		return this;

	},

	destroy: function(){

		this.off();
		this.remove();

	}

});