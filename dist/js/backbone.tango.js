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
        target: 'body',
        defaultClass: 'tango',
        containerBaseId: 'tango-container',
        containerClass: 'tango-container',
        position: 'top-right',
        timeOut: 5000,
        newestOnTop: true,
        template: undefined,
        type: 'info',
        
        //show options
        showMethod: 'fadeIn',
        showDuration: 300,
        showEasing: 'swing',
        
        //hiding options
        hideMethod: 'fadeOut',
        hideDuration: 1000,
        hideEasing: 'swing',
        
        //events
        onHidden: undefined,
        onShown: undefined,
        tapToDismiss: true,
        extendedTimeOut: 1000
    };

    var Tango = Backbone.Tango = function(defaults) {
        this.defaults = _.extend(_.extend({}, notifierDefaults), defaults);
        this.initialize.apply(this, arguments);
    };

    Tango.extend = Backbone.Model.extend;
    Tango.VERSION = '0.1.0';

    var NotificationView = Tango.NotificationView = Backbone.View.extend({
        initialize: function(options) {
            this.$container = options.$container;
            this.options = options.options;
        },
        
        events: {
            'click': 'dismiss',
            'mouseover': 'sleep',
            'mouseout': 'wakeup',
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

            if (opts.timeOut > 0 || opts.extendedTimeOut > 0) {
                this.intervalId = setTimeout(function() {
                    self.hide();
                }, opts.extendedTimeOut);
            }
        },
        
        render: function() {
            this.$container[this.options.newestOnTop ? 'prepend' : 'append'](this.el);
            this.fadeIn();
            return this;
        },
        
        hide: function(force) {
            if ($(':focus', this.$el).length && !force)
                return;

            var opts = this.options,
                self = this;
            
            return this.$el[opts.hideMethod]({
                duration: opts.hideDuration,
                easing: opts.hideEasing,
                complete: function() {
                    self.removeEl();
                    delete self.$container[self.cid];
                    
                    if (self.$container.children().length === 0) {
                        delete containers[self.$container.attr('id')];
                        self.$container.remove();
                    }
                    
                    if (opts.onHidden) {
                        opts.onHidden.call(self);
                    }
                }
            });
        },

        fadeIn: function() {
            var opts = this.options,
                self = this;
            
            this.$el.hide();

            this.$el[opts.showMethod]({
                duration: opts.showDuration,
                easing: opts.showEasing,
                complete: opts.onShown
            });

            if (opts.timeOut > 0) {
                this.intervalId = setTimeout(function() {
                    self.hide();
                }, opts.timeOut);
            }
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

    //generates a template vars object from the given options
    function compact(type, message, options) {
        var data = {
            options: _.isObject(options) ? _.extend({type: type}, options) : {type: type} 
        };

        //wrap message if it isn't an object
        if (_.isObject(message)) {
            return _.extend(data, message);
        } else {
            data.message = message;
        }

        return data;
    }

    _.extend(Tango.prototype, {
        initialize: function() {},

        info: function(message, options) {
            return this.notify(compact('info', message, options));
        },

        success: function(message, options) {
            return this.notify(compact('success', message, options));
        },

        warning: function(message, options) {
            return this.notify(compact('warning', message, options));
        },

        error: function(message, options) {
            return this.notify(compact('error', message, options));
        },

        notify: function(data) {
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
                
                $container = $('#' + containerId);
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
                $container = _.extend($container, {
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

            //override notifier options
            var options = typeof(data.options) !== 'undefined' ? _.extend(this.defaults, data.options) : this.defaults;

            //get template from options or generate a default one            
            var template = options.template || _.template('<div class="<%=cssClass%>"><%=message%></div>');

            //create container or obtain previous
            var $container = getContainer(options);

            //add 'id' and 'cssClass' attributes to template vars
            data = _.extend({
                id: ++notificationId,
                cssClass: options.defaultClass + (options.type ? ' ' + options.defaultClass + '-' + options.type : '')
            }, data);

            //create notification view
            var view = new NotificationView({
                el: $(template(data)),
                $container: $container,
                options: options
            });
            
            //render and return
            $container.childList[view.cid] = view;
            view.render();
            return view;
        }
    });

    return Tango;
}));