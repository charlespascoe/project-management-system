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

  function br(sourcePath, basePath) {
    var r = sourcePath.match(/[A-Za-z0-9_-]+\.js$/);
    if (r == null) return null;
    var filename = r[0],
        relPath = sourcePath.replace(basePath, '').replace(/^\//, '').replace(/[A-Za-z0-9_-]+\.js$/, '');

    return browserify({entries: sourcePath, debug: !prod})
      .transform(babelify, {presets: ['react', 'es2015'], plugins: ['transform-async-to-generator'], sourceMaps: !prod})
      .bundle()
      .pipe(source(filename))
      .pipe(buffer())
      .pipe(gulpif(prod, uglify()))
      .pipe(gulp.dest(outputDir + '/public/js/' + relPath));
  }

  var mergeStrm = merge(
    gulp.src('./src/views/**/*.ejs')
      .pipe(gulp.dest(outputDir + '/views/')),
    gulp.src('./src/public/**/*')
      .pipe(gulp.dest(outputDir + '/public/')),
    gulp.src('./src/scripts/**/*')
      .pipe(gulp.dest(outputDir + '/scripts/')),
    gulp.src('./src/emails/**/*.*')
      .pipe(gulp.dest(outputDir + '/emails/')),
    gulp.src('./src/style/**/*.scss')
      .pipe(gulpif(!prod, sourcemaps.init()))
      .pipe(scss({outputStyle: 'compressed'}).on('error', scss.logError))
      .pipe(autoprefixer())
      .pipe(gulpif(!prod, sourcemaps.write('.')))
      .pipe(gulp.dest(outputDir + '/public/css/'))
  );

  var basePath = './src/client/entry';
  glob.sync(basePath + '/**/*.js')
    .map(path => br(path, basePath))
    .filter(strm => strm != null)
    .forEach(strm => mergeStrm.add(strm));

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
      .pipe(gulp.dest('./.compiled-tests'))
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

