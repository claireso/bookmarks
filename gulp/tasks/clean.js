var gulp = require('gulp'),
    del = require('del'),
    paths = require('../paths.js');

gulp.task('clean', function() {
    del([paths.dist + '**/*.js'], {force: true});
});