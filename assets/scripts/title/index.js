/*
Title Module
Changes the page title based on chat, channel, and user activity
*/

var Title = require('./models/title.js');
var TitleView = require('./views/title.js');

module.exports = function( mediator ){
	this.title = new Title( null, mediator );
	this.title_view = new TitleView({
		model: this.title
	});
	this.destroy = function(){
		this.title.destroy();
		this.title_view.remove();
	}
};