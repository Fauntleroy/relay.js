/*
Connections module
Displays IRC connections and exposes several management abilities
*/

var Connections = require('./collections/connections.js');
var ConnectionsView = require('./views/connections.js');

module.exports = function( config ){
	this.connections = new Connections( null, config );
	this.connections_view = new ConnectionsView({
		el: config.el,
		collection: this.connections
	});
	this.destroy = function(){
		this.connections.destroy();
		this.connections_view.destroy();
	};
};