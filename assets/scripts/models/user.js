irc.Models.User = Backbone.Model.extend({

	defaults: {
		rank: null,
		idle: 0,
		active: true,
		modes: []
	},

	initialize: function(){

		_( this ).bindAll( 'active', 'idle', 'clearTimer' );

		this.idle_timer = setInterval( this.idle, 60 * 1000 );

		this.on( 'remove', this.clearTimer );

	},

	// Reset user inactivity
	active: function(){

		this.set({
			idle: 0,
			active: true
		});

	},

	// Update the user's idle time and status
	idle: function(){

		var idle = this.get('idle');

		// Mark as inactive if idle for 30 minutes
		if( idle >= 30 && this.get('active') ){
			this.set( 'active', false );
		}
		this.set( 'idle', idle + 1 );

	},

	// Unset the idle timer
	clearTimer: function(){

		clearInterval( this.idle_timer );

	}

});