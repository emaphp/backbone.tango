# Backbone.Tango
Notification library for Backbone.js

<br/>
###Demo

<br/>
Demo [here](https://backbone-tango.herokuapp.com "").

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
> npm

    npm install backbone.tango --save


<br/>
###Basic usage

<br/>
Start by including both the javascript and the css files.

<br/>
```html
<!doctype html>
<html>
    <head>
        <!-- jQuery, Underscore.js and Backbone.js goes here -->
        <script src="path/to/library/js/backbone.tango.js"></script>
        <link rel="stylesheet" href="path/to/library/css/backbone.tango.css" />
        <!-- Default theme, more to come hopefully -->
        <link rel="stylesheet" href="path/to/library/css/themes/tango.toastr.css" />
    </head>
</html>
```

<br/>
Create a new `Notifier` instance.

<br/>
```javascript
var notifier = new Backbone.Tango.Notifier();
```

<br/>
Notifications are generated through the `success`, `info`, `warning` and `error` methods. These methods return an instance of `Backbone.Tango.View`, a subclass of `Backbone.View`.

<br/>
```javascript
notifier.success('Success!!!');

notifier.info('The more you know...');

notifier.warning('Beware!!!');

notifier.error('Ooops!');
```

<br/>
An options object can be provided as a second argument.

<br/>
```javascript
notifier.success('Success!!!', {
    position: 'bottom-left',
    timeout: 3000
});
```

<br/>
###Options

<br/>
We can define a default set of options when creating a notifier instance. These options will be applied to all notifications generated from it.

<br/>
```javascript
var notifier = new Backbone.Tango.Notifier({
    position: 'top-left'
});

notifier.success('Going left');
```


<br/>
**View options**

 * position: Determines the place where notifications are shown. Values accepted: `top-right`, `top-left`, `bottom-right`, `bottom-left`, `top-center`, `bottom-center`, `top-full-width`, `bottom-full-width` (default: `top-right`).
 * timeout: The amount of time (in milliseconds) a notification remains visible (default: `5000`).
 * newestOnTop: Determines if new notifications are rendered on top of old ones (default: true).
 * type: Notification type. Values: `info`, `success`, `error`, `warning`, `loader` (default: `undefined`). 
 * render: Determines if the notification is renderer automatically after creation (default: `true`).
 * clearAll: When true, all notifications are removed except for the current one (Default: `false`).
 * clearContainer: When true, all notifications rendered in the same container are hided (Default: `false`).
 * viewClass: The default view class (Default: `Backbone.Tango.View`).
 

<br/>
**Style options**

 * cssClass: A CSS class used for all notification views. When a notification defines a `type` it will also be used to generate an additional class ("tango-success", "tango-warning", etc) (default: `tango`).
 * showMethod: The jQuery method used to show the current view (default: `fadeIn`).
 * showDuration: The amount of time (in milliseconds) for the specified show animation (default: 250).
 * showEasing: The easing method used for the specified show animation (default: `swing`).
 * hideMethod: The jQuery method used to hide the current view (default: `fadeOut`).
 * hideDuration: The amount of time (in milliseconds) for the specified hide animation (default: `850`).
 * hideEasing: The easing method used for the specified hide animation (default: `swing`).

<br/>
**Events options**

 * tapToDismiss: Determines if a view is removed after a *click* event (default: *true*).
 * extendedTimeout: The time in milliseconds in which a notification remains visible after a hover event (default: 1000).
 * onShown: A function called when a view is shown (default: *undefined*).
 * onHidden: A function called when a view is hdden (default: *undefined*).

<br/>
**Container options**

Containers are elements that wrap one or more notificacions in order to be displayed in the requested position. When a notification is removed from screen it also checks if the current container has any childs left. Empty containers are removed as well.

 * target: The element where all notification containers are appended to (default: `body`).
 * containerBaseId: All containers are generated using and id that combines this option and the position where is rendered (default: `tango-container`).
 * containerClass: A CSS class used for all containers (default: `tango-container`). Containers also include an additional CSS class associated with the position.

<br/>
**Overlay options**

 * overlay: When true, an overlay is appended to the document before showing the notification (Default: `false`).
 * overlayClass: The CSS class used by the overlay (Default `tango-overlay`).

<br/>
**Template options**

 * template: The function used to generate a notification view (default: `undefined`, when no template is found then a default one is used).
 * templateFn: A function that receives a list of options and returns a template function. It has priority over the `template` option (default: `undefined`).
 * includeDefaultVars: When true, additional values like `nid` (notification id) and `cssClass` are added to the template arguments (Default: `true`).
 * templateVars: Additional vars that are provided to the template (Default: `null`).

<br/>
###Using templates

<br/>
This example illustrates how to use a default notification template using Undercore.js. We start by adding the following snippet to our page.

<br/>
```html
<script type="text/template" id="notifier-tpl">
    <div class="tango">
        <h5><%=title%></h5>
        <p><%=message%></p>
    </div>
</script>
```

<br/>
Now we create a new notifier instance using that template.

<br/>
```javascript
var Notifier = Backbone.Tango.Notifier;

var notifier = new Notifier({
    template: _.template($('#notifier-tpl').html())
});
```

<br/>
This template receives a `title` and a `message` argument. We need to provide them using an object.

<br/>
```javascript
notifier.success({
    title: 'Hello',
    message: 'This is my custom template'
});
```

<br/>
Notification templates receive an additional argument called `cssClass` that is generated on runtime and contains a string with the predefined CSS classes for that element.

<br/>
```html
<script type="text/template" id="notifier-tpl">
    <div class="<%=cssClass%>">
        <h5><%=title%></h5>
        <p><%=message%></p>
    </div>
</script>
```

<br/>
The `cssClass` property is created using the `cssClass` option and the specified notification type. For example, a success notification will receive a `cssClass` containing *"tango tango-success"*. Templates also receive an `nid` and an `options` object. The first contains a numeric value that identifies the generated view while the second contains the options specified for that notification.


<br/>
###Events


<br/>
The callbacks `onShown` and `onHidden` are invoked after their respective animations are completed. They receive both the data and the options objects as arguments and use the current view as the context.

<br/>
```javascript
var notifier = new Backbone.Tango.Notifier();

notifier.warning('Stop right there criminal scum!', {
    onShown: function(data, options) {
        console.log('Message "' + data.message + '" was showed.');
    },
    
    onHidden: function(data, options) {
        console.log('Notification was showed for about ' + (options.timeout / 1000) + ' seconds.');
    },
    
    timeout: 7000
});
```

<br/>
We can also bind a callback to a view event just like any regular *Backbone* view. During its lifetime, a `Tango.View` instance triggers a `shown` and a `hidden` event. Any callback triggered by the `shown` event is called before the `onShown` callback. Same goes for the `hidden` event handler and the `onHidden` callback.

<br/>
```javascript
var notifier = new Backbone.Tango.Notifier();
var view = notifier`info("The princess is in another castle");

// Bind a callback to the 'shown' event
view.on('shown', function(view, data, options) {
    console.log('Showing view "' + view.cid + '"');
});

// Bind a callback to the 'hidden' event
view.on('hidden', function(view, data, options) {
    console.log('Removing view "' + view.cid + '"');
});
```

<br/>
###Custom notifications

<br/>
The next example shows a custom notification view class that includes a closing button. The associated event has been defined through the `events` object in the class declaration. Notice that we also added a static property called `defaults`. This value will be used as the default configuration when creating our notifier object.

<br/>
```javascript
var View = Backbone.Tango.View;

// CloseableNotification class
var CloseableNotification = View.extend({
    events: {
        "click .close-button": "close"
    },
    
    close: function(e) {
        e.stopPropagation();
        this.hide(true);
    }
}, {
    defaults: {
        template: _.template($('#closeable-tpl').html()),
        
        tapToDismiss: false,
        
        timeout: 0,
        
        extendedTimeout: 0
    }
});
```

<br/>
Now we create a new notifier instance using this class as the argument. The notifier instance will then import the configuration from the `defaults` property.

<br/>
```javascript
var Notifier = Backbone.Tango.Notifier;

// Import defaults from CloseableNotification
var notifier = new Notifier(CloseableNotification);

notifier.info({
    title: 'Welcome',
    message: 'How are you today?'
});
```

<br/>
We could also use the `make` method instead. This method receives a view class, the data to display and an additional options object.

<br/>
```javascript
var Notifier = Backbone.Tango.Notifier;

var view = notifier.make(CloseableNotification, {
    title: 'Welcome',
    message: 'How are you today?'
});
```

<br/>
###Loaders

<br/>
Loaders are a special type of notification that are generated using the `loader` method. By default they include a small css animation just before the text.

<br/>
```javascript
var notifier = new Backbone.Tango.Notifier();
notifier.loader('Loading...');
```

<br/>
Loaders have a default `timeout` of 0 and don't listen to the `click` event, which means they'll never disappear unless we call its `hide` method.

<br/>
```javascript
var notifier = new Backbone.Tango.Notifier();
var view = notifier.loader('Loading...');

// Show loader for 4 seconds
setTimeout(function () {
    view.hide();
}, 4000);
```

<br/>
###License

This library is distributed under the terms of the MIT license.
