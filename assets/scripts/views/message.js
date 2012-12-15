irc.Views.Message = Backbone.View.extend({

	template: templates.message,

	initialize: function(){

		_( this ).bindAll( 'render' );

	},

	render: function(){

		var html = this.template( this.model.toJSON() );
		this.setElement( html );

		return this;

	}

});