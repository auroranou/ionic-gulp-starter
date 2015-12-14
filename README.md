## Setting up gulp

This app is a variation on Ionic's [side menu starter project](https://github.com/driftyco/ionic-starter-sidemenu).

Instead of adding gulp manually, run `ionic setup sass` to automatically create a gulpfile and take advantage of Ionic's sass tasks.

This command will also add two items to `ionic.project`: "gulpStartupTasks" and "watchPatterns". Note that these only run during `ionic serve`, so we will need to configure our own gulp tasks to complement other commands, specifically `ionic run` and `ionic build` ([source](http://codepen.io/leob6/post/quick-tip-using-gulp-to-customize-the-serve-run-and-build-process-for-your-ionic-framework-apps)).

## Custom gulp tasks

The only way to run gulp in an Ionic project during the build phase is to run it separately prior to `ionic build` ([source](https://github.com/driftyco/ionic-cli/issues/345#issuecomment-88659079)).

### `ng-annotate`

In order to minify the code successfully, we need to insure that Angular dependency injection will work post-minification.

For instance, assume we have this controller:
```
angular.module('app', ['ionic'])

.controller('appController', function($scope) {
  $scope.title = 'Super Cool Title';
});
```

After minification we'll end up with something like the following, which will error out since `$scope` is no longer correctly injected.
`angular.module('app',['ionic']).controller('appController',function(a){a.title='Super Cool Title';});`

[ng-annotate](https://github.com/olov/ng-annotate) allows us to circumvent this issue, by injecting the necessary dependencies in such a way that they will not be obfuscated during minification:
```
angular.module('app', ['ionic'])

.controller('appController', ['$scope', function($scope) {
  $scope.title = 'Super Cool Title';
}]);
```

Install the [ng-annotate plugin](https://www.npmjs.com/package/gulp-ng-annotate/) for gulp:
`npm install gulp-ng-annotate --save-dev`

In `index.html`, add the `ng-strict-di` directive to the `ng-app` body element in order to prevent dependency injection from wreaking havoc ([source](http://www.joshmorony.com/how-to-minify-an-ionic-application-for-production/)).

### `eslint`

```
npm install eslint --save-dev
npm install eslint-config-angular --save-dev
npm install eslint-plugin-angular --save-dev
```

Check out the `.eslintrc` file for ESLint configuration details. Make sure to add Angular as a global variable.

I added linting to the default gulp task and set up a watch on it:
```
gulp.task('default', ['sass', 'lint']);

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']); // paths.sass refers to scss files
  gulp.watch(paths.js, ['lint']); // paths.js refers to the contents of www/js
});
```

### Building

```
npm install gulp-minify --save-dev
npm install gulp-uglify --save-dev
```

The gulp build task covers a lot of ground:
```
// run lint and sass before building
gulp.task('build', ['lint', 'sass'], function() {
  gulp.src('./www/js/**/*.js')
    .pipe(concat('app')) // concatenate all of the JS files
    .pipe(ngAnnotate({ single_quotes: true })) // annotate Angular modules
    .pipe(minify())
    .pipe(uglify())
    .pipe(rename({ extname: ".min.js" }))
    .pipe(gulp.dest('./www/dist/js/')) // final JS output is available as www/dist/js/app.min.js
});

```
