;(function(parent) {

  var utilities;
  var helpers;
  var dom;
  var defaults;

  var handlerFactory;
  var initialize;

  utilities = {
    noop: function() {},
    objectExtend: function(obj1, obj2) {
      var obj3 = {};

      for(var attr in obj1) {
        obj3[attr] = (obj2[attr]) ? obj2[attr] : obj1[attr];
      }

      return obj3;
    },
  };

  helpers = {
    getTopDistance: function(context, element) {
      var scrollOffset        = (context || window).pageYOffset;
      var elementTopOffset    = element.offsetTop;
      var scrollOffsetFromTop = (scrollOffset - elementTopOffset);

      return scrollOffsetFromTop;
    },
    getTopProgress: function(context, element, buffer) {
      var scrollOffsetFromTop = helpers.getTopDistance(context, element);
      var elementHeight       = element.offsetHeight;

      return (Math.round(((scrollOffsetFromTop / elementHeight) * 100) * 1e2) / 1e2);
    },
    getBotProgress: function(context, element, buffer) {
      var scrollOffsetFromTop = helpers.getTopDistance(context, element) + context.outerHeight;
      var elementHeight       = element.offsetHeight;

      return (Math.round(((scrollOffsetFromTop / elementHeight) * 100) * 1e2) / 1e2);
    },
    elementOnScreen: function(context, element) {
      var elementHeight  = element.offsetHeight;
      var viewportHeight = context.outerHeight;

      var elementOffset = element.offsetTop;
      var scrollOffset  = context.pageYOffset;

      var elementRect = element.offsetTop + elementHeight;
      var scrollRect  = context.pageYOffset + viewportHeight;

      return (
        (scrollRect >= elementOffset) && (scrollOffset <= elementRect)
      );
    },
    getStatusByProgress: function(progress) {
      if(progress < 0)        return 'above';
      else if(progress > 100) return 'below';
      else                    return 'over';
    },
  };

  dom = {
    bind: function($target, type, callback, useCapture) {
      var namespace = type;

      // Check for namespace
      if(type.split('.').length > 1) {
        namespace = type.split('.').slice(1).join('.');
        type      = type.split('.')[0];
      }

      if($target.constructor.name === 'NodeList') {
        for(var i = 0; i < $target.length; i++) {
          dom.bind($target[i], type, callback, useCapture);
        }
      } else if($target instanceof HTMLElement || $target === window) {
        $target.addEventListener(type, callback, !!useCapture);
      }
    },
  };

  defaults = {
    context : window,
    element : null,
    buffer  : 0,
    in      : utilities.noop,
    out     : utilities.noop,
    handler : utilities.noop
  };

  handlerFactory = function(options) {
    var elementWatcher = function(_element) {
      if(!helpers.elementOnScreen(options.context, _element)) {
        if(this.triggerInOut) {
          options.out.call(_element, __scrollData);
          this.triggerInOut = false;
        }

        return;
      }

      var topProgress = helpers.getTopProgress(options.context, _element, options.buffer);
      var botProgress = helpers.getBotProgress(options.context, _element, options.buffer);
      var closest     = (Math.abs(topProgress) < (Math.abs(botProgress) - 100)) ? 'top' : 'bot';

      this.__scrollData = {
        closest : closest,
        progress: {
          top : topProgress,
          bot : botProgress,
        },
        status: {
          top : helpers.getStatusByProgress(topProgress),
          bot : helpers.getStatusByProgress(botProgress),
        }
      };

      if(!this.triggerInOut) {
        options.in.call(_element, this.__scrollData);
        this.triggerInOut = true;
      }

      options.handler.call(_element, this.__scrollData);
    };

    return (function() {
      for(var i = 0; i < options.element.length; i++) {
        elementWatcher(options.element[i]);
      }
    });
  };

  function DriveBy(options) {
    this.options = utilities.objectExtend(defaults, options || {});

    // Check the compatibility of the elements provided.

    if(!(this.options.element instanceof HTMLElement) &&
       !(this.options.element instanceof HTMLCollection)) {
      return console.error('Invalid HTML Element provided.');
    }

    if(this.options.element instanceof HTMLElement) {
      this.options.element = [this.options.element];
    }

    this.handler = handlerFactory(this.options);

    // Bind the context scroll event to the handler

    dom.bind(this.options.context, 'scroll', this.handler);

    // Expose instance methods

    this.unbind = function() {
      this.options.context.removeEventListener('scroll', this.handler);
    };
  };

  parent.DriveBy = DriveBy;

})(this)
