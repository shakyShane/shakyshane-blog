var gulp        = require("gulp");
var browserSync = require("/Users/shakyshane/Sites/os-browser-sync");
var reload      = browserSync.reload;
var sass        = require("gulp-ruby-sass");
var minifyCSS   = require("gulp-minify-css");
var rename      = require("gulp-rename");
var prefix      = require("gulp-autoprefixer");
var cp          = require("child_process");

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
    gulp.src(["_scss/**/*.scss", "bower_components/pygments/css/*.scss"])
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
