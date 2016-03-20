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
			css: 'public/css'
		},

		watch: {
			sass: {
			  files: ['<%= gst.client %>/css/**/*.{scss,sass}'],
			  tasks: ['sass']
			}
		},

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

		concurrent: {
			dist: [
				'sass'
			]
		}
	})

	grunt.registerTask('build', [
		// 'clean:dist',
		// 'concurrent:dist',
		// 'concat',
		// 'uglify'
		'concurrent:dist'
	]);
}