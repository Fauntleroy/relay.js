var Backbone = require('backbone');
var $ = Backbone.$ = require('jquery');
var _ = require('underscore');
var Handlebars = require('handlebars');
var templates = require('../../compiled/templates.js')( Handlebars );

module.exports = Backbone.View.extend({
	template: templates.channel_listing,
	events: {
		'click a.name': 'clickName',
		'click a.part': 'clickPart'
	},
	initialize: function(){
		_( this ).bindAll( 'updateUnread', 'updateActive', 'clickName', 'clickPart', 'remove' );
		this.listenTo( this.model, 'change:unread', this.updateUnread );
		this.listenTo( this.model, 'change:active', this.updateActive );
		this.listenTo( this.model, 'remove destroy', this.remove );
		this.render();
	},
	render: function(){
		var html = this.template( this.model.toJSON() );
		var $channel_listing = $( html );
		this.setElement( $channel_listing );
		this.$unread = this.$el.find('.unread');
	},
	updateUnread: function( channel, unread ){
		this.$el.toggleClass( 'unread', ( unread > 0 ) );
		this.$unread.text( unread );
	},
	updateActive: function( channel, active ){
		this.$el.toggleClass( 'active', active );
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