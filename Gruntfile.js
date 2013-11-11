module.exports = function(grunt) {

	var pkg = grunt.file.readJSON('package.json');

	grunt.initConfig({
		pkg: pkg,
		stylus: {
			compile: {
				files: {
					'assets/compiled/styles.css': ['assets/styles/relay.styl']
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
		browserify: {
			options: {
				shim: {
					jquery: {
						path: 'assets/scripts/vendor/jquery.js',
						exports: '$'
					},
					'jquery-ui': {
						path: 'assets/scripts/vendor/jquery-ui.custom.js',
						exports: null,
						depends: {
							jquery: '$'
						}
					},
					'jquery.emojify': {
						path: 'assets/scripts/vendor/jquery.emojify.js',
						exports: null,
						depends: {
							jquery: '$'
						}
					},
					'jquery.links': {
						path: 'assets/scripts/vendor/jquery.links.js',
						exports: null,
						depends: {
							jquery: '$'
						}
					},
					'jquery.resize': {
						path: 'assets/scripts/vendor/jquery.resize.js',
						exports: null,
						depends: {
							jquery: '$'
						}
					},
					'jquery.serializeObject': {
						path: 'assets/scripts/vendor/jquery.serializeObject.js',
						exports: null,
						depends: {
							jquery: '$'
						}
					},
					'jquery.sparkartTags': {
						path: 'assets/scripts/vendor/jquery.sparkartTags.js',
						exports: null,
						depends: {
							jquery: '$'
						}
					},
					bootstrap: {
						path: 'assets/scripts/vendor/bootstrap.js',
						exports: null,
						depends: {
							jquery: '$'
						}
					},
					visibility: {
						path: 'assets/scripts/vendor/visibility.js',
						exports: 'Visibility'
					}
				}
			},
			relay: {
				files: {
					'assets/compiled/scripts.js': ['assets/scripts/relay.js']
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
			options: {
				multistr: true
			},
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
	grunt.registerTask( 'buildjs', [ 'jshint', 'browserify' ] );
	grunt.registerTask( 'minify', [ 'uglify', 'cssmin' ] );
	grunt.registerTask( 'predeploy', [ 'build' ] );
	grunt.registerTask( 'dev', [ 'build', 'server', 'watch' ] );

};