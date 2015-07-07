;(function(parent) {

  var utilities;
  var helpers;
  var dom;
  var defaults;

  var handlerFactory;

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
    getTopProgress: function(context, element) {
      var scrollOffsetFromTop = helpers.getTopDistance(context, element);
      var elementHeight       = element.offsetHeight;

      return Math.round(((scrollOffsetFromTop / elementHeight) * 100) * 1e2) / 1e2;
    },
    getBotProgress: function(context, element) {
      var scrollOffsetFromTop = helpers.getTopDistance(context, element) + context.outerHeight;
      var elementHeight       = element.offsetHeight;

      return Math.round(((scrollOffsetFromTop / elementHeight) * 100) * 1e2) / 1e2;
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
    }
  };

  dom = {
    find: function(scope, selector, all) {
      all = (typeof all === 'boolean') ? all : false;

      if(all) {
        return (scope || document).querySelectorAll(selector);
      } else {
        return (scope || document).querySelector(selector);
      }
    },
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
    parent: function($element, tagName) {
      if(!$element.parentNode) { return; }
      if($element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
        return $element.parentNode;
      }

      return dom.parent($element.parentNode, tagName);
    },
    insertBefore: function($targetElement, $elementToInsert) {
      var $targetParent = $targetElement.parentNode;

      if(!$targetParent) { return; }

      $targetParent.insertBefore($targetElement, $elementToInsert);
    },
  };

  defaults = {
    context : window,
    element : null,
    in      : utilities.noop,
    out     : utilities.noop,
    handler : utilities.noop
  };

  handlerFactory = function(options) {
    return function() {
      if(!helpers.elementOnScreen(options.context, options.element)) {
        if(this.triggerInOut) {
          options.out();
          this.triggerInOut = false;
        }

        return;
      }

      if(!this.triggerInOut) {
        options.in();
        this.triggerInOut = true;
      }

      var topProgress = helpers.getTopProgress(options.context, options.element);
      var botProgress = helpers.getBotProgress(options.context, options.element);


      options.handler({
        top : topProgress,
        bot : botProgress,
      });
    };
  };

  function DriveBy(options) {
    this.options = utilities.objectExtend(defaults, options || {});

    this.handler = handlerFactory(this.options);

    dom.bind(this.options.context, 'scroll', this.handler);

    this.remove = function() {
      this.options.context.removeEventListener('scroll', this.handler);
    }
  };

  parent.DriveBy = DriveBy;

})(this)
