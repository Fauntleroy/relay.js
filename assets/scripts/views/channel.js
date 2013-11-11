var CDN_URL = 'https://s3-us-west-2.amazonaws.com/relayjs/';

var Backbone = require('backbone');
var $ = Backbone.$ = require('jquery');
require('jquery.links');
require('jquery.emojify');
require('jquery.resize');
var _ = require('lodash');
var Handlebars = require('handlebars');
var templates = require('../../compiled/templates.js')( Handlebars );
var MessagesView = require('./messages.js');
var UsersView = require('./users.js');

module.exports = Backbone.View.extend({
	template: templates.channel,
	initialize: function( config ){
		this.mediator = config.mediator;
		_( this ).bindAll( 'render', 'clear', 'renderChannel', 'renderTopic', 'resizeMessages' );
		this.listenTo( this.mediator, 'channels:active', this.renderChannel );
	},
	render: function(){
		var html = this.template( this.model.toJSON() );
		var $channel = $.parseHTML( html );
		this.$el.html( $channel );
		// cache elements
		this.$info = this.$('> .info');
		this.$topic = this.$('.topic');
		this.$messages = this.$('.messages');
		this.$users = this.$('.users');
		// render the topic immediately
		this.renderTopic( this.model.get('name'), this.model.get('topic') );
		// Manage the subviews
		if( this.messages ) this.messages.remove();
		if( this.users ) this.users.remove();
		this.messages = new MessagesView({ collection: this.model.messages, el: this.$messages });
		this.messages.render();
		if( this.model.get('channel') ){
			this.users = new UsersView({ collection: this.model.users, el: this.$users });
			this.users.render();
		}
		this.messages.$new_message.focus();
		this.$info.on( 'resize', this.resizeMessages );
		this.resizeMessages();
	},
	clear: function(){
		this.$el.empty();
	},
	renderChannel: function( channel ){
		this.model = channel;
		if( this.model ){
			this.listenTo( this.model, 'change:topic', this.renderTopic );
			this.render();
		}
		else {
			this.clear();
		}
	},
	renderTopic: function( channel, topic ){
		topic = topic || '';
		this.$topic
		.text( topic )
		.links()
		.emojify({
			url: CDN_URL +'emoji',
			attr: {
				'class': 'emoji'
			}
		});
	},
	resizeMessages: function( e ){
		var height = this.$info.outerHeight( true );
		this.$messages.css( 'top', height + 1 );
	}
});