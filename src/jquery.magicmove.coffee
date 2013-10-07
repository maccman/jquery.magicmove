$ = jQuery

defaults =
  selector: '> *'
  visibleStyle: { opacity: 1, transform: 'scale(1)' }
  hiddenStyle:  { opacity: 0, transform: 'scale(0.001)' }

eql = (nodeA, nodeB) ->
  nodeAIndex = $(nodeA).data('mm')
  nodeBIndex = $(nodeB).data('mm')

  return false unless nodeAIndex?
  return false unless nodeBIndex?

  nodeAIndex is nodeBIndex

difference = (nodesA, nodesB) ->
  nodesA.filter (nodeA) ->
    for nodeB in nodesB
      return false if eql(nodeA, nodeB)
    true

intersect = (nodesA, nodesB) ->
  nodesA.filter (nodeA) ->
    for nodeB in nodesB
      return true if eql(nodeA, nodeB)
    false

magicMove = (options, callback) ->
  if typeof options is 'function'
    callback = options
    options  = {}

  options = $.extend({}, defaults, options)

  $el    = $(this)
  $nodes = $el.find(options.selector)

  # Identify all nodes, so we can find them later
  for node, index in $nodes
    $(node).data(mm: index)

  # Create clone, and append to body
  $clone = $el.clone(true, true)

  $clone.css({
    position: 'absolute'
    left:     '-1000px'
    top:      '-1000px'
  }).appendTo('body')

  # Apply transformation to clone
  callback.call($clone, $clone, options)

  $cloneNodes = $clone.find(options.selector)
  $elNodes    = $el.find(options.selector)

  $added   = difference($cloneNodes, $elNodes)
  $removed = difference($elNodes, $cloneNodes)
  $changed = intersect($elNodes, $cloneNodes)

  debugger


$.fn.magicMove = magicMove;