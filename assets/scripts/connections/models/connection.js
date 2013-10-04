var Backbone = require('backbone');
var _ = require('lodash');

module.exports = Backbone.Model.extend({
	initialize: function( attributes ){
		_( this ).bindAll( 'quit', 'doQuit', 'doNick', 'doRegister' );
		this.socket = io.connect( attributes.namespace );
		this.channels = new irc.Collections.Channels( null, { connection: this });
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