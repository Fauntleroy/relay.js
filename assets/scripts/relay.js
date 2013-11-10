/*
IRC Module
This is the base that includes all submodules and initializes the application
*/

var _ = require('lodash');
var Backbone = require('backbone');
var $ = require('jquery');

// set up namespace
var relay = window.relay = window.relay || {};

// Models and Collections
var Title = require('./title/models/title.js');
var Connections = require('./connections/collections/connections.js');
// Views
var TitleView = require('./title/views/title.js');
var ConnectView = require('./connect.js');
var ConnectionsView = require('./connections/views/connections.js');
var ConnectivityView = require('./connectivity.js'); 

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
		connectivity: new Connectivity
	};
});