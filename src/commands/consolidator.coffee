
class Consolidator extends SimpleModule

  markerClass: "__telerik_marker"

  @c: (h, i) ->
    if !h || !i || !h.parentNode || !i.parentNode || Simditor.CommandUtil.isTextNode(h)
      return false
    return Simditor.NodeComparer.equalNodes(h, i)

  options: 
    nodeCompare: Consolidator.c

  constructor: (editor, options) ->
    @options = $.extend(@options, options || {})
    @editor = editor
    @util = Simditor.CommandUtil

  consolidateMarkedEdges: (node) ->
    markers = this._getMarkers(node);
    if markers[0]
      @consolidateOverMarker(markers[0])
    if markers[1]
      @consolidateOverMarker(markers[1])

  consolidateOverMarker: (node) ->
    nodeCompare = @options.nodeCompare
    previousSibling = node.previousSibling
    nextSibling = node.nextSibling
    if nodeCompare(previousSibling, nextSibling)
      previousSibling.appendChild(node)
      while nextSibling.firstChild
        previousSibling.appendChild(nextSibling.firstChild)
      nextSibling.parentNode.removeChild(nextSibling)
      @consolidateOverMarker(node)

  normalizeTextEdge: (node, range, isStart) ->
    previousSibling = node.previousSibling
    nextSibling = node.nextSibling
    if @util.isTextNode(previousSibling) && @util.isTextNode(nextSibling) && previousSibling.nodeType == nextSibling.nodeType
      if isStart
        key = "setStart"
      else
        key = "setEnd"
      range[key](previousSibling, previousSibling.nodeValue.length)
      @mergeTextToStart(previousSibling, nextSibling)
      node.parentNode.removeChild(node)
      return true
    false

  mergeTextToStart: (prev, next) ->
    prev.nodeValue += next.nodeValue
    next.parentNode.removeChild(next)
    prev

  mergeTextNodes: (text, node) ->
    node.nodeValue = text.nodeValue + node.nodeValue
    text.parentNode.removeChild(text)
    node

  normalize: (node) ->
    @util.normalize(node)

  _getMarkers: (node) ->
    $("." + @markerClass, node)


Simditor.Consolidator = Consolidator