
CommandUtil = 
  emptyNodeRegExp: '/^&nbsp;?$/'
  blockNodes: ["div","p","ul","ol","li","blockquote","hr","pre","h1","h2","h3",
    "h4", "h5", "table"]
  isBlockNode: (node) ->
    node = $(node)[0]
    if !node or node.nodeType == 3
      return false

    new RegExp("^(#{@blockNodes.join('|')})$").test node.nodeName.toLowerCase()

  isTextNode: (node) ->
    node = $(node)[0]
    return node && node.nodeType && (node.nodeType == 3 || node.nodeType == 4 || node.nodeType == 8)

  canHaveChildren: (node) ->
    node = $(node)[0]
    if !node or @isTextNode(node)
      return false
    switch (node.tagName || node.nodeName).toUpperCase()
      when "AREA", "BASE", "BASEFONT", "COL", "FRAME", "HR", "IMG", "BR", "INPUT", "ISINDEX", "LINK", "META", "PARAM" then return false
      else return true

  isTag: (node, tagName) ->
    node = $(node)[0]
    return !!(node && node.tagName && tagName) && node.tagName.toLowerCase() == tagName.toLowerCase()

  isList: (node) ->
    return @isTag(node, "ul") || @isTag(node, "ol")

  isPreContent: (node) -> # 检查这个节点是不是pre，或者是不是在pre节点之下
    isUnderPre = $(node).closest('pre')
    if isUnderPre && isUnderPre.length
      return true
    false

  isHeading: (node) ->
    node && /^H[1-6]$/i.test(node.nodeName)

  isTableCell: (node) ->
    @isTag(node, "td") || @isTag(node, "th")

  isBlockComponent: (node) ->
    @isTag(node, "li") || @isTableCell(node)

  isAncestorOf: (m, l) ->
    try
      if @isTextNode(l)
        tempL = l.parentNode
      else 
        tempL = l
      return !@isTextNode(m) && (l.parentNode == m || $.contains(m, tempL))
    catch error
      return false

  isAncestorOrSelf: (l, k) ->
    return @isAncestorOf(l, k) || (l == k);

  findAncestorUntil: (l, k) ->
    if @isAncestorOf(l, k)
      while k && k.parentNode != l
        k = k.parentNode
    k

  traversePreviousNode: (l) ->
    k = l
    while k && !(m = k.previousSibling)
      k = k.parentNode
    m

  findNodeIndex: (node) ->
    node = $(node)[0]
    index = 0
    while node.previousSibling
      node = node.previousSibling
      index++
    index

  findCommonAncestor: (k, l) ->
    while k && k != l && !@isAncestorOf(k, l)
      k = k.parentNode;
    return k;

  getAllChildNodesBy: (m, l) ->
    k = []
    @_getChildNodes(m, k, l)
    return k;

  _getChildNodes: (o, l, m, p) ->
    firstChild = o.firstChild
    while firstChild
      n = m(firstChild)
      if !(p && n) && firstChild.nodeType == 1 && @canHaveChildren(firstChild)
        @_getChildNodes(firstChild, l, m, p)
      if n
        l.push(firstChild)
      firstChild = firstChild.nextSibling

  removeNode: (node) ->
    parentNode = node.parentNode;
    if parentNode != null
      while node.firstChild
        parentNode.insertBefore(node.firstChild, node)
      parentNode.removeChild(node)
      return parentNode
    return true

  removeChildren: (node) ->
    while node.firstChild
      node.removeChild(node.firstChild)

  cloneNodeClean: (node) ->
    cloneNode = node.cloneNode(false)
    @removeChildren(cloneNode)
    # if ($telerik.isIE10Mode && !$telerik.isIE10 && node.style && node.style.backgroundColor) {
    #   cloneNode.style.backgroundColor = node.style.backgroundColor;
    # }
    return cloneNode

  isTextNodeEmpty: (node) ->
    return !/[^\s\xA0\u200b]+/.test(node.nodeValue)

  isTextNodeCompletelyEmpty: (node) ->
    return !/[^\n\r\t\u200b]+/.test(node.nodeValue)

  isNodeEmpty: (node) ->
    return @isNodeCompletelyEmpty(node) || @emptyNodeRegExp.test(node.innerHTML)

  isNodeCompletelyEmpty: (node) ->
    return !node.innerHTML || node.childNodes.length == 0

  isEmptyDom: (node) ->
    if @isTextNode(node)
      return @isTextNodeEmpty(node)
    else
      return @isNodeEmpty(node)

  isCompletelyEmptyDom: (node) ->
    if @isTextNode(node)
      return @isTextNodeCompletelyEmpty(node)
    else
      return @isNodeCompletelyEmpty(node)

  isNodeEmptyRecursive: (m, k) ->
    if m.nodeType == 1 && !@canHaveChildren(m)
      return false
    else
      if m.childNodes.length == 0
        if k
          return @isCompletelyEmptyDom(m)
        else
          return @isEmptyDom(m)
      else
        if @isList(m) && m.children.length == 0
          return true
    firstChild = m.firstChild
    while firstChild && @isNodeEmptyRecursive(firstChild, k)
      firstChild = firstChild.nextSibling

    return !firstChild

  getDefinedAttributes: (n) ->
    l =
      length: 0
    for attr in n.attributes
      k = attr
      if k.specified && k.nodeName != "style" && !/^sizzle-/.test(k.nodeName)
        l[k.nodeName] = k.nodeValue;
        l.length++
    l

  getAttributes: (o, n) ->
    k =
      length: 1
    for l in [0...n.length-1]
      m = n[l]
      k[m] = o.getAttribute(m)
      k.length++
    k

  every: (nodes, fn) ->
    for node in nodes
      if !fn(node)
        return false
    return true

  some: (nodes, fn) ->
    for node in nodes
      if fn(node)
        return true
    return false

  getComputedStyle: (node, style) ->
    computedStyle = window.getComputedStyle(node, null)
    computedStyle.getPropertyValue(style)

  normalize: (node) ->
    if !node.normalize
      @_normalizeTextNodes(node)
    else
      node.normalize()

  _normalizeTextNodes: (node) ->
    firstChild = node.firstChild
    nextSibling = null
    while firstChild
      if firstChild.nodeType == 3
        nextSibling = firstChild.nextSibling
        while nextSibling && nextSibling.nodeType == 3
          firstChild.appendData(nextSibling.data)
          node.removeChild(nextSibling)
          nextSibling = firstChild.nextSibling
      else
        @_normalizeTextNodes(firstChild)
      firstChild = firstChild.nextSibling

  _isContentAreaLastBr: (node) ->
    @isTag(node, "br") && !node.nextSibling && Simditor.util.isEditorContentArea(node.parentNode)

  isWhitespaceBetweenTableCells: (node) ->
    @isTextNode(node) && @isTextNodeEmpty(node) && $(node.parentNode).is("tr,tbody,thead,tfoot,table")

  hasAttributes: (node) ->
    l = @getOuterHtml(node).replace(node.innerHTML, "")
    a = /=["][^"]/.test(l)
    b = /=['][^']/.test(l)
    c = /=[^'"]/.test(l)
    return a || b || c

  getOuterHtml: (node) ->
    if node.outerHTML
      return node.outerHTML
    else
      b = node.cloneNode(true)
      c = document.createElement("div")
      c.appendChild(b)
      return c.innerHTML

Simditor.CommandUtil = CommandUtil