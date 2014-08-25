var gulp = require('gulp'),
    paths = require('../paths.js');

gulp.task('watch', function() {
    gulp.watch(paths.scripts + '**/*.js', ['browserify']);
});