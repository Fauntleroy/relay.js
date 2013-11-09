var Backbone = require('backbone');
var _ = require('lodash');
var io = require('socket.io-client');
var Connection = require('../models/connection.js');

module.exports = Backbone.Collection.extend({
	model: Connection,
	initialize: function( data, config ){
		_( this ).bindAll( 'addConnection', 'updateActiveChannel' );
		this.on( 'remove', this.updateActiveChannel );
		this.mediator = config.mediator;
		this.max = config.max;
	},
	addConnection: function( data ){
		this.add( data );
	},
	updateActiveChannel: function( connection, connections, options ){
		var index = options.index;
		var active = connection.channels.where({ active: true });
		if( active ){
			var next_connection = this.at( index );
			var previous_connection = this.at( index - 1 );
			var next_active_connection = next_connection || previous_connection;
			if( next_active_connection ){
				next_active_connection.channels.at(0).active();
			}
			else {
				this.mediator.trigger( 'channels:active', null );
			}
		}
	}
});