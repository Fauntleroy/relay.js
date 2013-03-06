irc.Views.Message = Backbone.View.extend({

	template: irc.templates.message,

	initialize: function( parameters ){

		if( parameters.partial ) this.partial = parameters.partial;

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

				for( var i = urls.length - 1; i >= 0; i-- ){

					// Check if it's an image
					this.testImage( urls[i], inlineImage );

					// Check if it's a youtube video
					var youtube_id = this.testYoutube( urls[i] );
					if( youtube_id ){
						var youtube_html = irc.templates['inline/youtube']({
							id: youtube_id,
							url: urls[i]
						});
						$text.after( youtube_html );
					}

					// Check for Gists
					var gist_id = this.testGist( urls[i], inlineGist );

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
	testYoutube: function( url ){

		var id = url.match( /(?:youtube\.com.*[\?&]v=|youtu\.be\/)(.{11})/i );
		id = ( id )? id[1]: id;

		return id;

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

	}

});
