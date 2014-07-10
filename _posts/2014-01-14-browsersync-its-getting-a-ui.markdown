---
layout: post
title:  "BrowserSync - it's getting a UI"
date:   2014-01-14 20:51:39
categories: javascript nodejs
---

The early adoption of my open source project [BrowserSync](http://browsersync.io) has been **really** inspiring. The idea that people around the world are starting to use this little tool that I've been hacking on in my spare time is mind-blowing.

As it becomes more popular, more bugs are reported - these are great & have helped to make BrowserSync pretty stable at this point, (with the help of some awesome [contributors](https://github.com/shakyShane/browser-sync/graphs/contributors)), but I've been working soley on bugs for the last couple of months & this has resulted in the delay of a killer feature that I believe will take BrowserSync to the next level - a **Control Panel**.

##You won't find it on the App Store

BrowserSync will remain a command-line tool. It will stay on NPM as a NodeJS module & will always be free & open-source (although if you do use it often and would like to [support it](https://github.com/shakyShane/browser-sync#support), please do.).

I built the tool *exactly* how I wanted to use it - from the command-line if needed, configurable to projects & easy to integrate into existing workflows (that may include other gui tools, grunt, gulp etc) but now it's time to give it a user interface.

###How it will work?

The control panel will be a web page that is accessible whenever you run BrowserSync. The idea is that you'll have all your connected devices running on the proxy or server, and then a single browser window on your main computer will be used as the control panel. Simple as that.

###What will it do?

I have a short list of must-have features that will be available for launch. Things like:

1. Enter a URL in the control panel & all connected devices will navigate to it.
2. Keep a list of all visited links & make it possible to return to any of them.
3. List the connected devices (with screen size?)
5. Toggle options (without having to restart BrowserSync)

That's all I have at the moment, & now it's over to you....

###What features do you want? <small>(put them in the comments)</small>

If you could choose one feature (or many), what would it be? 

Imagine having access to all of the connected devices when using BrowserSync - what would you want to do? I've listed my top 4 features above, but I'm curious what everyone else would want to do!

Comment below & together let's make BrowserSync even better!