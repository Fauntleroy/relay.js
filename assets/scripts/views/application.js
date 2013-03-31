irc.Views.Application = Backbone.View.extend({

	el: '#application',

	initialize: function(){

		this.title = new irc.Views.Title();

		// Warn the user about the consequences of closing this tab/window
		window.onbeforeunload = function(){
			if( irc.connections.length > 0 ){
				return 'Are you sure you want to close relay.js? All open IRC sessions will be closed.';
			}
		}

	}

});