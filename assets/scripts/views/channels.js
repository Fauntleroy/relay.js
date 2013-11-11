var Backbone = require('backbone');
var $ = Backbone.$ = require('jquery');
require('jquery-ui');
var _ = require('lodash');
var Handlebars = require('handlebars');
var templates = require('../../compiled/templates.js')( Handlebars );
var ChannelListingView = require('../views/channel_listing.js');

module.exports = Backbone.View.extend({
	template: templates.channels,
	initialize: function( data, config ){
		_(this).bindAll( 'render', 'renderChannel' );
		this.listenTo( this.collection, 'add', this.renderChannel );
		this.render();
	},
	render: function(){
		var html = this.template();
		this.$el.html( html );
		this.$channels = this.$el.find('ul.list');
		this.collection.each( this.renderChannel );
		this.$channels.sortable({
			axis: 'y',
			revert: 100
		});
		return this;
	},
	renderChannel: function( channel ){
		var channel_view = new ChannelListingView({ model: channel });
		this.$channels.append( channel_view.$el );
	}
});