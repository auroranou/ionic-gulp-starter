var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var ngAnnotate = require('gulp-ng-annotate');
var lint = require('gulp-eslint');
var minify = require('gulp-minify');
var uglify = require('gulp-uglify');

var paths = {
  sass: ['./scss/**/*.scss'],
  templates: ['./www/templates/**/*.html'],
  js: ['./www/js/**/*.js']
};

gulp.task('default', ['sass', 'lint']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.js, ['lint']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

// --------- custom gulp tasks ---------

gulp.task('lint', function() {
  gulp.src('./www/js/**/*.js')
    .pipe(lint())
    .pipe(lint.format())
    // if an error is found, exit the task
    // .pipe(lint.failAfterError())
});

gulp.task('build', ['lint', 'sass'], function() {
  gulp.src('./www/js/**/*.js')
    .pipe(concat('app'))
    .pipe(ngAnnotate({ single_quotes: true }))
    .pipe(minify())
    .pipe(uglify())
    .pipe(rename({ extname: ".min.js" }))
    .pipe(gulp.dest('./www/dist/js/'))
})
