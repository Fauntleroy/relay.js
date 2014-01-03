var Backbone = require('backbone');
var _ = require('underscore');
var Messages = require('../collections/messages.js');
var Users = require('../collections/users.js');

module.exports = Backbone.Model.extend({
	defaults: {
		type: 'channel',
		active: false,
		unread: 0
	},
	initialize: function(){
		_( this ).bindAll( 'active', 'part', 'end', 'doAddMessage', 'doActive', 'doTopic' );
		this.socket = this.collection.socket;
		this.mediator = this.collection.mediator;
		this.connection = this.collection.connection;
		var config = {
			channel: this,
			connection: this.connection,
			socket: this.socket,
			mediator: this.mediator
		};
		this.messages = new Messages( null, config );
		this.users = new Users( null, config );
		this.messages.on( 'add', this.doAddMessage );
		this.socket.on( 'topic', this.doTopic );
		this.listenTo( this.mediator, 'channels:active', this.doActive );
	},
	active: function(){
		if( !this.get('active') ){
			this.set({
				active: true,
				unread: 0
			});
			this.trigger( 'active', this );
			this.mediator.trigger( 'channels:active', this );
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
		this.destroy();
	},
	doAddMessage: function( message ){
		if( this.get('active') ) this.mediator.trigger( 'active:messages:add', message.toJSON() );
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