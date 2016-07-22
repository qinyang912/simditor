
class InlineCommand extends CommandBase

  markerClass: "__telerik_marker"

  lineBreakCode: 8203

  settings: {}

  options: 
    title: "Inline command"
    canUnexecute: false

  c: (node) ->
    util = @get_editor().util
    return @d(node) || (util.isTextNode(node) && util.isTextNodeEmpty(node) && (/\n|\r/.test(node.nodeValue) || (node.previousSibling && !@d(node.previousSibling)) || (node.nextSibling && !@d(node.nextSibling))))
  
  d: (node) ->
    return node && node.className == @markerClass;

  constructor: (editor, settings, options) ->
    @settings = settings || {}
    @options  = $.extend @options, options || {}
    super(@options.title, @options.canUnexecute, editor)

  onExecute: ->
    # return @executeInlineCommand()


    try
      return @executeInlineCommand()
    catch error
      # a("." + @markerClass, this.get_editor().get_contentArea()).remove()

  executeInlineCommand: ->
    editor = @get_editor()
    @range = @getEditorRange()
    @collapsedRange = @range.collapsed
    state = @getState()
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
    @removeFormatting = @shouldRemoveFormatting(state)
    if @removeFormatting
      @removeFormat(fragments)
    else
      @formatFragments(fragments)

    @consolidate()

    if !@rangeChanged
      @restoreRange()

    if !@removeFormatting
      editor.trigger 'valuechanged'      


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
    return @shouldCollectNode(node)

  shouldCollectNode: (node) ->
    Simditor.FragmentsCondition.isInlineNode(node) && 
    !Simditor.CommandUtil._isContentAreaLastBr(node) && 
    !Simditor.CommandUtil.isWhitespaceBetweenTableCells(node) && 
    !Simditor.CommandUtil.isPreContent(node) && 
    !Simditor.CommandUtil.isTableContent(node) &&
    !Simditor.CommandUtil.isMentionContent(node)

  consolidate: (domRange) ->
    consolidator = new Simditor.Consolidator(@get_editor())
    area = @getContentElement()
    consolidator.consolidateMarkedEdges(area)
    if domRange
      consolidator.normalize(domRange.commonAncestorContainer)
    else
      consolidator.normalize(area)

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

  shouldRemoveFormatting: (state) ->
    state == 1

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
    if @isMarker(last.nextSibling)
      last = last.nextSibling
    return {
      first: first,
      last: last
    }

  removeEmptyNode: (node) ->
    if @get_editor().util.isNodeEmptyRecursive(node) && !@get_editor().util.hasAttributes(node) && node.parentNode
      node.parentNode.removeChild(node)

  cleanUpFormat: (fragment) ->
    @cleanUpFragment = fragment
    n = fragment.nodes;
    for node, l in n by -1
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
        for child in childNodes by -1
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
    if !Simditor.CommandUtil.isNodeEmptyRecursive(o, true)
      l.insertBefore(o, k)
    if !Simditor.CommandUtil.isNodeEmptyRecursive(q, true)
      l.insertBefore(q, k.nextSibling)

  shouldRemoveNode: ->
    true

  restoreRange: ->
    range = @range
    marker = $("." + @markerClass, @get_editor().body[0])
    consolidator = new Simditor.Consolidator()
    if marker.length
      startMarker = marker[0]
      next = startMarker.nextSibling
      endMarker = marker[1]
      if (@get_editor().util.isTextNode(next) && @get_editor().util.isTextNodeEmpty(next) && endMarker.previousSibling == next) || (startMarker == endMarker.previousSibling)
        $(endMarker).remove()
        @restoreCollapsedRange(startMarker)
      else
        if !consolidator.normalizeTextEdge(startMarker, range, true)
          if @isSameFormatNode(startMarker.nextSibling)
            range.setStart(startMarker.nextSibling, 0)
          else
            range.setStartAfter(marker[0])
        if !consolidator.normalizeTextEdge(endMarker, range, false)
          if @isSameFormatNode(endMarker.previousSibling)
            range.setEnd(endMarker.previousSibling, endMarker.previousSibling.childNodes.length)
          else
            range.setEndBefore(marker[1])
        range.select()
      marker.remove()
    else
      try
        if @rangeMemento
          @rangeMemento.restoreToRange(@getEditorRange())
      catch e
        # ...
  
  restoreCollapsedRange: (marker) ->
    # range = this.range;
    # var j = this.get_editor();
    # var n = l.parentNode;
    # var i = new Simditor.Consolidator();
    # j.setActive();
    # j.setFocus();
    # var o = l.previousSibling;
    # var m = l.nextSibling;
    # if (i.normalizeTextEdge(l, range)) {
    #   range.collapse();
    # } else {
    #   if (h.isTextNode(o)) {
    #     range.setEnd(o, o.length);
    #     range.collapse();
    #   } else {
    #     if (!$telerik.isSafari && h.isTextNode(m)) {
    #       range.setStart(m, 0);
    #       range.collapse(true);
    #     } else {
    #       var k = j.nodesTracker.createTrackedNode();
    #       n.insertBefore(k, l);
    #       range.setEnd(k, 1);
    #       range.collapse();
    #     }
    #   }
    # }
    # range.select();

  getContentElement: ->
    return @get_editor().body[0]

  isSameFormatNode: (node) ->
    @isSameTagFormat(node) || @isSameCssFormat(node)

  isSameTagFormat: (node) ->
    (Simditor.CommandUtil.isTag(node, @settings.tag) || @isAltTagFormat(node)) && (!node.className || @isTrackChangesNode(node))

  isAltTagFormat: (node) ->
    altTags = @settings.altTags;
    if !altTags || !altTags.length
      return false
    for altTag in altTags
      if Simditor.CommandUtil.isTag(node, altTag)
        if Simditor.CommandUtil.isTag(node, "font")
          return @isFormattingFont(node)
        else
          return true
    false

  isSameCssFormat: (node) ->
    settings = @settings
    cssName = settings.cssName
    cssValue = settings.cssValue
    cssName && cssValue && node.style && node.style[cssName].indexOf(cssValue) > -1

  isTrackChangesNode: (node) ->
    # return !!b.TrackChangesUtils && b.TrackChangesUtils.isTrackChangeElement(i);

  isEmptyInlineFragment: (fragment) ->
    fragment.all (node) =>
      @c(node)

  isMarker: (node) ->
    node && (node == @startMarker || node == @endMarker || node.className == @markerClass)

  isComment: (node) ->
    node.nodeType == 8

  isFormattingFont: (node) ->
    Simditor.CommandUtil.isTag(node, "font") && (@hasStyle(node, @settings.cssName) || @hasAttribute(node, @settings.altTagAttr))

  _shouldCleanUpNode: (node) ->
    node && !@isMarker(node) && (!@get_editor().util.isTextNode(node) || @isComment(node))



