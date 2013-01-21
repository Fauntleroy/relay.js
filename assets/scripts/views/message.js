irc.Views.Message = Backbone.View.extend({

	template: templates.message,

	initialize: function(){

		_( this ).bindAll( 'render' );

	},

	render: function(){

		var json = this.model.toJSON();
		var html = this.template( json );
		this.setElement( html );

		this.$el
		.links()
		.emojify({
			url: CDN_URL +'emoji',
			attr: {
				'class': 'emoji'
			}
		});

		return this;

	}

});