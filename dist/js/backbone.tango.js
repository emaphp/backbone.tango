/*
 * Backbone.Tango v0.2.0
 * Copyright 2015 Emmanuel Antico
 * This library is distributed under the terms of the MIT license.
 */
(function (global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['backbone', 'underscore'], function(Backbone, _) {
            return factory(global, Backbone, _);
        });
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(global, require('backbone'), require('underscore'));
    } else {
        factory(global, global.Backbone, global._);
    }
}(this, function (global, Backbone, _) {
    var $ = Backbone.$,
        notificationId = 0,
        containers = {};

    // Default options
    var notifierDefaults = {
        // Container options
        target: 'body',
        containerBaseId: 'tango-container',
        containerClass: 'tango-container',

        // View options
        viewClass: View,
        cssClass: 'tango',
        position: 'top-right',
        type: 'info',
        timeout: 5000,
        newestOnTop: true,
        template: undefined,
        templateFn: undefined,
        render: true,
        
        // Show options
        showMethod: 'fadeIn',
        showDuration: 250,
        showEasing: 'swing',
        
        // Hiding options
        hideMethod: 'fadeOut',
        hideDuration: 850,
        hideEasing: 'swing',
        
        // Events
        onHidden: undefined,
        onShown: undefined,
        tapToDismiss: true,
        extendedTimeout: 1000
    };

    // Generate detault template function
    var _defaultTemplate = _.template('<div class="<%=cssClass%>"><%=message%></div>');

    var Tango = Backbone.Tango = function(defaults) {
        var _defaults = _.isFunction(defaults) ? defaults.call() : defaults || _.extend({}, this.defaults);
        this.defaults = _.extend(_.extend({}, notifierDefaults), _.isObject(_defaults) ? _defaults : {});
        this.initialize.apply(this, arguments);
    };

    Tango.defaultTemplate = _defaultTemplate;
    Tango.extend = Backbone.Model.extend;
    Tango.VERSION = '0.2.0';
    
    // View states
    Tango.ViewState = {
        beforeShown:  0,
        afterShown:   1,
        beforeHidden: 2,
        afterHidden:  3
    };

    var View = Tango.View = Backbone.View.extend({
        initialize: function(options) {
            if (typeof options !== 'undefined') {
                this.$container = options.$container;
                this.options = options.options;
                this.data = options.data;
            }

            // Set initial state
            this._state = Tango.ViewState.beforeShown;
        },
        
        events: {
            'click': 'dismiss',
            'mouseenter': 'sleep',
            'mouseleave': 'wakeup',
        },
        
        dismiss: function() {
            if (this.options.tapToDismiss) {
                this.hide(true);
            }
        },
        
        sleep: function() {
            var opts = this.options;
            
            clearTimeout(this.intervalId);
            this.$el.stop(true, true)[opts.showMethod]({
                duration: opts.showDuration,
                easing: opts.showEasing
            });
        },
        
        wakeup: function() {
            var opts = this.options,
                self = this;
            
            if (opts.timeout > 0 || opts.extendedTimeout > 0) {
                this.intervalId = setTimeout(function() {
                    self.hide();
                }, opts.extendedTimeout);
            }
        },
        
        render: function() {
            this.$container[this.options.newestOnTop ? 'prepend' : 'append'](this.el);
            this.fadeIn();
            return this;
        },

        fadeIn: function() {
            var opts = this.options,
                data = this.data,
                self = this;
            
            this.$el.hide();

            this.$el[opts.showMethod]({
                duration: opts.showDuration,
                easing: opts.showEasing,
                complete: function() {
                    self._state = Tango.ViewState.afterShown;

                    // Trigger a 'shown' event
                    self.trigger('shown', self, data, opts);

                    if (_.isFunction(opts.onShown)) {
                        opts.onShown.call(self, data, opts);
                    }
                }
            });

            if (opts.timeout > 0) {
                this.intervalId = setTimeout(function() {
                    self.hide();
                }, opts.timeout);
            }
        },
        
        hide: function(force) {
            if (this._state >= Tango.ViewState.beforeHidden) {
                return;
            }
            
            if ($(':focus', this.$el).length && !force) {
                return;
            }
            
            var opts = this.options,
                self = this,
                data = this.data;
            
            this._state = Tango.ViewState.beforeHidden;

            return this.$el[opts.hideMethod]({
                duration: opts.hideDuration,
                easing: opts.hideEasing,
                complete: function() {
                    self._state = Tango.ViewState.afterHidden;

                    // Trigger a 'hidden' event
                    self.trigger('hidden', self, data, opts);

                    // Remove element
                    self.removeEl();

                    // Remove children from container
                    delete self.$container[self.cid];
                    
                    // If container is empty remove as well
                    if (self.$container.children().length === 0) {
                        delete containers[self.$container.attr('id')];
                        self.$container.remove();
                    }
                    
                    // Call 'onHidden' callback
                    if (_.isFunction(opts.onHidden)) {
                        opts.onHidden.call(self, data, opts);
                    }
                }
            });
        },
                
        removeEl: function() {
            if (this.$el.is(':visible')) {
                return;
            }

            // See http://stackoverflow.com/questions/6569704/destroy-or-remove-a-view-in-backbone-js
            this.undelegateEvents();
            this.$el.removeData().unbind(); 
            this.remove();  
            Backbone.View.prototype.remove.call(this);  
        },
        
        getContainer: function() {
            return this.container;
        }
    });

    // Generates a data object for a template
    function compact(message, options) {
        var data = {
            options: options
        };

        if (_.isObject(message)) {
            _.extend(data, message);
        } else {
            data.message = message;
        }

        return data;
    }

    _.extend(Tango.prototype, {
        initialize: function() {},

        info: function(message, optionsOverride) {
            var options = _.extend({type: 'info'}, _.isObject(optionsOverride) ? optionsOverride : {});
            return this.notify(compact(message, options), options);
        },

        success: function(message, optionsOverride) {
            var options = _.extend({type: 'success'}, _.isObject(optionsOverride) ? optionsOverride : {});
            return this.notify(compact(message, options), options);
        },

        warning: function(message, optionsOverride) {
            var options = _.extend({type: 'warning'}, _.isObject(optionsOverride) ? optionsOverride : {});
            return this.notify(compact(message, options), options);
        },

        error: function(message, optionsOverride) {
            var options = _.extend({type: 'error'}, _.isObject(optionsOverride) ? optionsOverride : {});
            return this.notify(compact(message, options), options);
        },

        loader: function(message, optionsOverride) {
            var options = _.extend({type: 'loader'}, _.isObject(optionsOverride) ? optionsOverride : {});
            return this.notify(compact(message, options), options);
        },

        notify: function(data, optionsOverride) {
            // Generates a container id from the given options
            function getContainerId(options) {
                return options.containerBaseId + '-' + options.position;
            }

            // Obtains a container element for the given options
            function getContainer(options) {
                var containerId = getContainerId(options);

                // Return previously generated container
                if (containers[containerId]) {
                    return containers[containerId];
                }

                // Create new container
                $container = createContainer(options, containerId);
                containers[containerId] = $container;
                return $container;
            }

            // Returns a new container element
            function createContainer(options, id) {
                // Create element
                $container = $('<div/>')
                    .attr('id', id)
                    .addClass(options.containerClass)
                    .addClass(options.cssClass + '-' + options.position)
                    .attr('aria-live', 'polite')
                    .attr('role', 'alert');

                // Inject 'clear' method
                _.extend($container, {
                    childList: {},
                    clear: function() {
                        if (this.childList.length !== 0) {
                            _.each(this.childList, function(view) {
                                view.hide(true);
                            });
                        }
                    }
                });
                
                $container.appendTo($(options.target));
                return $container;
            }

            // Returns a template function from the current notification options
            function getTemplate(options) {
                var template;

                if (_.isFunction(options.templateFn)) {
                    template = options.templateFn(options);
                }

                return template || options.template || _defaultTemplate;
            }

            // Override notifier options
            var options = typeof(optionsOverride) !== 'undefined' ? _.extend(_.extend({}, this.defaults), optionsOverride) : this.defaults;

            // Get view class
            var viewClass = this.defaults.viewClass || View;

            // Get template function
            var template = getTemplate(options);
        
            // Create container or obtain previous
            var $container = getContainer(options);

            // Add 'id' and 'cssClass' attributes to template vars
            _.extend(data, {
                id: ++notificationId,
                cssClass: options.cssClass + (options.type ? ' ' + options.cssClass + '-' + options.type : '')
            });

            // Create notification view
            var view = new viewClass({
                el: $(template(data)),
                $container: $container,
                options: options,
                data: data
            });
            
            // Store view in container
            $container.childList[view.cid] = view;

            // Render and return
            return !!options.render ? view.render() : view;
        }
    });

    return Tango;
}));
