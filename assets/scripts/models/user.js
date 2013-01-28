irc.Models.User = Backbone.Model.extend({

	defaults: {
		rank: null,
		idle: 0,
		active: true
	},

	initialize: function(){

		_( this ).bindAll( 'active', 'idle', 'clearTimer' );

		this.idle_timer = setInterval( this.idle, 60 * 1000 );

		this.on( 'remove', this.clearTimer );

	},

	active: function(){

		this.set({
			idle: 0,
			active: true
		});

	},

	idle: function(){

		var idle = this.get('idle');

		// Mark as inactive if idle for 30 minutes
		if( idle >= 30 && this.get('active') ){
			this.set( 'active', false );
		}
		this.set( 'idle', idle + 1 );

	},

	clearTimer: function(){

		clearInterval( this.idle_timer );

	}

});