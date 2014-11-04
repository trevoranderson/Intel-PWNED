module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      },
      dist: {
        files: {
          'js/script.min.js': 'js/script.js'
        }
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      bower: {
        src: [ 'bower_components/angular/angular.js',
          'bower_components/angular-cookies/angular-cookies.min.js',
          'bower_components/angular-route/angular-route.min.js',
          'bower_components/jquery/dist/jquery.js',
          'bower_components/angular-bootstrap/ui-bootstrap.min.js',
          'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js'
        ],
        dest: 'js/script.js'
      },
      dist: {
        src: [ 'js/script.js', 'app.js', 'views/**/*.js', 'components/**/*.js'],
        dest: 'js/script.js'
      }
    }
  });

  // Load the plugin that provides the tasks
  require('load-grunt-tasks')(grunt);

  // Default task(s).
  grunt.registerTask('default', [
    'concat:bower',
    'concat:dist',
    'uglify:dist'
  ]);

};