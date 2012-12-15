irc.Views.Channel = Backbone.View.extend({

	el: '#channel',
	template: templates.channel,

	initialize: function(){

		_( this ).bindAll( 'renderChannel' );

		irc.on( 'channels:active', this.renderChannel );

	},

	render: function(){

		var html = this.template( this.model.toJSON() );
		this.$el.html( html );

		this.$messages = this.$el.children('.messages');
		this.$users = this.$el.children('.users');

		this.messages = new irc.Views.Messages({ collection: this.model.messages, el: this.$messages });
		this.users = new irc.Views.Users({ collection: this.model.users, el: this.$users });
		this.messages.render();
		this.users.render();

		return this;

	},

	renderChannel: function( channel ){

		this.model = channel;
		this.render();

	}

});