/*
 * Backbone.Tango v0.1.0
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

    //default options
    var notifierDefaults = {
        //view options
        target: 'body',
        defaultClass: 'tango',
        containerBaseId: 'tango-container',
        containerClass: 'tango-container',
        position: 'top-right',
        type: 'info',
        timeout: 5000,
        newestOnTop: true,
        template: undefined,
        templateFn: undefined,
        
        //show options
        showMethod: 'fadeIn',
        showDuration: 250,
        showEasing: 'swing',
        
        //hiding options
        hideMethod: 'fadeOut',
        hideDuration: 850,
        hideEasing: 'swing',
        
        //events
        onHidden: undefined,
        onShown: undefined,
        tapToDismiss: true,
        extendedTimeout: 1000
    };

    var Tango = Backbone.Tango = function(defaults) {
        //check if argument is a class
        if (_.isFunction(defaults)) {
            //obtain defaults from class prototype
            this.defaults = _.extend(_.extend({}, notifierDefaults), _.isObject(defaults.defaults) ? defaults.defaults : {});
            this.viewClass = defaults;
        } else {
            this.defaults = _.extend(_.extend({}, notifierDefaults), _.isObject(defaults) ? defaults : {});
            this.viewClass = View; //use default view
        }

        this.initialize.apply(this, arguments);
    };

    Tango.extend = Backbone.Model.extend;
    Tango.VERSION = '0.1.0';
    
    //view states
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

            //set initial state
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

                    //trigger a 'shown' event
                    self.trigger('shown', self);

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
            
            self._state = Tango.ViewState.beforeHidden;

            return this.$el[opts.hideMethod]({
                duration: opts.hideDuration,
                easing: opts.hideEasing,
                complete: function() {
                    self._state = Tango.ViewState.afterHidden;

                    //trigger a 'hidden' event
                    self.trigger('hidden', self);

                    //delete view
                    self.removeEl();

                    //remove children from container
                    delete self.$container[self.cid];
                    
                    //if container is empty remove as well
                    if (self.$container.children().length === 0) {
                        delete containers[self.$container.attr('id')];
                        self.$container.remove();
                    }
                    
                    //call 'onHidden' callback
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

            //see http://stackoverflow.com/questions/6569704/destroy-or-remove-a-view-in-backbone-js
            this.undelegateEvents();
            this.$el.removeData().unbind(); 
            this.remove();  
            Backbone.View.prototype.remove.call(this);  
        },
        
        getContainer: function() {
            return this.container;
        }
    });

    //generates a data object for a template
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

        notify: function(data, optionsOverride) {
            //generates a container id from the given options
            function getContainerId(options) {
                return options.containerBaseId + '-' + options.position;
            }

            //obtains a container element for the given options
            function getContainer(options) {
                var containerId = getContainerId(options);
                if (containers[containerId]) {
                    return containers[containerId];
                }

                $container = createContainer(options, containerId);
                containers[containerId] = $container;
                return $container;
            }

            //returns a new container element
            function createContainer(options, id) {
                //create element
                $container = $('<div/>')
                    .attr('id', id)
                    .addClass(options.containerClass)
                    .addClass(options.defaultClass + '-' + options.position)
                    .attr('aria-live', 'polite')
                    .attr('role', 'alert');

                //inject 'clear' method
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

            var _defaultTemplate = _.template('<div class="<%=cssClass%>"><%=message%></div>');

            function getTemplate(options) {
                var template;

                if (_.isFunction(options.templateFn)) {
                    template = options.templateFn(options);
                }

                return template || options.template || _defaultTemplate;
            }

            //override notifier options
            var options = typeof(optionsOverride) !== 'undefined' ? _.extend(this.defaults, optionsOverride) : this.defaults;

            //get view class
            var viewClass = this.viewClass || View;

            //get template function
            var template = getTemplate(options);
        
            //create container or obtain previous
            var $container = getContainer(options);

            //add 'id' and 'cssClass' attributes to template vars
            _.extend(data, {
                id: ++notificationId,
                cssClass: options.defaultClass + (options.type ? ' ' + options.defaultClass + '-' + options.type : '')
            });

            //create notification view
            var view = new viewClass({
                el: $(template(data)),
                $container: $container,
                options: options,
                data: data
            });
            
            //store view in container
            $container.childList[view.cid] = view;

            //render and return
            return view.render();
        }
    });

    return Tango;
}));
