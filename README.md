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
        <script src="path/to/library/js/backbone.tango.js"></script>
        <link rel="stylesheet" href="path/to/library/css/backbone.tango.css" />
    </head>
</html>
```

<br/>
Create a new *Backbone.Tango* instance.

<br/>
```javascript
var tng = new Backbone.Tango();
```

<br/>
Notifications are generated through the *success*, *info*, *warning* and *error* methods. These methods return an instance of *Backbone.Tango.View*, a subclass of *Backbone.View*.

<br/>
```javascript
tng.success('Success!!!');

tng.info('The more you know...');

tng.warning('Beware!!!');

tng.error('Ooops!');
```

<br/>
An options object can be provided as a second argument.

<br/>
```javascript
tng.success('Success!!!', {
    position: 'bottom-left',
    timeout: 3000
});
```

<br/>
###Options

<br/>
We can define a default set of options when creating a new notifier instance. These options will be applied to each one of the notification generated from it.

<br/>
```javascript
var tng = new Backbone.Tango({
    position: 'top-left'
});

tng.success('Going left');
```


<br/>
**View options**

 * position: Determines the place in which notifications are shown. Values accepted: 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center', 'top-full-width', 'bottom-full-width' (default: 'top-right').
 * timeout: The amount of time (in milliseconds) a notification remains visible (default: 5000).
 * newestOnTop: Determines if new notifications are rendered on top of old ones (default: true).
 * type: Notification type. Values: 'info', 'success', 'error', 'warning', 'loader' (default: *undefined*). 
 * template: The function used to generate a notification view (default: *undefined*, when no template is found then a default one is used).
 * templateFn: A function that receives a list of options and returns a template function. It has priority over the *template* option (default: *undefined*).
 * render: Determines if the notification is renderer automatically after creation (default: true).
 * overlay: When true, an overlay is appended before showing the notification (Default: *false*).
 * clear: When true, all notifications are removed except for the current one (Default: *false*).
 * viewClass: The default view class (Default: *Backbone.Tango.View*).
 

<br/>
**Style options**

 * cssClass: A CSS class used for all notification views. When a notification defines a *type* it will also be used to generate an additional class ("tango-success", "tango-warning", etc) (default: *'tango'*).
 * showMethod: The jQuery method used to show the current view (default: *'fadeIn'*).
 * showDuration: The amount of time (in milliseconds) for the specified show animation (default: 250).
 * showEasing: The easing method used for the specified show animation (default: *'swing'*).
 * hideMethod: The jQuery method used to hide the current view (default: *'fadeOut'*).
 * hideDuration: The amount of time (in milliseconds) for the specified hide animation (default: 850).
 * hideEasing: The easing method used for the specified hide animation (default: *'swing'*).

<br/>
**Events options**

 * tapToDismiss: Determines if a view is removed after a *click* event (default: *true*).
 * extendedTimeout: The time in milliseconds in which a notification remains visible after a hover event (default: 1000).
 * onShown: A function called when a view is shown (default: *undefined*).
 * onHidden: A function called when a view is hdden (default: *undefined*).

<br/>
**Container options**

Containers are elements that wrap one or more notificacions in order to be displayed in the requested position. When a notification is removed from screen it also checks if the current container has any childs left. Empty containers are removed as well.

 * target: The element where all notification containers are appended to (default: *'body'*).
 * containerBaseId: All containers are generated using and id that combines this option and the position where is rendered (default: *'tango-container'*).
 * containerClass: A CSS class used for all containers (default: *'tango-container'*). Containers also include an additional CSS class associated with the position.


<br/>
###Using templates

<br/>
This example illustrates how to use a default notification template using Undercore.js. We start by adding the following code to our page.

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
var notifier = new Backbone.Tango({
    template: _.template($('#notifier-tpl').html())
});
```

<br/>
This template receives a *title* and a *message* argument. We need to provide them using an object.

<br/>
```javascript
notifier.success({
    title: 'Hello',
    message: 'This is my custom template'
});
```

<br/>
Notification templates receive an additional argument called *cssClass* that is generated on runtime and contains a string with the predefined CSS classes for that element. We could redefine our template like this.

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
The *cssClass* property is created using the *cssClass* option and the specified notification type. For example, a success notification will receive a *cssClass* containing *"tango tango-success"*. Templates also receive an *id* and an *options* object. The first contains a numeric value that identifies the generated view while the second contains the options specified for that notification.


<br/>
###Events


<br/>
The callbacks *onShown* and *onHidden* are invoked after their respective animations are completed. They receive both the data and the options objects as arguments and use the current view as the context.

<br/>
```javascript
var tng = new Backbone.Tango();

tng.warning('Stop right there criminal scum!', {
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
We can also bind a callback to a view event just like any regular *Backbone* view. During its lifetime, a *Tango.View* instance triggers a *shown* and a *hidden* event. Any callback triggered by the *shown* event is called before the *onShown* callback. Same goes for the *hidden* event handler and the *onHidden* callback.

<br/>
```javascript
var tng = Backbone.Tango();
var view = tng.info("The princess is in another castle");

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
The next example shows a custom notification view class that includes a closing button. The associated event has been defined through the *events* object in the class declaration. Notice that we also added a static property called *defaults*. This value will be used as the default configuration when creating our notifier object.

<br/>
```javascript
// CloseableNotification class
var CloseableNotification = Backbone.Tango.View.extend({
    events: {
        "click .close-button": "close"
    },
    
    close: function(e) {
        e.stopPropagation();
        this.hide(true);
    }
}, {
    defaults: {
        templateFn: function(options) {
            // Return a special template when using a 'success' notification
            switch(options.type) {
                case 'success':
                   return _.template('<div class="notification success">
                                        <h4><%=title%>!!!</h4>
                                        <p><%=message%> :)</p>
                                        <button class="close-button">Close</button>
                                      </div>');
                   
                default:
                    return _.template('<div class="notification">
                                        <h4><%=title%></h4>
                                        <p><%=message%></p>
                                        <button class="close-button">Close</button>
                                      </div>');
            }
        },
        
        tapToDismiss: false,
        
        timeout: 0,
        
        extendedTimeout: 0
    }
});
```

<br/>
Now we create a new notifier instance using this class as the argument. The notifier instance will then import the configuration from the *defaults* property.

<br/>
```javascript
// Import defaults from CloseableNotification
var tng = new Backbone.Tango(CloseableNotification);

tng.success({
    title: 'Welcome',
    message: 'How are you today?'
});
```


<br/>
###Loaders

<br/>
Loaders are a special type of notification that are generated using the *loader* method. By default they include a small css animation just before the text.

<br/>
```javascript
var tng = new Backbone.Tango();
tng.loader('Loading...');
```

<br/>
Loaders have a default *timeout* of 0 and don't listen to the *click* event, which means they'll never disappear unless we call its *hide* method.

<br/>
```javascript
var tng = new Backbone.Tango();
var view = tng.loader('Loading...');

// Show loader for 4 seconds
setTimeout(view.hide, 4000);
```

<br/>
###License

This library is distributed under the terms of the MIT license.