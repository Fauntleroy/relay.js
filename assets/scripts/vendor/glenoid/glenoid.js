this.Glenoid = {};

(function(){
	
	// Glenoid.Model
	// --------------

	Glenoid.Model = Backbone.Model.extend({
		
		// Automatically uses parent collection's socket
		socket: function(){
			
			var parent_socket = getValue( this.collection, 'socket' );
			
			return parent_socket;
			
		},
		
		// Assign a socket to the model
		// We store this socket and use it for socket sync methods
		// This also listens for changes pushed from the server
		setSocket: function( socket ){
			
			if( socket === this.socket )
				return;
			
			this_socket = getValue( this, 'socket' );
			
			// No zombies
			if( this_socket ){
				this_socket.removeListener( 'update', this.receiveSocketUpdate );
				this_socket.removeListener( 'delete', this.receiveSocketDelete );
			}
			
			this.socket = socket;
			this_socket = getValue( this, 'socket' );
			
			_(this).bindAll( 'receiveSocketUpdate', 'receiveSocketDelete' );
			this_socket.on( 'update', this.receiveSocketUpdate );
			this_socket.on( 'delete', this.receiveSocketDelete );
			
		},
		
		// Update the model on 'update' event from socket
		receiveSocketUpdate: function( data ){
			
			var attributes = data;
			this.set( attributes );
			
		},
		
		// Delete the model on 'delete' event from socket
		receiveSocketDelete: function( data ){
			
			this.destroy();
			
		},
		
		// Shortcut to 'fetch' via socket
		socketFetch: function( options ){
			
			var options = ( options )
				? _.clone( options )
				: {};
			
			options.method = 'socket.io';
			
			return this.fetch( options );
			
		},
		
		// Shortcut to 'save' via socket
		socketSave: function( key, value, options ){
			
			var attributes;
			
			// Handle both `("key", vaclue)` and `({key: value})` -style calls.
			if( _.isObject( key ) || key === null ){
				attributes = key;
				options = value;
			}
			else {
				attributes = {};
				attributes[key] = value;
			}
			
			var options = ( options )
				? _.clone( options )
				: {};
			
			options.method = 'socket.io';
			
			return this.save( attributes, options );
			
		},
		
		// Shortcut to 'destroy' via socket
		socketDestroy: function( options ){
			
			var options = ( options )
				? _.clone( options )
				: {};
			
			options.method = 'socket.io';
			
			return this.destroy( options );
			
		}
		
	});
	
	// Glenoid.Collection
	// --------------
	
	Glenoid.Collection = Backbone.Collection.extend({
		
		// Ensure we use the Glenoid model by default
		model: Glenoid.Model,
		
		// Assign a socket to the collection
		// We store this socket and use it for socket sync methods
		// This also listens for changes pushed from the server
		setSocket: function( socket ){
			
			if( socket === this.socket )
				return;
			
			// No zombies
			if( this.socket ){
				this.socket.removeListener( 'create', this.receiveSocketCreate );
				this.socket.removeListener( 'read', this.receiveSocketRead );
				this.socket.removeListener( 'update', this.receiveSocketUpdate );
				this.socket.removeListener( 'delete', this.receiveSocketDelete );
			}
			
			this.socket = socket;
			
			_(this).bindAll( 'receiveSocketCreate', 'receiveSocketRead', 'receiveSocketUpdate', 'receiveSocketDelete' );
			this.socket.on( 'create', this.receiveSocketCreate );
			this.socket.on( 'read', this.receiveSocketRead );
			this.socket.on( 'update', this.receiveSocketUpdate );
			this.socket.on( 'delete', this.receiveSocketDelete );
			
		},
		
		// Add a model on 'create' event from socket
		receiveSocketCreate: function( data ){
			
			var attributes = data;
			
			this.add( attributes );
			
		},
		
		// Add models on 'read' event from socket
		receiveSocketRead: function( data ){
			
			var attributes = data;

			this.add( attributes );
			
		},
		
		// Update a model on 'update' event from socket
		receiveSocketUpdate: function( data ){
			
			var id = data.id;
			var attributes = data;
			var model = this.get( id );
			
			model.set( attributes );
			
		},
		
		// Remove a model on 'delete' event from socket
		receiveSocketDelete: function( data ){
			
			var id = data.id;
			var model = this.get( id );
			
			this.remove( model );
			
		},
		
		// Shortcut to 'fetch' via socket
		socketFetch: function( options ){
			
			var options = ( options )
				? _.clone( options )
				: {};
			
			options.method = 'socket.io';
			
			return this.fetch( options );
			
		},
		
		// Shortcut to 'create' via socket
		socketCreate: function( attributes, options ){
			
			var options = ( options )
				? _.clone( options )
				: {};
			
			options.method = 'socket.io';
			
			return this.create( attributes, options );
			
		}
		
	});
	
	// Backbone.sync
	// -------------

	// Map from CRUD to HTTP for our default `Backbone.sync` implementation.
	var methodMap = {
		'create': 'POST',
		'update': 'PUT',
		'delete': 'DELETE',
		'read':   'GET'
	};

	// Override this function to change the manner in which Backbone persists
	// models to the server. You will be passed the type of request, and the
	// model in question. By default, makes a RESTful Ajax request
	// to the model's `url()`. Some possible customizations could be:
	//
	// * Use `setTimeout` to batch rapid-fire updates into a single request.
	// * Send up the models as XML instead of JSON.
	// * Persist models via WebSockets instead of Ajax.
	//
	// Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
	// as `POST`, with a `_method` parameter containing the true HTTP method,
	// as well as all requests with the body as `application/x-www-form-urlencoded`
	// instead of `application/json` with the model in a param named `model`.
	// Useful when interfacing with server-side languages like **PHP** that make
	// it difficult to read the body of `PUT` requests.
	Backbone.sync = function( method, model, options ) {
		
		var type = methodMap[method];
		
		// Default options, unless specified.
		options || (options = {});
		
		if( options.method === 'socket.io' ){
			
			// Default Socket request options
			var params = {
				type: type
			};
			
			// Set the channel
			params.socket = getValue(model, 'socket') || socketError();
			params.id = getValue(model, 'id');
			
			// Ensure that we have the appropriate request data.
			if (!options.data && model && (method == 'create' || method == 'update'))
				params.data = JSON.stringify( model.toJSON() );
			
			// Enqueue methods if not connected yet
			if( !params.socket.socket.connected ){
				
				var that = this;
				var sync = arguments.callee;
				var sync_arguments = arguments;
				
				params.socket.on( 'connect', function(){
					sync.apply( that, sync_arguments );
					params.socket.removeListener( 'connect', arguments.callee );
				});
				
				return;
			
			}
			
			params = _( params ).extend( options );
			
			var data = ( method === 'read' || method === 'delete' )
				? { id: params.id }
				: model.toJSON();

			params.socket.emit( method, data, function( data ){
				if( data.errors && params.error )
					params.error( data.errors );
				else if( params.success )
					params.success( data );
			});
			
		}

		// Leave normal sync method intact
		else {
			
			// Default JSON-request options.
			var params = {type: type, dataType: 'json'};
			
			// Ensure that we have a URL.
			if (!options.url) {
				params.url = getValue(model, 'url') || urlError();
			}
			
			// Ensure that we have the appropriate request data.
			if (!options.data && model && (method == 'create' || method == 'update')) {
				params.contentType = 'application/json';
				params.data = JSON.stringify(model.toJSON());
			}
			
			// For older servers, emulate JSON by encoding the request into an HTML-form.
			if (Backbone.emulateJSON) {
				params.contentType = 'application/x-www-form-urlencoded';
				params.data = params.data ? {model: params.data} : {};
			}
			
			// For older servers, emulate HTTP by mimicking the HTTP method with `_method`
			// And an `X-HTTP-Method-Override` header.
			if (Backbone.emulateHTTP) {
				if (type === 'PUT' || type === 'DELETE') {
					if (Backbone.emulateJSON) params.data._method = type;
					params.type = 'POST';
					params.beforeSend = function(xhr) {
						xhr.setRequestHeader('X-HTTP-Method-Override', type);
					};
				}
			}
			
			// Don't process data on a non-GET request.
			if (params.type !== 'GET' && !Backbone.emulateJSON) {
				params.processData = false;
			}
			
			// Make the request, allowing the user to override any Ajax options.
			return $.ajax(_.extend(params, options));
			
		}
		
	};
	
	// Helper function to get a value from a Backbone object as a property
	// or as a function.
	var getValue = function(object, prop) {
		if (!(object && object[prop])) return null;
		return _.isFunction(object[prop]) ? object[prop]() : object[prop];
	};

	// Throw an error when a URL is needed, and none is supplied.
	var socketError = function() {
		throw new Error('You need to setSocket() before you use socket methods');
	};

})();