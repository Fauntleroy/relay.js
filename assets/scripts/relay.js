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
var Connectivity = require('./connectivity.js');
// transmit events across modules
var mediator = _.extend( {}, Backbone.Events );

$(function(){
	relay.mediator = mediator;
	relay.title = new Title( mediator );
	relay.connections = new Connections({
		el: '#connections'
	});
	relay.connectivity = new Connectivity;
});