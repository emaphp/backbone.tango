module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            files: ['Gruntfile.js', 'dist/<%= pkg.name %>.js'],

            options: {
                globals: {
                    'Backbone': true,
                    _: true
                }
            }
        },

        uglify: {
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['dist/<%= pkg.name %>.js']
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

	//copies dependencies to test directory
	grunt.registerTask('prepare', ['copy:jquery', 'copy:underscore', 'copy:backbone']);

    //applies jshint to project files
    grunt.registerTask('test', ['jshint']);

    //minifies library
    grunt.registerTask('release', ['jshint', 'uglify:dist']);
};
