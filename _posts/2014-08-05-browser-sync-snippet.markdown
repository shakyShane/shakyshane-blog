---
layout: post
title:  "BrowserSync snippet injector plugin."
date:   2014-08-05 20:51:39
categories: javascript nodejs
---

Sometimes, I simply don't need all of the cross-device synchronization stuff that [BrowserSync](http://browsersync.io) gives me. 

Let's say I'm working on a legacy project that uses a huge CMS/Eccommerce system (like Magento, for example) and really all I need/want
is some live-reload & css-injecting into a couple of desktop browsers... the [proxy option](http://www.browsersync.io/docs/options/#option-proxy)
is useful in these situations, but it's sometimes kind of overkill as well.

###Proxy
The Proxy option can take your existing website url (such as `mylocal.dev`) and provide you with an IP based one that can accessed on all devices -
 which is great if you need that feature. If your use-case matches the one mentioned above however, using the proxy is creating a *lot* of
 additional work for BrowserSync that can actually be avoided.
 
 Also, you can run into issues with websites that are reliant on sessions/cookies/admin panels etc when using the proxy - which is actually
  the main reason I sometimes resort to copy/pasting the snippet instead.
 
 I *really* don't like repeating the same steps over and over again, and considering it's just the snippet I need in these situations, I thought
  it was about time I automated this whole process.
 
##Easier with a plugin
 This is such a common need of mine during my day-job at [JH](http://www.wearejh.com/), that I've created a tiny BrowserSync plugin
  that will write the snippet to a file for me, & remove it automatically. 
  
  This means, if I have something like a Magento site running on a vhost called `mylocal.dev`, I can can continue using that same url & get 90%
  of the BrowserSync features.
  
###Example:
First, you'll need to install both `browser-sync` and `bs-snippet-injector` by running...
 
{% highlight bash %}
$ npm install browser-sync bs-snippet-injector
{% endhighlight %}
 
... after that, create a `.js` file in the root of your project containing the following (I'm using magento-style paths here for consistency - 
obviously you'll need to adjust those)
   
{% highlight javascript %}
// requires version 1.3.3 or higher.
var browserSync = require("browser-sync");

// register the plugin
browserSync.use(require("bs-snippet-injector"), {
    // path to the file containing the closing </body> tag
    file: "app/design/frontend/project/template/page/1column.phtml" 
});

// now run BrowserSync, wathching CSS files.
browserSync({
  files: "skin/frontend/project/assets/css/*.css"
});
{% endhighlight %}

That's it. Now you can just run...
 
{% highlight bash %}
$ node myfile.js
{% endhighlight %}
 
... and the snippet will be written to the file when BrowserSync starts, and removed when it closes.

###Little wins
It's a small convenience that allows you to use your existing vhost with BrowserSync & solves many issues reported about the 
Proxy option.

It is *literally* writing the snippet to the file that you specify though - so it this may not suit your workflow - but I've found it to be a nice
little helper and feels much cleaner than copying/pasting the snippet from the command line.

####Resources

* [bs-snippet-injector](https://github.com/shakyShane/bs-snippet-injector)
* [browser-sync](https://github.com/shakyShane/browser-sync)
  
