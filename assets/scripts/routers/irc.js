irc.Routers.Application = Backbone.Router.extend({

	routes: {
		'': 'default'
	},

	default: function(){

		irc.user = {
			nick: 'irchub'
		};
		irc.socket = io.connect('/irc.freenode.net/irchub');

		irc.socket.on( 'connect', function(){

			console.log(' socket.io connected!', arguments );

		});

		irc.channels = new irc.Collections.Channels;

		irc.views.application = new irc.Views.Application;
		irc.views.channels = new irc.Views.Channels({ collection: irc.channels });
		irc.views.channel = new irc.Views.Channel;

	}

});