
class FormatPainterCommand extends InlineCommand

  @wrapperClass: "TELERIK_formatPainterContentWrapper"

  _attributes: ["class", "style", "size", "color", "face"]

  constructor: (editor, settings, options) ->
    options = $.extend({ title: "Format Painter" }, options || {})
    super(editor, settings, options)

  formatFragments: (fragments) ->
    if fragments.length && @settings.formatting
      formatTree = @_createFormattingTree()
    else
      formatTree = undefined
    while fragments.length && formatTree
      fragment = fragments.shift()
      if !@isEmptyInlineFragment(fragment)
        @formatFragment(fragment, formatTree)

  formatFragment: (fragment, formatTree) ->
    cloneNode = formatTree.cloneNode(true)
    wrapperClass = FormatPainterCommand.wrapperClass
    if $(cloneNode).is('span.' + wrapperClass)
      wrapperNode = $(cloneNode).removeClass(wrapperClass).get(0)
    else 
      wrapperNode = $(cloneNode).find("span." + wrapperClass).removeClass(wrapperClass).get(0)
    
    fragment.insertBeforeFirst(cloneNode)
    fragment.appendTo(wrapperNode)
    parentNode = cloneNode.parentNode
    util = @get_editor().util
    if util.isBlockNode(cloneNode) && util.isBlockNode(parentNode)
      if cloneNode.nodeName == parentNode.nodeName || util.isBlockComponent(cloneNode)
        util.removeNode(cloneNode)
      else
        if !util.isBlockComponent(parentNode) && util.isHeading(cloneNode)
          if @isMarker(cloneNode.previousSibling)
            fragment.insertBeforeFirst(cloneNode.previousSibling)
          if @isMarker(cloneNode.nextSibling)
            fragment.appendNodeAfter(cloneNode.nextSibling)
          @extractFormatting(parentNode, cloneNode, cloneNode)
          util.removeNode(parentNode)
        else
          if util.isHeading(parentNode) || util.isBlockComponent(parentNode)
            util.removeNode(cloneNode)
    formatting = @settings.formatting
    if formatting && formatting.computedStyles
      computedStyles = formatting.computedStyles
    else
      computedStyles = {}

    wrapperNodeTmp = wrapperNode;
    diffCss = @_getStyleDifferences(wrapperNodeTmp, computedStyles)
    if diffCss
      $(wrapperNodeTmp).css(diffCss)
    else
      util.removeNode(wrapperNodeTmp)

  _getStyleDifferences: (node, computedStyles) ->
    for own key, value of computedStyles
      l = @get_editor().util.getComputedStyle(node, key)
      h = computedStyles[key]
      if l != h
        if !f
          f = {}
        f[key] = h
    return f

  _createFormattingTree: ->
    formatting = @settings.formatting;
    if formatting && formatting.elements
      elements = formatting.elements
    else
      elements = []
    wrapper = document.createElement("div");
    tmp = wrapper;
    for m in elements.slice(0).reverse()
      o = document.createElement(m.nodeName);
      @_setAttributes(o, m);
      tmp.appendChild(o);
      tmp = o;
      
    h = document.createElement("span");
    h.className = FormatPainterCommand.wrapperClass
    tmp.appendChild(h)
    return wrapper.firstChild

  _setAttributes: (node, attrs) ->
    @_attributes.forEach (item) =>
      if attrs[item]
        node.setAttribute(item, attrs[item])

  getState: ->
    0

Simditor.FormatPainterCommand = FormatPainterCommand