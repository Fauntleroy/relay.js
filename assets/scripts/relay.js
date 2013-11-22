/*
IRC Module
This is the base that includes all submodules and initializes the application
*/

var _ = require('underscore');
var Backbone = require('backbone');
var $ = require('jquery');

// set up namespace
var relay = window.relay = window.relay || {};

// Models and Collections
var Title = require('./models/title.js');
var Connections = require('./collections/connections.js');
// Views
var TitleView = require('./views/title.js');
var ConnectView = require('./views/connect.js');
var ConnectionsView = require('./views/connections.js');
var ChannelView = require('./views/channel.js');
var ConnectivityView = require('./views/connectivity.js');

$(function(){
	// start mediator for event transmission
	var mediator = relay.mediator = _.extend( {}, Backbone.Events );
	// initialize models and collections
	relay.title = new Title( null, mediator );
	relay.connections = new Connections( null, {
		mediator: mediator,
		max: relay.config.max_connections || Infinity
	});
	// initialize views
	relay.views = {
		title: new TitleView({
			model: relay.title
		}),
		connect: new ConnectView({
			el: '#connect',
			mediator: mediator,
			config: relay.config
		}),
		connections: new ConnectionsView({
			el: '#connections',
			collection: relay.connections
		}),
		channel: new ChannelView({
			el: '#channel',
			mediator: mediator
		}),
		connectivity: new ConnectivityView()
	};
});