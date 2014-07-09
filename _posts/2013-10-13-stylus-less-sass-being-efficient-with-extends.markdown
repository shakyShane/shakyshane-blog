---
layout: post
title:  "Using SASS - Being efficient with @mixin & @extend"
date:   2013-10-13 20:51:39
categories: SASS CSS
---

When using SASS, LESS or Stylus it's easy to do things that bloat the resulting CSS.

> The following examples are using SASS, but the principles apply to any preprocessor

We'll use `inline-block` & `border-radius` as simple examples here.

###The infamous inline-block hack

Nothing more annoying that IE7's treatment of inline-block. You've probably seen this littered around a project before

{% highlight css %}
.box {
	display: inline-block;
    zoom: 1;
    *display: inline;
}
{% endhighlight %}

Ok it works, but it's three lines of code. With sass we could define a mixin & then use that anywhere we want the inline-block hack.

{% highlight css %}
/* define it */
@mixin inline-block(){
    display: inline-block;
    zoom: 1;
    *display: inline;
}
/* use it */
.box {
    @include inline-block();
}
.box2 {
    @include inline-block();
}
{% endhighlight %}
DON'T do that. Ever.

Let's look at the CSS it just created.
{% highlight css %}
/* generated CSS */
.box {
  display: inline-block;
  zoom: 1;
  *display: inline;
}
.box2 {
  display: inline-block;
  zoom: 1;
  *display: inline;
}
{% endhighlight %}

Yep, you just won the award for worst use of mixins EVER. You should of used `@extend` instead.

###Using @extend

A **much** better way, is to extend the functionality of one class to another

**SASS @extend**

{% highlight css %}
.box {
    display: inline-block;
    zoom: 1;
    *display: inline;
}
.box2 {
	@extend .box;
}
{% endhighlight %}

**CSS Output**

{% highlight css %}
/* How we would've written in CSS anyway :p */
.box, .box2 {
    display: inline-block;
    zoom: 1;
    *display: inline;
}
{% endhighlight %}

####Getting better

We are improving now. But this example is *still* a bad practice. You shouldn't extend a project-specific class like `.box` (well, you might want to in other circumstances, but not here). The `.box` class will have other styles that you might not want to be present in `.box2`.

Instead, you should create a class that is descriptive of it's functionality & extend that instead.

{% highlight css %}
.inline-block {
    display: inline-block;
    zoom: 1;
    *display: inline;
}
.box {
    @extend .inline-block;
    background: orange;
}
.box2 {
    @extend .inline-block;
    background: black;
}
{% endhighlight %}

**CSS output**

{% highlight css %}
/* shared styles */
.inline-block, .box, .box2 {
	display: inline-block;
	zoom: 1;
	*display: inline;
}
/* .box specific styles */
.box {
	background: orange;
}
/* .box2 specific styles */
.box2 {
	background: black;
}
{% endhighlight %}

####Yeah it has side-effects - good ones!

Because `.inline-block` has only a single responsibility, we are not limited to using it as a modifier in our CSS. It can also be used within the mark-up if needed.

{% highlight html %}
<!-- A silly example, but gets the point across -->
<div class="inline-block">
    <p>Wow, it's great to see @extend being used correctly</p>
</div>
{% endhighlight %}

##@extend + @mixin

We can apply the same ideas when using mixins. Here's a perfectly valid use of a `@mixin`. (please note: for brevity, this is a very simplified example!)


{% highlight css %}
/* define the mixin, with a default param */
@mixin border-radius($value: 10px) {
    -webkit-border-radius: $value;
    border-radius: $value;
}
/* Use the mixin, passing a value to use in place of the default */
.box {
    @include border-radius(6px);
}
{% endhighlight %}

**CSS**

{% highlight css %}
.box {
  -webkit-border-radius: 6px;
  border-radius: 6px;
}
{% endhighlight %}

Nice! It's not great though & you probably know what's coming up here... What happens when `.box2` wants the same styles applying?

{% highlight css %}
/* define the mixin, with a default param */
@mixin border-radius($value: 10px) {
    -webkit-border-radius: $value;
    border-radius: $value;
}
/* Use the mixin, passing a value to use in place of the default */
.box {
    @include border-radius(6px);
}
.box {
    @include border-radius(6px);
}
{% endhighlight %}

**CSS** - go and grab your 'worst use of mixins ever' award from the cupboard again.

{% highlight css %}
.box {
  -webkit-border-radius: 6px;
  border-radius: 6px;
}
.box2 {
  -webkit-border-radius: 6px;
  border-radius: 6px;
}
{% endhighlight %}

###@extend to the rescue, again.

I won't waste time showing you why you should **not** simply extend `.box` this time. Instead, let's just jump straight into the correct way to do this.

