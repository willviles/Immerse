module.exports = function(grunt) {

  grunt.registerTask('watch', [ 'watch' ]);

  grunt.initConfig({
    concat: {
      js: {
        options: {
          separator: ';',
          sourceMap: true
        },
        src: [
          'src/js/main.js', 'src/js/scroll.js'
        ],
        dest: 'dist/js/immerse.js'
      },
    },
    uglify: {
      options: {
        mangle: false,
        sourceMap: true
      },
      js: {
        files: {
          'dist/js/immerse.min.js': ['dist/js/immerse.js']
        }
      }
    },
    sass: {
      style: {
        options: {
          style: 'expanded',
          compass: true
        },
        files: {
          'dist/css/immerse.css': 'src/css/style.scss',
          'example/style.css': 'example/css/style.scss'
        }
      }
    },
    watch: {
      js: {
        files: ['src/js/*.js'],
        tasks: ['concat:js', 'uglify:js'],
        options: {
          livereload: true,
        }
      },
      css: {
        files: ['src/css/style.scss', 'example/css/style.scss'],
        tasks: ['sass:style'],
        options: {
          livereload: true,
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

};
