var Backbone = require('backbone');
var $ = Backbone.$ = require('jquery');
require('bootstrap');
require('jquery.sparkartTags');
require('jquery.serializeObject');
var _ = require('underscore');
var Handlebars = require('handlebars');
var handlebars_helper = require('handlebars-helper');
handlebars_helper.help( Handlebars );
var templates = require('../../compiled/templates.js')( Handlebars );

module.exports = Backbone.View.extend({
	template: templates.connect,
	events: {
		'submit form': 'submitForm',
		'click a[href="#advanced"]': 'clickAdvanced'
	},
	initialize: function( config ){
		this.config = config.config;
		this.mediator = config.mediator;
		_( this ).bindAll( 'render', 'connect', 'show', 'hide', 'submitForm' );
		this.listenTo( this.mediator, 'connect:show', this.show );
		this.render();
		this.show();
	},
	render: function(){
		var html = this.template({
			defaults: this.config.defaults
		});
		var $connect = $.parseHTML( html );
		this.$el.html( $connect );
		// cache selections
		this.$modal = this.$el.children('div.modal');
		this.$form = this.$modal.children('form');
		this.$channels = this.$form.find('input[name="channels"]');
		this.$advanced = this.$form.find('div.advanced');
		// call plugins, etc
		this.$modal.modal({ backdrop: false });
		this.$channels.sparkartTags();
		this.$advanced.toggle();
		return this;
	},
	connect: function( parameters ){
		var connect = this;
		$.post( '/connect', parameters, function( data ){
			connect.mediator.trigger( 'connections:add', data );
		}, 'json' );
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
