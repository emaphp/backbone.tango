** WORK IN PROGRESS **

# Backbone.Tango
Notification library for Backbone.js

<br/>
###About

<br/>
Backbone.Tango is a Backbone.js notification library based on [toastr](https://github.com/CodeSeven/toastr "").


<br/>
###Installation

<br/>
> Bower

    bower install backbone.tango --save

<br/>
> Node

    npm install backbone.tango --save


<br/>
###Usage

<br/>
```javascript
var tng = new Backbone.Tango();

tng.success('Success!!!');

tng.info('The more you know...');

tng.warning('Beware!!!');

tng.error('Ooops!');
```

<br/>
###Options

<br/>
A default set of options could be provided when creating a new notifier instance.


```javascript
var tng = new Backbone.Tango({
    position: 'top-left'
});

tng.success('Going left');
```

Alternatively, you could also provide those options as a second argument when creating a new view.

```javascript
var tng = new Backbone.Tango();

tng.success('I prefer right', {
    position: 'bottom-right'
});

tng.info("I'll stay longer", {
    position: 'top-left',
    timeOut: 10000
});
```

<br/>
**View options**

 * position: The place where notifications are shown. Values: 'top-right, 'top-left', 'bottom-right', 'bottom-left' (default: 'top-right').
 * timeOut: The time in milliseconds in which a notification remains visible (default: 5000).
 * newestOnTop: Determines if a newly generated notifications are rendered on top of old ones (default: true).
 * template: The function used to generate a notification view (default: undefined, when no template is found then a default one is loaded).
 * type: Notification type. Values: 'info', 'success', 'error', 'warning' (default: undefined).

<br/>
**Presentation options**

 * defaultClass: The default CSS class used for all notifications (default: 'tango').
 * showMethod: The JQuery method used to show the current view (default: 'fadeIn').
 * showDuration: The amount in milliseconds for the specified show method (default: 300).
 * showEasing: The easing method used for the specified show method (default: 'swing').
 * hideMethod: The JQuery method used to hide the current view (default: 'fadeOut').
 * hideDuration: The amount in milliseconds for the specified hide method (default: 1000).
 * hideEasing: The easing method used for the specified hide method (default: 'swing').

<br/>
**Events options**

 * tapToDismiss: Determines if a view is dismissed when clicking on it (default: true).
 * extendedTimeout: .
 * onShown: A function that is called when a view is shown (default: undefined).
 * onHidden: A function that is called after an element is hidden (default: undefined).

<br/>
**Container options**

Containers are special elements that contain notification views. When a notification is removed from screen it also checks if the current container has any child elements left. Empty containers are removed as well.

 * target: The element where all notification containers are appended to (default: 'body').
 * containerBaseId: All containers are generated using and id that combines this option and the position where it is shown (default: 'tango-container').
 * containerClass: A CSS class used for all containers (default: 'tango-container').


<br/>
###Using templates

<br/>
This example illustrates how to define a default notification template using Undercore.js. We start by adding the following code to our page.
```html
<script type="text/template" id="notifier-tpl">
    <div class="tango">
        <h5><%=title%></h5>
        <p><%=message%></p>
    </div>
</script>
```

Now we create a new notifier instance using that template.

```javascript
var notifier = new Backbone.Tango({
    template: _.template($('#notifier-tpl').html())
});
```

This template receives a *title* and a *message* argument. We need to provide them by using an object.

```javascript
notifier.success({
    title: 'Hello',
    message: 'This is my custom template'
});
```
That doesn't look like a success message at all. We still need to provide some styles. Notification templates receive an additional argument called *cssClass* that is generated on runtime and contains a string with the predefined CSS classes for that element. We could redefine our template like this.

```html
<script type="text/template" id="notifier-tpl">
    <div class="<%=cssClass%>">
        <h5><%=title%></h5>
        <p><%=message%></p>
    </div>
</script>
```

*cssClass* is in fact just the conbination of the *defaultClass* option and the specified notification type. For example, a success notification will receive a *cssClass* containing *"tango tango-success"*. Templates also receive an *id* and an *options* object. The first contains a numeric value that identifies the generated view while the second contains the options specified for that notification.


<br/>
###Events

<br/>
###License

This library is distributed under the terms of the MIT license.