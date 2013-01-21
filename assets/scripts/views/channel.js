irc.Views.Channel = Backbone.View.extend({

	el: '#channel',
	template: templates.channel,

	initialize: function(){

		_( this ).bindAll( 'render', 'clear', 'renderChannel', 'renderTopic' );

		this.listenTo( irc, 'channels:active', this.renderChannel );

	},

	render: function(){

		var html = this.template( this.model.toJSON() );
		this.$el.html( html );

		this.$info = this.$el.children('.info');
		this.$topic = this.$info.children('.topic');
		this.$messages = this.$el.children('.messages');
		this.$users = this.$el.children('.users');

		this.renderTopic( this.model.get('name'), this.model.get('topic') );

		// Manage the subviews
		if( this.messages ) this.messages.remove();
		if( this.users ) this.users.remove();
		this.messages = new irc.Views.Messages({ collection: this.model.messages, el: this.$messages });
		this.users = new irc.Views.Users({ collection: this.model.users, el: this.$users });
		this.messages.render();
		this.users.render();

		this.messages.$new_message.focus();

		return this;

	},

	clear: function(){

		this.$el.html('');

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

		this.$topic
		.text( topic )
		.links()
		.emojify({
			url: CDN_URL +'emoji',
			attr: {
				'class': 'emoji'
			}
		});

	}

});