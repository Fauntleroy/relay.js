irc.Views.Messages = Backbone.View.extend({

	template: templates.messages,

	events: {
		'submit form.new': 'submitNew'
	},

	initialize: function(){

		_( this ).bindAll( 'render', 'renderMessage', 'scrollBottom', 'submitNew' );

		this.listenTo( this.collection, 'add', this.renderMessage );
		$(window).on( 'resize', this.scrollBottom );

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
		var force_scroll = ( message.get('nick') === this.collection.connection.get('nick') );

		this.$messages.append( $message );

		this.scrollBottom( force_scroll );

	},

	// Scrolls to the bottom of the chat messages
	scrollBottom: function( force ){

		var frame_height = this.$messages.height();
		var frame_scrollheight = this.$messages[0].scrollHeight;
		var frame_scrolltop = this.$messages.scrollTop();
		var frame_scrollbottom = frame_scrolltop + frame_height;
		var last_message_height = this.$messages.find('li:last-child').height();
		var is_near_bottom = frame_scrollbottom + 15 > frame_scrollheight - last_message_height;

		if( is_near_bottom || force ){
			this.$messages.scrollTop( frame_scrollheight - frame_height );
		}

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