irc.Views.Connect = Backbone.View.extend({

	el: '#connect',
	template: templates.connect,

	events: {
		'submit form': 'submitForm'
	},

	initialize: function(){

		_( this ).bindAll( 'render', 'connect', 'show', 'hide', 'submitForm' );

		this.render();

	},

	render: function(){

		var html = this.template();
		this.$el.html( html );

		this.$modal = this.$el.children('div.modal');
		this.$form = this.$modal.children('form');
		this.$channels = this.$form.find('input[name="channels"]');

		this.$modal.modal({
			show: true
		});

		this.$channels.sparkartTags();

		return this;

	},

	connect: function( parameters ){

		irc.socket.emit( 'new_irc_connection', parameters );

	},

	show: function(){

		this.$modal.modal('show');

	},

	hide: function(){

		this.$modal.modal('hide');

	},

	submitForm: function( e ){

		e.preventDefault();

		var parameters = this.$form.serializeObject();
		parameters.channels = parameters.channels.split(',');

		this.connect( parameters );
		this.hide();		

	}

});