irc.Views.Channel = Backbone.View.extend({

	el: '#channel',
	template: templates.channel,

	initialize: function(){

		_( this ).bindAll( 'renderChannel' );

		irc.on( 'channels:active', this.renderChannel );

	},

	render: function(){
console.log( 'render channel', this.$el, this.model );
		var html = this.template( this.model.toJSON() );
		this.$el.html( html );

		return this;

	},

	renderChannel: function( channel ){

		this.model = channel;
		this.render();

	}

});