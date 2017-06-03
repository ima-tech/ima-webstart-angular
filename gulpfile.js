var gulp = require('gulp');
var del = require('del');
var run_sequence = require('run-sequence');
var strip = require('gulp-strip-comments');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var iife = require('gulp-iife');
var minify_css = require('gulp-minify-css');
var karma_server = require('karma').Server;
var less = require("gulp-less");
var rename = require("gulp-rename");
var sourcemaps = require("gulp-sourcemaps");
var minify_css = require("gulp-minify-css");
var jsdoc = require('gulp-jsdoc3');

// Define here the variables needed to build the project
var dist_folder = 'dist/';
var js_dist_folder = dist_folder + 'js/';
var css_dist_folder = dist_folder + 'css/';
var images_dist_folder = dist_folder + 'images/';
var fonts_dist_folder = dist_folder + 'fonts/';
var docs_dist_folder = dist_folder + 'docs/';

var src_folder = 'src/';
var less_src_folder = src_folder + 'less/';

// Define the vendor files here
var js_vendors = [
    'node_modules/jquery/dist/jquery.js',
    'node_modules/bootstrap/dist/js/bootstrap.js',
    'node_modules/moment/moment.js',
    'node_modules/angular/angular.js',
    'node_modules/angular-ui-router/release/angular-ui-router.js',
    'node_modules/angular-bootstrap-datetimepicker/src/js/datetimepicker.js',
    'node_modules/angular-bootstrap-datetimepicker/src/js/datetimepicker.templates.js',
    'node_modules/angular-ui-bootstrap/dist/ui-bootstrap.js',
    'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
    'node_modules/angular-sortable-view/src/angular-sortable-view.js',
];

var css_vendors = [
    'node_modules/bootstrap/dist/css/bootstrap.css',
    'node_modules/font-awesome/css/font-awesome.css',
    'node_modules/angular-bootstrap-datetimepicker/src/css/datetimepicker.css',
    'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-csp.css',
];

var fonts_vendors = [
    'node_modules/bootstrap/dist/fonts/*',
    'node_modules/font-awesome/fonts/*'
];

// Current library variables
var library_name = '';

var js_tests = [
    'src/js/**/*.test.js'
];

var js = [
    'src/js/**/!(*.test)*.js',
];

var less_file = 'src/less/all.less';

var resources = [
    'src/fonts/**/*',
    'src/images/**/*',
    'src/partials/**/*',
    'src/index.html'
];

// Define here the gulp tasks
gulp.task('js-vendors-prod', function(cb) {
    return gulp.src(js_vendors)
        .pipe(strip())
        .pipe(uglify())
        .pipe(concat('vendors.min.js'))
        .pipe(iife())
        .pipe(gulp.dest(js_dist_folder))
});

gulp.task('js-vendors-dev', function(cb) {
    return gulp.src(js_vendors)
        .pipe(concat('vendors.js'))
        .pipe(gulp.dest(js_dist_folder))
});

gulp.task('css-vendors-prod', function(cb) {
    //Compile CSS vendors
    return gulp.src(css_vendors)
        .pipe(minify_css())
        .pipe(concat('vendors.min.css'))
        .pipe(gulp.dest(css_dist_folder));
});

gulp.task('css-vendors-dev', function(cb) {
    //Compile CSS vendors
    return gulp.src(css_vendors)
        .pipe(concat('vendors.css'))
        .pipe(gulp.dest(css_dist_folder));
});

// Application tasks
gulp.task('export-resources' , function(cb) {
    return gulp.src(resources, {base: 'src'})
        .pipe(gulp.dest(dist_folder));
});

gulp.task('fonts' , function(cb) {
    return gulp.src(fonts_vendors)
        .pipe(gulp.dest(fonts_dist_folder));
});

gulp.task('js-dev', function(cb) {
    return gulp.src(js)
        .pipe(concat(library_name + '.js'))
        .pipe(gulp.dest(js_dist_folder))
});

gulp.task('js-prod', function(cb) {
    return gulp.src(js)
        .pipe(strip())
        .pipe(uglify())
        .pipe(concat(library_name + '.min.js'))
        .pipe(gulp.dest(js_dist_folder));
});

// Tests related tasks
gulp.task('js-test', function() {
    //Compile JS files
    return gulp.src(js_tests)
        .pipe(concat(library_name + '.test.js'))
        .pipe(iife())
        .pipe(gulp.dest(js_dist_folder));

});

gulp.task("less-dev", function () {
    return gulp.src(less_file)
        .pipe(less({
            paths: less_src_folder
        }))
        .pipe(rename(library_name + ".css"))
        .pipe(gulp.dest(css_dist_folder));
});

gulp.task("less-prod", function () {
    return gulp.src(less_file)
        .pipe(less({
            paths: less_src_folder
        }))
        .pipe(sourcemaps.init())
        .pipe(minify_css())
        .pipe(sourcemaps.write())
        .pipe(rename(library_name + ".min.css"))
        .pipe(gulp.dest(css_dist_folder));
});

gulp.task('doc', function() {

    var config = {
        "opts": {
            "destination": docs_dist_folder
        }
    };

    return gulp.src(js)
        .pipe(jsdoc(config));
});

gulp.task('run-tests-dev', function (done) {
    return new karma_server({
        configFile: __dirname + '/karma.dev.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('run-tests-prod', function (done) {
    return new karma_server({
        configFile: __dirname + '/karma.prod.conf.js',
        singleRun: true
    }, done).start();
});


gulp.task('clean', function() {
    return del([dist_folder + '/*']);
});

gulp.task('default', function(cb) {
    run_sequence('clean',
        [
            'js-vendors-prod', 'js-vendors-dev',
            'css-vendors-prod', 'css-vendors-dev',
            'js-dev', 'js-prod',
            'less-dev', 'less-prod',
            'fonts',
            'export-resources',
            'js-test',
            'doc'
        ],
        'run-tests-dev',
        'run-tests-prod',
        cb);
});

gulp.task('dev', function(cb) {
    run_sequence('clean',
        [
            'js-vendors-dev',
            'css-vendors-dev',
            'js-dev',
            'less-dev',
            'fonts',
            'export-resources',
            'js-test',
        ],
        'run-tests-dev',
        cb);
});

gulp.task('prod', function(cb) {
    run_sequence('clean',
        [   'js-vendors-prod',
            'css-vendors-prod',
            'js-prod',
            'less-prod',
            'fonts',
            'export-resources',
            'js-test'
        ],
        'run-tests-prod',
        cb);
});