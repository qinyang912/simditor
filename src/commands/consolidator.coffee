
class Consolidator extends SimpleModule

  markerClass: "__telerik_marker"

  @c: (h, i) ->
    if !h || !i || !h.parentNode || !i.parentNode || Simditor.commandUtil.isTextNode(h)
      return false
    return Simditor.NodeComparer.equalNodes(h, i)

  options: 
    nodeCompare: Consolidator.c

  constructor: (editor, options) ->
    @options = $.extend(@options, options || {})
    @editor = editor
    @util = Simditor.commandUtil

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

  normalize: (node) ->
    @util.normalize(node)

  _getMarkers: (node) ->
    $("." + @markerClass, node)


Simditor.Consolidator = Consolidator