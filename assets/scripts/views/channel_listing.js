irc.Views.ChannelListing = Backbone.View.extend({

	template: templates.channel_listing,

	events: {
		'click a.name': 'clickName',
		'click a.part': 'clickPart'
	},

	initialize: function(){

		_( this ).bindAll( 'render', 'remove', 'updateUnread', 'clickName', 'clickPart' );

		this.listenTo( this.model, 'remove destroy', this.remove );
		this.listenTo( this.model, 'change:unread', this.updateUnread );

	},

	render: function(){

		var html = this.template( this.model.toJSON() );
		this.setElement( html );

		this.$name = this.$el.children('.name');
		this.$unread = this.$el.children('.unread');

		return this;

	},

	updateUnread: function( channel, unread ){

		this.$unread.text( unread );
		this.$el.toggleClass( 'unread', ( unread > 0 ) );

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