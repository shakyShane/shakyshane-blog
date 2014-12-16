---
layout: post
title:  "BrowserSync + Magento (or any other cms, really)"
date:   2014-12-16 19:52:00
categories: javascript nodejs browser-sync
---

It's a happy day.
 
A bug from back in [April](https://github.com/shakyShane/browser-sync/issues/124) 
that stopped cookies persisting when using the proxy has finally been resolved.
   
This is a pretty big deal if you use any type CMS (such as Magento, which was the one of those
mentioned in the original issue report) as it allows you to access your website from multiple 
devices, run through login process and test pages that require authentication.

You can see a quick demo in the video below, but go ahead and try it out yourself. 

{% highlight bash %}
$ npm install browser-sync@1.8.0 --save-dev
{% endhighlight %}

<iframe name='quickcast' src='http://quick.as/embed/15kimo8' scrolling='no' frameborder='0' width='100%' allowfullscreen></iframe><script src='http://quick.as/embed/script/1.60'></script>