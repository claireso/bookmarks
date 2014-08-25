var gulp = require('gulp'),
    paths = require('../paths.js'),
    uglify = require('gulp-uglify');

gulp.task('build', ['concat'], function() {
    return gulp.src([paths.dist + '**/*.js'])
    .pipe(uglify())
    .pipe(gulp.dest(paths.dist));
});