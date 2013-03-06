// Add global EventEmitter
_.extend( irc, Backbone.Events );

// Start the router
$(function(){

	irc.routers.application = new irc.Routers.Application();
	Backbone.history.start({
		pushState: true
	});

});