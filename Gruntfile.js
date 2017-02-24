/*global module:false*/
module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks("grunt-contrib-yuidoc");
    grunt.loadNpmTasks('grunt-exec');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            browser: {
                src: ['lib/*.js', 'test/*.js'],
                options: {
                    jshintrc: ".jshintrc"
                }
            }
        },
        clean: ['coverage', 'doc'],
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>',
                description: '<%= pkg.description %>',
                version: '<%= pkg.version %>',
                url: '<%= pkg.homepage %>',
                logo: 'https://raw.github.com/yaniswang/jWebDriver/master/logo_s.png',
                options: {
                    paths: './lib',
                    themedir: 'path/to/custom/theme/',
                    outdir: './doc'
                }
            }
        },
        exec: {
            test: {
                command: '"./node_modules/.bin/mocha"',
                stdout: true,
                stderr: true
            },
            cover: {
                command: '"./node_modules/.bin/istanbul" cover "./node_modules/mocha/bin/_mocha"',
                stdout: true,
                stderr: true
            }
        },
        watch: {
            src: {
                files: ['lib/*.js'],
                tasks: 'dev'
            }
        }
    });

    grunt.registerTask('dev', ['jshint', 'exec:test']);

    grunt.registerTask('default', ['jshint', 'clean', 'exec:cover', 'yuidoc']);

};
