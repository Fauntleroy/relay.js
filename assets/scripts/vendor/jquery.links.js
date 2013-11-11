( function( $ ){

	$.fn.links = function( parameters ){
		
		parameters = parameters || {};
		var defaults = {
			target: '_blank',
			protocol: 'http://'
		};
		$.extend( parameters, defaults );

		return this.each( function(){
			
			var $this = $(this);
			var string = $this.html();
			var url_regex = /(\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’])))/ig;
			var html = string.replace( url_regex, function( match, url ){
				var href = url;
				// No protocol? No problem. Fill it in for them.
				var has_protocol = /[a-z]+:\/\//.test( href );
				if( !has_protocol ) href = parameters.protocol + href;
				return '<a href="'+ href +'" target="'+ parameters.target +'">'+ url +'</a>';
			});
			
			$this.html( $.parseHTML(html) );
			
			return this;
			
		});
		
	};

})( jQuery );