irc.Views.ChannelListing = Backbone.View.extend({

	template: templates.channel_listing,

	events: {
		'click a.name': 'clickName',
		'click a.part': 'clickPart'
	},

	initialize: function(){

		_( this ).bindAll( 'render', 'remove', 'updateUnread', 'updateActive', 'clickName', 'clickPart' );

		this.listenTo( this.model, 'remove destroy', this.remove );
		this.listenTo( this.model, 'change:unread', this.updateUnread );
		this.listenTo( irc, 'channels:active', this.updateActive );

	},

	render: function(){

		var html = this.template( this.model.toJSON() );
		var $channel_listing = $.parseHTML( html );
		this.setElement( $channel_listing );
		this.updateActive();

		this.$name = this.$el.children('.name');
		this.$unread = this.$el.find('.unread');

		return this;

	},

	updateUnread: function( channel, unread ){

		this.$unread.text( unread );
		this.$el.toggleClass( 'unread', ( unread > 0 ) );

	},

	updateActive: function(){

		this.$el.toggleClass( 'active', this.model.get('active') );

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