/*
IRC Module
This is the base that includes all submodules and initializes the application
*/

var $ = require('jquery');

// set up namespace
var relay = this.relay = this.relay || {};

var Connectivity = require('./connectivity.js');

$(function(){
	relay.connectivity = new Connectivity;
});