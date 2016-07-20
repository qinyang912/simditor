
class RangeIterator extends SimpleModule

  constructor: (editor, range) ->
    @range = range
    @editor = editor
    if @range.collapsed
      return
    commonAncestorContainer = @range.commonAncestorContainer
    if @range.startContainer == commonAncestorContainer && !@editor.util.isTextNode(@range.startContainer)
      @_next = @range.startContainer.childNodes[@range.startOffset]
    else
      @_next = @editor.util.findAncestorUntil(commonAncestorContainer, @range.startContainer)

    if @range.endContainer == commonAncestorContainer && !@editor.util.isTextNode(@range.endContainer)
      @_end = @range.endContainer.childNodes[@range.endOffset]
    else
      @_end = @editor.util.findAncestorUntil(commonAncestorContainer, @range.endContainer).nextSibling

  iterate: (fn) ->
    nextNode = @nextNode()
    while nextNode
      if @_hasSubTree(nextNode)
        @_buildSubTraverser(nextNode).iterate(fn)
      else
        fn(nextNode)
      nextNode = @nextNode();

  nextNode: ->
    next = @_next
    if @_next && @_next.nextSibling != @_end
      @_next = @_next.nextSibling
    else
      @_next = null
    next

  _hasSubTree: (node) ->
    return !@editor.util.isTextNode(node) && @editor.util.canHaveChildren(node) && (@editor.util.isAncestorOrSelf(node, @range.startContainer) || @editor.util.isAncestorOrSelf(node, @range.endContainer))

  _buildSubTraverser: (node) ->
    range = @range.cloneRange()
    range.selectNodeContents(node)
    if @editor.util.isAncestorOrSelf(node, @range.startContainer)
      range.setStart(@range.startContainer, @range.startOffset)
    if @editor.util.isAncestorOrSelf(node, @range.endContainer)
      range.setEnd(@range.endContainer, @range.endOffset)
    return new Simditor.RangeIterator(@editor, range)

Simditor.RangeIterator = RangeIterator
    