var gulp = require('gulp'),
  create = require('gulp-cordova-create'),
  version = require('gulp-cordova-version');

gulp.task('default', function () {
  return gulp.src('')
    .pipe(version(require('./package.json').version));
});