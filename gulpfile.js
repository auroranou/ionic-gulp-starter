var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var del = require('del');
var ngAnnotate = require('gulp-ng-annotate');
var lint = require('gulp-eslint');
var minify = require('gulp-minify');
var uglify = require('gulp-uglify');
var htmlreplace = require('gulp-html-replace');
var replace = require('gulp-replace');

var paths = {
  sass: ['./scss/**/*.scss'],
  js: ['./src/js/**/*.js'],
  templates: ['./src/templates/**/*.html'],
  lib: ['./src/lib/**/*'],
  img: ['./src/img/**/*'],
  index: ['./src/index.html']
};

// === top level tasks ===

gulp.task('default', ['sass', 'lint']);

gulp.task('build', ['clean', 'compile-js', 'compile-html', 'compile-css']);

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.js, ['lint']);
});

// === utility tasks ===

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./src/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./src/css/'))
    .on('end', done);
});

gulp.task('lint', function() {
  gulp.src('./src/js/**/*.js')
    .pipe(lint())
    .pipe(lint.format())
    // if an error is found, exit the task
    // .pipe(lint.failAfterError())
});

gulp.task('clean', function() {
  del('./www/**/*');
});

// === child tasks ===

gulp.task('compile-js', function() {
  gulp.src(paths.js)
    .pipe(concat('app'))
    .pipe(ngAnnotate({ single_quotes: true }))
    .pipe(minify())
    .pipe(uglify())
    .pipe(rename({ extname: ".min.js" }))
    .pipe(gulp.dest('./www/js'));

  gulp.src(paths.lib)
    .pipe(gulp.dest('./www/lib'));
});

gulp.task('compile-html', function() {
  gulp.src(paths.index)
    .pipe(htmlreplace({
      'css': 'css/ionic.app.min.css',
      'js': 'js/app.min.js',
    }))
    .pipe(replace(/<body /, '<body ng-strict-di '))
    .pipe(gulp.dest('./www'));

  gulp.src(paths.templates)
    .pipe(gulp.dest('./www/templates'));

  gulp.src(paths.img)
    .pipe(gulp.dest('./www/img'));
});

gulp.task('compile-css', ['sass'], function() {
  gulp.src('./src/css/ionic.app.min.css')
    .pipe(gulp.dest('./www/css'));
});

// === other ionic tasks ===
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
