irc.Views.Channel = Backbone.View.extend({

	el: '#channel',
	template: templates.channel,

	initialize: function(){

		_( this ).bindAll( 'render', 'clear', 'renderChannel', 'renderTopic' );

		irc.on( 'channels:active', this.renderChannel );

	},

	render: function(){

		var html = this.template( this.model.toJSON() );
		this.$el.html( html );

		this.$info = this.$el.children('.info');
		this.$topic = this.$info.children('.topic');
		this.$messages = this.$el.children('.messages');
		this.$users = this.$el.children('.users');

		this.$topic.links();

		this.messages = new irc.Views.Messages({ collection: this.model.messages, el: this.$messages });
		this.users = new irc.Views.Users({ collection: this.model.users, el: this.$users });
		this.messages.render();
		this.users.render();

		return this;

	},

	clear: function(){

		this.$el.html('');

	},

	renderChannel: function( channel ){

		this.model = channel;

		if( this.model ){
			this.model.on( 'change:topic', this.renderTopic );
			this.render();
		}
		else {
			this.clear();
		}

	},

	renderTopic: function( channel, topic ){

		this.$topic.text( topic );
		this.$topic.links();

	}

});