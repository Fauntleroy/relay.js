this.tkView = {};

(function(){

	tkView = Backbone.View.extend({

		_childRender: function( options ){

			var $parent = options.parent.$el;

			if( this.render ) this.render();
			$parent.on( 'renderchildren dispose', this.dispose );

		},

		redraw: function( options ){

			// Redraw the current viewk
			json = options.json || ( this.model )? this.model.toJSON(): {};
			var html = this.template( json );

			if( options.replace ){
				var $view = $(html);
				this.$el.replaceWith( $view );
				this.setElement( $view );
			}
			else {
				this.$el.html(html);
			}

		},

		// Render a child view
		renderChild: function( child ){

			var $el = child.options.$el;
			delete child.options.$el;
			var view = new child.View( child.options );
			view.setElement( $el );
			view._childRender({ parent: this });

		},

		// Render the view and its children
		renderChildren: function( children ){

			_( children ).each( this.renderChild, this );

			this.trigger('renderChildren');

			// Automatically render embedded subviews
			/*var $sub_views = this.$el.find('view');
			
			$sub_views.each( function( i, view ){
				
				var $view = $(view);
				var data = $view.data();
				var SubModel = tandem.Models[data.model];
				var SubView = tandem.Views[data.view];
				var id = data.id;
				var sub_model = new SubModel({ id: id });
				var sub_view = new SubView({ model: sub_model });
				var $sub_view = sub_view.render().$el;
				
				$view.replaceWith( $sub_view );
				
			});*/
			
		},

		// Ensure the view is dead
		dispose: function(){

			this.remove();
			this.off();
			if( this.model ) this.model.off( null, null, this );
			if( this.collection ) this.collection.off( null, null, this );

			this.trigger('dispose');

		}

	});

})();