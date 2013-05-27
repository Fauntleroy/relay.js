irc.Views.Connect = Backbone.View.extend({

	el: '#connect',
	template: irc.templates.connect,

	events: {
		'submit form': 'submitForm',
		'click a[href="#advanced"]': 'clickAdvanced'
	},

	initialize: function(){

		_( this ).bindAll( 'render', 'connect', 'show', 'hide', 'submitForm' );

		this.render();
		this.show();

	},

	render: function(){

		var config = _( irc.config ).clone();
		if( _( config.defaults.channels ).isArray() ) config.defaults.channels = config.defaults.channels.join(','); 
		var html = this.template( irc.config );
		var $connect = $.parseHTML( html );
		this.$el.html( $connect );

		this.$modal = this.$el.children('div.modal');
		this.$form = this.$modal.children('form');
		this.$channels = this.$form.find('input[name="channels"]');
		this.$advanced = this.$form.find('div.advanced');

		this.$modal.modal({ backdrop: false });
		this.$channels.sparkartTags();
		this.$advanced.toggle();

		return this;

	},

	connect: function( parameters ){

		$.post( '/connect', parameters, irc.connections.addConnection, 'json' );

	},

	show: function(){

		this.$modal.modal('show');
		this.$form.find('input:visible:first').focus();

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
