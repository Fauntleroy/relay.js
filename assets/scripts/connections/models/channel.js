var Backbone = require('backbone');
var _ = require('lodash');

module.exports = Backbone.Model.extend({
	defaults: {
		type: 'channel',
		active: false,
		unread: 0
	},
	initialize: function(){
		_( this ).bindAll( 'active', 'part', 'end', 'doAddMessage', 'doActive', 'doTopic' );
		this.socket = this.collection.socket;
		this.messages = new irc.Collections.Messages( null, { channel: this });
		this.users = new irc.Collections.Users( null, { channel: this });
		this.messages.on( 'add', this.doAddMessage );
		this.socket.on( 'topic', this.doTopic );
		irc.on( 'channels:active', this.doActive );
	},
	active: function(){
		if( !this.get('active') ){
			this.set({
				active: true,
				unread: 0
			});
			this.trigger( 'active', this );
			irc.trigger( 'channels:active', this );
		}
	},
	part: function(){
		if( this.get('channel') ){
			this.socket.emit( 'command', '/part '+ this.get('name') );
		}
		this.end();
	},
	// ensure this model never lives again
	end: function(){
		this.messages.off();
		this.socket.removeListener( 'topic', this.doTopic );
		irc.off( 'channels:active', this.doActive );
		this.destroy();
	},
	doAddMessage: function( message ){
		if( this.get('active') ) irc.trigger( 'active:messages:add', message );
		if( !this.get('active') && message.get('message') ){
			var unread = this.get('unread');
			this.set( 'unread', unread + 1 );
		}
	},
	doActive: function( channel ){
		if( channel !== this ){
			this.set( 'active', false );
		}
	},
	doTopic: function( channel, topic, nick ){
		if( channel === this.get('name') ){
			this.set( 'topic', topic );
		}
	}
});