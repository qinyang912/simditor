
class Util extends SimpleModule

  @pluginName: 'Util'

  emptyNodeRegExp: /^&nbsp;?$/

  _init: ->
    @editor = @_module
    @phBr = '' if @browser.msie and @browser.version < 11

  phBr: '<br/>'

  os: (->
    os = {}
    if /Mac/.test navigator.appVersion
      os.mac = true
    else if /Linux/.test navigator.appVersion
      os.linux = true
    else if /Win/.test navigator.appVersion
      os.win = true
    else if /X11/.test navigator.appVersion
      os.unix = true

    if /Mobi/.test navigator.appVersion
      os.mobile = true

    os
  )()

  browser: (->
    ua = navigator.userAgent
    ie = /(msie|trident)/i.test(ua)
    chrome = /chrome|crios/i.test(ua)
    safari = /safari/i.test(ua) && !chrome
    firefox = /firefox/i.test(ua)
    edge = /edge/i.test(ua)

    if ie
      msie: true
      version: ua.match(/(msie |rv:)(\d+(\.\d+)?)/i)?[2] * 1
    else if edge
      edge: true
      webkit: true
      version: ua.match(/edge\/(\d+(\.\d+)?)/i)?[1] * 1
    else if chrome
      webkit: true
      chrome: true
      version: ua.match(/(?:chrome|crios)\/(\d+(\.\d+)?)/i)?[1] * 1
    else if safari
      webkit: true
      safari: true
      version: ua.match(/version\/(\d+(\.\d+)?)/i)?[1] * 1
    else if firefox
      mozilla: true
      firefox: true
      version: ua.match(/firefox\/(\d+(\.\d+)?)/i)?[1] * 1
    else
      {}
  )()

  support: do ->
    onselectionchange: do ->
      # NOTE: not working on firefox
      onselectionchange = document.onselectionchange
      if onselectionchange != undefined
        try
          document.onselectionchange = 0
          return document.onselectionchange == null
        catch e
        finally
          document.onselectionchange = onselectionchange
      false
    oninput: do ->
      # NOTE: `oninput` event not working on contenteditable on IE
      # `document` wouldn't return undefined of this event,
      # for it's exists but not for contenteditable.
      # So we have to block the whole browser for Simditor.
      not /(msie|trident)/i.test(navigator.userAgent)


  # force element to reflow, about reflow:
  # http://blog.letitialew.com/post/30425074101/repaints-and-reflows-manipulating-the-dom-responsibly
  reflow: (el = document) ->
    $(el)[0].offsetHeight

  metaKey: (e) ->
    isMac = /Mac/.test navigator.userAgent
    if isMac then e.metaKey else e.ctrlKey

  isEmptyNode: (node) ->
    $node = $(node)
    $node.is(':empty') or
      (!$node.text() and !$node.find(':not(br, span, div)').length)

  isDecoratedNode: (node) ->
    $(node).is('[class^="simditor-"]')

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

  getNodeLength: (node) ->
    node = $(node)[0]
    switch node.nodeType
      when 7, 10 then 0
      when 3, 8 then node.length
      else node.childNodes.length

  # convert base64 data url to blob object
  # for pasting images in firefox and IE11
  dataURLtoBlob: (dataURL) ->
    hasBlobConstructor = window.Blob && (->
      try
        return Boolean(new Blob())
      catch e
        return false
    )()

    hasArrayBufferViewSupport = hasBlobConstructor && window.Uint8Array && (->
      try
        return new Blob([new Uint8Array(100)]).size == 100
      catch e
        return false
    )()

    BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder ||
      window.MozBlobBuilder || window.MSBlobBuilder;
    supportBlob = hasBlobConstructor || BlobBuilder

    unless supportBlob && window.atob && window.ArrayBuffer && window.Uint8Array
      return false

    if dataURL.split(',')[0].indexOf('base64') >= 0
      # Convert base64 to raw binary data held in a string:
      byteString = atob(dataURL.split(',')[1])
    else
      # Convert base64/URLEncoded data component to raw binary data:
      byteString = decodeURIComponent(dataURL.split(',')[1])

    # Write the bytes of the string to an ArrayBuffer:
    arrayBuffer = new ArrayBuffer(byteString.length)
    intArray = new Uint8Array(arrayBuffer)
    for i in [0..byteString.length]
      intArray[i] = byteString.charCodeAt(i)

    # Separate out the mime component:
    mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]
    # Write the ArrayBuffer (or ArrayBufferView) to a blob:
    if hasBlobConstructor
      blobArray = if hasArrayBufferViewSupport then intArray else arrayBuffer
      return new Blob([blobArray], {type: mimeString})
    bb = new BlobBuilder()
    bb.append(arrayBuffer)
    bb.getBlob(mimeString)

  throttle: (func, wait) ->
    last = 0
    timeoutID = 0
    ctx = args = rtn = null

    call = ->
      timeoutID = 0
      last = +new Date()
      rtn = func.apply ctx, args
      ctx = null
      args = null

    throttled = ->
      ctx = @
      args = arguments
      delta = new Date() - last

      unless timeoutID
        if delta >= wait
          call()
        else
          timeoutID = setTimeout(call, wait - delta)

      rtn

    throttled.clear = ->
      return unless timeoutID
      clearTimeout timeoutID
      call()

    throttled

  formatHTML: (html) ->
    re = /<(\/?)(.+?)(\/?)>/g
    result = ''
    level = 0
    lastMatch = null
    indentString = '  '
    repeatString = (str, n) ->
      new Array(n + 1).join(str)

    while (match = re.exec(html)) != null
      match.isBlockNode = $.inArray(match[2], @blockNodes) > -1
      match.isStartTag = match[1] != '/' and match[3] != '/'
      match.isEndTag = match[1] == '/' or match[3] == '/'

      cursor = if lastMatch then lastMatch.index + lastMatch[0].length else 0
      if (str = html.substring(cursor, match.index)).length > 0 and $.trim(str)
        result += str

      level -= 1 if match.isBlockNode and match.isEndTag and !match.isStartTag
      if match.isBlockNode and match.isStartTag
        if !(lastMatch and lastMatch.isBlockNode and lastMatch.isEndTag)
          result += '\n'
        result += repeatString(indentString, level)
      result += match[0]
      result += '\n' if match.isBlockNode and match.isEndTag
      level += 1 if match.isBlockNode and match.isStartTag

      lastMatch = match

    $.trim result

  isEditorContentArea: (node) ->
    if node && node == @editor.body[0]
      return true
    else
      return false

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

  every: (nodes, fn) ->
    length = nodes.length;
    for m in [0...length-1]
      if !fn(nodes[m])
        return false
    return true

  some: (nodes, fn) ->
    length = nodes.length
    for m in [0...length-1]
      if fn(nodes[m])
        return true
    return false

  getComputedStyle: (node, style) ->
    computedStyle = window.getComputedStyle(node, null)
    computedStyle.getPropertyValue(style)

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



