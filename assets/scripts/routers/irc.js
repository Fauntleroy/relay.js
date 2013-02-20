irc.Routers.Application = Backbone.Router.extend({

	routes: {
		'': 'default'
	},

	default: function(){

		irc.socket = io.connect('/');
		
		irc.socket.on( 'disconnect', function(){

			irc.trigger( 'notifications:add', {
				message: 'You\'ve lost your connection to the server!'
			});

		});

		irc.connections = new irc.Collections.Connections;
		irc.notifications = new irc.Collections.Notifications;

		irc.views.application = new irc.Views.Application;
		irc.views.connections = new irc.Views.Connections({ collection: irc.connections });
		irc.views.channel = new irc.Views.Channel;
		irc.views.connect = new irc.Views.Connect;
		irc.views.notifications = new irc.Views.Notifications({ collection: irc.notifications });

	}

});