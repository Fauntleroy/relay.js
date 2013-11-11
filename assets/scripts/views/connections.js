var Backbone = require('backbone');
var $ = Backbone.$ = require('jquery');
var _ = require('lodash');
var Handlebars = require('handlebars');
var ConnectionView = require('./connection.js');

module.exports = Backbone.View.extend({
	template: Handlebars.compile('<ul class="list"></ul>\
	<button name="new_connection" class="btn"><i class="icon-plus"></i> New Connection</button>'),
	events: {
		'click button[name="new_connection"]': 'clickNewConnection'
	},
	initialize: function(){
		_( this ).bindAll( 'render', 'renderConnection', 'toggleNewConnection', 'clickNewConnection' );
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
		var connection_view = new ConnectionView({ model: connection });
		this.$connections.append( connection_view.$el );
	},
	toggleNewConnection: function(){
		var show_hide = ( this.collection.length < this.collection.max );
		this.$new_connection.toggle( show_hide );
	},
	clickNewConnection: function( e ){
		e.preventDefault();
		this.collection.mediator.trigger('connect:show');
	}
});