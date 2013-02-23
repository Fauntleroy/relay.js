irc.Views.Messages = Backbone.View.extend({

	is_near_bottom: true,
	template: templates.messages,

	events: {
		'submit form.new': 'submitNew',
		'keypress :input[name="message"]': 'keyTextarea',
		'keydown :input[name="message"]': 'keydownTextarea',
		'keyup :input[name="message"]': 'keyupTextarea'
	},

	initialize: function(){

		_( this ).bindAll( 'render', 'renderMessage', 'scrollBottom', 'scrollMessages', 'resizeMessages', 'submitNew', 'keyTextarea', 'keydownTextarea', 'keyupTextarea' );

		this.listenTo( this.collection, 'add', this.renderMessage );

	},

	render: function(){

		var html = this.template();
		var $messages = $.parseHTML( html );
		this.$el.html( $messages );

		this.$form = this.$el.find('form.new');
		this.$new_message = this.$form.find(':input[name="message"]');
		this.$scroll = this.$el.find('div.scroll');
		this.$messages = this.$scroll.children('ul.list');

		this.$scroll.on( 'resize', this.resizeMessages );
		this.$scroll.on( 'scroll', this.scrollMessages );
		this.$messages.on( 'resize', this.resizeMessages );

		this.collection.each( this.renderMessage );

	},

	renderMessage: function( message ){

		var last_message = this.collection.at( this.collection.indexOf( message ) - 1 );

		// Check to see if this is a continuation of previous messaging
		if( last_message ){
			var both_notice = ( last_message.get('notice') && message.get('notice') );
			var both_message = ( last_message.get('message') && message.get('message') );
			var notice_match = ( last_message.get('from') === message.get('from') && last_message.get('to') === message.get('to') );
			var message_match = ( last_message.get('nick') === message.get('nick') );
		}

		// If this is a continuation, render the partial template and append it
		if( ( both_notice && notice_match ) || ( both_message && message_match ) ){
			
			var append_message = new irc.Views.Message({ model: message, partial: true });
			var $message = append_message.render().$el.find('ul.contents > li');
			var $last_message = this.$messages.find(':last-child');
			$last_message.find('ul.contents').append( $message );

		}
		else {

			var message_view = new irc.Views.Message({ model: message });
			var $message = message_view.render().$el;
			this.$messages.append( $message );

		}

		var force_scroll = ( message.get('nick') === this.collection.connection.get('nick') );
		this.scrollBottom( force_scroll );

	},

	scrollMessages: function( e ){

		var frame_height = this.$scroll.height();
		var frame_scrollheight = this.$scroll[0].scrollHeight;
		var frame_scrolltop = this.$scroll.scrollTop();
		var frame_scrollbottom = frame_scrolltop + frame_height;
		this.is_near_bottom = ( frame_scrollbottom + 50 > frame_scrollheight );

	},

	// Scrolls to the bottom of the chat messages
	scrollBottom: function( force ){

		if( this.is_near_bottom || force ){
			this.$scroll.scrollTop( this.$messages[0].scrollHeight );
		}

	},

	resizeMessages: function( e ){

		this.scrollBottom();

	},

	submitNew: function( e ){

		e.preventDefault();

		var message = $.trim( this.$new_message.val() );

		if( message !== '' ){

			var socket = this.collection.socket;
			var channel = this.collection.channel.get('name');

			socket.emit( 'command', message, channel );

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