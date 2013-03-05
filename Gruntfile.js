module.exports = function(grunt) {

	var pkg = grunt.file.readJSON('package.json');

	grunt.initConfig({
		pkg: pkg,
		stylus: {
			compile: {
				files: {
					'assets/compiled/stylus_styles.css': ['assets/styles/**/*.styl']
				}
			}
		},
		handlebars: {
			compile: {
				options: {
					namespace: 'irc.templates',
					processName: function( filename ){
						filename = filename.replace( /^assets\/templates\//i, '' );
						filename = filename.replace( /\.hbs$/i, '' );
						return filename;
					}
				},
				files: {
					'assets/compiled/templates.js': ['assets/templates/**/*.hbs']
				}
			}
		},
		concat: {
			js: {
				options: {
					separator: ';'
				},
				files: {
					'assets/compiled/scripts.js': [
						'assets/scripts/vendor/jquery/**/*.js',
						'assets/scripts/vendor/jqueryui/**/*.js',
						'assets/scripts/vendor/jquery.links/**/*.js',
						'assets/scripts/vendor/jquery.emojify/**/*.js',
						'assets/scripts/vendor/jquery.serializeObject/**/*.js',
						'assets/scripts/vendor/jquery.sparkartTags/**/*.js',
						'assets/scripts/vendor/jquery.resize/**/*.js',
						'assets/scripts/vendor/bootstrap/**/*.js',
						'assets/scripts/vendor/underscore/**/*.js',
						'assets/scripts/vendor/backbone/**/*.js',
						'assets/scripts/vendor/handlebars/**/*.js',
						'assets/scripts/handlebars_helpers.js',
						'assets/compiled/templates.js',
						'assets/scripts/irc.js',
						'assets/scripts/models/**/*.js',
						'assets/scripts/collections/**/*.js',
						'assets/scripts/views/**/*.js',
						'assets/scripts/routers/**/*.js',
						'assets/scripts/application.js'
					]
				}
			},
			css: {
				options: {
					separator: '\n'
				},
				files: {
					'assets/compiled/styles.css': [ 'assets/styles/**/*.css', 'assets/compiled/stylus_styles.css' ]
				}
			}
		},
		clean: [ 'assets/compiled/stylus_styles.css', 'assets/compiled/templates.js' ],
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				files: {
					'assets/compiled/scripts.js': ['assets/compiled/scripts.js'],
					'assets/compiled/templates.js': ['assets/compiled/templates.js']
				}
			}
		},
		cssmin: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				files: {
					'assets/compiled/styles.css': ['assets/compiled/styles.css']
				}
			}
		},
		watch: {
			files: [ 'assets/scripts/**/*.js', 'assets/styles/**/*.css', 'assets/templates/**/*.hbs' ],
			tasks: ['build']
		}
	});

	// the cool/easy way to do it
	Object.keys( pkg.devDependencies ).forEach( function( dep ){
		if( dep.substring( 0, 6 ) === 'grunt-' ) grunt.loadNpmTasks( dep );
	});

	grunt.registerTask( 'server', 'Start the relay.js server', function(){
		var child_process = require('child_process');
		var spawn = child_process.spawn;
		var server = spawn( 'node', ['relay.js'] );
		console.log('Starting relay.js server...');
		server.stderr.on( 'data', function( data ){
			console.log( 'stderr:', data.toString() );
		});
	});

	grunt.registerTask( 'default', ['build'] );
	grunt.registerTask( 'build', [ 'stylus', 'handlebars', 'concat', 'clean' ] );
	grunt.registerTask( 'minify', [ 'uglify', 'cssmin' ] );
	grunt.registerTask( 'predeploy', [ 'build', 'minify' ] );
	grunt.registerTask( 'dev', [ 'build', 'server', 'watch' ] );

};