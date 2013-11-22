var Backbone = require('backbone');
var _ = require('underscore');

module.exports = Backbone.Model.extend({
	initialize: function(){
		var user = this.collection.channel.users.findWhere({ nick: this.get('nick') }); // bad
		var nick_mention_regex = new RegExp( '^'+ this.collection.connection.get('nick') ); // bad?
		if( nick_mention_regex.test( this.get('contents') ) ) this.set( 'mention', true );
	}
});