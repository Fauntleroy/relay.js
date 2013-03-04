irc.Views.Notification = Backbone.View.extend({

	template: irc.templates.notification,

	events: {
		'click button.close': 'clickClose'
	},

	initialize: function(){

		_( this ).bindAll( 'render', 'remove', 'clickClose' );

		this.listenTo( this.model, 'remove', this.remove );

	},

	render: function(){

		var json = this.model.toJSON();
		var html = this.template( json );
		var $notification = $.parseHTML( html );
		this.setElement( $notification );

		return this;

	},

	clickClose: function( e ){

		e.preventDefault();

		this.model.destroy();

	}

});