var Backbone = require('backbone');
var $ = Backbone.$ = require('jquery');
var _ = require('underscore');
var Handlebars = require('handlebars');
var templates = require('../../compiled/templates.js')( Handlebars );
var ChannelsView = require('./channels.js');

module.exports = Backbone.View.extend({
	template: templates.connection,
	events: {
		'click a[href="#quit"]': 'clickQuit'
	},
	initialize: function(){
		_( this ).bindAll( 'updateNick', 'clickQuit', 'remove' );
		this.listenTo( this.model, 'change:nick', this.updateNick );
		this.listenTo( this.model, 'destroy remove', this.remove );
		this.render();
	},
	render: function(){
		var html = this.template( this.model.toJSON() );
		var $connection = $( html );
		new ChannelsView({
			el: $connection.find('.channels'),
			collection: this.model.channels
		});
		this.setElement( $connection );
		this.$nick = this.$el.find('.nick');
	},
	updateNick: function( connection, nick ){
		this.$nick.text( nick );
	},
	clickQuit: function( e ){
		e.preventDefault();
		this.model.quit();
	}
});