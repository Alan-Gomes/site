'use strict';

const autoprefixer = require('gulp-autoprefixer');
const browsersync = require('browser-sync').create();
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const gulp = require('gulp');
const merge = require('merge-stream');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');

function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: './dist'
    },
    port: 3000
  });
  done();
}

function browserSyncReload(done) {
  browsersync.reload();
  done();
}

function clean() {
  return del(['./dist/']);
}

function modules() {
  
  const bootstrap = gulp.src('./node_modules/bootstrap/dist/**/*')
    .pipe(gulp.dest('./dist/bootstrap'));
    
  const fontAwesome = gulp.src('./node_modules/@fortawesome/**/*')
    .pipe(gulp.dest('./dist'));

  const jqueryEasing = gulp.src('./node_modules/jquery.easing/*.js')
    .pipe(gulp.dest('./dist/jquery-easing'));

  const jquery = gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(gulp.dest('./dist/jquery'));
  return merge(bootstrap, fontAwesome, jquery, jqueryEasing);
}

function css() {
  return gulp
    .src('./scss/**/*.scss')
    .pipe(plumber())
    .pipe(sass({
      outputStyle: 'expanded',
      includePaths: './node_modules',
    }))
    .on('error', sass.logError)
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./dist/css'))
    .pipe(browsersync.stream());
}

function js() {
  return gulp
    .src([
      './js/*.js',
      '!./js/*.min.js',
      '!./js/contact_me.js',
      '!./js/jqBootstrapValidation.js'
    ])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./dist/js'))
    .pipe(browsersync.stream());
}

function html() {
  return gulp.src('./**/*.html')
    .pipe(gulp.dest('./dist/'))
    .pipe(browsersync.stream());
}


function image() {
  return gulp.src('./img/**/*')
    .pipe(gulp.dest('./dist/img/'))
    .pipe(browsersync.stream());
}

function watchFiles() {
  gulp.watch('./scss/**/*', css);
  gulp.watch('./js/**/*', js);
  gulp.watch('./**/*.html', browserSyncReload);
}

const vendor = gulp.series(clean, modules);
const build = gulp.series(vendor, gulp.parallel(css, js, html, image));
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));

exports.css = css;
exports.js = js;
exports.clean = clean;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.default = build;
