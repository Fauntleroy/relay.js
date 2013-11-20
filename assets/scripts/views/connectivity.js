/*
Connectivity Module
Keeps track of the user's socket connection and displays its status
*/

var Backbone = require('backbone');
var $ = Backbone.$ = require('jquery');
var _ = require('lodash');
var Handlebars = require('handlebars');
var templates = require('../../compiled/templates.js')( Handlebars );
var io = require('socket.io-client');

var STATES = ['connected','connecting','disconnected','connect_failed','reconnected','reconnecting','reconnect_failed'];

module.exports = Backbone.View.extend({
	el: '#connectivity',
	template: templates.connectivity,
	initialize: function(){
		_( this ).bindAll( 'bindState' );
		this.socket = io.connect( 'http://localhost' );
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