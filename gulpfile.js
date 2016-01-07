var gulp = require('gulp'), 
    uglify = require('gulp-uglify');
 
 gulp.task('compress', function() {
       return gulp.src('ko-bootstrap.js')
           .pipe(uglify())
           .pipe(gulp.dest('./dist'));
 });


gulp.task('default', ['compress']);



