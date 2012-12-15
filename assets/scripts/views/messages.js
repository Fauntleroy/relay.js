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

			this.collection.say( message );
			this.$new_message.val('');

		}

	}

});