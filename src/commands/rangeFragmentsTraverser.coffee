
class RangeFragmentsTraverser extends SimpleModule

  constructor: (editor, range) ->
    @iterator = new Simditor.RangeIterator(editor, range);
    @range = @iterator.range
    @editor = editor
    @traversedFragments = []
    @nodesToTraverse = []

  traverseFragments: (fn) ->
    @iterator.iterate (node) =>
      @nodesToTraverse.push node
    return unless @nodesToTraverse.length
    @splitRangeEdges()
    @clearEmptyTextNodes(@nodesToTraverse)
    while @nodesToTraverse.length
      @collectNode(@nodesToTraverse.shift(), fn)

  collectNode: (node, fn) ->
    while node && @isInRange(node)
      if !@isSuitable(node, fn)
        @removeTraversedNode(node)
        if node.firstChild
          @collectNode(node.firstChild, fn)
        node = node.nextSibling
        continue
      fragmentContainer = new Simditor.FragmentContainer()
      nodeTmp = node
      while nodeTmp && @isSuitable(nodeTmp, fn)
        if fn(nodeTmp)
          @removeTraversedNode(nodeTmp)
        node = nodeTmp
        nodeTmp = node.nextSibling
        fragmentContainer.addNode(node)
      @storeFragment(fragmentContainer)
      if node
        node = node.nextSibling
      else
        node = null

  storeFragment: (fragment) ->
    if fragment.nodes.length
      @traversedFragments.push(fragment)

  isSuitable: (node, fn) ->
    return fn(node) && @isInRange(node);

  isInRange: (node) ->
    range = @range.cloneRange();
    range.selectNodeContents(node);
    return @range.compareBoundaryPoints(Simditor.DomRange.END_TO_END, range) > -1 && @range.compareBoundaryPoints(Simditor.DomRange.START_TO_START, range) < 1;

  removeTraversedNode: (node) ->
    list = @nodesToTraverse;
    index = $.inArray(node, list);
    if index != -1
      list.splice(index, 1);

  splitRangeEdges: ->
    end = @splitEnd(@range.endContainer, @range.endOffset)
    start = @splitStart(@range.startContainer, @range.startOffset)
    if start
      @range.setStartBefore(start)
    if end
      @range.setEndAfter(end)

    @range.select()

  splitEnd: (container, offset) ->
    if @editor.util.isTextNode(container)
      data = container.data
      parentNode = container.parentNode
      if offset == 0
        return container.previousSibling
      else
        if offset > 0 && offset < container.length
          textNode = document.createTextNode(data.substring(offset))
          container.data = data.substring(0, offset)
          parentNode.insertBefore(textNode, container.nextSibling)
          return container
      return container
    if @editor.util.canHaveChildren(container)
      e = container.childNodes
      f = e[offset - 1]
      return f || @editor.util.traversePreviousNode(container.firstChild)
    else
      return container

  splitStart: (container, offset) ->
    if @editor.util.isTextNode(container)
      data = container.data
      parentNode = container.parentNode
      if offset == container.length
        return container.nextSibling
      else
        if offset > 0 && offset < container.length
          textNode = document.createTextNode(data.substring(0, offset))
          container.data = data.substring(offset)
          parentNode.insertBefore(textNode, container)
          return container
      return container;
    if @editor.util.canHaveChildren(container)
      return container.childNodes[offset]
    else
      return container

  clearEmptyTextNodes: (list) ->
    f = 0
    while f < list.length
      node = list[f];
      if @editor.util.isTextNode(node) && node.nodeValue == ""
        e = list.splice(f, 1)[0]
        if e.parentNode
          e.parentNode.removeChild(e)
      else
        f++

Simditor.RangeFragmentsTraverser = RangeFragmentsTraverser