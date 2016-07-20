
class FormatPaintButton extends Button

  name: 'formatPaint'

  icon: 'simditor-r-icon-format_paint'

  commandList: ['color', 'font-family', 'font-size', 'font-style', 'font-variant', 'font-weight', 'text-decoration', 'background-color', 'background-image', 'background-position', 'background-repeat', 'background-attachment']

  attrList: ['class', 'style', 'size', 'color', 'face']

  tagList: ['p', 'b', 'i', 'u', 'strike', 'h1', 'h2', 'h3', 'h4', 'h5'] # 需要考虑，p标签只能在目标标签是h1-h5的时候才可用

  _format: {}

  _init: ->
    super()
    @editor.on 'blur', (e) =>
      @_removeEvent()

  _getSelectedElement: ->
    $startNodes = @editor.selection.startNodes()

  _getComputedStyle: ($node) ->
    node = $node[0]
    if node.nodeName == '#text'
      node = $(node).parent()[0]
    _computedStyle = window.getComputedStyle(node, null)
    computedStyles = {}
    @commandList.forEach (style) ->
      computedStyles[style] = _computedStyle.getPropertyValue(style)
    return computedStyles

  _getEleAttr: ($node) ->
    $node = $node.filter @tagList.join ','
    list = []
    $node.each (i, node) =>
      eleAttr = {nodeName: node.nodeName}
      @attrList.forEach (attr) =>
        value = node.getAttribute(attr) || ''
        if value
          eleAttr[attr] = value
      list.push(eleAttr)
    return list

  _formatPainterApply: ->
    stripCondition = (node) =>
      if @editor.util.isTag(node, 'a')
        return false
      return !@editor.util.isTextNode(node) && !@editor.util.isBlockNode(node) && @editor.util.canHaveChildren(node)
    command = new Simditor.StripElementCommand @editor,
      stripCondition: stripCondition
    command.onExecute()

  _registerEvent: ->
    @_mousedown = false
    @_mouseup = false
    @editor.body.one 'mousedown.format_paint', (e) => 
      @_mousedown = true;
    @editor.body.one 'mouseup.format_paint', (e) =>
      @_mouseup = true
      if @_mousedown
        @_formatPainterApply();
      @editor.body.removeClass 'simditor-on-format-paint'

  _removeEvent: ->
    @editor.body.off 'mousedown.format_paint'
    @editor.body.off 'mouseup.format_paint'
    @editor.body.removeClass 'simditor-on-format-paint'

  _shouldCleanUpNode: ->
    
  command: ->
    @_removeEvent()
    $node = @_getSelectedElement()
    return unless $node and $node.length > 0
    @_format.computedStyles = @_getComputedStyle($node)
    @_format.elements = @_getEleAttr($node)
    @editor.body.addClass 'simditor-on-format-paint'
    @_registerEvent()

Simditor.Toolbar.addButton FormatPaintButton