irc.Views.Connect = Backbone.View.extend({

	el: '#connect',
	template: templates.connect,

	events: {
		'submit form': 'submitForm',
		'click a[href="#advanced"]': 'clickAdvanced'
	},

	initialize: function(){

		_( this ).bindAll( 'render', 'connect', 'show', 'hide', 'submitForm' );

		this.render();

	},

	render: function(){

		var html = this.template({
			preset_server: irc.config.preset_server
		});
		var $connect = $.parseHTML( html );
		this.$el.html( $connect );

		this.$modal = this.$el.children('div.modal');
		this.$form = this.$modal.children('form');
		this.$channels = this.$form.find('input[name="channels"]');
		this.$advanced = this.$form.find('div.advanced');

		this.$modal.modal({
			backdrop: false,
			show: true
		});
		this.$channels.sparkartTags();
		this.$advanced.toggle();

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

	},

	clickAdvanced: function( e ){

		e.preventDefault();

		this.$advanced.toggle( 100 );

	}

});