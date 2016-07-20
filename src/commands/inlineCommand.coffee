
class InlineCommand extends CommandBase

  markerClass: "__telerik_marker"

  lineBreakCode: 8203

  settings: {}

  options: 
    title: "Inline command"
    canUnexecute: false

  constructor: (editor, settings, options) ->
    @settings = settings || {}
    @options  = $.extend @options, options || {}
    super(@options.title, @options.canUnexecute, editor)

  onExecute: ->
    try
      return @executeInlineCommand()
    catch error
      # a("." + @markerClass, this.get_editor().get_contentArea()).remove()

  executeInlineCommand: ->
    editor = @get_editor()
    @range = @getEditorRange()
    @collapsedRange = @range.collapsed
    if @collapsedRange and @isGreedy()
      boundary = @getWordBoundaries(@range.startContainer, @range.startOffset)
      @range.setStart(@range.startContainer, boundary.left)
      @range.setEnd(@range.startContainer, boundary.right)
      @range.select()
      @collapsedRange = @range.collapsed

    fragments = @traverseFragments(@range)
    if @range
      @emptyRange = @range.toString() == ""
    else
      @emptyRange = true
    @storeRangeByFragments(fragments)
    @rangeChanged = false
    @removeFormatting = @shouldRemoveFormatting()
    if @removeFormatting
      @removeFormat(fragments)




    # var j = this
    #   , n = j.range = j.getEditorRange()
    #   , l = j.get_editor()
    #   , o = j.getState(l.get_contentWindow(), l)
    #   , k = j.collapsedRange = n ? n.isCollapsed() : true;
    # if (k && this.isGreedy()) {
    #     var i = j.getWordBoundaries(n.startContainer, n.startOffset);
    #     n.setStart(n.startContainer, i.left);
    #     n.setEnd(n.startContainer, i.right);
    #     n.select();
    #     j.collapsedRange = n.isCollapsed();
    # }
    # var m = j.traverseFragments(n);
    # j.emptyRange = n ? n.toString() == "" : true;
    # j.storeRangeByFragments(m);
    # j.rangeChanged = false;
    # j.removeFormatting = j.shouldRemoveFormatting(o);
    # if (j.removeFormatting) {
    #     j.removeFormat(m);
    # } else {
    #     j.formatFragments(m);
    # }
    # j.fireFormattingChanged();
    # j.consolidate(n);
    # if (!j.rangeChanged) {
    #     j.restoreRange();
    # }
    # return true;

  isGreedy: ->
    !@settings.isNotGreedy

  getWordBoundaries: (startContainer, startOffset) ->
    boundary = 
      left: -1
      right: 1
    nodeValue = startContainer.nodeValue
    if !nodeValue or @isCharEmptyOrWhiteSpace(nodeValue.charAt(startOffset)) or @isCharEmptyOrWhiteSpace(nodeValue.charAt(startOffset - 1))
      return {
        right: startOffset
        left: startOffset
      }
    left = @getBoundary(startOffset, nodeValue, boundary.left)
    right = @getBoundary(startOffset, nodeValue, boundary.right)
    return {
      right: right,
      left: left
    };

  getBoundary: (startOffset, nodeValue, boundary) ->
    l = startOffset <= 0 || startOffset >= nodeValue.length;
    if nodeValue.charAt(startOffset) == " "
      j = boundary < 0 ? 1 : 0;
      return startOffset + j;
    if l
      return startOffset;
    startOffset += boundary;
    return this.getBoundary(startOffset, nodeValue, boundary);

  isCharEmptyOrWhiteSpace: (char) ->
    if !char then return true
    /\s/g.test(char) || char.charCodeAt(0) == @lineBreakCode

  traverseFragments: (range) ->
    range = range || @range
    rangeFragmentsTraverse = new Simditor.RangeFragmentsTraverser @get_editor(), range
    rangeFragmentsTraverse.traverseFragments(@traverseCondition.bind(@))
    return rangeFragmentsTraverse.traversedFragments;

  traverseCondition: (node) ->
    return @shouldCollectNode()

  getEditorRange: ->
    return Simditor.DomRange.toDomRange(@get_editor(), @get_editor().selection.range()) 

  storeRangeByFragments: (fragments) ->
    if fragments.length
      first = fragments[0];
      last = fragments[fragments.length - 1];
      @startMarker = @createMarker();
      @endMarker = @startMarker.cloneNode(true);
      first.insertBeforeFirst(@startMarker);
      last.appendNodeAfter(@endMarker);
    else
      @storeRange()

  storeRange: (range) ->
    range = range || @getEditorRange()
    @rangeMemento = new Simditor.DomRangeMemento(@get_editor(), range)

  createMarker: ->
    marker = document.createElement("span")
    marker.className = @markerClass
    marker.innerHTML = "&nbsp;"
    marker

  shouldRemoveFormatting: ->
    true

  removeFormat: (fragments) ->
    while fragments.length
      @removeFormat_fragment(fragments.shift())

  removeFormat_fragment: (fragment) ->
    @cleanUpFormat(fragment)
    parent = fragment.getParent()
    ancestor = @findFormattedAncestor(parent)
    if ancestor && @isSameFormatNode(ancestor) && !@get_editor().util.isEditorContentArea(ancestor)
      edges = @getFragmentEdges(fragment)
      @removeFormat_extract(ancestor, edges.first, edges.last)

  getFragmentEdges: (fragment) ->
    nodes = fragment.nodes
    first = nodes[0]
    last = nodes[nodes.length - 1]
    if @isMarker(first.previousSibling)
      first = first.previousSibling
    if @isMarker(first.nextSibling)
      first = first.nextSibling
    return {
      first: first,
      last: first
    }

  removeEmptyNode: (node) ->
    if @get_editor().util.isNodeEmptyRecursive(node) && !@get_editor().util.hasAttributes(node) && node.parentNode
      node.parentNode.removeChild(node)

  cleanUpFormat: (fragment) ->
    @cleanUpFragment = fragment
    n = fragment.nodes;
    for l in [n.length - 1..0]
      node = n[l]
      if !@_shouldCleanUpNode(node)
        continue
      @removeSameFormatChildren(node)
      @removeSameFormat(node, l)

  removeSameFormatChildren: (node) ->
    k = @getSameFormatChildren(node)
    while k.length
      @removeSameFormat(k.shift())

  removeSameFormat: (node, m) ->
    if @isSameFormatNode(node)
      if !isNaN(m) && @shouldRemoveNode(node)
        @cleanUpFragment.removeNodeAt(m)
        childNodes = node.childNodes
        for n in [childNodes.length - 1..0]
          child = childNodes[n]
          @cleanUpFragment.addNodeAt(child, m)
      @removeNodeFormatting(node)

  extractFormatting: (k, j, m) ->
    l = k.parentNode
    i = new Simditor.DomTreeExtractor(k)
    n = i.extractBefore(j)
    p = i.extractAfter(m)
    o = @get_editor().util.cloneNodeClean(k)
    q = @get_editor().util.cloneNodeClean(k)
    q.appendChild(p)
    o.appendChild(n)
    if !h.isNodeEmptyRecursive(o, true)
      l.insertBefore(o, k)
    if !h.isNodeEmptyRecursive(q, true)
      l.insertBefore(q, k.nextSibling)

  shouldRemoveNode: ->
    true

  isMarker: (node) ->
    node && (node == @startMarker || node == @endMarker || node.className == @markerClass)

  isComment: (node) ->
    node.nodeType == 8;

  _shouldCleanUpNode: (node) ->
    node && !@isMarker(node) && (!@get_editor().util.isTextNode(node) || @isComment(node))