{% highlight css %}
/* the way a ninja would handle this shit */
@mixin border-radius($value: 10px) {
    -webkit-border-radius: $value;
    border-radius: $value;
}
.rounded-corners {
    @include border-radius(6px);
}
.box {
    @extend .rounded-corners;
    background: orange;
}
.box2 {
    @extend .rounded-corners;
    background: red;
}
{% endhighlight %}

**We're getting good, check this CSS**

{% highlight css %}
.rounded-corners, .box, .box2 {
  -webkit-border-radius: 6px;
  border-radius: 6px;
}
.box {
  background: orange;
}
.box2 {
  background: red;
}
{% endhighlight %}

Don't forget, you get the good side-effect here too, you can drop that `.rounded-corners` class into your HTML as a modifier if you want & you still have the benefits of being about to change the size of your rounded-corners site-wide by changing a single value inside `.rounded-corners`

{% highlight css %}
/* Change your rounder-corners across your entire site here */
.rounded-corners {
    @include border-radius(20px);
}
{% endhighlight %}

###For different values, use more modifier classes

What if `.box2` wants rounded-corners, but they want to be a different size? Is this a good time to fall back to using `@include`? Perhaps like this?

{% highlight css %}
/* Would a ninja do this ? */
@mixin border-radius($value: 10px) {
    -webkit-border-radius: $value;
    border-radius: $value;
}
.rounded-corners {
    @include border-radius(6px);
}
/* use default value set in .rounded-corners */
.box {
    @extend .rounded-corners;
    background: orange;
}
/* call the mixin directly, because you need 20px this time */
.box2 {
    @include border-radius(20px);
    background: red;
}
{% endhighlight %}

No. 

Because the EXACT same argument now applies to `.box2`. If another class wanted a border-radius of `20px`, then you'd have to call that mixin again & produce all the duplicate code.

{% highlight css %}
/* generated CSS - not great! */
.rounded-corners, .box {
  -webkit-border-radius: 6px;
  border-radius: 6px;
}
.box {
  background: orange;
}
.box2 {
  -webkit-border-radius: 20px;
  border-radius: 20px;
  background: red;
}
{% endhighlight %}

###Driving it home.

When you need a slightly modified version & you envision it being re-used elsewhere, just create another class with the configuration you need, and then extend as normal.

Here's the final example showing a better way to combine @extend & @mixin with different values.

{% highlight css %}
@mixin border-radius($value: 10px) {
    -webkit-border-radius: $value;
    border-radius: $value;
}
.rounded-corners {
    @include border-radius(6px);
}
.rounded-corners--large {
    @include border-radius(20px);
}
.box {
    @extend .rounded-corners;
    background: orange;
}
.box2 {
    @extend .rounded-corners--large;
    background: red;
}
{% endhighlight %}

**Which will generate this CSS**

{% highlight css %}
.rounded-corners, .box {
  -webkit-border-radius: 6px;
  border-radius: 6px;
}
.rounded-corners--large, .box2 {
  -webkit-border-radius: 20px;
  border-radius: 20px;
}
.box {
  background: orange;
}
.box2 {
  background: red;
}
{% endhighlight %}

We're approaching ninja-level coding now. We're making full use of the `@mixin` feature by creating re-usable styles that are extend-able using `@extend`

###Finally

I got to the end of writing this article before realising that I havn't even mentioned the most common mis-use of `@include` that I've seen & even done myself. 

**Clearfix**

We've all used it when you want a parent element to correctly contain it's 'floated' children. 

{% highlight css %}
/* the incorrect way */
@mixin clearfix {
    &:before,
    &:after {
        content:" ";
        display:table;
    }
    &:after {
        clear:both;
    }
    & {
        *zoom:1;
    }
}
/* bad, very bad */
.grid {
    @include clearfix();
}
.grid-cell {
    float: left;
}
{% endhighlight %}

At this point in the post, I'm sure I don't have to explain why this is bad, just make sure you always do it like this instead.

{% highlight css %}
/* the correct way */
@mixin clearfix {
    &:before,
    &:after {
        content:" ";
        display:table;
    }
    &:after {
        clear:both;
    }
    & {
        *zoom:1;
    }
}
/* good, very good */
.clearfix {
    @include clearfix();
}
.grid {
    @extend .clearfix;
}
.grid-cell {
    float: left;
}
{% endhighlight %}

###Disclaimer

Of course, you're going to be able to think of situations where this approach is simply not appropriate. I'm certainly not suggesting you use this idea exclusively (you couldn't if you tried) or that's it's the only way to use these features efficiently. I'm just trying to encourage you to look at your code & see if anything mentioned in this post can help you reduce repetition and/or bad practices. 