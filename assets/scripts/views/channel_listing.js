irc.Views.ChannelListing = Backbone.View.extend({

	template: templates.channel_listing,

	events: {
		'click a.name': 'clickName',
		'click a.part': 'clickPart'
	},

	initialize: function(){

		_( this ).bindAll( 'render', 'remove', 'clickName', 'clickPart' );

		this.listenTo( this.model, 'remove destroy', this.remove );

	},

	render: function(){

		var html = this.template( this.model.toJSON() );
		this.setElement( html );

		this.$name = this.$el.children('.name');

		return this;

	},

	clickName: function( e ){

		e.preventDefault();

		this.model.active();

	},

	clickPart: function( e ){

		e.preventDefault();

		this.model.part();

	}

});