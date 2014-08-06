var gulp        = require("gulp");
var browserSync = require("/Users/shakyshane/Sites/os-browser-sync");
var reload      = browserSync.reload;
var sass        = require("gulp-ruby-sass");
var minifyCSS   = require("gulp-minify-css");
var rename      = require("gulp-rename");
var prefix      = require("gulp-autoprefixer");
var through2    = require("through2");
var cp          = require("child_process");
var rev         = require("gulp-rev");
var awspublish  = require('gulp-awspublish');
var yaml        = require('js-yaml');


var messages = {
    jekyllBuild: "<span style=\"color: grey\">Running:</span> $ jekyll build"
};

var jekylArgs    = ["build", "--config", "_config.yml"];
var jekylDevArgs = ["build", "--config", "_config.yml,_config-dev.yml"];

function getjekyllArgs(cb, args) {
    return cp.spawn("jekyll", args, {stdio: "inherit"}).on("close", cb);
}

/**
 * Build the Jekyll Site
 */
gulp.task("jekyll-build", function (done) {
    browserSync.notify(messages.jekyllBuild);
    return getjekyllArgs(done, jekylArgs);
});

/**
 * Build the Jekyll Site
 */
gulp.task("build-dev", ["sass"], function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn("jekyll", jekylDevArgs, {stdio: "inherit"}).on("close", done);
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task("browser-sync", ["sass", "build-dev"], function() {
    browserSync({
        server: "_site",
        open: false
    });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task("sass", function () {
    browserSync.notify("Compiling SASS...");
    return gulp.src(["_scss/**/*.scss", "bower_components/pygments/css/*.scss"])
        .pipe(sass())
        .pipe(prefix(["last 5 versions", "> 1%", "ie 8"], { cascade: true }))
        .pipe(gulp.dest("_site/css"))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest("css"))
        .pipe(minifyCSS({keepBreaks:false}))
        .pipe(rename("main.min.css"))
        .pipe(gulp.dest("css"));
});


/**
 * REV css file
 */
gulp.task("rev:css", ['sass'], function () {

    var publisher = awspublish.create(require("./.aws.json"));

    var headers = {
        'Cache-Control': 'max-age=315360000, no-transform, public',
        'Expires': new Date(Date.now() + 63072000000).toUTCString()
    };

    function updateYaml(file, cb) {
        var fs = require("fs");
        try {
            var doc = yaml.safeLoad(fs.readFileSync("./_config.yml", "utf-8"));
            doc.cssFile = "https://s3-eu-west-1.amazonaws.com/shakshane/" + file.s3.path;
            fs.writeFileSync("./_config.yml", yaml.safeDump(doc));
        } catch (e) {
            console.log(e);
        }

        cb(null);
    }

    return gulp.src("css/main.min.css")

        .pipe(rev())
        // gzip, Set Content-Encoding headers and add .gz extension
        .pipe(awspublish.gzip())

        // publisher will add Content-Length, Content-Type and  headers specified above
        // If not specified it will set x-amz-acl to public-read by default
        .pipe(publisher.publish(headers))

        // create a cache file to speed up consecutive uploads
        .pipe(publisher.cache())

        // print upload updates to console
        .pipe(through2.obj(function (file, enc, cb) {
            updateYaml(file, cb);
        }));
});

gulp.task("release:css", ['rev:css']);

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task("watch", function () {
    gulp.watch("_scss/**/*.scss", ["sass"]);
    gulp.watch([
        "_posts/*",
        "_includes/**",
        "_layouts/**"], ["build-dev", reload]);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task("default", ["browser-sync", "watch"]);

gulp.task("build", ["sass", "docs-build", "jekyll-build"]);

gulp.task("dev", ["sass", "jekyll-build"]);
