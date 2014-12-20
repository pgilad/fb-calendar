'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('jade', function () {
    return gulp.src('./src/*.jade')
        .pipe($.jade({
            pretty: true
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('watch', function () {
    gulp.watch('./src/**/*', ['build']);
});

gulp.task('build', function () {
    gulp.start('jade');
});

gulp.task('default', function () {
    gulp.start('build', 'watch');
});
