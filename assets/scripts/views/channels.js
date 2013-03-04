irc.Views.Channels = Backbone.View.extend({

	template: irc.templates.channels,

	initialize: function(){

		_(this).bindAll( 'render', 'renderChannel' );

		this.listenTo( this.collection, 'add', this.renderChannel );

	},

	render: function(){

		var html = this.template();
		var $channels = $.parseHTML( html );
		this.setElement( $channels );
		this.collection.each( this.renderChannel );
		this.$el.sortable({
			axis: 'y',
			revert: 100
		});

		return this;

	},

	renderChannel: function( channel ){

		var channel_listing_view = new irc.Views.ChannelListing({ model: channel });
		var $channel_listing = channel_listing_view.render().$el;
		this.$el.append( $channel_listing );

	}

});