irc.Views.Connections = Backbone.View.extend({

	el: '#connections',
	template: templates.connections,

	events: {
		'click button[name="new_connection"]': 'clickNewConnection'
	},

	initialize: function(){

		_( this ).bindAll( 'render', 'renderConnection' );

		this.collection.on( 'add', this.renderConnection );

		this.render();

	},

	render: function(){

		var html = this.template();
		this.$el.html( html );

		this.$connections = this.$el.children('ul.list');

		this.collection.each( this.renderConnection );

		return this;

	},

	renderConnection: function( connection ){

		var connection_view = new irc.Views.Connection({ model: connection });
		var $connection = connection_view.render().$el;

		this.$connections.append( $connection );

	},

	clickNewConnection: function( e ){

		e.preventDefault();

		irc.views.connect.show();

	}

});