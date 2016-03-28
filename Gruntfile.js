'use strict';

module.exports = function(grunt) {
	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);

	// Time how long tasks take. Can help when optimizing build times
	require('time-grunt')(grunt);

	// Define the configuration for all the tasks
	// Can set variables using <%= variable.name %>
	grunt.initConfig({
		// Project settings
		gst: {
			// paths
			client: 'public',
			css: 'public/css',
			dist: 'dist'
		},

		// watch: {
		// 	sass: {
		// 	  files: ['<%= gst.client %>/css/**/*.{scss,sass}'],
		// 	  tasks: ['sass']
		// 	}
		// },

		// Compiles Sass to CSS
		sass: {
		  server: {
		    options: {
		      compass: false
		    },
		    files: {
		      '.tmp/dist/app.css' : '<%= gst.client %>/css/main.scss'
		    }
		  }
		},

		// Copies remaining files to places other tasks can use
		copy: {
			dist: {
				files: [{
					expand: true,
					dot: true,
					dest: '.tmp/dist',
					src: [
						'*.js'
					]
				}]
			}
		},

		// Inject js and css to files
		injector: {
			// No need to inject component scss into one file
			// because it's all imported.
			sass: {

			},

			// Inject css into index.html
			css: {
				options: {
					starttag: '<!-- injector:css -->',
					endtag: '<!-- endinjector -->'
				},

				files: {
					'.tmp/dist/index.html': [
						'.tmp/dist/app.css'
					]
				}
			}
		},

		concurrent: {
			dist: [
				'sass'
			],
			post: [
				'injector:sass'
			]
		}

	});

	grunt.registerTask('build', [
		// 'clean:dist',
		// 'concurrent:dist',
		// 'concat',
		// 'sass',
		// 'uglify',
		'concurrent:dist',
		'copy:dist',
		'injector:css'
	]);
}