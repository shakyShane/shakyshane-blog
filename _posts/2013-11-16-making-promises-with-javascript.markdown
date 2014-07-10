---
layout: post
title:  "Making Promises with Javascript."
date:   2013-11-16 20:51:39
categories: javascript
---

Promises are a great way to make asynchronous programming easier to write, read & understand.

Let's first look at a common pattern that occurs in Javascript programming.

Here we are defining a function that will set the value of `data` to an array after 2 seconds - this is to simulate something like an ajax call to a back-end.

{% highlight javascript %}
var getData = function(){
  var data;
  window.setTimeout(function () {
     data = [1,2];
  }, 2000);  
}

{% endhighlight %}

So, with our simulated ajax-call, how can we use the value of `data` in the rest of our program?

How about making the function `return` the value of data? 

{% highlight javascript %}
var getData = function(){
  var data;
  window.setTimeout(function () {
     data = [1,2];
  }, 2000);  
  return data;
}

console.log(getData()); // undefined
{% endhighlight %}

Well that didn't work too well! The thing is, by the time we return, `data` has not yet been set! Let's try something else...

{% highlight javascript %}
var getData = function(){
  var data;
  window.setTimeout(function () {
     data = [1,2];
     // return data AFTER it's been set
     return data;
  }, 2000);
}

console.log(getData()); // undefined

{% endhighlight %}

Oh man! That doesn't work either! That'll be because we're actually returning from inside the callback function of setTimeout, not our function. So what's the deal? How do we access that data?...

###Say hello to callback functions

In Javascript, we have the ability to pass functions around easily. We can assign them to variables, pass them as arguments to other functions & even return them from other functions.

With this knowledge, we can pass an anonymous function  into `getData`, and then when ready, call that function.

{% highlight javascript %}
var getData = function(callback){
  var data;
  window.setTimeout(function () {
     data = [1,2];
     // now call the function we passed in
     callback(data);
  }, 2000);
}

// passing a call-back function as a parameter.
getData(function(data){
	console.log(data) // [1, 2]
}); 

{% endhighlight %}

SUCCESS! we now have access to the data and we could do whatever we like with it! :)

By passing a function as a argument, we are able to call that passed-in function whenever it suits us. In this case it's when the fake Ajax request returned a value after 2 seconds.

###Now say hello to the 'pyramid of doom'

The above example shows a single callback. It's nice & compact, easy to read & understand... But what happens if you need to use multiple callbacks to achieve your goal? What happens if you need to make ANOTHER asyncronous function call with the the result of the previous one?

Let's say that after fetching our first batch of data, we need to append something to it.

We now need two functions like this.

{% highlight javascript %}
// first function, get's the data after 2 seconds
var getData = function(callback){  
  var data;
  window.setTimeout(function () {
     data = [1,2];
     // now call the function we passed in
     callback(data);
  }, 2000);
};

// second function, appends to the data after 1 second
var modifyData = function(data, callback){
    window.setTimeout(function () {
     data.push(3);
     // now call the function we passed in
     callback(data);
  }, 1000);
};

// now we nest the callbacks & successfully get the data
getData(function(data){
  modifyData(data, function(result){
    console.log(result); // 1, 2, 3
  });
});

{% endhighlight %}

This may not seem too troublesome right now, but consider needing 3, 4, 5 or more callbacks? It end's up looking like this...

###Callback hell

{% highlight javascript %}
// from https://github.com/kriskowal/q
step1(function (value1) {
    step2(value1, function(value2) {
        step3(value2, function(value3) {
            step4(value3, function(value4) {
                // Do something with value4
            });
        });
    });
});

{% endhighlight %}

Not so easy to read & understand now is it?

This *pyramid of doom* (also known as 'callback hell') is a very common problem with ansyncronous programming... but there are ways to make life a little easier.

##Backing up

Going back to our example, what we really want to say is "go and get the data & when you have it do the following with it..." - sounds sounds so simple! Well with promises, we can make our code look exactly like what it does.

> In the following examples, I'm using Q from https://github.com/kriskowal/q

First, let's take the code from above, add a third step to it & implement it using promises

{% highlight javascript %}
// functions that cannot return right away, return a promise instead.
var getData = function() {  
  var deferred = Q.defer();
  window.setTimeout(function () {
     data = [1,2];
     deferred.resolve(data);
  }, 2000);
  return deferred.promise;
};

// Takes data, also returns a promise
var appendData = function(data) {  
  var deferred = Q.defer();
  window.setTimeout(function () {
     data.push(3);
     deferred.resolve(data);
  }, 1000);
  return deferred.promise;
};

// Takes data, returns another promise
var appendMoreData = function(data) {  
  var deferred = Q.defer();
  window.setTimeout(function () {
     data.push(4);
     deferred.resolve(data);
  }, 1000);
  return deferred.promise;
};

// Now we have got rid of the pyramid & our code
// looks like what it does - do this, then that, then this. etc
getData().then(function(data) {  
  return appendData(data);
}).then(function(data){
  return appendMoreData(data);
}).then(function(data){
  console.log(data); // 1, 2, 3, 4
});


{% endhighlight %}

You can see we are no-longer passing in another function to be used as a callback each time. Instead, whenever we call a function that cannot return a value straight way, we create a deferred object with `var deferred = Q.defer();` and then return  `deferred.promise`. 

This is like the function turning around and saying:

> "hey, you asked me for data but I can't give it to you just yet. Take this promise instead and I'll fulfill it as soon as I can.

###Breaking it down

To help understand exactly what's going on here, let's strip away the async stuff & look at a promise in it's simplest form.

{% highlight javascript %}
// create a deferred object, resolve it with a value & return the promise
var getName = function() {  
  var deferred = Q.defer();
  deferred.resolve("Shane");
  return deferred.promise;
};

// `resp` is now the value that was 'resolved'
getName().then(function(resp){
	console.log(resp); // Shane
});
{% endhighlight %}

To be continued...