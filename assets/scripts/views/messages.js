irc.Views.Messages = Backbone.View.extend({

	// keep track of nicks user can tab through
	mention_nicks: null,
	mention_next: null,
	is_near_bottom: true,
	template: irc.templates.messages,

	events: {
		'submit form.new': 'submitNew',
		'keypress :input[name="message"]': 'keyTextarea',
		'keydown :input[name="message"]': 'keydownTextarea'
	},

	initialize: function(){

		_( this ).bindAll( 'render', 'renderMessage', 'scrollBottom', 'scrollMessages', 'resizeMessages', 'submitNew', 'keyTextarea', 'keydownTextarea' );

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

		var nick = message.get('nick');
		var last_message = this.collection.at( this.collection.indexOf( message ) - 1 );
		var both_notice, both_message, notice_match, message_match, $message;

		// Check to see if this is a continuation of previous messaging
		if( last_message ){
			both_notice = ( last_message.get('notice') && message.get('notice') );
			both_message = ( last_message.get('message') && message.get('message') );
			notice_match = ( last_message.get('from') === message.get('from') && last_message.get('to') === message.get('to') );
			message_match = ( last_message.get('nick') === nick );
		}

		// If this is a continuation, render the partial template and append it
		if( ( both_notice && notice_match ) || ( both_message && message_match ) ){
			
			var append_message = new irc.Views.Message({
				model: message,
				partial: true
			});
			$message = append_message.render().$el.find('ul.contents > li');
			var $last_message = this.$messages.find(':last-child');
			$last_message.find('ul.contents').append( $message );

		}
		else {

			var message_view = new irc.Views.Message({
				model: message
			});
			$message = message_view.render().$el;
			this.$messages.append( $message );

		}

		var force_scroll = ( nick === this.collection.connection.get('nick') );
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

		// send message when enter is pressed
		if( e.which === 13 && !e.shiftKey ){

			e.preventDefault();
			return this.$form.trigger('submit');

		}

	},

	// some things require keydown instead of keypress
	keydownTextarea: function( e ){

		// cancel out tabs
		if( e.which === 9 ) e.preventDefault();

		// try to complete a username
		if( e.which === 9 && this.$new_message.val() ){

			if( !this.mention_nicks ){
				var text = this.$new_message.val();
				var nick_regex = new RegExp( '^'+ text, 'i' );
				var nicks = this.collection.channel.users.pluck('nick'); // bad?
				this.mention_nicks = _( nicks ).filter( function( nick ){
					return nick_regex.test( nick );
				});
				this.mention_next = this.mention_nicks[0];
			}
			else {
				var mention_nick_id = _( this.mention_nicks ).indexOf( this.mention_next );
				this.mention_next = this.mention_nicks[mention_nick_id+1] || this.mention_nicks[0];
			}

			if( this.mention_next )	this.$new_message.val( this.mention_next +': ' );

		}
		else {

			this.mention_nicks = null;
			this.mention_next = null;

		}

	}

});