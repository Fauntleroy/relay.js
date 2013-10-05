var Backbone = require('backbone');
var $ = Backbone.$ = require('jquery');
var _ = require('lodash');
var Handlebars = require('handlebars');

module.exports = Backbone.View.extend({
	template: Handlebars.compile('<ul class="list"></ul>'),
	channel_template: Handlebars.compile('<li data-id="{{id}}" data-name="{{name}}">\
		<a class="name" href="{{display_name}}">\
			<h5>{{#private_channel}}<i class="icon-comment"></i> {{/private_channel}}{{display_name}}</h5>\
			<span class="unread badge badge-info">0</span>\
		</a>\
		{{^status}}<a class="part" href="#part">&times;</a>{{/status}}\
	</li>'),
	events: {
		'click a.name': 'clickName',
		'click a.part': 'clickPart'
	},
	initialize: function( data, config ){
		_(this).bindAll( 'render', 'renderChannel', 'updateUnread', 'updateActive', 'clickName', 'clickPart' );
		this.mediator = config.mediator;
		this.listenTo( this.collection, 'add', this.renderChannel );
		this.listenTo( this.collection, 'remove destroy', this.remove );
		this.listenTo( this.collection, 'change:unread', this.updateUnread );
		this.listenTo( this.mediator, 'channels:active', this.updateActive );
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
		var html = this.channel_template( channel.toJSON() );
		var $channel = $.parseHTML( html );
		this.$el.append( $channel );
		return this;
	},
	updateUnread: function( channel, unread ){
		var $channel = this.$el.children('[data-id="'+ channel.id +'"]');
		$channel
			.toggleClass( 'unread', ( unread > 0 ) )
			.find('.unread').text( unread );
	},
	updateActive: function( name ){
		var $channel = this.$el.children('[data-name="'+ name +'"]');
		$channel
			.addClass('active')
			.siblings().removeClass('active');
	},
	clickName: function( e ){
		e.preventDefault();
		var $channel = $(e.target).closest('li');
		var id = $channel.data('id');
		this.collection.get( id ).active();
	},
	clickPart: function( e ){
		e.preventDefault();
		var $channel = $(e.target).closest('li');
		var id = $channel.data('id');
		this.collection.get( id ).part();
	}
});