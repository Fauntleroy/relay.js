/*
Connectivity Module
Keeps track of the user's socket connection and displays its status
*/

var Backbone = require('backbone');
var $ = Backbone.$ = require('jquery');
var _ = require('lodash');
var Handlebars = require('handlebars');
var io = require('socket.io-client');

var STATES = ['connected','connecting','disconnected','connect_failed','reconnected','reconnecting','reconnect_failed'];

module.exports = Backbone.View.extend({
	el: '#connectivity',
	template: Handlebars.compile('<div class="connecting">Connecting <i class="icon-refresh icon-spin"></i></div>\
	<div class="connected">Connected</div>\
	<div class="connect_failed">Connection Failed</div>\
	<div class="reconnecting">Reconnecting <i class="icon-refresh icon-spin"></i></div>\
	<div class="reconnected">Reconnected</div>\
	<div class="reconnect_failed">Reconnect Failed</div>\
	<div class="disconnected"><strong>Disconnected.</strong> Try refreshing the page.</div>'),
	initialize: function(){
		_( this ).bindAll( 'bindState' );
		this.socket = io.connect( window.location.host );
		_( STATES ).each( this.bindState );
		this.render();
	},
	render: function(){
		this.$el.html( this.template() );
		this.$body = $('body');
	},
	updateState: function( state ){
		if( !state ) return;
		this.$body.removeClass( STATES.join(' ') ).addClass( state );
	},
	bindState: function( state ){
		var event_name = state;
		if( state === 'connected' || state === 'disconnected' || state === 'reconnected' ){
			event_name = event_name.replace( /ed$/i, '' );
		}
		this.socket.on( event_name, _.bind( this.updateState, this, state ) );
	}
});