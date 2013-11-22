var Backbone = require('backbone');
var _ = require('underscore');
var $ = Backbone.$ = require('jquery');

var UPDATE_DELAY = 200;

module.exports = Backbone.View.extend({
	el: 'title',
	initialize: function(){
		this.listenTo( this.model, 'change', this.render );
		this.render();
	},
	render: function(){
		var title_view = this;
		var newtitle = this.model.getTitle();
		// For some reason there are problems updating the title too quickly
		// in some browsers (namely Chrome), so we wait
		setTimeout( function(){
			title_view.$el.text( newtitle );	
		}, UPDATE_DELAY );
	}
});