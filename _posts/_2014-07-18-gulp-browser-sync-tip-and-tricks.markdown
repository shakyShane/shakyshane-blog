---
layout: post
title:  "Gulp + BrowserSync. Tips, Tricks & Best Practices"
date:   2014-03-14 20:51:39
categories: javascript nodejs
---


I've been receiving quite a few questions recently around this topic. BrowserSync + Gulp is a pretty awesome 
combo for web development - no doubt about it. But it's easy to get the setup wrong and miss out on all the greatness.

This post aims to solve that by providing what I consider to be best practices. 

  
## Keep up to date.

I spend about 50% of my time in Github issues asking people which version they are running (which needs automating - I know...).
Usually the issue in question can solved by simply updating to the latest version.
  
{% highlight bash %}
$ npm install browser-sync@latest --save-dev
{% endhighlight %}

This project is Open Source & we fix things often - keep this in mind before submitting an issue.

## Tip: shorthand server config
We all like to keep a nice & tidy `gulpfile.js` - well did you know that if you only use the `baseDir` option with the server, 
you can provide that as the only property?

{% highlight javascript %}
// Shorthand
browserSync({
    server: "./app"
});

// Normal
browserSync({
    server: {
        baseDir: "./app"
    }
});
{% endhighlight %}

This works because of the way we transform options on the way in (to allow the app to handle command-line/api usage consistently). 
so that shorthand example above is exactly equivalent to doing this on the command line

{% highlight bash %}
$ browser-sync start --server "./app"
{% endhighlight %}

## Tip: Don't tell BrowserSync about files - sometimes...
Although BrowserSync accepts a `files` option for watching your changes - it also exposes a `.reload()` method that might 
be of more use to you.

A great example would be when you have more than 1 task writing to a CSS file - or when you want the browser to be informed
 of changes at a specific point. In this situation, file watching is just too error-prone. Where possible, it's much more reliable 
 to use the streams support. You should still use Gulp for initializing the tasks, just don't have BrowserSync watching aswell.
 
{% highlight javascript %}
var browserSync = require("browser-sync");
var reload      = browserSync.reload;

gulp.task('less', function () {
    return gulp.src('less/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('css'))
        .pipe(reload({stream:true}));
});
 
 gulp.task('default', ['less', 'browser-sync'], function () {
     gulp.watch("less/*.less", ['less']);
 });
 {% endhighlight %}
 
 Of course, if you are not doing any pre-processing, by all means use the built-in file watching. This is without question 
 the easiest server + live reload setup available.
 
{% highlight javascript %}

var gulp        = require("gulp");
var browserSync = require("browser-sync");

gulp.task('serve', function () {
    browserSync({
        server: "./app",
        files: "./app/css/*.css"
    });
});

{% endhighlight %}

