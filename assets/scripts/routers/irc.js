irc.Routers.Application = Backbone.Router.extend({

	routes: {
		'': 'default'
	},

	default: function(){

		irc.socket = io.connect('/');
		irc.socket.on( 'connect', function(){

			console.log(' socket.io connected!', arguments );

		});

		irc.connections = new irc.Collections.Connections;

		irc.views.application = new irc.Views.Application;
		irc.views.connections = new irc.Views.Connections({ collection: irc.connections });
		irc.views.channel = new irc.Views.Channel;
		irc.views.connect = new irc.Views.Connect;

	}

});