---
layout: post
title:  "GulpJS + SASS + BrowserSync ftw"
date:   2014-01-25 20:51:39
categories: javascript nodejs
---

Being the *new-kid-on-the-block*, [GulpJS](http://gulpjs.com/) is getting plently of attention lately. Instead of contributing to the pool of opinion-pieces out there though, I thought I'd walk you through setting it up with a really nice little workflow including `SASS` for CSS along with my open-source project, [BrowserSync.io](http://www.browsersync.io).

The end result will be a pretty sweet front-end development setup including:

- **SCSS** File watching/compilation.
- **Live CSS injecting** into multiple devices.
- A **Server** running on an IP address that can be accessed on multiple devices/screens.
- **Syncronized** scroll, clicks, links & form fields across all devices.

{<1>}![Modern Developer workflow - Image by Addy Osmani](https://pbs.twimg.com/media/BehaekGCEAAp9bM.jpg:large)

This photo from  [@addyosmani](https://twitter.com/addyosmani) shows BrowserSync in use.

###Prerequisites

Before starting, you should have:

1. A project containing at *least* an `index.html` & some `scss` files.
2. [NodeJS](http://nodejs.org) installed.
3. [GulpJS](http://gulpjs.com/) installed globally `npm install -g gulp`

##Assumptions

All following examples/configuration assume we're dealing with a simple HTML/CSS/JS project with the following structure.

{% highlight javascript %}
// Assumed file/dir structure
index.html
css/
scss/
js/
{% endhighlight %}
You should alter any path/filenames to match your project where needed.

###Step 1 - <small>install the tools</small>

We need to install 3 tools locally to our project - `gulp`, `gulp-sass` & `browser-sync`. In your terminal/command line, navigate to your project directory and run 

{% highlight bash %}

npm install gulp gulp-sass browser-sync
{% endhighlight %}

###Step 2 - <small>create gulpfile.js</small>

Also in your project root, create a file called `gulpfile.js`. This is the file in which we'll configure our tools.

###Step 3 - <small>require() the tools</small>

Open up `gulpfile.js` in your favourite editing tool and place this at the top.

{% highlight javascript %}
var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
{% endhighlight %}

###Step 4 - <small>Create tasks</small>

We'll have a separate task for compiling `SCSS` into `CSS` & one for starting BrowserSync.

**SASS** - Here we specify the path to our main `scss` file (the one that contains all of the **@imports**), then we *pipe* the files into the `sass` function (that we required above) and finally into `gulp.dest` which will write the output into the CSS directory.

{% highlight javascript %}
gulp.task('sass', function () {
    gulp.src('scss/styles.scss')
        .pipe(sass({includePaths: ['scss']}))
        .pipe(gulp.dest('css'));
});
{% endhighlight %}

**BrowserSync** - First we tell BrowserSync to watch any `css` & `js` files for changes (which will allow the live updating/reload features to work) & the second param can contain any normal BrowserSync [options](https://github.com/shakyShane/browser-sync/wiki/Working-with-a-Config-File). In our case though, we just want to start a server in the root of the project.

{% highlight javascript %}
gulp.task('browser-sync', function() {
    browserSync.init(["css/*.css", "js/*.js"], {
        server: {
            baseDir: "./"
        }
    });
});

{% endhighlight %}

**Watch** - So far we've configured two separate tasks & now we'll tie them together using gulp's `default` task. First, we will run the sass compiler ONCE (to ensure the first page load has the latest CSS) & then BrowserSync will start the server & open up a browser. Finally we watch the `scss` files in the background for changes & run the `sass` task each time.

{% highlight javascript %}
gulp.task('default', ['sass', 'browser-sync'], function () {
    gulp.watch("scss/*.scss", ['sass']);
});
{% endhighlight %}

###Seeing it all together

The entire `gulpfile.js` should now look like this.

{% highlight javascript %}
var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');

gulp.task('sass', function () {
    gulp.src('scss/styles.scss')
        .pipe(sass({includePaths: ['scss']}))
        .pipe(gulp.dest('css'));
});

gulp.task('browser-sync', function() {
    browserSync.init(["css/*.css", "js/*.js"], {
        server: {
            baseDir: "./"
        }
    });
});

gulp.task('default', ['sass', 'browser-sync'], function () {
    gulp.watch("scss/*.scss", ['sass']);
});
{% endhighlight %}

###Running it.

We're all set up now. All that remains is to head back to the command-line and run.

{% highlight bash %}
gulp
{% endhighlight %}

A browser window will open up automatically & will serve up your `index.html` file. Take note of the URL, you can use it on **any device** that's connected to your WIFI network & all of the BrowserSync features will work across them all. (create for reponsive stuff).

**Don't forget, you're being watched** - you now have a great development workflow where any changes to `scss` files will automatically trigger the compilation. When that's done, BrowserSync will notice that the `css` file was changed & will auto-inject the new file into all browsers.

###Notes

1. For the sake of simplicity, I removed the step of creating a package.json. If you do want to save your tooling dependencies as you install them, you can run `npm init` before you start & then add `--save-dev` to any install commands you run.
2. The `gulp-sass` plugin uses the node port of SASS, NOT the ruby version. This is much, much faster - but it's not quite 100% compatible yet, so just be careful when using with legacy projects.





