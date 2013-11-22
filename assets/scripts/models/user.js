var Backbone = require('backbone');
var _ = require('underscore');

module.exports = Backbone.Model.extend({
	defaults: {
		rank: null,
		idle: 0,
		active: true,
		modes: []
	},
	initialize: function(){
		_( this ).bindAll( 'active', 'idle' );
		this.listenTo( this.collection, 'idle', this.idle );
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
	}
});