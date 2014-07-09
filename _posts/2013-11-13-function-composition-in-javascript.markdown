---
layout: post
title:  "Function Composition in Javascript."
date:   2013-11-13 20:51:39
categories: javascript
---

Sounds scary? It isn't really. Function composition is simply the process of combining two or more existing functions to create a brand new one specific to your needs. Think of it as a function factory.

> I use Lo-dash in this post, to follow along, just kick up a JSBin with it loaded.

###Straight into the code.

Consider this example where we are just doing a `console.log` with a welcome message.

{% highlight javascript %}
// saying hello to Shane
var name = "Shane"
console.log("Welcome " + name);
{% endhighlight %}

To make this re-usable across our project, we can wrap it in a function.

{% highlight javascript %}
var name = "Shane"

var printIt = function (name) {
    console.log("welcome " + name);
};

printIt(name); // Welcome Shane
{% endhighlight %}

We have a problem here though - the `printIt` method is not re-usable right now is it?

{% highlight javascript %}
printIt("Goodbye Shane"); // Welcome Goodbye Shane
{% endhighlight %}

Let's clean it up so that `printIt` has a single responsibility.

{% highlight javascript %}
var printIt = function (string) {
    console.log(string);
};

// Now it can print any string.
printIt("Welcome " + name);
{% endhighlight %}

###Improving.

We made a MINOR improvement there. What happens if we change how we greet our users? Do we have to do a find & replace across the project? No, you just abstract the process of appending a welcome message to another function.

{% highlight javascript %}
var welcome = function (name) {
    return "Welcome " + name;
};
{% endhighlight %}

Now we have two functions that do one thing each, we can start using them together to build-up to our desired goal. 

{% highlight javascript %}
var name = "Shane";

printIt(welcome("Shane")); // Welcome Shane

{% endhighlight %}

###Nice.

Ok, now if you want to change how you greet people in your app, you just alter the `welcome` method & you're done. 

###Our first composed function

The previous examples were trivial, but enough to get the idea of composition across. Calling one function with the return result of another is a very common need & it can be really useful. 

**The problem with the previous example though,** is that it's already hard to read. Wrapping function calls around function calls can be confusing & hard to follow (especially when the amount increases)! This is where you can use a library like Lo-dash to create *compose* your own brand-new functions using existing ones. 

{% highlight javascript %}
var name = "Shane";

var printIt = function (string) {
    console.log(string);
};

var welcome = function (name) {
    return "Welcome " + name;
};

// create a new function, using existing ones
var sayHelloTo = _.compose(printIt, welcome);

// cool, we now have a 'composed' function that we can use. 
sayHelloTo(name); // Welcome Shane
{% endhighlight %}

`_.compose()` takes functions as it's arguments & returns a new function. Then, when the new function is called (`sayHelloTo` in our example) each function you passed in is called in order (from right-to-left) with the return value from the previous one. 

**Following?** Let's do a walk through of the cycle to fully understand it. When you call `sayHelloTo` with `name` it gets passed as the argument to the last function you gave to _.compose earlier & this happens: 

You call `sayHelloTo(name)`, then...

1. `welcome("Shane")` is called, which returns `"Welcome Shane"`.
2. That return value then gets passed to the next function in the list, so this happens
3. `printIt("Welcome Shane")`
4. Which will do whatever we told the print function to do.

See how that works?

###Going further.

Using tiny, single responsibility functions may seem strange to you. But it's a very powerful way of programming. Let's say we no longer want to simply greet someone by name. Instead, we have a user object like this.

{% highlight javascript %}
var user = {
    id: "12",
    name: "Shane"
};
{% endhighlight %}

Now our `sayHelloTo` function is not going to work because the `welcome` part of it is expecting a string… You might be thinking that we could just change the `welcome` method to accept a user object like this:

{% highlight javascript %}
// bad!
var welcome = function (user) {
    return "Welcome " + user.name;
};
{% endhighlight %}
This is not good idea because now the `welcome` method knows too much about our implementation. We've tied it down to a single use-case & made it hard to re-use.

{% highlight javascript %}
// can't be used now with a string
var welcome = function (user) {
    return "Welcome " + user.name;
};

welcome("Shane"); // Welcome undefined
{% endhighlight %}

###Solution?

So what's a good way to handle this? Well we need to extract the user's name before greeting them & since we're talking about composition here, let's create another mini-function to resolve the name

{% highlight javascript %}
// returns the name property if it exists or the original input
var getName = function (user) {
    return user.name || user;
};

{% endhighlight %}

We can now add this to our composed function chain so that it's the first thing called.

{% highlight javascript %}
var sayHelloTo = _.compose(printIt, welcome, getName);
{% endhighlight %}

Just as before, we now have a new function that has be composed from other small functions & can be used like this:

{% highlight javascript %}
var user = {
    id: "12",
    name: "Shane"
};

sayHelloTo(user); // Welcome Shane

sayHelloTo("Kittie") // Welcome Kittie
{% endhighlight %}

###Benefits

The cool thing here, is that any time something changes in your app, you can narrow the change down to one of these tiny functions. For example, let's say there's an API change & you now need to look for the key `username` on the user object. Easy - just change the implementation of `getName` and you're good to go.

### Full example.

Here's the full code from the examples above.

{% highlight javascript %}
var user = {
    id: "12",
    name: "Shane"
};

var printIt = function (string) {
    console.log(string);
};

var welcome = function (name) {
    return "Welcome " + name;
};

var getName = function (user) {
    return user.name || user;
};

var sayHelloTo = _.compose(printIt, welcome, getName);

sayHelloTo(user); // Welcome Shane
{% endhighlight %}

###Finally

Just to hammer it home about the benefits of function composition

{% highlight javascript %}
// without composition = hard to read, hard to maintain.
printIt(welcome(getName(user))); // Welcome Shane

// with composition - easy to understand, modify & maintain
var sayHelloTo = _.compose(printIt, welcome, getName);

sayHelloTo(user); // Welcome Shane
{% endhighlight %}