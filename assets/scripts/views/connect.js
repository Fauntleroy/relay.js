irc.Views.Connect = Backbone.View.extend({

	el: '#connect',
	template: templates.connect,

	events: {
		'submit form': 'submitForm'
	},

	initialize: function(){

		_( this ).bindAll( 'render', 'connect', 'submitForm' );

		this.render();

	},

	render: function(){

		var html = this.template();
		this.$el.html( html );

		this.$modal = this.$el.children('div.modal');
		this.$form = this.$modal.children('form');

		this.$modal.modal({
			show: true
		});

		return this;

	},

	connect: function( parameters ){

		irc.socket.emit( 'new_irc_connection', parameters );

	},

	submitForm: function( e ){

		e.preventDefault();

		var parameters = this.$form.serializeObject();

		this.connect( parameters );

		this.$modal.modal('hide');

	}

});