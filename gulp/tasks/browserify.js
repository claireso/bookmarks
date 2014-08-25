var gulp = require('gulp'),
    concat = require('gulp-concat'),
    browserify = require('browserify'),
    paths = require('../config.js'),
    source = require('vinyl-source-stream');

gulp.task('browserify', ['clean'], function() {
    //app.js
    // return gulp.src(paths.scripts + '*.js')
    //     .pipe(concat('app.js', {newLine: ';'}))
    //     .pipe(browserify({
    //       insertGlobals : true,
    //       debug: true
    //     }))
    //     .pipe(gulp.dest(paths.dist));
    //     
    var b = browserify('./' + paths.scripts + "base.js", {
        debug: true
    });

    return b.bundle()
    .pipe(source('app.js'))
    // .pipe(argv.env != "production" ? gutil.noop() : gStreamify(uglify()))
    .pipe(gulp.dest(paths.dist));
});