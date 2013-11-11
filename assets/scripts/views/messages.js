var CDN_URL = 'https://s3-us-west-2.amazonaws.com/relayjs/';

var Backbone = require('backbone');
var $ = Backbone.$ = require('jquery');
require('jquery.links');
require('jquery.emojify');
var _ = require('lodash');
var Handlebars = require('handlebars');
var helpers = require('../handlebars_helpers.js');
helpers( Handlebars );

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

var gist_template = Handlebars.compile('<div class="inline gist">\
	{{{div}}}\
	<link rel="stylesheet" href="https://gist.github.com/{{stylesheet}}" />\
</div>');

var image_template = Handlebars.compile('<div class="inline image">\
	<a href="{{url}}" target="_blank"><img src="{{url}}" /></a>\
</div>');

var vimeo_template = Handlebars.compile('<div class="inline vimeo">\
	<a href="{{url}}" target="_blank"><img src="{{thumbnail}}" /></a>\
</div>');

var vine_template = Handlebars.compile('<div class="inline vine">\
	<iframe class="vine-embed" src="https://vine.co/v/{{id}}/embed/simple" width="320" height="320" frameborder="0"></iframe><script async src="//platform.vine.co/static/scripts/embed.js" charset="utf-8"></script>\
</div>');

var youtube_template = Handlebars.compile('<div class="inline youtube">\
	<a href="{{url}}" target="_blank"><img src="https://i.ytimg.com/vi/{{id}}/0.jpg" /></a>\
</div>');

