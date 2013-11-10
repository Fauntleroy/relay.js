/*

Sparkart Tags

*/

(function( $ ){
	
	'use strict';
	
	var PLACEHOLDER_TEXT = 'add a tag';
	var TAG_SEPARATOR = ',';
	var BUFFER_STRING = 'W';
	var TAG_ELEMENT_CONSTRUCTOR = function( tag ){
		return '<li class="tag"><a href="#remove" class="remove" tabindex="-1">&times;</a>'+ tag +'</li>';
	};
	
	// Convert a csv string into a tag array
	var parseTags = function( string ){
		
		var tags = string.split( TAG_SEPARATOR );
		for( var i in tags ) tags[i] = $.trim( tags[i] );
		
		return tags;
		
	};
	
	var methods = {
		
		// Set up the plugin
		initialize: function( options ){
			
			options = options || {};
			
			return this.each( function(){
				
				var $this = $( this );
				var data = {};
				data.value = options.value || $this.val() || '';
				data.placeholder = options.placeholder || $this.attr('placeholder') || PLACEHOLDER_TEXT;
				data.validator = options.validator || null;
				data.suggest = options.suggest;
				data.defocus_timer = null;
				data.tags = [];
				
				// Bind passed events
				if( options.events ){
					for( var event in options.events ){
						if( options.events.hasOwnProperty( event ) ){
							var method = options.events[event];
							$this.on( event, method );
						}
					}
				}
				
				$this.data( 'sparkart_tags', data );
				
				// Create tags interface
				var $container = data.$container = $('<div class="sparkart-tags" />');
				var $tags = data.$tags = $('<ul class="tags" />');
				var $tag_input = data.$tag_input = $('<input name="new" type="text" placeholder="'+ data.placeholder +'" />');
				var $pseudo_input = data.$false_input = $('<div class="pseudo" />');
				
				// Add elements to DOM
				$tags.append( $tag_input );
				$container.append( $tags );
				$container.append( $pseudo_input );
				$this.after( $container );	
				
				// Start sparkartSuggest
				// Needs to start here in order to get proper event order
				if( options.suggest ){
					$tag_input.sparkartSuggest( options.suggest );
					data.$suggest = $tag_input.data('sparkart_suggest').$suggestions;
				}	
				
				// Bind interface events
				$this.on( 'focus.sparkart-tags', function( e ){
					e.preventDefault();
					$tag_input.focus();
				});
				$tags.on( 'click.sparkart-tags', function( e ){
					$tag_input.focus();
				});
				$container.on( 'mousedown.sparkart-tags', function( e ){
					e.preventDefault();
				});
				$tags.on( 'click.sparkart-tags', 'a.remove', function( e ){
					e.preventDefault();
					var $tag = $(this).closest('ul.tags > *');
					var index = $tag.index();
					var tag = data.tags[index];
					$this.sparkartTags( 'remove', tag );
				});
				$tag_input.on({
					'keydown.sparkart-tags': function( e ){
						var val = $tag_input.val();
						// Enter or ,
						if( e.which === 13 || e.which === 188 || e.which === 44 ){
							e.preventDefault();
							$this.sparkartTags('add');
							val = null;
						// Backspace
						} else if( e.which === 8 ){
							if( val === '' && data.tags.length ){
								$this.sparkartTags( 'remove', data.tags[data.tags.length-1] );
							}
						}
						// Resize tag input
						var pseudo_val = val || data.placeholder;
						$pseudo_input.text( pseudo_val + BUFFER_STRING );
						var pseudo_input_width = $pseudo_input.width();
						var tag_input_width = ( pseudo_input_width > data.min_input_width )? pseudo_input_width: data.min_input_width;
						$tag_input.width( tag_input_width );
					},
					'focus.sparkart-tags': function(){
						$this.sparkartTags('focus');
					},
					'blur.sparkart-tags': function(){
						$this.sparkartTags('blur');
					}
				});
				
				// Get minimum width for tag input
				$pseudo_input.text( data.placeholder + BUFFER_STRING );
				data.min_input_width = $pseudo_input.width();
				$tag_input.width( data.min_input_width );
				
				// Add existing tags
				var tags = parseTags( $this.val() );
				$this
					.hide()
					.sparkartTags( 'add', tags, { silent: true });	
				
			});
			
		},
		
		// Get list of tags
		get: function(){
			
			var $this = $(this);
			var data = $this.data('sparkart_tags');
			
			return data.tags;
			
		},
		
		// Add a tag
		add: function( tags, method_options ){
			
			method_options = method_options || {};
			if( typeof tags === 'string' ) tags = [tags];

			return this.each( function(){

				var $this = $(this);
				var data = $this.data('sparkart_tags');		
				
				// Get tag from tag input
				if( typeof tags === 'undefined' ){
					var val = data.$tag_input.val();
					tags = [val];
					data.$tag_input.val('');
					if( data.suggest ) data.$tag_input.sparkartSuggest('update');
				}
				
				// Clean tags
				for( var i in tags ){
					tags[i] = $.trim( tags[i] );
					if( tags[i] === '' ) tags.splice( i, 1 );
				}
				
				// Remove duplicates
				for( var i in data.tags ){
					var original_tag = data.tags[i];
					for( var ii in tags ){
						var tag = tags[ii];
						if( tag === original_tag || tag === '' ) tags.splice( ii, 1 );
					}
				}

				data.tags = data.tags.concat( tags );
				$this.sparkartTags('update');
				if( !method_options.silent && tags.length ) $this.trigger( 'add', tags );
				
			});
			
		},
		
		// Remove a tag
		remove: function( tags, method_options ){
			
			method_options = method_options || {};
			if( typeof tags === 'string' ) tags = [tags];	
			
			return this.each( function(){
				
				var $this = $(this);
				var data = $this.data('sparkart_tags');
				
				// Remove tags
				for( var i in data.tags ){
					var original_tag = data.tags[i];
					for( var ii in tags ){
						var tag = tags[ii];
						if( tag === original_tag ) data.tags.splice( i, 1 );
					}
				}
				
				$this.sparkartTags('update');
				
				//if( !method_options.silent && tags.length ) $this.trigger( 'remove', tags );
				
			});
		
		},
		
		// Redraw the tags interface
		update: function(){
			
			return this.each( function(){	
				
				var $this = $(this);
				var data = $this.data('sparkart_tags');	

				data.$tags.children().not( data.$tag_input ).not( data.$suggest ).remove();
				
				for( var i in data.tags ){
					var tag = data.tags[i];
					var tag_html = TAG_ELEMENT_CONSTRUCTOR( tag );
					data.$tag_input.before( tag_html );
				}
				
				$this.val( data.tags.join(',') );
			
			});
		
		},
		
		// Fake focus for the fake tags input
		focus: function(){
			
			return this.each( function(){	
				
				var $this = $(this);
				var data = $this.data('sparkart_tags');
				
				data.$container.addClass('focus');
				
			});
			
		},	
		
		// Fake blur for the fake tags input
		blur: function(){
			
			return this.each( function(){	
				
				var $this = $(this);
				var data = $this.data('sparkart_tags');
				
				data.$container.removeClass('focus');
				
				// Add any leftover text as a tag
				$this.sparkartTags('add');
				data.$tag_input.val('');
				
			});
			
		},
		
		// Destroy the plugin
		destroy: function(){
			
			var $this = $(this);	
			var data = $this.data('sparkart_tags');
			
			data.$tags.remove();
			$this
				.show()
				.off('.sparkart-tags')
				.removeData('sparkart_tags');
			
		}
		
	};
	
	// Attach stPagination to jQuery
	$.fn.sparkartTags = function( method ){
		
		if( methods[method] ){
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		}
		else if( typeof method === 'object' || ! method ){
			return methods.initialize.apply( this, arguments );
		}	
		
	};

})( jQuery );