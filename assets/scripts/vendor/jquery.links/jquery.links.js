( function( $ ){

	$.fn.links = function( parameters ){
		
		parameters = parameters || {};
		var defaults = {
			target: '_blank'
		};
		$.extend( parameters, defaults );

		return this.each( function(){
			
			var $this = $(this);
			var string = $this.html();
			var url_regex = /(\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’])))/ig;
			var html = string.replace( url_regex, '<a href="$1" target="'+ parameters.target +'">$1</a>' );
			
			$this.html( html );
			
			return this;
			
		});
		
	};

})( jQuery );