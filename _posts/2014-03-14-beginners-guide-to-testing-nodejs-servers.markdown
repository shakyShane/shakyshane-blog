---
layout: post
title:  "Beginners guide to testing NodeJS Servers"
date:   2014-03-14 20:51:39
categories: javascript nodejs
---

The following is a gentle introduction into the world of unit testing NodeJS servers. We'll look at the absolute basics here - so if you've never written unit tests before & you've *been meaning to learn how* - then this is the blog post for you.

##Setup

I encourage you to follow along with these examples to ensure you get the most out of it. It couldn't be easier - only three files and a couple of things to install.

- Install Mocha globally with `npm install -g mocha`.
- Then in a new directory, run `npm install connect chai supertest`
- Create a file called `myapp.js`
- Create a sub directory called `app` with a `index.html` file inside.
- Create a sub directory called `test` with a file inside that called `myapp.test.js`

Your file/directory structure should now look like this:

{% highlight javascript %}
myapp.js
app/
  index.html
test/
  myapp.test.js
{% endhighlight %}

##The first test.

Before we write any production code - let's write a test that shows our intentions. On line `3` we load the module (which we havn't written yet) and assign its return value to the variable `server`.

Then we open an `it` block & on line `7` we call the function that was returned from the module - this is what will start the static server. 

Finally we call `http.get()` and provide a callback function - inside which we can assert that we did in fact receive a `200` response.

{% highlight javascript %}
// test/myapp.test.js
var assert = require("chai").assert;
var http   = require("http");
var server = require("../myapp");

it("should return a 200 response", function (done) {

    var app = server();

    http.get("http://localhost:8000", function (res) {
        assert.equal(res.statusCode, 200);
        done();
    });
});
{% endhighlight %}

Now run `mocha` and you should see your first failing test - TDD at it's simplest.

##Turning it green.

Now that we have a failing test, we can go ahead and write the code that will make it pass.

We'll create a tiny module that will create a static web server using [connect](https://github.com/senchalabs/connect) & point it at the `app` directory. This will make it serve the `index.html` that we created earlier.

{% highlight javascript %}
// myapp.js
var connect = require("connect");
var http    = require("http");
var path    = require("path");

module.exports = function () {
    var base = path.resolve("app");
    var app = connect().use(connect.static(base));
    return http.createServer(app).listen(8000);
};
{% endhighlight %}

Now when you run `mocha` you should see <span style="color: green">green</span> in the console & be pleased that you've just completed your first piece of **TDD**.

##Testing the response content.

We have successfully tested that our server can return a `200` response when the root url is requested. But in the next example, we are going to test that our server does indeed return the contents we are expecting.

For simplicity, the following example just checks that the closing `</html>` tag is present in the response body - not overly useful on it's own, but it demonstrates the technique well.

{% highlight javascript %}
it("should return the correct HTML", function (done) {

    var app = server();

    http.get("http://localhost:8000", function (res) {

        var chunks = [];
        res.on("data", function (data) {
            chunks.push(data);
        }).on("end", function () {
            assert.isTrue(chunks.join("").indexOf("</html>") > 0);
            done();
        });

    });
});
{% endhighlight %}

We are using the `data` and `end` events on the `res` stream to ensure we are testing against the entire response body. Granted this is slightly overkill for our small example, but it's useful to see how verbose this method of testing can end up being.

Now, if your `index.html` was empty - you should get a <span style="color: red">failing</span> test when you run `mocha` - go ahead and add some boilerplate HTML to it and make the test go <span style="color: green">green</span> so that we can move onto improving this testing workflow.

##Supertest to the rescue.

The previous examples were deliberately low-level & verbose because I wanted you to see how you can manually deal with the basics of testing NodeJS servers. Even though our tests were pretty simple, they were already spanning multiple lines, had us dealing with `streams` within tests & had `ports` hard-coded into both the module & the test... a recipe for disaster.

Let's look at how we can use Supertest in the previous examples to:

- reduce boilerplate code
- remove hard-coded port numbers

**Never call .listen() imediately**

Looking back at our mini-module, we are calling `.listen(8000)` from within the function - not cool. This makes it much more difficult to test because we now have to have this port number specified in our tests *aswell* as the production code!

Supertest handles all of this for us & removes the need for hard-coding port numbers into our tests - just return the result of `http.createServer(app)` instead.

{% highlight javascript %}
// myapp.js
module.exports = function () {
    var base = path.resolve("app");
    var app = connect().use(connect.static(base));
    return http.createServer(app); //don't call .listen() here
};
{% endhighlight %}

Now in the test, we don't need the `http` module anymore because we can test our app server using Supertest.

{% highlight javascript %}
// test/myapp.test.js
var request   = require("supertest");
var server = require("../myapp");

it("can return a 200 response", function (done) {
    var app = server();
    request(app)
        .get("/")
        .expect(200, done);
});
{% endhighlight %}

**MUCH better** - This is much more compact, understandable & maintainable. We've also removed the need for hard-coded `urls` or `port` numbers too :)

Run `mocha` again now to ensure your tests are still <span style="color: green">green</span>. Next, we'll go back to our second example and use Supertest to verify the response body as we did before.

###Testing response body with Supertest

Just as we did before, we'll write a little assertion that verifies the HTML reponse. Only this time, Supertest is going to handle all of the stream events and simply give us a `res.text` property that we can test against.

As a refresher, this is what we're trying to **avoid**.

{% highlight javascript %}
// We can do better than this...
it("should return the correct HTML", function (done) {

    var app = server();

    http.get("http://localhost:8000", function (res) {

        var chunks = [];
        res.on("data", function (data) {
            chunks.push(data);
        }).on("end", function () {
            assert.isTrue(chunks.join("").indexOf("</html>") > 0);
            done();
        });

    });
});
{% endhighlight %}

Now here's how it would look with **Supertest**.

{% highlight javascript %}
var assert = require("chai").assert;
var request   = require("supertest");
var server = require("../myapp");

it("should return the correct HTML", function (done) {
    var app = server();
    request(app)
        .get("/")
        .end(function (err, res) {
            assert.isTrue(res.text.indexOf("</html>") > 0);
            done();
        });
});
{% endhighlight %}

I think you'll agree this is a huge improvement. It's easier to understand, easier to write & most importantly of all - easier to *maintain*!


###Resources

- [Mocha](http://visionmedia.github.io/mocha/)
- [Chai](http://chaijs.com/)
- [Supertest](https://github.com/visionmedia/supertest)
- [Connect](http://www.senchalabs.org/connect/)













