var igneous = {};
(function(){

	var socket = io.connect('/igneous');

	igneous = {
		watch: function( file ){
			socket.emit( 'add', file );
		}
	};

	socket.on( 'reload', function( file ){
		var links = document.getElementsByTagName('link');
		for( var i = links.length - 1; i >= 0; i-- ){
			var link = links[i];
			if( link.href.match( file ) ){
				var time_string = new Date().getTime().toString();
				link.href = file + '?ts='+ time_string;
			}
		}
	});

})();