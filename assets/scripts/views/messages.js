irc.Views.Messages = Backbone.View.extend({

	template: templates.messages,

	events: {
		'submit form.new': 'submitNew'
	},

	initialize: function(){

		_( this ).bindAll( 'render', 'renderMessage' );

		this.collection.on( 'add', this.renderMessage );

	},

	render: function(){

		var html = this.template();
		this.$el.html( html );

		this.$form = this.$el.find('form.new');
		this.$new_message = this.$form.find('input[name="message"]');
		this.$messages = this.$el.find('ul.list');

		this.collection.each( this.renderMessage );

	},

	renderMessage: function( message ){

		var message_view = new irc.Views.Message({ model: message });
		var $message = message_view.render().$el;

		this.$messages.append( $message );

	},

	submitNew: function( e ){

		e.preventDefault();

		var message = $.trim( this.$new_message.val() );

		if( message !== '' ){

			var message_bits = message.split(' ');
			var command = message_bits.shift();

			if( command.match( /^\/msg/i ) ){

				this.collection.socket.emit( 'say', message_bits.shift(), message_bits.join(' ') );

			}
			else if( command.match( /^\/notice/i ) ){

				this.collection.socket.emit( 'notice', message_bits.shift(), message_bits.join(' ') );

			}
			else if( command.match( /^\/(?:me|action)/i ) ){

				this.collection.socket.emit( 'action', this.collection.channel, message_bits.join(' ') );

			}
			else if( command.match( /^\/topic/i ) ){

				this.collection.socket.emit( 'topic', this.collection.channel, message_bits.join(' ') );

			}
			else if( command.match( /^\/join/i ) ){

				this.collection.socket.emit( 'join', message_bits[0] );

			}
			else if( command.match( /^\/part/i ) ){

				this.collection.socket.emit( 'part', this.collection.channel );

			}
			else if( command.match( /^\/quit/i ) ){

				this.collection.socket.emit( 'quit', message_bits.join(' ') );

			}
			else if( this.collection.get('private') ){

				this.collection.say( this.collection.get('name'), message );

			}
			else {

				this.collection.say( message );

			}

			this.$new_message.val('');

		}

	}

});