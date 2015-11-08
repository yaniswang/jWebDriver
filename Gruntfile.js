/*global module:false*/
module.exports = function(grunt) {

    var isWin32 = process.platform === 'win32';

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
            },
            coverUnix: {
                command: 'export coverunix=1 & "./node_modules/.bin/mocha"',
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


    var path = require('path')
    var childProcess = require('child_process')
    var phantomjs = require('phantomjs')
    var binPath = phantomjs.path;
    var phantomjsProcess;

    grunt.registerTask('startPhantomjs', function() {
        var childArgs = [
          '--webdriver=4445', '--ignore-ssl-errors=true'
        ];
        phantomjsProcess = childProcess.spawn(binPath, childArgs, {
            stdio: ['inherit', 'inherit', 'inherit']
        });
        grunt.log.ok('Phantomjs start successed.');
    });

    grunt.registerTask('closePhantomjs', function() {
        var done = this.async();
        if(phantomjsProcess){
            phantomjsProcess.kill();
            phantomjsProcess.on('exit', function(){
                grunt.log.ok('Phantomjs close successed.');
                done();
            });
        }
        else{
            done();
        }
    });

    grunt.registerTask('dev', ['jshint', 'exec:test']);

    grunt.registerTask('unix', ['jshint', 'clean', 'startPhantomjs', 'exec:coverUnix', 'closePhantomjs', 'yuidoc']);

    grunt.registerTask('win32', ['jshint', 'clean', 'exec:cover', 'yuidoc']);

    grunt.registerTask('default', function(){
        grunt.task.run(isWin32?'win32':'unix');
    });

};
