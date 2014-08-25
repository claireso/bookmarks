var gulp = require('gulp'),
    concat = require('gulp-concat'),
    browserify = require('browserify'),
    paths = require('../paths.js'),
    source = require('vinyl-source-stream');

gulp.task('browserify', ['clean'], function() {

    var b = browserify('./' + paths.scripts + "base.js", {
        debug: true
    });

    return b.bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest(paths.dist));
});