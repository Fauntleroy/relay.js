var Backbone = require('backbone');
var $ = Backbone.$ = require('jquery');
require('bootstrap');
require('jquery.sparkartTags');
require('jquery.serializeObject');
var _ = require('lodash');
var Handlebars = require('handlebars');
var handlebars_helper = require('handlebars-helper');
handlebars_helper.help( Handlebars );

module.exports = Backbone.View.extend({
	template: Handlebars.compile('<div class="modal">\
		<form class="form-horizontal">\
			<div class="modal-header">\
				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>\
				<h3>Connect</h3>\
			</div>\
			<div class="modal-body">\
				<fieldset>\
					<div class="control-group">\
						<label for="connect_server" class="control-label">Server</label>\
						<div class="controls">\
							{{#defaults.server.locked}}\
							<h4>{{defaults.server.host}}</h4>\
							{{/defaults.server.locked}}\
							{{^defaults.server.locked}}\
							<input id="connect_server" name="server" placeholder="ex: irc.freenode.net" value="{{defaults.server.host}}" type="text" />\
							<span class="help-inline"><a href="#advanced">Advanced Options</a></span>\
							{{/defaults.server.locked}}\
						</div>\
					</div>\
					{{^defaults.server.locked}}\
					<div class="advanced">\
						<div class="control-group">\
							<label for="connect_port" class="control-label">Server Port</label>\
							<div class="controls">\
								<input id="connect_port" name="port" value="{{defaults.server.port}}" type="text" />\
								<span class="help-inline">Optional</span>\
							</div>\
						</div>\
						<div class="control-group">\
							<label for="connect_password" class="control-label">Server Password</label>\
							<div class="controls">\
								<input id="connect_password" name="password" type="password" />\
								<span class="help-inline">Optional</span>\
							</div>\
						</div>\
						<div class="control-group">\
							<div class="controls">\
								<label class="checkbox">\
									<input name="ssl" {{#defaults.server.ssl}}checked{{/defaults.server.ssl}} type="checkbox"> SSL\
								</label>\
							</div>\
						</div>\
					</div>\
					{{/defaults.server.locked}}\
				</fieldset>\
				<hr />\
				<fieldset>\
					<div class="control-group">\
						<label for="connect_nick" class="control-label">Nick</label>\
						<div class="controls">\
							<input id="connect_nick" name="nick" value="{{defaults.nick}}" type="text" />\
						</div>\
					</div>\
					<div class="control-group">\
						<label for="connect_nick_password" class="control-label">Password</label>\
						<div class="controls">\
							<input id="connect_nick_password" name="nick_password" type="password" />\
							<span class="help-inline">Optional</span>\
						</div>\
					</div>\
				</fieldset>\
				<hr />\
				<fieldset>\
					<div class="control-group">\
						<label for="connect_channels" class="control-label">Channels</label>\
						<div class="controls">\
							<input id="connect_channels" name="channels" value="{{join defaults.channels ","}}" placeholder="#relay.js" type="text" />\
							<span class="help-inline">Optional</span>\
						</div>\
					</div>\
				</fieldset>\
			</div>\
			<div class="modal-footer">\
				<button class="btn" type="cancel">Cancel</button>\
				<button class="btn btn-primary" type="submit">Connect <i class="icon-signin"></i></button>\
			</div>\
		</form>\
	</div>'),
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
