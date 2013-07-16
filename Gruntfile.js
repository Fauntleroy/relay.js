module.exports = function(grunt) {

	var pkg = grunt.file.readJSON('package.json');

	grunt.initConfig({
		pkg: pkg,
		stylus: {
			compile: {
				files: {
					'assets/compiled/styles.css': ['assets/styles/irc.styl']
				}
			}
		},
		cssjoin: {
			compile: {
				options: {
					paths: ['assets/styles']
				},
				files: {
					'assets/compiled/styles.css': ['assets/compiled/styles.css']
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
						'assets/scripts/vendor/lodash/**/*.js',
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
			}
		},
		clean: {
			js: {
				src: [ 'assets/compiled/templates.js' ]
			},
			css: {
				src: [ 'assets/compiled/stylus_styles.css' ]
			}
		},
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
			css: {
				files: [ 'assets/styles/**/*.styl', 'assets/styles/**/*.css' ],
				tasks: [ 'buildcss' ]
			},
			js: {
				files: [ 'assets/scripts/**/*.js', 'assets/templates/**/*.hbs' ],
				tasks: [ 'buildjs' ]
			},
			livereload: {
				options: {
					livereload: true
				},
				files: [ 'assets/compiled/styles.css' ]
			}
		},
		jshint: {
			all: [ 'assets/scripts/**/*.js', '!assets/scripts/vendor/**/*.js' ]
		}
	});

	// the cool/easy way to do it
	Object.keys( pkg.devDependencies ).forEach( function( dep ){
		if( dep.substring( 0, 6 ) === 'grunt-' ) grunt.loadNpmTasks( dep );
	});

	grunt.registerTask( 'server', 'Start the relay.js server', function(){
		var port = grunt.option('port') || grunt.option('p');
		var args = ['relay.js','--livereload'];
		if( port ) args = args.concat([ '-p', port ]);
		grunt.util.spawn({
			cmd: 'node',
			args: args,
			opts: {
				stdio: 'inherit'
			}
		});
	});

	grunt.registerTask( 'default', ['build'] );
	grunt.registerTask( 'build', [ 'buildcss', 'buildjs' ] );
	grunt.registerTask( 'buildcss', [ 'stylus', 'cssjoin', 'clean:css' ] );
	grunt.registerTask( 'buildjs', [ 'handlebars', 'concat:js', 'clean:js' ] );
	grunt.registerTask( 'minify', [ 'uglify', 'cssmin' ] );
	grunt.registerTask( 'predeploy', [ 'build' ] );
	grunt.registerTask( 'dev', [ 'build', 'server', 'watch' ] );

};