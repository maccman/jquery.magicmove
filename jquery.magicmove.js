(function($){
  var defaults = {
    selector: '> *',
    visibleStyle: { opacity: 1, transform: 'scale(1)' },
    hiddenStyle: { opacity: 0, transform: 'scale(0.001)' }
  };

  var expando = $.expando + 'mm';

  $.fn.fix = function(position){
    var positions = [];

    // Positions are relative to parent
    this.parent().css({position: 'relative'});

    // Find all positions without altering elements
    this.each(function(){
      positions.push($(this).position());
    });

    // Set absolute positions
    this.each(function(i){
      $(this).css($.extend({position: 'absolute'}, positions[i]));
    });

    return this;
  };

  $.fn.unfix = function(){
    return this.css({position: 'static'});
  };

  var difference = function($nodesA, $nodesB) {
    return $nodesA.filter(function(){
      var nodeA = this;

      return !$nodesB.filter(function(){
        return this[expando] == nodeA[expando];
      })[0];
    });
  };

  var intersect = function($nodesA, $nodesB) {
    return $nodesA.filter(function(){
      var nodeA = this;

      return $nodesB.filter(function(){
        return this[expando] == nodeA[expando];
      })[0];
    });
  };

  var magicMove = function(options, callback){
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

    $nodes.each(function(index){
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

    $nodes.fix();

    $changed.each(function(){
      var $node  = $($nodes[this[expando]]);
      var $clone = $(this);

      $node.animate($clone.position());
      promises.push($node.promise());
    });

    $added.each(function(){
      var $clone = $(this);
      var $pos   = $nodes.eq($clone.index());
      var $node  = $clone.fix().clone().hide();

      $node.insertBefore($pos).fadeIn();
      promises.push($node.promise());
    });

    $removed.each(function(){
      var $node  = $($nodes[this[expando]]);

      $node.fadeOut();
      $node.promise().done(function(){
        $node.remove();
      });
      promises.push($node.promise());
    });

    $clone.remove();

    // Remove 'absolute' styles
    $.when.apply($, promises).done(function(){
      $el.find(options.selector).unfix();
    });

    return this;
  };

  $.fn.magicMove = magicMove;
})(jQuery);