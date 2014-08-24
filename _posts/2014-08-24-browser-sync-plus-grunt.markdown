---
layout: post
title:  "BrowserSync + Grunt - a common problem addressed"
date:   2014-08-24 10:21:39
categories: javascript nodejs browser-sync
---

   
Believe it or not, back in the day BrowserSync was actually a Grunt-only plugin. Being an in-experienced
developer who was just getting to grips with front-end tooling, I really didn't know any better. 

Now a year later, the `grunt-browser-sync` package has been reduced to a simple wrapper for the main module.

##Elsewhere
... have you seen API or Gulp examples that look something like this? 

{% highlight javascript %}
var browserSync = require("browser-sync");

browserSync({
    server: "./"
})
{% endhighlight %}

**... well behind the scenes, that's almost exactly what the Grunt plugin does!**

<br/>

So, in a Gruntfile.js, when you see the following configuration...

{% highlight javascript %}
// Config snippet from a Gruntfile.js
browserSync: {
    bsFiles: {
        src : 'assets/css/*.css'
    },
    options: {
        server: {
            baseDir: "./"
        }
    }
}
{% endhighlight %}

... it's actually being converted into this, which is exactly the same as just using the module directly...

{% highlight javascript %}
// What actually happens in the plugin.
var browserSync = require("browser-sync");

browserSync({
    files: "assets/css/*.css"
    server: "./"
})
{% endhighlight %}

##In the know...

Now that you know what really happens in the plugin, we can look at ways 
to solve a common Grunt + BrowserSync problem.

By far, the biggest issue I've had to deal with is regarding multiple tasks that write to a css file & getting 
the injection working correctly.

Let's look at a simple example - suppose you have SASS & Autoprefixer running to compile your CSS. You want 
browserSync to inject the CSS file, but only AFTER both tasks are complete...

{% highlight bash %}
// Desired workflow
you change a file -> SASS compiles -> Autoprefixer runs -> BrowserSync injects the CSS
{% endhighlight %}

But here's the problem, if you have BrowserSync watching your output CSS directory for changes and the SASS & 
Autoprefixer tasks are BOTH setup to write to that same directory, then things get confusing because BrowserSync will 
see changes from the first SASS task & attempt to inject the CSS too soon...

{% highlight bash %}
// What actually happens, incorrect order
you change a file -> SASS compiles -> BrowserSync injects the CSS -> Autoprefixer runs
{% endhighlight %}

###Solution
If you think about it, all we really want is the ability to trigger CSS injecting at a specific time (after x tasks have finished)
& you can actually do that, but it requires you to ditch the `grunt-browser-sync` plugin...
 
An overview of the changes we'll make.

* Don't watch CSS files directly with BrowserSync
* Use the `browser-sync` module directly, instead of the Grunt Plugin.
* Define custom tasks for starting BrowserSync + injecting CSS.

{% highlight javascript %}

var browserSync = require("browser-sync");

module.exports = function (grunt) {
    grunt.initConfig({
        sass: {
            dev: {
                files: {
                    'app/css/main.css': 'scss/main.scss',
                }
            }
        },
        autoprefixer: {
            single_file: {
                options: {
                    browsers: ['last 5 version', 'ie 8', 'ie 7']
                },
                src: 'app/css/main.css',
                dest: 'app/css/main.css'
            }
        },
        watch: {
            options: {
                spawn: false // Very important, don't miss this
            },
            sass: {
                files: ['scss/**/*.scss'],
                // Notice the 'bs-inject' task, can be triggered
                tasks: ['sass', 'autoprefixer', 'bs-inject']
            }
        }
    });
    
    /**
     * Init BrowserSync manually
     */
    grunt.registerTask("bs-init", function () {
        var done = this.async();
        browserSync({
            server: "./app"
        }, function (err, bs) {
            done();
        });
    });
    
    /**
     * Inject CSS
     */
    grunt.registerTask("bs-inject", function () {
        browserSync.reload(["styles.css", "other.css"]);
    });
    
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-sass');
    
    // Launch Browser-sync & watch files
    grunt.registerTask('watch', ['bs-init', 'watch']);
};
{% endhighlight %}

Notice the **watch** task? we are adding `bs-inject` as the last task to run following changes to `scss` files. 
 This will ensure that CSS injection is only done when both SASS & Autoprefixer are done writing files.

It's a much more reliable technique, because now you can control when CSS injecting takes place simply by
changing where `bs-inject` is in the task list.

###Note:
You'll need the `spawn: false` option on your watch tasks, and inside the `bs-inject` task, you'll need to 
ensure that you specify CSS files that actually exist in your webpage.

----

###Options.
Any options you previously had in your old config will work perfectly inside your new `bs-init` task.

{% highlight javascript %}
// Still watch files as you did before.
grunt.registerTask("bs-init", function () {
    var done = this.async();
    browserSync({
        server: "./app",
        port: 4000,
        xip: true,
        files: [
            "./app/views/**/*.php", 
            "./app/js/**/*.js"
        ]
    }, function (err, bs) {
        done();
    });
});
{% endhighlight %}

###Bottom line
The Grunt plugin for BrowserSync is just a simple wrapper, if it's working great for you already, then there's 
no need to switch. But if you're having any types of problems like the one mentioned above, you should really consider
just using the module directly.

<br/>
<br/>