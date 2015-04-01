** STILL UNDER DEVELOPMENT **

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

Methods *success*, *info*, *warning* and *error* return an instance of Backbone.Tango.View, a subclass of Backbone.View.

```javascript
var tng = new Backbone.Tango();
var view = tng.error('Hasta la vista baby');
console.log('View "' + view.cid + '" has been created');
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

 * position: Determines in which place notifications are shown. Values: 'top-right, 'top-left', 'bottom-right', 'bottom-left' (default: 'top-right').
 * timeout: The time in milliseconds in which a notification remains visible (default: 5000).
 * newestOnTop: Determines if new notifications are rendered on top of old ones (default: true).
 * type: Notification type. Values: 'info', 'success', 'error', 'warning' (default: undefined). 
 * template: The function used to generate a notification view html (default: undefined, when no template is found then a default one is used).
 * templateFn: A function that receives a list of options and returns a template function. It has priority over the *template* option (default: undefined).
 

<br/>
**Presentation options**

 * defaultClass: A CSS class used for all notification views. When a notification defines a *type* it will also be used to generate an additional class ("tango-success", "tango-warning", etc) (default: "tango").
 * showMethod: The jQuery method used to show the current view (default: 'fadeIn').
 * showDuration: The amount in milliseconds for the specified show method (default: 250).
 * showEasing: The easing method used for the specified show method (default: 'swing').
 * hideMethod: The jQuery method used to hide the current view (default: 'fadeOut').
 * hideDuration: The amount in milliseconds for the specified hide method (default: 850).
 * hideEasing: The easing method used for the specified hide method (default: 'swing').

<br/>
**Events options**

 * tapToDismiss: Determines if a view is removed after a *click* event (default: true).
 * extendedTimeout: The time in milliseconds in which a notification remains visible after a *mouseenter* event (default: 1000).
 * onShown: A function that is called when a view is shown. This function is executed using the view as the context and receives both the options and the data used to generate it (default: undefined).
 * onHidden: A function that is called after an a view is hidden. This function is executed using the view as the context and receives both the options and the data used to generate it (default: undefined).

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

This template receives a *title* and a *message* argument. We need to provide them using an object.

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
Backbone.Tango supports two special callbacks that are invoked right after a notification is showed and hid from the user. Both receive the view instance, the data defined for that view and the options used.

```javascript
var tng = new Backbone.Tango();

tng.warning('Stop right there criminal scum!', {
    onShown: function(view, data, options) {
        console.log('Message "' + data.message + '" was showed.');
    },
    
    onHidden: function(view, data, options) {
        console.log('Notification was showed for about ' + (options.timeout / 1000) + ' seconds.');
    },
    
    timeout: 7000
});
```

<br/>
We can also bind a callback to a view event just like any regular Backbone view. A Tango.View instance triggers a *shown* event right after is fully visible and a *hidden* event right after is hid from the user. Any callback triggered by the *shown* event is called before the *onShown* callback. Same goes for the *hidden* event handler and the *onHidden* callback.

<br>
```javascript
var tng = Backbone.Tango();
var view = tng.info("The princess is in another castle");

//bind a callback to the 'shown' event
view.on('shown', function(view, data, options) {
    console.log('View "' + v.cid + '" is being shown...');
});

//bind a callback to the 'hidden' event
view.on('hidden', function(view, data, options) {
    console.log('View "' + v.cid + '" is being hidden...');
});
```

<br/>
###Custom notifications


<br>
```javascript
var Sticky = Backbone.Tango.View.extend({
    events: {
        "click .close-button": "close"
    },
    
    close: function(e) {
        e.stopPropagation();
        this.hide(true);
    }
}, {
    options: {
        templateFn: function(options) {
            //return a special template when using a 'success' notification
            switch(options.type) {
                case 'success':
                   return _.template('<div class="notification success">
                                        <h4><%=title%>!!!</h4>
                                        <p><%=message%> :)</p>
                                        <button class="close-button">Close</button>
                                      </div>');
                   break;
                   
                default:
                    return _.template('<div class="notification">
                                        <h4><%=title%></h4>
                                        <p><%=message%></p>
                                        <button class="close-button">Close</button>
                                      </div>');
                    break;
            }
        },
        tapToDismiss: false,
        timeout: 0,
        extendedTimeout: 0
    }
});


//use Sticky defaults
var tng = new Backbone.Tango(Sticky);

tng.success({
    title: 'Welcome',
    message: 'How are you today?'
});
```

<br/>
###License

This library is distributed under the terms of the MIT license.