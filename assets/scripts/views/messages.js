irc.Views.Messages = Backbone.View.extend({

	template: templates.messages,

	events: {
		'submit form.new': 'submitNew',
		'keypress :input[name="message"]': 'keyTextarea',
		'keydown :input[name="message"]': 'keydownTextarea',
		'keyup :input[name="message"]': 'keyupTextarea'
	},

	initialize: function(){

		_( this ).bindAll( 'render', 'renderMessage', 'scrollBottom', 'submitNew', 'keyTextarea', 'keydownTextarea', 'keyupTextarea' );

		this.listenTo( this.collection, 'add', this.renderMessage );
		$(window).on( 'resize', this.scrollBottom );

	},

	render: function(){

		var html = this.template();
		this.$el.html( html );

		this.$form = this.$el.find('form.new');
		this.$new_message = this.$form.find(':input[name="message"]');
		this.$messages = this.$el.find('ul.list');

		this.collection.each( this.renderMessage );

	},

	renderMessage: function( message ){

		var $last_message = this.$messages.find('.message:last-child');

		if( message.get('message') && message.get('nick') === $last_message.find('.nick').text() ){
			
			var append_message = new irc.Views.Message({ model: message });
			var $append_message = append_message.render().$el;
			var $append_message_content = $append_message.find('ul.contents > li');
			$last_message.find('ul.contents').append( $append_message_content );

		}
		else {

			var message_view = new irc.Views.Message({ model: message });
			var $message = message_view.render().$el;
			this.$messages.append( $message );

		}

		var force_scroll = ( message.get('nick') === this.collection.connection.get('nick') );
		this.scrollBottom( force_scroll );

	},

	// Scrolls to the bottom of the chat messages
	scrollBottom: function( force ){

		var frame_height = this.$messages.height();
		var frame_scrollheight = this.$messages[0].scrollHeight;
		var frame_scrolltop = this.$messages.scrollTop();
		var frame_scrollbottom = frame_scrolltop + frame_height;
		var last_message_height = this.$messages.children('li:last-child').height();
		var is_near_bottom = frame_scrollbottom + 30 > frame_scrollheight - last_message_height;

		if( is_near_bottom || force ){
			this.$messages.scrollTop( frame_scrollheight - frame_height );
		}

	},

	submitNew: function( e ){

		e.preventDefault();

		var message = $.trim( this.$new_message.val() );

		if( message !== '' ){

			var socket = this.collection.socket;
			var channel = this.collection.channel.get('name');
			var message_bits = message.split(' ');
			var command = message_bits.shift();

			if( command.match( /^\/msg/i ) ){

				socket.emit( 'say', message_bits.shift(), message_bits.join(' ') );

			}
			else if( command.match( /^\/notice/i ) ){

				socket.emit( 'notice', message_bits.shift(), message_bits.join(' ') );

			}
			else if( command.match( /^\/(?:me|action)/i ) ){

				socket.emit( 'action', channel, message_bits.join(' ') );

			}
			else if( command.match( /^\/topic/i ) ){

				socket.emit( 'topic', channel, message_bits.join(' ') );

			}
			else if( command.match( /^\/join/i ) ){

				socket.emit( 'join', message_bits[0] );

			}
			else if( command.match( /^\/part/i ) ){

				socket.emit( 'part', channel );

			}
			else if( command.match( /^\/quit/i ) ){

				socket.emit( 'quit', message_bits.join(' ') );

			}
			else if( command.match( /^\/nick/i ) ){

				socket.emit( 'nick', message_bits[0] );

			}

			// Channel Ops commands

			else if( command.match( /^\/kick/i ) ){

				socket.emit( 'kick', channel, message_bits[0] );

			}

			// IRC Ops commands

			else if( command.match( /^\/kill/i ) ){

				socket.emit( 'kill', message_bits.shift(), message_bits.join(' ') );

			}

			else if( this.collection.get('private') ){

				this.collection.say( channel, message );

			}
			else {

				this.collection.say( message );

			}

			this.$new_message.val('');

		}

	},

	keyTextarea: function( e ){

		if( e.which === 13 && !this.shift ){

			e.preventDefault();
			this.$form.trigger('submit');

		}

	},

	keydownTextarea: function( e ){

		if( e.which === 16 ) this.shift = true;

	},

	keyupTextarea: function( e ){

		if( e.which === 16 ) this.shift = false;

	}

});