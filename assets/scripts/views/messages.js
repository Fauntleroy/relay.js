var CDN_URL = 'https://s3-us-west-2.amazonaws.com/relayjs/';

var Backbone = require('backbone');
var $ = Backbone.$ = require('jquery');
require('jquery.links');
require('jquery.emojify');
require('jquery.resize');
var _ = require('underscore');
var Handlebars = require('handlebars');
var helpers = require('../handlebars_helpers.js');
helpers( Handlebars );
var templates = require('../../compiled/templates.js')( Handlebars );

// See if a URL is an image or not
var testImage = function( url, callback ){
	var is_image = /\.(?:jpg|jpeg|gif|png|bmp|svg)(?:[\?#].*){0,}$/i.test( url );
	if( is_image ){
		if( callback ) callback( null, {
			url: url
		});
	}
	else {
		if( callback ) callback( 'No image found' );
	}
};

// Get Youtube ID out of a URL
var testYoutube = function( url, callback ){
	var id = url.match( /(?:youtube\.com.*[\?&]v=|youtu\.be\/)(.{11})/i );
	id = ( id )? id[1]: id;
	if( id ){
		var data = {
			id: id,
			url: url
		};
		if( callback ) callback( null, data );
	}
	else {
		if( callback ) callback( 'Not YouTube' );
	}
};

// Get Vimeo ID out of a URL
var testVimeo = function( url, callback ){
	var id = url.match( /vimeo\.com\/([0-9]*)/i );
	id = ( id )? id[1]: id;
	if( id ){
		$.getJSON( 'http://vimeo.com/api/v2/video/'+ id +'.json?callback=?', function( data ){
			var return_data = {
				url: url,
				thumbnail: data[0].thumbnail_large
			};
			if( callback ) callback( null, return_data );
		});
	}
	else {
		if( callback ) callback( 'Not Vimeo' );
	}
};

// Get Gist ID out of a URL
var testGist = function( url, callback ){
	var gist_url = url.match( /(gist\.github\.com\/(?:[a-z0-9_-]+\/)?[a-z0-9]+)/i );
	gist_url = ( gist_url )? 'https://'+ gist_url[1] +'.json': gist_url;
	if( gist_url ){
		$.getJSON( gist_url +'?callback=?', function( data ){
			if( callback ) callback( null, data );
		});
	}
	else {
		if( callback ) callback( 'No Gist found' );
	}
};

// Get SoundCloud ID out of a URL
var testSoundCloud = function( url, callback ){
	var is_soundcloud = /soundcloud.com/i.test( url );
	if( is_soundcloud ) {
		$.get( 'http://soundcloud.com/oembed', {
			format: 'json',
			url: url,
			show_comments: false
		}, function( data ){
			if( callback ) callback( null, data );
		});
	} else {
		if( callback ) callback( 'Not SoundCloud' );
	}
};

// Get Vine ID out of a URL
var testVine = function( url, callback ){
	var id = url.match( /vine\.co\/v\/([0-9a-z]*)/i );
	id = ( id )? id[1]: id;
	if( id ){
		var return_data = {
			id: id
		};
		if( callback ) callback( null, return_data );
	}
	else {
		if( callback ) callback( 'Not Vine' );
	}
};

module.exports = Backbone.View.extend({
	// keep track of nicks user can tab through
	mention_nicks: null,
	mention_next: null,
	// know when we need to scroll down
	is_near_bottom: true,
	template: templates.messages,
	message_template: templates.message,
	events: {
		'submit form.new': 'submitNew',
		'keypress :input[name="message"]': 'keyTextarea',
		'keydown :input[name="message"]': 'keydownTextarea'
	},
	initialize: function(){
		_( this ).bindAll( 'render', 'renderMessage', 'postprocess', 'scrollBottom', 'scrollMessages', 'resizeMessages', 'submitNew', 'keyTextarea', 'keydownTextarea' );
		this.listenTo( this.collection, 'add', this.renderMessage );
	},
	render: function(){
		var html = this.template();
		var $messages = $.parseHTML( html );
		this.$el.html( $messages );
		// cache elements
		this.$form = this.$el.find('form.new');
		this.$new_message = this.$form.find(':input[name="message"]');
		this.$scroll = this.$el.find('div.scroll');
		this.$messages = this.$scroll.children('ul.list');
		// bind element events
		this.$scroll.on( 'resize', this.resizeMessages );
		this.$scroll.on( 'scroll', this.scrollMessages );
		this.$messages.on( 'resize', this.resizeMessages );
		// detach during this loop to speed up rendering
		this.$messages = this.$messages.detach();
		this.collection.each( this.renderMessage );
		this.$messages.appendTo( this.$scroll );
	},
	// render an individual message
	renderMessage: function( message ){
		var json = message.toJSON();
		var nick = message.get('nick');
		var last_message = this.collection.at( this.collection.indexOf( message ) - 1 );
		var $message, $partial, both_notice, both_message, notice_match, message_match;
		// Check to see if this is a continuation of previous messaging
		if( last_message ){
			both_notice = ( last_message.get('notice') && message.get('notice') );
			both_message = ( last_message.get('message') && message.get('message') );
			notice_match = ( last_message.get('from') === message.get('from') && last_message.get('to') === message.get('to') );
			message_match = ( last_message.get('nick') === nick );
		}
		// If this is a continuation, render the partial template and append it
		if( ( both_notice && notice_match ) || ( both_message && message_match ) ){
			json.partial = true;
			$partial = $($.trim(this.message_template( json )));
			this.$last_message.find('ul.contents').append( $partial );
			this.postprocess( $partial );
		}
		else {
			$message = $($.parseHTML( this.message_template( json ) ));
			this.$messages.append( $message );
			this.postprocess( $message );
		}
		var force_scroll = ( nick === this.collection.connection.get('nick') );
		this.scrollBottom( force_scroll );
		this.last_message = message;
		this.$last_message = $message || this.$last_message;
	},
	// modify the message markup after rendering
	postprocess: function( $message ){
		var $text = $message.find('.text');
		var contents = $text.text();
		var url_regex = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;
		var urls = contents.match( url_regex ) || [];
		$text
		.links()
		.emojify({
			url: CDN_URL +'emoji',
			attr: {
				'class': 'emoji'
			}
		});
		var inlineImage = function( err, result ){
			if( err ) return err;
			var image_html = templates['inline/image']( result );
			$text.after( image_html );
		};
		var inlineGist = function( err, result ){
			if( err ) return err;
			var gist_html = templates['inline/gist']( result );
			$text.after( gist_html );
		};
		var inlineSoundCloud = function( err, result ){
			if( err ) return err;
			$text.after( result.html );
		};
		var inlineYoutube = function( err, result ){
			if( err ) return err;
			var youtube_html = templates['inline/youtube']( result );
			$text.after( youtube_html );
		};
		var inlineVimeo = function( err, result ){
			if( err ) return err;
			var vimeo_html = templates['inline/vimeo']( result );
			$text.after( vimeo_html );
		};
		var inlineVine = function( err, result ){
			if( err ) return err;
			var vine_html = templates['inline/vine']( result );
			$text.after( vine_html );
		};
		if( urls.length > 0 ){
			for( var i = urls.length - 1; i >= 0; i-- ){
				// Check if it's an image
				testImage( urls[i], inlineImage );
				// Check if it's a soundcloud song
				testSoundCloud( urls[i], inlineSoundCloud );
				// Check if it's a youtube video
				testYoutube( urls[i], inlineYoutube );
				// Check if it's a vimeo video
				testVimeo( urls[i], inlineVimeo );
				// Check if it's a vine
				testVine( urls[i], inlineVine );
				// Check for Gists
				testGist( urls[i], inlineGist );
			}
		}
	},
	// keep track of the user's scroll status
	scrollMessages: function( e ){
		var frame_height = this.$scroll.height();
		var frame_scrollheight = this.$scroll[0].scrollHeight;
		var frame_scrolltop = this.$scroll.scrollTop();
		var frame_scrollbottom = frame_scrolltop + frame_height;
		this.is_near_bottom = ( frame_scrollbottom + 50 > frame_scrollheight );
	},
	// Scrolls to the bottom of the chat messages
	scrollBottom: function( force ){
		if( this.is_near_bottom || force ){
			try {
				this.$scroll.scrollTop( this.$messages[0].scrollHeight );
			} catch( err ){}
		}
	},
	// update messages scroll position as elements change size
	resizeMessages: _(function( e ){
		this.scrollBottom();
	}).throttle( 150, { leading: true, trailing: true } ),
	submitNew: function( e ){
		e.preventDefault();
		var message = $.trim( this.$new_message.val() );
		if( message !== '' ){
			var socket = this.collection.socket;
			var channel = this.collection.channel.get('name');
			socket.emit( 'command', message, channel );
			this.$new_message.val('');
		}
	},
	keyTextarea: function( e ){
		// send message when enter is pressed
		if( e.which === 13 && !e.shiftKey ){
			e.preventDefault();
			return this.$form.trigger('submit');
		}
	},
	// some things require keydown instead of keypress
	keydownTextarea: function( e ){
		// cancel out tabs
		if( e.which === 9 ) e.preventDefault();
		// try to complete a username
		if( e.which === 9 && this.$new_message.val() ){
			if( !this.mention_nicks ){
				var text = this.$new_message.val();
				var nick_regex = new RegExp( '^'+ text, 'i' );
				var nicks = this.collection.channel.users.pluck('nick'); // bad?
				this.mention_nicks = _( nicks ).filter( function( nick ){
					return nick_regex.test( nick );
				});
				this.mention_next = this.mention_nicks[0];
			}
			else {
				var mention_nick_id = _( this.mention_nicks ).indexOf( this.mention_next );
				this.mention_next = this.mention_nicks[mention_nick_id+1] || this.mention_nicks[0];
			}
			if( this.mention_next )	this.$new_message.val( this.mention_next +': ' );
		}
		else {
			this.mention_nicks = null;
			this.mention_next = null;
		}
	}
});