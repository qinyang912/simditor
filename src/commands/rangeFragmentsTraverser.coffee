
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
    # while node && this.isInRange(node)
    #   if !this.isSuitable(node, fn)
    #     this.removeTraversedNode(node);
    #     if (node.firstChild) {
    #       this.collectNode(node.firstChild, fn);
    #     }
    #     node = node.nextSibling;
    #     continue;
    #   var f = new b.FragmentContainer();
    #   var g = node;
    #   while g && this.isSuitable(g, fn)
    #     if fn(g)
    #       this.removeTraversedNode(g);
    #     node = g;
    #     g = node.nextSibling;
    #     f.addNode(node);
    #   this.storeFragment(f);
    #   node = node ? node.nextSibling : null ;

  isInRange: (node) ->
    range = @range.cloneRange();
    @editor.selection.selectNodeContents(node, range);
    return this.range.compareBoundaryPoints(Telerik.Web.UI.Editor.DomRange.END_TO_END, g) > -1 && this.range.compareBoundaryPoints(Telerik.Web.UI.Editor.DomRange.START_TO_START, g) < 1;

  splitRangeEdges: ->
    end = @splitEnd(@range.endContainer, @range.endOffset)
    start = @splitStart(@range.startContainer, @range.startOffset)
    if start
      @range.setStartBefore(start)
    if end
      @range.setEndAfter(end)
    @editor.selection.select(@range)

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