---
layout: post
title:  "Testing Angular Directives with Isolated Scope"
date:   2013-11-17 20:51:39
categories: javascript
---


Passing objects into a directive's scope is an extremely useful practice as it lets you focus on the job of the directive without worrying about the 'outside world'.

Specifying a `scope` property on a directive *isolates* it from any parent scopes & when you need access to anything from a parent scope, you can explicitly pass it through, like this:

{% highlight javascript %}
angular.module("TestExample", []).directive("tabs", function () {
    return {
        restrict: "E",
        scope: {
            user: "="
        },
        controller: ["$scope", function ($scope) {
            
            // Access to the User
            console.log($scope.user);
            
        }]
    };
});
{% endhighlight %}

###How do we test it though?

This test will fail as we're looking at the wrong scope when we assert.

{% highlight javascript %}
describe("Directive: Tabs", function () {

    var scope, element, compile;
    beforeEach(module('TestExample'));

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($compile, $rootScope) {
        scope = $rootScope;
        compile = $compile;
    }));

    describe("Rendering tabs for the user", function () {
        beforeEach(function () {
        
			// Set the user on the parent scope to simulate how it'd happen in your app
            scope.userFromParent = {
				name: "Shane", 
                age: "28"
            };

			// Pass in the user object to the directive
            element = angular.element('<tabs  user="userFromParent"></tabs>');

			// Compile & Digest as normal
            compile(element)(scope);
            scope.$digest();
        });
        
		// This test will fail as we're looking at the parent scope here & not the directives' 'isolated' scope.
        it("should have access to the user", function () {
            expect(scope.user).toBeDefined(); // Test Failed!
        });
    });
});
{% endhighlight %}

###Solution
 
To test if a directive has access to items on it's own isolated scope, you can access it like this in your tests.

{% highlight javascript %}
it("should have access to the user", function () {
    expect(element.scope().user).toBeDefined(); // Test PASSED!
});
{% endhighlight %}