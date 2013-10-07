(function($){
  var defaults = {
    selector: '> *',
    visible: { opacity: 1, transform: 'scale(1)' },
    hidden: { opacity: 0, transform: 'scale(0.001)' }
  };

  var expando = $.expando + 'mm';

  var $fix = function (position) {
    var positions = [];

    // Positions are relative to parent
    this.parent().css({position: 'relative'});

    // Find all positions without altering elements
    this.each(function () {
      positions.push($(this).position());
    });

    // Set absolute positions
    this.each(function (i) {
      $(this).css($.extend({position: 'absolute'}, positions[i]));
    });

    return this;
  };

  var $unfix = function () {
    return this.css({position: '', top: '', left: ''});
  };

  var $transition = function (props, options) {
    var defaults = {
      easing: 'linear',
      duration: 400
    };

    options = $.extend(
      {}, defaults, options
    );

    var effect = [
      'all',
      options.duration + 'ms',
      options.easing
    ].join(' ');

    props = $.extend(
      {transition: effect},
      props
    );

    var callback = function () {
      $(this).css('transition', '');
      $(this).dequeue();
    };

    return this.queue(function () {
      setTimeout($.proxy(callback, this), options.duration);
      $(this).css(props);
    });
  };

  var $redraw = function () {
    return this.each(function () {
      var redraw = this.offsetTop;
    });
  };

  var difference = function ($nodesA, $nodesB) {
    return $nodesA.filter(function () {
      var nodeA = this;

      return !$nodesB.filter(function () {
        return this[expando] == nodeA[expando];
      })[0];
    });
  };

  var intersect = function ($nodesA, $nodesB) {
    return $nodesA.filter(function () {
      var nodeA = this;

      return $nodesB.filter(function () {
        return this[expando] == nodeA[expando];
      })[0];
    });
  };

  var magicMove = function (options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options  = {};
    }

    options = $.extend({}, defaults, options);

    var promises    = [];
    var $el         = $(this);
    var $nodes      = $el.find(options.selector);
    var $clone      = $el.clone(true, true);
    var $cloneNodes = $clone.find(options.selector);

    // Set a ID to each element, so we match up
    // all the $nodes and $cloneNodes
    $nodes.each(function (index) {
      this[expando] = $cloneNodes[index][expando] = index;
    });

    $clone.css({
      position: 'absolute',
      left:     '-1000px',
      top:      '-1000px'
    }).appendTo('body');

    // Apply transformation to clone
    callback.call($clone, $clone, options);

    // Refresh cloned nodes
    $tNodes = $clone.find(options.selector);

    var $added   = difference($tNodes, $nodes);
    var $removed = difference($nodes, $tNodes);
    var $changed = intersect($tNodes, $nodes);

    // Compare nodes in $cloneNodes to nodes in $nodes
    // If node doesn't exist, create it, and animate
    // If node has moved, animate move
    // If node has been removed, fade it out

    $fix.call($nodes);

    $changed.each(function () {
      var $node  = $($nodes[this[expando]]);
      var $clone = $(this);
      var props = $clone.position();

      // If display state has changed
      if ($clone.is(':visible') && $node.is(':hidden')) {
        $.extend(props, options.visible);

      } else if ($clone.is(':hidden') && $node.is(':visible')) {
        $.extend(props, options.hidden);
        $node.promise().done(function () {
          $node.hide();
        });
      }

      $transition.call($node, props, options);
      promises.push($node.promise());
    });

    $added.each(function () {
      var $clone = $(this);
      var $pos   = $nodes.eq($clone.index());
      var $node  = $fix.call($clone).clone();

      $node.css(options.hidden);
      $node.insertBefore($pos);
      $redraw.call($node);

      $transition.call($node, options.visible, options);
      promises.push($node.promise());
    });

    $removed.each(function () {
      var $node  = $($nodes[this[expando]]);

      $transition.call($node, options.hidden, options);
      $node.promise().done(function () {
        $node.remove();
      });
      promises.push($node.promise());
    });

    $clone.remove();

    var promise = $.when.apply($, promises);

    return promise.done(function () {
      // Remove 'absolute' styles
      $unfix.call($el.find(options.selector));
    });
  };

  $.fn.magicMove = function (options, callback) {
    var $el = this;

    // Throttle animations, so they happen sequentially
    return $el.queue(function () {
      var promise = magicMove.call($el, options, callback);

      promise.done(function () {
        $el.dequeue();
      });
    });
  };
})(jQuery);