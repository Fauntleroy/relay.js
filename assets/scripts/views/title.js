irc.Views.Title = Backbone.View.extend({

	channel: '',
	focus: true,
	unread: 0,

	initialize: function(){

		_( this ).bindAll( 'doMessageAdd', 'doChannelActive', 'doFocus', 'doBlur', 'render' );

		this.listenTo( irc, 'active:messages:add', this.doMessageAdd );
		this.listenTo( irc, 'channels:active', this.doChannelActive );
		$(window).on({
			focus: this.doFocus,
			blur: this.doBlur
		});

	},

	doMessageAdd: function( message ){

		if( message.get('message') && !this.focus ){

			this.unread++;
			this.render();

		}

	},

	doChannelActive: function( channel ){

		this.channel = channel.get('name');
		this.render();

	},

	doFocus: function(){

		this.focus = true;
		this.unread = 0;
		this.render();

	},

	doBlur: function(){

		this.focus = false;

	},

	render: function(){

		var title = this.channel;
		if( this.unread ) title = '('+ this.unread +') '+ title;

		// Hack to force title to update properly
		setTimeout( function(){
			document.title = title;
		}, 150 );

	}

});