irc.Models.Channel = Backbone.Model.extend({

	defaults: {
		type: 'channel',
		active: false
	},

	initialize: function(){

		_( this ).bindAll( 'active', 'doActive', 'doTopic' );

		this.connection = this.collection.connection;
		this.socket = this.connection.socket;

		this.messages = new irc.Collections.Messages( null, { channel: this, connection: this.connection });
		this.users = new irc.Collections.Users( null, { channel: this, connection: this.connection })

		this.socket.on( 'topic', this.doTopic );

		irc.on( 'channels:active', this.doActive );

		this.active();

	},

	active: function(){

		if( !this.get('active') ){

			this.set( 'active', true );
			irc.trigger( 'channels:active', this );

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