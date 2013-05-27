irc.Views.Message = Backbone.View.extend({

	template: irc.templates.message,

	initialize: function( parameters ){

		this.partial = parameters.partial;

		_( this ).bindAll( 'render', 'postprocess' );

	},

	render: function(){

		var json = this.model.toJSON();
		var html = this.template( json );
		var $message = $.parseHTML( html );
		this.setElement( $message );
		this.postprocess();

		return this;

	},

	postprocess: function(){

		var $text = this.$el.find('.text');

		$text
		.links()
		.emojify({
			url: CDN_URL +'emoji',
			attr: {
				'class': 'emoji'
			}
		});

		if( this.model.get('message') ){

			var contents = this.model.get('contents');
			var url_regex = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;
			var urls = contents.match( url_regex ) || [];

			if( urls.length > 0 ){

				var inlineImage = function( err, result ){
					if( err ) return err;
					var image_html = irc.templates['inline/image']( result );
					$text.after( image_html );
				};

				var inlineGist = function( err, result ){
					if( err ) return err;
					var gist_html = irc.templates['inline/gist']( result );
					$text.after( gist_html );
				};

				var inlineSoundCloud = function( err, result ){
					if( err ) return err;
					$text.after( result.html );
				};

				var inlineYoutube = function( err, result ){
					if( err ) return err;
					var youtube_html = irc.templates['inline/youtube']( result );
					$text.after( youtube_html );
				};

				var inlineVimeo = function( err, result ){
					if( err ) return err;
					var vimeo_html = irc.templates['inline/vimeo']( result );
					$text.after( vimeo_html );
				};

				var inlineVine = function( err, result ){
					if( err ) return err;
					var vine_html = irc.templates['inline/vine']( result );
					$text.after( vine_html );
				};

				for( var i = urls.length - 1; i >= 0; i-- ){

					// Check if it's an image
					this.testImage( urls[i], inlineImage );

					// Check if it's a soundcloud song
					this.testSoundCloud( urls[i], inlineSoundCloud );

					// Check if it's a youtube video
					this.testYoutube( urls[i], inlineYoutube );

					// Check if it's a vimeo video
					this.testVimeo( urls[i], inlineVimeo );

					// Check if it's a vine
					this.testVine( urls[i], inlineVine );

					// Check for Gists
					this.testGist( urls[i], inlineGist );

				}

			}

		}

	},

	// See if a URL is an image or not
	testImage: function( url, callback ){

		var is_image = /\.(?:jpg|jpeg|gif|png|bmp|svg)(?:[\?#].*){0,}$/i.test( url );
		if( is_image ){
			if( callback ) callback( null, {
				url: url
			});
		}
		else {
			if( callback ) callback( 'No image found' );
		}

	},

	// Get Youtube ID out of a URL
	testYoutube: function( url, callback ){

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

	},

	// Get Vimeo ID out of a URL
	testVimeo: function( url, callback ){

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

	},

	// Get Gist ID out of a URL
	testGist: function( url, callback ){

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

	},

	// Get SoundCloud ID out of a URL
	testSoundCloud: function( url, callback ){

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

	},

	// Get Vine ID out of a URL
	testVine: function( url, callback ){

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

	}

});
