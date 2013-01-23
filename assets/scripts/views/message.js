irc.Views.Message = Backbone.View.extend({

	template: templates.message,

	initialize: function( parameters ){

		if( parameters.partial ) this.partial = parameters.partial;

		_( this ).bindAll( 'render', 'postprocess' );

	},

	render: function(){

		var json = this.model.toJSON();
		var html = this.template( json );
		this.setElement( html );
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
			var url_regex = /^(\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’])))$/ig;
			var is_url = url_regex.test( contents );

			if( is_url ){

				// Check if it's an image
				this.testImage( contents, function( url, result ){
					if( result === 'success' ){
						var image_html = templates['inline/image']({ url: contents });
						$text.after( image_html );
					}
				});

			}

		}

	},

	// See if a URL is an image or not
	testImage: function( url, callback ){

		var timeout = 4000;
		var timed_out = false;
		var timer;
		var img = new Image();

		img.onerror = img.onabort = function(){
			if( !timed_out ){
				clearTimeout( timer );
				callback( url, 'error' );
			}
		};

		img.onload = function(){
			if( !timed_out ){
				clearTimeout( timer );
				callback( url, 'success' );
			}
		};

		img.src = url;
		timer = setTimeout( function(){
			timed_out = true;
			callback( url, 'timeout' );
		}, timeout ); 

	}

});