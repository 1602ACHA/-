var gulp = require('gulp');
var squence = require('gulp-sequence');
var server = require('gulp-webserver');
var path = require('path');
var url = require('url');
var fs = require('fs');
var mork = require('./src/js/lib/mork');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean-css');
var html = require('gulp-htmlmin');
var user = {
    name: 'cao',
    pwd: '000',
};
var userCheck = false;
gulp.task('js', function() {
    gulp.src(['./src/js/*.js', './src/js/{common/,lib/,page/}*.js'])
        .pipe(babel({
            presets: 'es2015'
        }))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js'))
});
gulp.task('css', function() {
    gulp.src('./src/css/*.css')
        .pipe(clean())
        .pipe(gulp.dest('./dist/css'))
});
gulp.task('html', function() {
    gulp.src(['./src/*.html', './src/tql/*.html'])
        .pipe(html())
        .pipe(gulp.dest('./dist/tql'))
});
gulp.task('server', function() {
    gulp.src('src')
        .pipe(server({
            port: 8080,
            host: "localhost",
            livereload: true,
            // open: true,
            middleware: function(req, res, next) {
                var uname = url.parse(req.url, true);
                if (req.url === '/loginuser') {
                    var arr = [];
                    req.on('data', function(chunk) {
                        arr.push(chunk);
                    });
                    req.on('end', function() {
                        var data = Buffer.concat(arr).toString();
                        var obj = require('querystring').parse(data);
                        console.log(obj);
                        if (obj.user === user.name && obj.pwd == user.pwd) {
                            res.end('{"result":"success"}');
                            userCheck = true;
                        } else {
                            res.end('{"result":"arror"}');
                        }
                        next();
                    });
                    return false;
                };
                if (req.url === '/loginSearch') {
                    res.end('{"result":"' + userCheck + '"}');
                };
                if (/\/book\//.test(uname.pathname)) {
                    res.end(JSON.stringify(mork(req.url)));
                } else if (/\/read\/read/.test(uname.pathname)) {
                    res.end(JSON.stringify(mork(req.url)));
                }
                next();
            }
        }))
});
gulp.task('default', function(cd) {
    squence("server", cd)
})