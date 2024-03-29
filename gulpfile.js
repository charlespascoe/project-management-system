const args = require('yargs').argv,
      autoprefixer = require('gulp-autoprefixer'),
      babel = require('gulp-babel'),
      babelify = require('babelify'),
      browserify = require('browserify'),
      buffer = require('vinyl-buffer'),
      glob = require('glob'),
      gulp = require('gulp'),
      gulpif = require('gulp-if'),
      merge = require('merge-stream'),
      nodemon = require('gulp-nodemon'),
      rename = require('gulp-rename'),
      rimraf = require('rimraf'),
      scss = require('gulp-sass'),
      source = require('vinyl-source-stream'),
      sourcemaps = require('gulp-sourcemaps'),
      uglify = require('gulp-uglify');

const outputDir = './.compiled-server/server';

gulp.task('clean', function (cb) {
  rimraf(outputDir, cb);
});

gulp.task('clean-tests', function (cb) {
  rimraf('./.compiled-tests', cb);
});

gulp.task('babel', ['clean'], function () {
  return gulp.src('./src/server/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({plugins: ['transform-async-to-generator', 'transform-es2015-modules-commonjs']}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(outputDir));
});

gulp.task('build', ['babel'], function () {
  var prod = args.production;

  var mergeStrm = merge(
    gulp.src('./src/views/**/*.ejs')
      .pipe(gulp.dest(outputDir + '/views/')),
    gulp.src('./src/public/**/*')
      .pipe(gulp.dest(outputDir + '/public/')),
    gulp.src('./src/emails/**/*.*')
      .pipe(gulp.dest(outputDir + '/emails/')),
    gulp.src('./client/.compiled-client/public/**/*')
      .pipe(gulp.dest(outputDir + '/public/'))
  );

  return mergeStrm;
});

gulp.task('build-test', ['clean-tests', 'babel'], function () {
  return merge(
    gulp.src('./.compiled-server/**/*')
      .pipe(gulp.dest('./.compiled-tests/')),
    gulp.src('./tests/**/*.js')
      .pipe(sourcemaps.init())
      .pipe(babel({plugins: ['transform-async-to-generator', 'transform-es2015-modules-commonjs']}))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('./.compiled-tests/tests')),
    gulp.src('./config/development.json')
      .pipe(rename('configuration.json'))
      .pipe(gulp.dest('./.compiled-tests/server')),
    gulp.src('./config/test.json')
      .pipe(rename('config.json'))
      .pipe(gulp.dest('./.compiled-tests/tests')),
    gulp.src('./database/create-database.sql')
      .pipe(gulp.dest('./.compiled-tests/tests')),
    gulp.src('./database/test-data.sql')
      .pipe(gulp.dest('./.compiled-tests/tests'))
  );
});

gulp.task('build-dev', ['build'], function () {
  return gulp.src('./config/development.json')
    .pipe(rename('configuration.json'))
    .pipe(gulp.dest(outputDir));
});

gulp.task('start', ['build-dev'], function () {
  return nodemon({
    script: outputDir + '/index.js',
    watch: 'src/**/*.*',
    ignore: '*.swp',
    tasks: ['build-dev']
  });
});

