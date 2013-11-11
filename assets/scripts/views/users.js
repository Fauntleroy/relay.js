var Backbone = require('backbone');
var $ = Backbone.$ = require('jquery');
var _ = require('lodash');
var Handlebars = require('handlebars');

module.exports = Backbone.View.extend({
	template: Handlebars.compile('<h6><var></var> Users</h6>\
	<ul class="list"></ul>'),
	user_template: Handlebars.compile('<li class="{{#active}}active{{/active}}{{^active}}inactive{{/active}}" data-nick="{{encodeURI nick}}">\
		<a href="#{{nick}}">\
			{{#rank}}<strong class="rank">{{.}}</strong>{{/rank}}\
			<span class="nick">{{nick}}</span>\
		</a>\
		{{^active}}<var class="idle">{{idle}}m</var>{{/active}}\
	</li>'),
	initialize: function(){
		_( this ).bindAll( 'render', 'renderUsers', 'updateUser' );
		this.listenTo( this.collection, 'reset sort remove', this.renderUsers );
		this.listenTo( this.collection, 'change', this.updateUser );
	},
	render: function(){
		var html = this.template();
		var $users = $.parseHTML( html );
		this.$el.html( $users );
		this.$title = this.$el.children('h6');
		this.$count = this.$title.children('var');
		this.$users = this.$el.find('ul.list');
		this.renderUsers();
		return this;
	},
	renderUsers: function( user ){
		var users_view = this;
		var html = '';
		this.collection.each( function( user ){
			html += users_view.user_template( user.toJSON() );
		});
		this.$users[0].innerHTML = html;
		this.$count.text( this.collection.length );
	},
	updateUser: function( user ){
		var $user = this.$users.find( '[data-nick="'+ encodeURI( user.get('nick') ) +'"]' );
		var html = this.user_template( user.toJSON() );
		var $user_new = $.parseHTML( html );
		$user.replaceWith( $user_new );
	}
});