module.exports = Backbone.View.extend({
	// keep track of nicks user can tab through
	mention_nicks: null,
	mention_next: null,
	// know when we need to scroll down
	is_near_bottom: true,
	template: Handlebars.compile('<div class="scroll">\
		<ul class="list"></ul>\
	</div>\
	<form class="new">\
		<textarea name="message"></textarea>\
	</form>'),
	message_template: Handlebars.compile('{{#message}}\
	{{^partial}}\
	<li class="message{{#self}} self{{/self}}">\
		<h5 class="nick"><a href="#{{nick}}" {{^self}}class="user{{presence_id}}"{{/self}}>{{nick}}</a></h5>\
		<ul class="contents">\
	{{/partial}}\
			<li {{#mention}}class="mention"{{/mention}}>\
				<var class="timestamp">{{time timestamp}}</var>\
				<span class="text">{{breaklines contents}}</span>\
			</li>\
	{{^partial}}\
		</ul>\
	</li>\
	{{/partial}}\
	{{/message}}\
	{{#if away}}\
	<li class="away">\
		<var class="timestamp">{{time timestamp}}</var>\
		<i class="icon-minus-sign"></i> <strong class="nick">{{nick}}</strong> <em>(away)</em> <span class="text">{{contents}}</span>\
	</li>\
	{{/if}}\
	{{#if nowaway}}\
	<li class="nowaway">\
		<var class="timestamp">{{time timestamp}}</var>\
		<i class="icon-minus-sign"></i> {{text}}\
	</li>\
	{{/if}}\
	{{#action}}\
	<li class="action">\
		<var class="timestamp">{{time timestamp}}</var>\
		<em>* <strong>{{nick}}</strong> <span class="text">{{contents}}</span></em>\
	</li>\
	{{/action}}\
	{{#nick_change}}\
	<li class="nick">\
		<var class="timestamp">{{time timestamp}}</var>\
		<i class="icon-user"></i> <strong class="nick">{{old_nick}}</strong> is now known as <strong class="nick">{{new_nick}}</strong>\
	</li>\
	{{/nick_change}}\
	{{#notice}}\
	{{^partial}}\
	<li class="notice">\
		<h5>{{#from}}<span class="from">{{.}}</span> {{/from}}&#9656; <span class="to">{{to}}</span></h5>\
		<ul class="contents">\
	{{/partial}}\
			<li>\
				<var class="timestamp">{{time timestamp}}</var>\
				<span class="text">{{text}}</span>\
			</li>\
	{{^partial}}\
		</ul>\
	</li>\
	{{/partial}}\
	{{/notice}}\
	{{#join}}\
	<li class="join">\
		<var class="timestamp">{{time timestamp}}</var>\
		<i class="icon-chevron-right"></i> <strong>{{nick}}</strong> joined the channel\
	</li>\
	{{/join}}\
	{{#part}}\
	<li class="part">\
		<var class="timestamp">{{time timestamp}}</var>\
		<i class="icon-chevron-left"></i> <strong>{{nick}}</strong> left the channel{{#reason}} ( <span class="text">{{.}}</span> ){{/reason}}\
	</li>\
	{{/part}}\
	{{#kick}}\
	<li class="kick">\
		<var class="timestamp">{{time timestamp}}</var>\
		<i class="icon-chevron-left"></i> <strong class="nick">{{nick}}</strong> was kicked by <strong class="by">{{by}}</strong>{{#reason}} ( <span class="text">{{.}}</span> ){{/reason}}\
	</li>\
	{{/kick}}\
	{{#topic}}\
	<li class="topic">\
		<var class="timestamp">{{time timestamp}}</var>\
		<i class="icon-pencil"></i> <strong>{{nick}}</strong> <span class="text">{{#topic_text}}set the topic to <em>&ldquo;{{.}}&rdquo;</em>{{/topic_text}}{{^topic_text}}cleared the topic{{/topic_text}}</span>\
	</li>\
	{{/topic}}\
	{{#mode_add}}\
	<li class="mode add">\
		<var class="timestamp">{{time timestamp}}</var>\
		<i class="icon-plus"></i>\
		<span class="text"><strong>{{by}}</strong> added the mode &ldquo;{{mode}}&rdquo; to {{channel}}{{#argument}} with the argument <code>{{.}}</code>{{/argument}}</span>\
	{{/mode_add}}\
	{{#mode_remove}}\
	<li class="mode remove">\
		<var class="timestamp">{{time timestamp}}</var>\
		<i class="icon-minus"></i>\
		<span class="text"><strong>{{by}}</strong> removed the mode &ldquo;{{mode}}&rdquo; from {{channel}}{{#argument}} with the argument <code>{{.}}</code>{{/argument}}</span>\
	{{/mode_remove}}\
	{{#motd}}\
	<li class="motd">\
		<var class="timestamp">{{time timestamp}}</var>\
		<pre class="text">{{text}}</pre>\
	</li>\
	{{/motd}}\
	{{#whois}}\
	<li class="whois">\
		<var class="timestamp">{{time timestamp}}</var>\
		<i class="icon-question-sign"></i> WHOIS for <strong>{{info.nick}}</strong>: {{^info.server}}User not found.{{/info.server}}\
		{{#info}}\
		<dl>\
			{{#if account}}<dt>account</dt><dd>{{account}}</dd>{{/if}}\
			{{#if user}}<dt>user</dt><dd>{{user}}</dd>{{/if}}\
			{{#if host}}<dt>host</dt><dd>{{host}}</dd>{{/if}}\
			{{#if realname}}<dt>realname</dt><dd>{{realname}}</dd>{{/if}}\
			{{#if channels}}<dt>channels</dt><dd>{{#channels}}{{.}} {{/channels}}</dd>{{/if}}\
			{{#if server}}<dt>server</dt><dd>{{server}} {{#if serverinfo}}({{serverinfo}}){{/if}}</dd>{{/if}}\
		</dl>\
		{{/info}}\
	</li>\
	{{/whois}}\
	{{#error}}\
	<li class="error">\
		<var class="timestamp">{{time timestamp}}</var>\
		<i class="icon-warning-sign"></i> <span class="text">{{text}}</span>\
	</li>\
	{{/error}}'),
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
			$message = $($.trim(this.message_template( json )));
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
			var image_html = image_template( result );
			$text.after( image_html );
		};
		var inlineGist = function( err, result ){
			if( err ) return err;
			var gist_html = gist_template( result );
			$text.after( gist_html );
		};
		var inlineSoundCloud = function( err, result ){
			if( err ) return err;
			$text.after( result.html );
		};
		var inlineYoutube = function( err, result ){
			if( err ) return err;
			var youtube_html = youtube_template( result );
			$text.after( youtube_html );
		};
		var inlineVimeo = function( err, result ){
			if( err ) return err;
			var vimeo_html = vimeo_template( result );
			$text.after( vimeo_html );
		};
		var inlineVine = function( err, result ){
			if( err ) return err;
			var vine_html = vine_template( result );
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