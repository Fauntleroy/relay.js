irc.Views.Connections = Backbone.View.extend({

	el: '#connections',
	template: irc.templates.connections,

	events: {
		'click button[name="new_connection"]': 'clickNewConnection'
	},

	initialize: function(){

		_( this ).bindAll( 'render', 'renderConnection' );

		this.listenTo( this.collection, 'add', this.renderConnection );
		this.listenTo( this.collection, 'add remove reset', this.toggleNewConnection );

		this.render();
		this.toggleNewConnection();

	},

	render: function(){

		var html = this.template();
		var $connections = $.parseHTML( html );
		this.$el.html( $connections );

		this.$connections = this.$el.children('ul.list');
		this.$new_connection = this.$el.find('button[name="new_connection"]');

		this.collection.each( this.renderConnection );

		return this;

	},

	renderConnection: function( connection ){

		var connection_view = new irc.Views.Connection({ model: connection });
		var $connection = connection_view.render().$el;

		this.$connections.append( $connection );

	},

	toggleNewConnection: function(){

		var show_hide = ( this.collection.length < ( irc.config.max_connections || Infinity ) );
		this.$new_connection.toggle( show_hide );

	},

	clickNewConnection: function( e ){

		e.preventDefault();

		irc.views.connect.show();

	}

});