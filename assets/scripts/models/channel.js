irc.Models.Channel = Backbone.Model.extend({

	defaults: {
		type: 'channel',
		active: false,
		unread: 0
	},

	initialize: function(){

		_( this ).bindAll( 'active', 'part', 'doAddMessage', 'doActive', 'doTopic' );

		this.connection = this.collection.connection;
		this.socket = this.connection.socket;

		this.messages = new irc.Collections.Messages( null, { channel: this, connection: this.connection });
		this.users = new irc.Collections.Users( null, { channel: this, connection: this.connection })

		this.messages.on( 'add', this.doAddMessage );
		this.socket.on( 'topic', this.doTopic );

		irc.on( 'channels:active', this.doActive );

		this.active();

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

		this.socket.emit( 'part', this.get('name') );

	},

	doAddMessage: function( message ){

		irc.trigger( 'active:messages:add', message );

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