/*
 * Backbone.Tango v0.3.0
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
        containers = {},
        $overlay = null;

    // Obtains an overlay instance
    function getOverlay(view) {
        if (!$overlay) {
            // Create element
            $overlay = $('<div/>').addClass(view.options.overlayClass);
            $overlay._childs = {};

            // Include Backbone.Events so we can listen to view 'hidden' event
            _.extend($overlay, Backbone.Events);

            // Append element
            $overlay.hide();
            $overlay.appendTo($(view.options.target));

            // Animate
            $overlay.fadeIn({
                duration: 150,
                easing: 'swing'
            });
        }

        // Store child view
        var cid = view.cid;
        $overlay._childs[cid] = view;

        // Remove children from list when hidden
        $overlay.listenTo(view, 'hidden', function () {
            $overlay.stopListening(view);
            delete $overlay._childs[cid];
            if (_.keys($overlay._childs).length === 0) {
                $overlay.fadeOut({
                    duration: 250,
                    easing: 'swing',
                    complete: function () {
                        removeOverlay();
                    }
                });
            }
        });

        return $overlay;
    }

    // Removes current overlay
    function removeOverlay() {
        if ($overlay) {
            $overlay.remove();
            $overlay = null;
        }
    }

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
        clearAll: false,
        clearContainer: false,

        // Template options
        includeDefaultVars: true,
        templateVars: {},
        
        // Overlay options
        overlay: false,
        overlayClass: 'tango-overlay',

        // Show options
        showMethod: 'fadeIn',
        showDuration: 250,
        showEasing: 'swing',
        
        // Hiding options
        hideMethod: 'fadeOut',
        hideDuration: 650,
        hideEasing: 'swing',
        
        // Events
        onHidden: undefined,
        onShown: undefined,
        tapToDismiss: true,
        extendedTimeout: 1000
    };

    // Generate detault template function
    var _defaultTemplate = _.template('<div class="<%=cssClass%>"><% if (isLoader) { %><div class="tango-loader-pulse"><div></div><div></div><div></div></div><% } %><%=message%></div>');

    // Tango class
    var Tango = Backbone.Tango = {};
    Tango.VERSION = '0.3.0';
    Tango.defaultTemplate = _defaultTemplate;

    // View states
    Tango.ViewState = {
        beforeShown:  0,
        afterShown:   1,
        beforeHidden: 2,
        afterHidden:  3
    };

    // Hides all notifications except for the provided
    Tango.clearAll = function (except) {
        for (var key in containers) {
            var childs = containers[key].childList;

            for (var child in childs) {
                if (child !== except) {
                    containers[key].childList[child].hide(true);
                }
            }
        }
    };

    // Notifier class
    var Notifier = Tango.Notifier = function(options) {
        // Clone default options
        var _defaults = _.extend({}, notifierDefaults);

        // Check if argument is a view class
        if (_.isFunction(options)) {
            // Import the options from its 'defaults' static property
            if (_.isObject(options.defaults)) {
                this.defaults = _.extend(_defaults, options.defaults);
                this.defaults.viewClass = options;
            } else { // Invoke function a merge return value with options
                this.defaults = _.extend(_defaults, options.call());
            }
        } else {
            // Merge values with defaults
            this.defaults = _.extend(_defaults, _.isObject(options) ? options : {});
        }
    };

    // Make notifier extendable
    Notifier.extend = Backbone.Model.extend;
    
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
            // Remove other notifications
            if (this.options.clearAll) {
                Tango.clearAll(this.cid);
            }

            // Show overlay
            if (this.options.overlay) {
                $overlay = getOverlay(this);
            }

            // Append element and apply animation
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
        },
    });

    // Generates a data object for a template
    function compact(message, options) {
        return _.isObject(message) ? message : {message: message};
    }

    _.extend(Tango.Notifier.prototype, {
        initialize: function() {},

        _includeDefaultVars: function (data, options) {
            if (options.includeDefaultVars) {
                _.extend(data, {
                    nid: ++notificationId,
                    cssClass: options.cssClass + (options.type ? ' ' + options.cssClass + '-' + options.type : ''),
                    isLoader: options.type === 'loader'
                });
            }
            
            // Inject additional template vars
            if (_.isFunction(this.templateVars)) {
                var values = this.templateVars(options);

                if (_.isObject(values)) {
                    _.extend(data, values);
                }
            } else if (_.isObject(options.templateVars)) {
                _.extend(data, options.templateVars);
            }
        },

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
            var options = _.extend({
                type: 'loader',
                position: 'top-center',
                overlay: true,
                showDuration: 150,
                hideDuration: 250,
                timeout: 0,
                extendedTimeout: 0,
                tapToDismiss: false,
                clear: true
            }, _.isObject(optionsOverride) ? optionsOverride : {});
            return this.notify(compact(message, options), options);
        },

        _getContainer: function (options) {
            var containerId = options.containerBaseId + '-' + options.position;

            // Return previously generated container
            if (containers[containerId]) {
                return containers[containerId];
            }

            // Create new container
            $container = this._createContainer(options, containerId);
            containers[containerId] = $container;
            return $container;
        },

        _createContainer: function (options, id) {
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
        },

        _getTemplate: function (options) {
            var template;

            if (_.isFunction(options.templateFn)) {
                template = options.templateFn(options);
            }

            return template || options.template || _defaultTemplate;
        },

        notify: function(data, optionsOverride) {
            // Returns a template function from the current notification options
            function getTemplate(options) {
                var template;

                if (_.isFunction(options.templateFn)) {
                    template = options.templateFn(options);
                }

                return template || options.template || _defaultTemplate;
            }

            // Override notifier options
            var defaults = _.extend({}, this.defaults);
            var options = typeof(optionsOverride) !== 'undefined' ? _.extend(defaults, optionsOverride) : this.defaults;

            // Get view class
            var viewClass = this.defaults.viewClass || View;

            // Get template function
            var template = this._getTemplate(options);
        
            // Create container or obtain previous
            var $container = this._getContainer(options);

            // Add 'nid' and 'cssClass' attributes to template vars
            this._includeDefaultVars(data, options);

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
        },

        // Generates a new notification view from a view class
        make: function (viewClass, data, options) {
            var defaults = _.extend({}, this.defaults, _.isObject(viewClass.defaults) ? viewClass.defaults : {});

            if (_.isObject(options)) {
                _.extend(defaults, options);
            }

            // Get template function
            var template = this._getTemplate(defaults);
        
            // Create container or obtain previous
            var $container = this._getContainer(defaults);

            // Add 'nid' and 'cssClass' attributes to template vars
            this._includeDefaultVars(data, defaults);

            // Create notification view
            var view = new viewClass({
                el: $(template(data)),
                $container: $container,
                options: defaults,
                data: data
            });

            // Store view in container
            $container.childList[view.cid] = view;

            // Render and return
            return !!defaults.render ? view.render() : view;
        }
    });

    return Tango;
}));
