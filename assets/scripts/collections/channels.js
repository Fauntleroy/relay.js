var Backbone = require('backbone');
var _ = require('lodash');
var io = require('socket.io-client');
var Channel = require('../models/channel.js');

module.exports = Backbone.Collection.extend({
	model: Channel,
	initialize: function( models, config ){
		this.mediator = config.mediator;
		this.connection = config.connection;
		this.socket = config.socket || io.connect( config.namespace );
		_(this).bindAll( 'join', 'part', 'doChans', 'doJoin', 'doPart', 'doKick', 'doMessage', 'updateActive' );
		this.add({
			status: true,
			display_name: 'status'
		});
		this.socket.on( 'chans', this.doChans );
		this.socket.on( 'join', this.doJoin );
		this.socket.on( 'part', this.doPart );
		this.socket.on( 'kick', this.doKick );
		this.socket.on( 'message', this.doMessage );
		this.on( 'remove', this.updateActive );
	},
	join: function( name ){
		this.socket.emit( 'join', name );
	},
	part: function( name ){
		this.socket.emit( 'part', name );
	},
	// join all the channels our connection is in
	// no dupes
	doChans: function( channels ){
		var channels_to_join = [];
		for( var i in channels ){
			if( !this.findWhere({ channel: true, name: channels[i] }) ){
				channels_to_join.push({
					channel: true,
					name: channels[i],
					display_name: channels[i]
				});
			}
		}
		this.add( channels_to_join );
		var last_channel = this.last();
		if( last_channel ) last_channel.active();
	},
	// join the channel our connection demands
	// still no dupes
	doJoin: function( channel_name, nick, message ){
		// ensure we don't attempt to create a channel we're already in
		var existing_channel = this.find( function( channel ){
			var name = channel.get('name');
			if( !name ) return false;
			return name.toLowerCase() === channel_name.toLowerCase();
		});
		if( nick === this.connection.get('nick') && !existing_channel ){
			this.add({
				channel: true,
				name: channel_name,
				display_name: channel_name
			});
			var new_channel = this.last();
			if( new_channel ) new_channel.active();
		}
	},
	doPart: function( channel, nick, reason, message ){
		if( nick === this.connection.get('nick') ){
			var parted_channel = this.where({ name: channel })[0];
			if( parted_channel ) parted_channel.end();
		}
	},
	doKick: function( channel, nick, by, reason, timestamp ){
		if( nick === this.connection.get('nick') ){
			var kicked_from = this.where({ name: channel })[0];
			this.remove( kicked_from );
		}
	},
	doMessage: function( from, to, text, timestamp ){
		var nick = this.connection.get('nick');		
		var channel = ( to === nick )? from: to;
		var existing_channels = this.where({ name: channel });
		if( existing_channels.length === 0 ){
			this.add({
				private_channel: true,
				name: channel,
				display_name: channel
			});
			var private_channel = this.last();
			// pass the new channel the message event, since it missed it
			private_channel.messages.doMessage.apply( private_channel.messages, arguments );
			if( from === this.connection.get('nick') ) private_channel.active();
		}
	},
	updateActive: function( channel, channels, options ){
		if( channel.get('active') ){
			var parted_index = options.index;
			var next_channel = this.at( parted_index );
			var previous_channel = this.at( parted_index - 1 );
			var next_active_channel = next_channel || previous_channel;
			if( next_active_channel ) next_active_channel.active();
			else this.trigger( 'active', next_active_channel.get('name') );
		}
	}
});