irc.Views.Users = Backbone.View.extend({

	template: templates.users,

	initialize: function(){

		_( this ).bindAll( 'render', 'renderUser' );

		this.listenTo( this.collection, 'add', this.renderUser );
		this.listenTo( this.collection, 'sort add remove', this.render );

	},

	render: function(){

		var html = this.template();
		this.$el.html( html );

		this.$users = this.$el.find('ul.list');

		this.collection.each( this.renderUser );

		return this;

	},

	renderUser: function( user ){

		var user_view = new irc.Views.User({ model: user });
		var $user = user_view.render().$el;

		this.$users.append( $user );

	}

});