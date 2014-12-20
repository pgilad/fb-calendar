'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');

gulp.task('jade', function () {
    return gulp.src('./src/*.jade')
        .pipe($.jade({
            pretty: true
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('copy', function () {
    return gulp.src('./src/img/**/*')
        .pipe(gulp.dest('./dist/img'));
});

gulp.task('styles', function () {
    return gulp.src('./src/styles/style.styl')
        .pipe($.stylus().on('error', function (err) {
            console.log(err);
            this.emit('end');
        }))
        .pipe($.autoprefixer())
        .pipe(gulp.dest('./dist/css/'));
});

gulp.task('lint', function () {
    return gulp.src(['./src/**/*.js'])
        .pipe($.jshint('.jshintrc'))
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.jshint.reporter('fail'));
});

gulp.task('watch', function () {
    gulp.watch('./src/**/*', ['build']);
});
gulp.task('clean', function (done) {
    del('./dist', done);
});

gulp.task('build', ['clean', 'lint'], function () {
    gulp.start('jade', 'styles', 'copy');
});

gulp.task('default', function () {
    gulp.start('build', 'watch');
});
