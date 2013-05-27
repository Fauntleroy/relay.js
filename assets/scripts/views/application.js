(function(){

	var STATES = ['connected','connecting','disconnected','connect_failed','reconnected','reconnecting','reconnect_failed'];

	irc.Views.Application = Backbone.View.extend({

		el: '#application',

		initialize: function(){

			_( this ).bindAll( 'bindState', 'updateState' );

			this.title = new irc.Views.Title();

			// Warn the user about the consequences of closing this tab/window
			window.onbeforeunload = function(){
				if( irc.connections.length > 0 && irc.socket.socket.connected ){
					return 'Are you sure you want to close relay.js? All open IRC sessions will be closed.';
				}
			};

			_( STATES ).each( this.bindState );
			// Update connection status
			irc.socket.on( 'connect', this.updateState );

		},

		bindState: function( state ){

			var application_view = this;
			var event_name = state;
			if( event_name === 'connected' || event_name === 'disconnected' || event_name === 'reconnected' ) event_name = event_name.replace( /ed$/i, '' );

			irc.socket.on( event_name, function(){
				application_view.updateState( state );
			});

		},

		// Update interface per connection state
		updateState: function( state ){

			if( !state ) return;
			
			this.$el
			.removeClass( STATES.join(' ') )
			.addClass( state );

		}

	});

})();