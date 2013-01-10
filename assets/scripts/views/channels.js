irc.Views.Channels = Backbone.View.extend({

	template: templates.channels,
	channel_template: templates.channel_listing,

	events: {
		'click a.name': 'clickName',
		'click a.part': 'clickPart'
	},

	initialize: function(){

		_(this).bindAll( 'render', 'renderChannel', 'removeChannel', 'clickName', 'clickPart' );

		this.listenTo( this.collection, 'add', this.renderChannel );
		this.listenTo( this.collection, 'remove', this.removeChannel );

	},

	render: function(){

		var html = this.template();
		this.$el.html( html );

		this.$channels = this.$el.find('ul.list');

		this.collection.each( this.renderChannel );

		return this;

	},

	renderChannel: function( channel ){

		this.$channels.append( this.channel_template( channel.toJSON() ) );

	},

	removeChannel: function( channel ){

		var index = this.collection.indexOf( channel );
		var $channel = this.$channels.find('li:eq('+ index +')');

		$channel.remove();

	},

	clickName: function( e ){

		e.preventDefault();

		var $target = $( e.target );
		var $channel = $target.closest('li');
		var index = $channel.index();

		this.collection.at( index ).active();

	},

	clickPart: function( e ){

		e.preventDefault();

		var $target = $( e.target );
		var $channel = $target.closest('li');
		var index = $channel.index();
		var channel = this.collection.at( index );

		this.collection.part( channel.get('name') );

	}

});