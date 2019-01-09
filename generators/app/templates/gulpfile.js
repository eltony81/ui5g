var gulp = require('gulp');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var ui5preload = require('gulp-ui5-preload');
var eslint = require('gulp-eslint');
var merge = require('merge-stream');
var browserSync = require("browser-sync");
var GulpMem = require('gulp-mem');
var sass = require('gulp-sass');
var del = require('del');
var filter = require('gulp-filter');
var console = require('console');
var replace = require('gulp-string-replace');

var SRC_ROOT = "./src";
var DEST_ROOT = "./dist";
var UI5LIB_ROOT = "./ui5lib";

var gulpMem = new GulpMem();
gulpMem.serveBasePath = DEST_ROOT;
gulpMem.enableLog = false;

var PROD_CACHE_STRATEGY = true;

var buildJs = () => {
  // use to avoid an error cause whole gulp failed
  var b = babel()
    .on("error", (e) => {
      console.log(e.stack);
      b.end();
    });
  return gulp.src([`${SRC_ROOT}/**/*.js`, `!${SRC_ROOT}/**/lib/*.js`, `!${SRC_ROOT}/index.js`, `!${SRC_ROOT}/service-worker.js`, `!${SRC_ROOT}/register-worker.js`])
    .pipe(sourcemaps.init())
    .pipe(b)
    .pipe(sourcemaps.write('/sourcemap'));
};

sass.compiler = require('node-sass');
var buildCss = () => {
  return gulp.src(`${SRC_ROOT}/**/css/*.scss`, { base: `${SRC_ROOT}` })
    .pipe(sass().on('error', sass.logError));
};

var buildServiceWorker = () => {
  return gulp.src([`${SRC_ROOT}/**/service-worker.js`, `${SRC_ROOT}/**/register-worker.js`], { base: `${SRC_ROOT}` })
    .pipe(replace(/\$\{cache\.manifest\.version\}/, Date.now()))
    .pipe(replace(/\/\/\$\{prod\.cache\.strategy}/, "TEMPORARY_CACHE_STRATEGY = " + (!PROD_CACHE_STRATEGY).toString() + ";"));

};

var copy = () => {
  return merge(
    gulp.src([`${SRC_ROOT}/**/*`, `!${SRC_ROOT}/**/*.js`, `!${SRC_ROOT}/**/*.scss`, `${SRC_ROOT}/index.js`,], { base: `${SRC_ROOT}` }),
    gulp.src([`${SRC_ROOT}/**/lib/*`], { base: `${SRC_ROOT}` })
  );
};

var build = () => {
  return merge(copy(), buildJs(), buildCss(), buildServiceWorker());
};

var copyui5lib = () => {
	return gulp.src(`${UI5LIB_ROOT}/**/*`, { base: './' }).pipe(gulp.dest(DEST_ROOT));
};

var buildWithLib = () => {
  return merge(copyui5lib(), copy(), buildJs(), buildCss(), buildServiceWorker());
};

gulp.task('clean', () => del(DEST_ROOT));

gulp.task('build:mem', () => {
  return build()
    .pipe(gulpMem.dest(DEST_ROOT));
});

gulp.task('build:pwamem', () => {
  return build()
    .pipe(gulp.dest(DEST_ROOT))
    .pipe(filter(['**/*.js', '**/*.xml', '**/*.css', '**/*.properties', '!**/images/*.*', '!**/lib/*', '!**/ui5lib/*']))
    .pipe(ui5preload({ base: `${DEST_ROOT}`, namespace: '<%= namespace %>' }))
    .pipe(gulpMem.dest(DEST_ROOT));
});

gulp.task('build', () => {
  return buildWithLib()
    .pipe(gulp.dest(DEST_ROOT))
    .pipe(filter(['**/*.js', '**/*.xml', '**/*.css', '**/*.properties', '!**/images/*.*', '!**/lib/*', '!**/ui5lib/*']))
    .pipe(ui5preload({ base: `${DEST_ROOT}`, namespace: '<%= namespace %>' }))
    .pipe(gulp.dest(`${DEST_ROOT}`));
});

gulp.task('bs', () => {
  var middlewares = require('./proxies');
  middlewares.push(gulpMem.middleware);
  browserSync.init({
    server: {
      baseDir: './',
      middleware: middlewares
    },
    notify: false,
	  routes: {
        '/ui5lib': 'ui5lib',
		'/': DEST_ROOT
	  }
  });
});

gulp.task('bs:test', () => {
  var middlewares = require('./proxies');
  middlewares.push(gulpMem.middleware);
  browserSync.init({
    server: {
      baseDir: './',
      middleware: middlewares,
      notify: false,
	  routes: {
        '/ui5lib': 'ui5lib',
		'/<%= namepath %>': DEST_ROOT
	  }
    },
    startPath: "<%= namepath %>/test/mockServer.html"
  });
});



// run gulp lint to auto fix src directory
gulp.task('lint', () => {
  return gulp.src([`${SRC_ROOT}/**/*.js`, '!node_modules/**'])
    .pipe(eslint({ fix: true, useEslintrc: true }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(gulp.dest(SRC_ROOT));
});

gulp.task('watch:mem', () => {
  gulp.watch(`${SRC_ROOT}/**/*`, gulp.series(['build:mem', 'reload']));
});

gulp.task('watch:pwamem', () => {
  gulp.watch(`${SRC_ROOT}/**/*`, gulp.series(['build:pwamem', 'reload']));
});

gulp.task('live-build', gulp.series('build', 'bs'), () => {
  gulp.watch(`${SRC_ROOT}/**/*`, () => gulp.series('build', 'reload'));
});

gulp.task('reload', (done) => { browserSync.reload(); done(); });

gulp.task("build-js", buildJs);

gulp.task('build-css', buildCss);

gulp.task("copy", copy);

gulp.task('default', gulp.series('clean', 'build:mem', gulp.parallel('bs', 'watch:mem')));

gulp.task('test', gulp.series(['clean', 'build:mem', 'bs:test', 'watch:mem']));

gulp.task('testpwa', gulp.series('clean', 'build:pwamem', gulp.parallel('bs', 'watch:pwamem')));
