module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            files: ['Gruntfile.js', 'dist/js/<%= pkg.name %>.js'],

            options: {
                globals: {
                    'Backbone': true,
                    _: true
                }
            }
        },

        uglify: {
            dist: {
                options: {
                    sourceMap: true
                },
                
                files: {
                    'dist/js/<%= pkg.name %>.min.js': ['dist/js/<%= pkg.name %>.js']
                }
            }
        },

        cssmin: {
            options: {
                sourceMap: true
            },

            target: {
                files: {
                    'dist/css/<%= pkg.name %>.min.css': 'dist/css/<%= pkg.name %>.css',
                    'dist/css/themes/tango.toastr.min.css': 'dist/css/themes/tango.toastr.css'
                }
            }
        },

        sass: {
            dist: {
                files: {
                    'dist/css/<%= pkg.name %>.css': 'dist/sass/<%= pkg.name %>.scss',
                    'dist/css/themes/tango.toastr.css': 'dist/sass/themes/toastr/tango.toastr.scss'
                }
            }
        },
        
        copy: {
			jquery: {
				src: 'bower_components/jquery/dist/jquery.js',
				dest: 'test/lib/jquery.js'
			},

			underscore: {
				src: 'bower_components/underscore/underscore.js',
				dest: 'test/lib/underscore.js'
			},

			backbone: {
				src: 'bower_components/backbone/backbone.js',
				dest: 'test/lib/backbone.js'
			}
		}
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-sass');

	//copies dependencies to test directory
	grunt.registerTask('prepare', ['copy:jquery', 'copy:underscore', 'copy:backbone']);

    //applies jshint to project files
    grunt.registerTask('test', ['jshint']);

    //minifies library
    grunt.registerTask('release', ['jshint', 'uglify:dist', 'sass', 'cssmin']);
};
