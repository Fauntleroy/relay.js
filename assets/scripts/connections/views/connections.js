var Backbone = require('backbone');
var $ = Backbone.$ = require('jquery');
var _ = require('lodash');
var Handlebars = require('handlebars');
var Channels = require('../../channels');

module.exports = Backbone.View.extend({
	template: Handlebars.compile('<ul class="list"></ul>\
	<button name="new_connection" class="btn"><i class="icon-plus"></i> New Connection</button>'),
	connection_template: Handlebars.compile('<li data-id="{{id}}">\
		<div class="info">\
			<strong class="server">{{server}}</strong> (<em class="nick">{{nick}}</em>)\
			<a class="disconnect" href="#quit">&times;</a>\
		</div>\
		<div class="channels"></div>\
	</li>'),
	events: {
		'click button[name="new_connection"]': 'clickNewConnection',
		'click div.info a[href="#quit"]': 'clickQuit'
	},
	initialize: function(){
		_( this ).bindAll( 'render', 'renderConnection' );
		this.listenTo( this.collection, 'add', this.renderConnection );
		this.listenTo( this.collection, 'add remove reset', this.toggleNewConnection );
		this.listenTo( this.collection, 'remove', this.destroy );
		this.listenTo( this.collection, 'change:nick', this.renderNick );
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
		var html = this.template( connection.toJSON() );
		var $connection = $.parseHTML( html );
		this.$connections.append( $connection );
		return this;
	},
	renderNick: function( connection, nick ){
		var $connection = this.$connections.children('[data-id="'+ connection.id +'"]');
		$connection.find('.nick').text( nick );
	},
	toggleNewConnection: function(){
		var show_hide = ( this.collection.length < ( irc.config.max_connections || Infinity ) );
		this.$new_connection.toggle( show_hide );
	},
	clickNewConnection: function( e ){
		e.preventDefault();
		irc.views.connect.show();
	},
	clickQuit: function( e ){
		e.preventDefault();
		var $connection = $(e.target).closest('li');
		var id = $connection.data('id');
		var connection = this.collection.get( id );
		connection.quit();
	},
});