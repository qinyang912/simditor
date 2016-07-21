
class DomRange extends SimpleModule

  @START_TO_START: 0

  @START_TO_END: 1

  @END_TO_END: 2

  @END_TO_START: 3

  @m: /^<[^>]+>$/

  @j: /^<[\s\S]+>$/

  @l: /^<[^<]+>$/

  @c: (text) ->
    return text.indexOf("<") < text.indexOf(">")

  @d: (text) ->
    return DomRange.j.test(text) && (DomRange.test(text) || !DomRange.test(text));

  @toDomRange: (editor, range) ->
    if !range || range instanceof DomRange
      return range
    else
      return new DomRange(editor, range)

  options:
    preventCalculateEdges: false

  constructor: (editor, range, options) ->
    @util = Simditor.CommandUtil
    @options = $.extend(@options, options || {})
    @range = range
    @editor = editor
    @_initialCalculateEdges()


  setEnd: (node, offset) ->
    @endContainer = node
    @endOffset = offset
    @_calculateRangeProperties()

  setStart: (node, offset) ->
    @startContainer = node
    @startOffset = offset
    @_calculateRangeProperties()

  setStartBefore: (node) ->
    @setStart(node.parentNode, @util.findNodeIndex(node))

  setStartAfter: (node) ->
    @setStart(node.parentNode, @util.findNodeIndex(node) + 1)

  setEndBefore: (node) ->
    @setEnd(node.parentNode, @util.findNodeIndex(node))

  setEndAfter: (node) ->
    @setEnd(node.parentNode, @util.findNodeIndex(node) + 1);

  toString: ->
    range = @_updateBrowserRange();
    if range.text != undefined
      return range.text
    else
      if range.toString
        return range.toString()
      else
        return ""

  compareBoundaryPoints: (num, domRange) ->
    range = @_updateBrowserRange()
    if range.compareBoundaryPoints
      return range.compareBoundaryPoints(num, domRange.getBrowserRange())
    else
      if range.compareEndPoints
        return range.compareEndPoints(@_pointPairToCompare(num), domRange.getBrowserRange());
      else
        return 0;

  getBrowserRange: ->
     return @_updateBrowserRange();

  select: () ->
    range = @_updateBrowserRange();
    if range.select
      try
        range.select()
      catch e
        # ...
    else
      selection = @clear()
      if selection
        selection.range(range)

  clear: () ->
    @editor.selection.clear()
    @editor.selection

  selectNodeContents: (node) ->
    if @range.length
      @range.addElement(node);
    else
      if node.nodeType == 1
        tmp = "childNodes"
      else
        tmp = "nodeValue"
      @setEnd(node, node[tmp].length);
      @setStart(node, 0);

  cloneRange: ->
    range = @_updateBrowserRange()
    if @editor.util.browser.msie && range.length
        cloneRange = @cloneControlRange(range)
        if cloneRange
          return new DomRange(@editor, cloneRange, @options)
    cloneRange = @_cloneBrowserRange()
    if cloneRange
        domRange = new DomRange(@editor, cloneRange, @options)
        domRange.setStart(@startContainer, @startOffset)
        domRange.setEnd(@endContainer, @endOffset)
    return domRange;

  cloneControlRange: (range) ->
    length = range.length
    if length
      item = range.item(0)
      body = item.ownerDocument.body
      range = body.createControlRange()
      for t in [0..length - 1]
        range.addElement(@range.item(t))
      return range;

  _cloneBrowserRange: ->
    if @range.cloneRange
      return @range.cloneRange()
    else
      if @range.duplicate
        return @range.duplicate()
      else
        if @editor.util.browser.msie && @range.length
          return @cloneControlRange(@range)

  _isControlRange: ->
    @range.length

  _updateBrowserRange: ->
    if @_isControlRange() || @util.isTag(@startContainer, "textarea")
      return @range;
    @_updateBrowserRangeStart();
    @_updateBrowserRangeEnd();
    @_updateBrowserRangeStart();
    @range;

  _updateBrowserRangeStart: ->
    container = @startContainer;
    offset = @startOffset;
    if @range.setStart
        @range.setStart(container, offset);
    # else # 可能ie需要，暂时不写
    #     # @range.setEndPoint("StartToStart", this._setStartRangeAtNodeOffset(container, offset));

  _updateBrowserRangeEnd: ->
    container = @endContainer
    offset = @endOffset
    if @range.setEnd
      @range.setEnd container, offset

  _initialCalculateEdges: (r) ->
    if @options.preventCalculateEdges
      return;
    this._calculateEdge(true, r);
    this._calculateEdge(false, r);
    this._fixIE_plainTextStartOffset();
    this._calculateRangeProperties();

  _calculateEdge: (isStart, J) ->
    range = @range;
    isCollapsed = @_isBrowserRangeCollapsed();
    if isStart
      containerKey = "startContainer"
      offsetKey = "startOffset"
    else
      containerKey = "endContainer"
      offsetKey = "endOffset"
    container = range[containerKey];
    offset = range[offsetKey] || 0;
    # if !container
    #   if range.length
    #     item = range.item(0);
    #     container = item.parentNode;
    #     offset = @editor.util.findNodeIndex(item) + (isStart ? 0 : 1);
    #   else
    #     var w;
    #     var s = range.duplicate();
    #     s.collapse(isStart);
    #     var I = s.parentElement()
    #       , A = I.childNodes.length == 0;
    #     if !@editor.util.canHaveChildren(I) || @editor.util.isTag(I, "textarea")
    #       container = I;
    #     else
    #       tempNode = this._createTempNode();
    #       w = isStart ? "StartToStart" : "StartToEnd";
    #       this._traverseToEdgeNode(w, I, s, tempNode, 0);
    #       container = A ? I : tempNode.nextSibling;
    #     if !container
    #       if isStart && !isCollapsed
    #         I.removeChild(tempNode);
    #         var H = I;
    #         while (H == I && this._moveCursorByCharacter(s)) {
    #           I = s.parentElement();
    #         }
    #         this._traverseToEdgeNode(w, I, s, tempNode, 0);
    #         container = tempNode.nextSibling;
    #       if !container
    #         var K = tempNode.previousSibling;
    #         if !J && K && @editor.util.isTextNode(K)
    #           this[containerKey] = K;
    #           this[offsetKey] = K.length || K.data.length || K.nodeValue.length;
    #         else
    #           if !this.startContainer
    #             this.startContainer = I;
    #             this.startOffset = @editor.util.findNodeIndex(tempNode);
    #           this.endContainer = I;
    #           this.endOffset = I[I.nodeType === 1 ? "childNodes" : "nodeValue"].length - 1;
    #         I.removeChild(tempNode);
    #         return;
    #     if tempNode
    #       I.removeChild(tempNode);
    #     s.setEndPoint(isStart ? "EndToStart" : "EndToEnd", range);
    #     if @editor.util.isTextNode(container)
    #       var N = s.text
    #         , C = 0
    #         , E = container.nodeValue
    #         , O = e(N)
    #         , F = n(E)
    #         , P = n(N)
    #         , x = E.indexOf(N)
    #         , y = F.indexOf(P);
    #       if x == -1 && y > -1
    #         C = f(E, N) - O;
    #       offset = Math.max(y, 0) + N.length + C;
    #     else
    #       if containerKey == "startContainer" && @editor.util.isAncestorOrSelf(container, range.parentElement()) || (A && containerKey == "endContainer")
    #         offset = 0;
    #       else
    #         offset = @editor.util.findNodeIndex(container);
    #         container = container.parentNode;
    this[containerKey] = container;
    this[offsetKey] = offset;

  _fixIE_plainTextStartOffset: ->
    text = @range.htmlText;
    if text == undefined || DomRange.c(text)
      return
    if @startContainer == @endContainer && (@endOffset - @startOffset) > text.length
      @startOffset = @endOffset - text.length

  _calculateRangeProperties: ->
    @commonAncestorContainer = @util.findCommonAncestor(@startContainer, @endContainer)
    @collapsed = @startContainer == @endContainer && @startOffset == @endOffset

  _isBrowserRangeCollapsed: ->
    range = @range;
    try
      if range.isCollapsed
        return range.isCollapsed();
      else
        if range.collapsed != undefined
          return range.collapsed;
        else
          if range.length != undefined
            return range.length == 0;
          else
            if range.text != undefined
              return range.text == "" && !DomRange.d(range.htmlText);
            else
              return @toString() == "";
    catch e
      return true

  _createTempNode: ->
    tmp = document.createElement("span")
    tmp.innerHTML = "&#x200b;"
    tmp

  _traverseToEdgeNode: (t, v, s, x, u) ->
    # range = @range
    #   , r = 1;
    # do
    #   v.insertBefore(x, x.previousSibling);
    #   s.moveToElementText(x);
    #   r = s.compareEndPoints(t, range);
    # while (x.previousSibling && r > u);return r;

  _setStartRangeAtNodeOffset: (node, offset, isEnd) ->
    # var k = d(this.range);
    # var p = k.body.createTextRange();
    # if (g.isTextNode(m)) {
    #     var o = this._createTempNode(k);
    #     m.parentNode.insertBefore(o, m);
    #     this._selectTempNode(p, o);
    #     p.moveStart("character", n + ($telerik.isIE9 && l && /^\s/.test(m.nodeValue) ? 1 : 0));
    # } else {
    #     var j = m.childNodes;
    #     if (n < j.length) {
    #         var i = j[n];
    #         if (g.isTextNode(i)) {
    #             var q = this._createTempNode(k);
    #             if (l) {
    #                 if (i.nextSibling) {
    #                     m.insertBefore(q, i.nextSibling);
    #                 } else {
    #                     m.appendChild(q);
    #                 }
    #             } else {
    #                 m.insertBefore(q, i);
    #             }
    #             p.moveToElementText(q);
    #             m.removeChild(q);
    #         } else {
    #             p.moveToElementText(j[n]);
    #         }
    #     } else {
    #         if (n == j.length) {
    #             p.moveToElementText(m);
    #             p.collapse(!l);
    #         }
    #     }
    # }
    # return p;

  _pointPairToCompare: (num) ->
    switch num
      when DomRange.START_TO_START
        return "StartToStart"
      when DomRange.START_TO_END
        return "EndToStart"
      when DomRange.END_TO_END
        return "EndToEnd"
      when DomRange.END_TO_START
        return "StartToEnd"
      else return ""

      
Simditor.DomRange = DomRange