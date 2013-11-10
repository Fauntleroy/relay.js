/*
IRC Module
This is the base that includes all submodules and initializes the application
*/

var _ = require('lodash');
var Backbone = require('backbone');
var $ = require('jquery');

// set up namespace
var relay = window.relay = window.relay || {};

var Title = require('./title');
var Connect = require('./connect.js');
var Connections = require('./connections');
var Connectivity = require('./connectivity.js');
// transmit events across modules
var mediator = _.extend( {}, Backbone.Events );

$(function(){
	relay.mediator = mediator;
	relay.title = new Title( mediator );
	relay.connect = new Connect({
		el: '#connect',
		mediator: mediator,
		config: relay.config
	});
	relay.connections = new Connections({
		el: '#connections',
		mediator: mediator,
		max: relay.config.max_connections || Infinity
	});
	relay.connectivity = new Connectivity;
});