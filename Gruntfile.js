module.exports = function(grunt) {

  grunt.registerTask('server', [ 'connect', 'watch' ]);

  grunt.initConfig({
    concat: {
      main: {
        options: {
          separator: '\n\n',
          sourceMap: true
        },
        src: [
          'src/js/main.js',
          'src/js/section.js',
          'src/js/scroll.js',
          'src/js/video.js',
          'src/js/audio.js',
          'src/js/navigation.js',
          'src/js/assets.js',
          'src/js/viewport.js',
          'src/js/component.js',
          'src/js/components/*.js'
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
    connect: {
      all: {
        options:{
          port: 9000,
          hostname: "0.0.0.0",
          livereload: true
        }
      }
    },
    watch: {
      js: {
        files: ['src/js/*.js', 'src/js/components/*.js'],
        tasks: ['concat:main', 'uglify:js'],
        options: {
          livereload: true,
        }
      },
      css: {
        files: ['src/css/**/*.scss', 'example/css/*.scss'],
        tasks: ['sass:style'],
        options: {
          livereload: true,
        }
      },
      html: {
        files: ['example/index.html'],
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
  grunt.loadNpmTasks('grunt-contrib-connect');

};
