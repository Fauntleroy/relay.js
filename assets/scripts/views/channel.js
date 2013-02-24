irc.Views.Channel = Backbone.View.extend({

	el: '#channel',
	template: templates.channel,

	initialize: function(){

		_( this ).bindAll( 'render', 'clear', 'renderChannel', 'renderTopic', 'resizeMessages' );

		this.listenTo( irc, 'channels:active', this.renderChannel );

	},

	render: function(){

		var html = this.template( this.model.toJSON() );
		var $channel = $.parseHTML( html );
		this.$el.html( $channel );

		this.$info = this.$el.children('.info');
		this.$topic = this.$info.children('.topic');
		this.$messages = this.$el.children('.messages');
		this.$users = this.$el.children('.users');

		this.renderTopic( this.model.get('name'), this.model.get('topic') );

		// Manage the subviews
		if( this.messages ) this.messages.remove();
		if( this.users ) this.users.remove();
		this.messages = new irc.Views.Messages({ collection: this.model.messages, el: this.$messages });
		this.messages.render();
		if( this.model.get('channel') ){
			this.users = new irc.Views.Users({ collection: this.model.users, el: this.$users });
			this.users.render();
		}

		this.messages.$new_message.focus();

		this.$info.on( 'resize', this.resizeMessages );
		this.resizeMessages();

		return this;

	},

	clear: function(){

		this.$el.empty();

	},

	renderChannel: function( channel ){

		this.model = channel;

		if( this.model ){
			this.listenTo( this.model, 'change:topic', this.renderTopic );
			this.render();
		}
		else {
			this.clear();
		}

	},

	renderTopic: function( channel, topic ){

		topic = topic || '';

		this.$topic
		.text( topic )
		.links()
		.emojify({
			url: CDN_URL +'emoji',
			attr: {
				'class': 'emoji'
			}
		});

	},

	resizeMessages: function( e ){

		var height = this.$info.outerHeight( true );
		this.$messages.css( 'top', height + 1 );

	}

});