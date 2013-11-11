var Backbone = require('backbone');
var _ = require('lodash');
var Visibility = require('visibility');

module.exports = Backbone.Model.extend({
	defaults: {
		title: document.title,
		unread: 0,
		channel: null
	},
	initialize: function( data, mediator ){
		_( this ).bindAll( 'updateVisibility', 'clearUnread' );
		this.mediator = mediator;
		this.listenTo( this.mediator, 'chat:active:message', this.updateUnread );
		this.listenTo( this.mediator, 'channels:active', this.updateChannel );
		Visibility.change( this.updateVisibility );
	},
	isHidden: function(){
		return Visibility.hidden();
	},
	updateUnread: function(){
		if( !this.isHidden() ) return;
		this.set( 'unread', this.get('unread') + 1 );
	},
	updateChannel: function( channel ){
		this.set( 'channel', channel );
	},
	updateVisibility: function( e, state ){
		if( state === 'visible' ) this.clearUnread();
	},
	clearUnread: function(){
		this.set( 'unread', 0 );
	},
	getTitle: function(){
		var title_string = '';
		var unread = this.get('unread');
		var channel = this.get('channel');
		if( unread ) title_string += '('+ unread +') ';
		title_string += channel ? channel.get('display_name') : this.get('title');
		return title_string;
	}
});