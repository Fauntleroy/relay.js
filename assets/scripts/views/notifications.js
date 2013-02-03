irc.Views.Notifications = Backbone.View.extend({

	el: '#notifications',

	template: templates.notifications,

	initialize: function(){

		_( this ).bindAll( 'renderNotification' );

		this.listenTo( this.collection, 'add', this.renderNotification );

		this.render();

	},

	render: function(){

		var html = this.template();
		this.$el.html( html );

		this.$notifications = this.$el.find('ul.notifications');

		this.collection.each( this.renderNotification );

	},

	renderNotification: function( notification ){

		var notification_view = new irc.Views.Notification({ model: notification });
		var $notification = notification_view.render().$el;

		this.$notifications.prepend( $notification );

	}

});