var Backbone = require('backbone');
var _ = require('lodash');
var Channels = require('../collections/channels.js');

module.exports = Backbone.Model.extend({
	initialize: function( data, config ){
		config = config || {};
		config.mediator = this.mediator = this.collection.mediator;
		config.namespace = data.namespace; // attach this new connection to the config data
		config.connection = this;
		_( this ).bindAll( 'quit', 'doQuit', 'doNick', 'doRegister' );
		this.socket = config.socket || io.connect( data.namespace );
		this.channels = new Channels( null, config );
		this.socket.on( 'quit', this.doQuit );
		this.socket.on( 'nick', this.doNick );
		this.socket.on( 'registered', this.doRegister );
	},
	quit: function(){
		this.socket.emit( 'command', '/quit' );
		this.collection.remove( this );
	},
	doQuit: function( nick, reason, channels ){
		if( nick === this.get('nick') ){
			if( this.collection ) this.collection.remove( this );
		}
	},
	doNick: function( old_nick, new_nick, channels ){
		if( old_nick === this.get('nick') ){
			this.set( 'nick', new_nick );
		}
	},
	doRegister: function( message ){
		var nick = message.args[0];
		if( nick !== this.get('nick') ){
			this.set( 'nick', nick );
		}
	}

});