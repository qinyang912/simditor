
class FormatPaintButton extends Button

  name: 'formatPaint'

  icon: 'simditor-r-icon-format_paint'

  commandList: ['color', 'font-family', 'font-size', 'font-style', 'font-variant', 'font-weight', 'text-decoration', 'background-color', 'background-image', 'background-position', 'background-repeat', 'background-attachment']

  attrList: ['class', 'style', 'size', 'color', 'face']

  _format: {}

  _init: ->
    super()

  _getSelectedElement: ->
    $startNodes = @editor.selection.startNodes()
    return unless $startNodes and $startNodes.length > 0
    startNode = $startNodes[0]
    $node
    if startNode.nodeName != '#text'
      $node = $(startNode)
    else 
      $node = $(startNode).parent();
    return if $node.is(@editor.body)
    return $node

  _getComputedStyle: (node) ->
    _computedStyle = window.getComputedStyle(node, null)
    computedStyles = {}
    @commandList.forEach (style) ->
      computedStyles[style] = _computedStyle.getPropertyValue(style)
    return computedStyles

  _getEleAttr: (node) -> 
    eleAttr = {nodeName: node.nodeName}
    @attrList.forEach (attr) ->
      eleAttr[attr] = node.getAttribute(attr) || ''
    return [eleAttr]
  command: ->
    $node = @_getSelectedElement()
    return unless $node and $node.length > 0
    @_format['computedStyles'] = @_getComputedStyle($node[0])
    @_format['elements'] = @_getEleAttr($node[0])
    @editor.body.addClass 'simditor-on-format-paint'
    console.log('_format', @_format);
Simditor.Toolbar.addButton FormatPaintButton